# 6. jkadhp_dev PostgreSQL 데이터베이스 아키텍처 및 DDL 명세

## 6.1 단일 개발 DB 환경 격리 원칙
* **데이터베이스명**: `jkadhp_dev` (PostgreSQL 16.2 on AWS RDS Multi-AZ)
* **스키마 네임스페이스**: `public`
* **동시성 제어**: Task 고유 ID 기반 Savepoint 격리 및 세션 분산 락(`locked_by_session_id`) 메커니즘 적용
* **목적**: stg/prd 환경이 분리되지 않은 개발 단일 DB에서 복수 에이전트/개발자의 스키마 충돌 및 데이터 덮어쓰기 방지

---

## 6.2 핵심 테이블 DDL 스키마 (Full Specification)

### 1. `harness_sessions` (세션 거버넌스 및 실행 상태 마스터)
```sql
CREATE TABLE harness_sessions (
  id VARCHAR(64) PRIMARY KEY,
  session_code VARCHAR(64) UNIQUE NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  user_email VARCHAR(128) NOT NULL,
  user_role VARCHAR(32) NOT NULL DEFAULT 'SUPER_ADMIN',
  target_database VARCHAR(32) NOT NULL DEFAULT 'jkadh_dev',
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'DRAINED', 'STALE', 'RECOVERED'
  active_task_id VARCHAR(64),
  active_task_code VARCHAR(32),
  active_phase_num INT DEFAULT 1,
  session_goal TEXT,
  savepoint_name VARCHAR(64),
  tokens_consumed BIGINT DEFAULT 0,
  cost_usd NUMERIC(10, 4) DEFAULT 0.0000,
  execution_count INT DEFAULT 0,
  next_handoff_brief TEXT,
  heartbeat_interval_sec INT DEFAULT 30,
  last_heartbeat_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_recovered BOOLEAN DEFAULT FALSE,
  git_branch VARCHAR(64) DEFAULT 'dev',
  git_commit_hash VARCHAR(64),
  release_tag VARCHAR(32),
  report_doc_path VARCHAR(256),
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_HARNESS',
  reg_user_id VARCHAR(64) DEFAULT 'jkoogi',
  reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_HARNESS',
  mod_user_id VARCHAR(64) DEFAULT 'jkoogi',
  mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `task_nodes` (작업 그래프 및 동시성 락 / 승급 관리)
```sql
CREATE TABLE task_nodes (
  id VARCHAR(64) PRIMARY KEY,
  task_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. 'PDF-OCR-04'
  title VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL, -- 'BACKLOG', 'ANALYSIS', 'PLANNED', 'DEVELOPING', 'TESTED', 'DONE'
  current_phase INT DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 7),
  assigned_to VARCHAR(64) REFERENCES team_members(id),
  locked_by_session_id VARCHAR(64) REFERENCES harness_sessions(id),
  lock_acquired_at TIMESTAMP,
  target_git_branch VARCHAR(64) DEFAULT 'dev', -- 'dev', 'stg', 'main'
  release_tag VARCHAR(32),
  approved_by VARCHAR(64),
  approved_at TIMESTAMP,
  spec_validation_score INT DEFAULT 0,
  phases_payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `task_execution_loops` (7종 하네스 루프 실행 및 세이브포인트 스냅샷)
```sql
CREATE TABLE task_execution_loops (
  id VARCHAR(64) PRIMARY KEY,
  session_id VARCHAR(64) REFERENCES harness_sessions(id),
  task_id VARCHAR(64) NOT NULL,
  task_code VARCHAR(32) NOT NULL,
  phase_number INT NOT NULL,
  loop_number INT NOT NULL,
  loop_action VARCHAR(32) NOT NULL, -- 'LOOP_ANALYZE', 'LOOP_EXECUTE', 'LOOP_REFINE', 'LOOP_ROLLBACK' 등
  model_id VARCHAR(64) NOT NULL,
  savepoint_name VARCHAR(64) NOT NULL,
  ast_validation_passed BOOLEAN DEFAULT TRUE,
  error_summary TEXT,
  diff_patch TEXT,
  tokens_consumed INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 4. `phase_gate_logs` (게이트키퍼 검증 및 처방 조치 추적)
```sql
CREATE TABLE phase_gate_logs (
  id VARCHAR(64) PRIMARY KEY,
  task_id VARCHAR(64) NOT NULL,
  task_code VARCHAR(32) NOT NULL,
  phase_num INT NOT NULL,
  overall_score INT NOT NULL,
  passed BOOLEAN NOT NULL,
  evaluated_by_model_id VARCHAR(64) NOT NULL,
  evaluation_json JSONB NOT NULL,
  executed_action_id VARCHAR(64),
  executed_action_category VARCHAR(32), -- 'ADVANCE', 'RETRY_FIX', 'FALLBACK_SWAP', 'SAVEPOINT_ROLLBACK'
  action_result VARCHAR(32), -- 'SUCCESS', 'FAILED'
  action_executed_at TIMESTAMP,
  reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5. `ai_accounts` (AI 공급자 계정 풀 및 3-Tier 서킷 브레이커)
```sql
CREATE TABLE ai_accounts (
  id VARCHAR(64) PRIMARY KEY,
  provider VARCHAR(32) NOT NULL, -- 'ANTHROPIC', 'OPENAI', 'GOOGLE', 'MANUS'
  account_name VARCHAR(128) NOT NULL,
  tier VARCHAR(32) DEFAULT 'ENTERPRISE',
  monthly_budget_usd NUMERIC(10, 2) NOT NULL,
  spent_usd NUMERIC(10, 2) DEFAULT 0.00,
  daily_tokens_used BIGINT DEFAULT 0,
  daily_token_limit BIGINT NOT NULL,
  circuit_state VARCHAR(16) DEFAULT 'CLOSED', -- 'CLOSED', 'OPEN', 'HALF_OPEN'
  cooldown_until TIMESTAMP,
  consecutive_failures INT DEFAULT 0,
  fallback_provider VARCHAR(32),
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 6. `team_members` (RBAC 팀 멤버 및 토큰 한도)
```sql
CREATE TABLE team_members (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  role VARCHAR(32) NOT NULL, -- 'SUPER_ADMIN', 'ARCHITECT', 'ENGINEER', 'REVIEWER', 'AUDITOR'
  assigned_models TEXT[] NOT NULL,
  daily_token_limit BIGINT NOT NULL,
  daily_token_used BIGINT DEFAULT 0,
  status VARCHAR(16) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
