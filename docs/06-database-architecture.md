# 6. jkadhp_dev PostgreSQL 데이터베이스 아키텍처

## 6.1 단일 개발 DB 환경 격리 원칙
* **데이터베이스명**: `jkadhp_dev` (PostgreSQL 16.2 on AWS RDS Multi-AZ)
* **스키마 네임스페이스**: `public`
* **동시성 제어**: Task 고유 ID 기반 Savepoint 격리 및 마이그레이션 락 메커니즘 적용
* **목적**: stg/prd 환경이 분리되지 않은 개발 단일 DB에서 복수 에이전트/개발자의 스키마 충돌 및 데이터 덮어쓰기 방지

---

## 6.2 핵심 테이블 DDL 스키마

### 1. `ai_accounts` (AI 공급자 계정 풀)
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
  is_active BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `team_members` (RBAC 팀 멤버 및 토큰 한도)
```sql
CREATE TABLE team_members (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  email VARCHAR(128) UNIQUE NOT NULL,
  role VARCHAR(32) NOT NULL, -- 'ADMIN', 'ARCHITECT', 'ENGINEER', 'REVIEWER', 'AUDITOR'
  assigned_models TEXT[] NOT NULL,
  daily_token_limit BIGINT NOT NULL,
  daily_token_used BIGINT DEFAULT 0,
  status VARCHAR(16) DEFAULT 'ACTIVE',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `task_nodes` (작업그래프 및 7단계 라이프사이클)
```sql
CREATE TABLE task_nodes (
  id VARCHAR(64) PRIMARY KEY,
  task_code VARCHAR(32) UNIQUE NOT NULL, -- e.g. 'PDF-OCR-04'
  title VARCHAR(255) NOT NULL,
  category VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL, -- 'BACKLOG', 'ANALYSIS', 'PLANNED', 'DEVELOPING', 'TESTED', 'DONE'
  current_phase INT DEFAULT 1 CHECK (current_phase BETWEEN 1 AND 7),
  assigned_to VARCHAR(64) REFERENCES team_members(id),
  spec_validation_score INT DEFAULT 0,
  phases_payload JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4. `model_execution_logs` (AI 실행 및 토큰 소비 감사 로그)
```sql
CREATE TABLE model_execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id VARCHAR(64) REFERENCES task_nodes(id),
  phase_number INT CHECK (phase_number BETWEEN 1 AND 7),
  model_id VARCHAR(64) NOT NULL,
  tokens_consumed INT NOT NULL,
  cost_usd NUMERIC(8, 4) NOT NULL,
  latency_ms INT NOT NULL,
  status VARCHAR(16) NOT NULL, -- 'SUCCESS', 'FALLBACK_TRIGGERED', 'FAILURE'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```
