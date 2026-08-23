export interface SchemaMigrationMeta {
  version: string;
  description: string;
  scriptName: string;
  checksum?: string;
  appliedBy: string;
  appliedAt: string;
  executionTimeMs: number;
  success: boolean;
}

export interface TableVersionHistory {
  version: string;
  releasedAt: string;
  author: string;
  summary: string;
  targetDatabase: string;
  appliedTablesCount: number;
  migrationSql: string;
  rollbackSql: string;
  scriptName: string;
  schemaSnapshot: {
    tableName: string;
    description: string;
    columnCount: number;
    primaryKey: string;
  }[];
}

export interface SchemaDiffCheckItem {
  version: string;
  scriptName: string;
  description: string;
  appliedAt: string | null;
  appliedBy: string | null;
  executionTimeMs: number;
  status: 'APPLIED' | 'PENDING' | 'FAILED';
}

export const SCHEMA_MIGRATIONS_DDL = `
-- Flyway/Liquibase 표준: 단일 스키마 버전 관리 메타 테이블
CREATE TABLE IF NOT EXISTS schema_migrations (
  version VARCHAR(32) PRIMARY KEY,         -- e.g. 'v1.0.0', 'v2.0.0', 'v2.2.0'
  description VARCHAR(256) NOT NULL,       -- 마이그레이션 요약 설명
  script_name VARCHAR(128) NOT NULL,       -- e.g. 'V2_2_0__circuit_breaker_and_governance.sql'
  checksum VARCHAR(64),                    -- 스크립트 무결성 해시
  applied_by VARCHAR(64) DEFAULT 'SYSTEM', -- 적용 주체
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- 실행 시각
  execution_time_ms INT DEFAULT 0,         -- 소요 시간(ms)
  success BOOLEAN DEFAULT TRUE             -- 성공 여부
);
`;

export const SCHEMA_VERSION_HISTORY: TableVersionHistory[] = [
  {
    version: 'v1.0.0',
    releasedAt: '2026-08-10 09:00:00',
    author: 'jkoogi (구진규)',
    summary: '초기 4대 핵심 테이블 (ai_accounts, team_members, task_nodes, execution_metrics) 생성 및 베이스라인 수립',
    targetDatabase: 'jkadhp_dev',
    appliedTablesCount: 4,
    scriptName: 'V1_0_0__initial_core_entities.sql',
    migrationSql: `-- V1_0_0__initial_core_entities.sql
CREATE TABLE IF NOT EXISTS ai_accounts (
  id VARCHAR(64) PRIMARY KEY,
  provider VARCHAR(32) NOT NULL,
  account_name VARCHAR(128) NOT NULL,
  total_token_quota BIGINT DEFAULT 10000000,
  used_tokens BIGINT DEFAULT 0,
  remaining_tokens BIGINT DEFAULT 10000000,
  cost_monthly_limit_usd NUMERIC(10,2) DEFAULT 200.00,
  current_cost_usd NUMERIC(10,2) DEFAULT 0.00,
  status VARCHAR(32) DEFAULT 'HEALTHY',
  reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_nodes (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) NOT NULL UNIQUE,
  title VARCHAR(256) NOT NULL,
  module VARCHAR(64) NOT NULL,
  current_phase INT DEFAULT 1,
  status VARCHAR(32) DEFAULT 'NOT_STARTED',
  spec_validation_score INT DEFAULT 0,
  assigned_to VARCHAR(64),
  reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS execution_metrics (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tokens_consumed INT NOT NULL,
  cost_usd NUMERIC(10,4) DEFAULT 0.0,
  latency_ms INT DEFAULT 0,
  model_name VARCHAR(64),
  task_code VARCHAR(64),
  user_id VARCHAR(64),
  status VARCHAR(32) DEFAULT 'SUCCESS'
);

CREATE TABLE IF NOT EXISTS team_members (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(64) NOT NULL,
  email VARCHAR(128) NOT NULL,
  role VARCHAR(32) NOT NULL,
  allowed_models JSONB DEFAULT '[]'::jsonb,
  daily_token_limit BIGINT DEFAULT 1000000,
  tokens_used_today BIGINT DEFAULT 0,
  monthly_budget_usd NUMERIC(10,2) DEFAULT 100.00,
  cost_used_usd NUMERIC(10,2) DEFAULT 0.00,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  department VARCHAR(64),
  reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
    rollbackSql: `DROP TABLE IF EXISTS team_members, execution_metrics, task_nodes, ai_accounts CASCADE;`,
    schemaSnapshot: [
      { tableName: 'ai_accounts', description: 'AI 계정 및 토큰 쿼터 관리', columnCount: 11, primaryKey: 'id' },
      { tableName: 'task_nodes', description: '태스크 그래프 노드', columnCount: 10, primaryKey: 'id' },
      { tableName: 'execution_metrics', description: 'AI 호출 메트릭 및 비용 감사', columnCount: 9, primaryKey: 'id' },
      { tableName: 'team_members', description: '팀원 및 RBAC 권한 관리', columnCount: 13, primaryKey: 'id' },
    ],
  },
  {
    version: 'v2.0.0',
    releasedAt: '2026-08-16 14:30:00',
    author: 'jkoogi (구진규)',
    summary: '세션 거버넌스(harness_sessions), 7종 루프 상태머신(task_execution_loops), 게이트키퍼 로그(phase_gate_logs) 신규 추가',
    targetDatabase: 'jkadhp_dev',
    appliedTablesCount: 7,
    scriptName: 'V2_0_0__harness_governance_and_loops.sql',
    migrationSql: `-- V2_0_0__harness_governance_and_loops.sql
CREATE TABLE IF NOT EXISTS harness_sessions (
  id VARCHAR(64) PRIMARY KEY,
  session_code VARCHAR(64) NOT NULL UNIQUE,
  user_id VARCHAR(64) NOT NULL,
  user_email VARCHAR(128) NOT NULL,
  user_role VARCHAR(32) DEFAULT 'SUPER_ADMIN',
  target_database VARCHAR(64) DEFAULT 'jkadhp_dev',
  active_task_id VARCHAR(64),
  active_task_code VARCHAR(64),
  active_phase_num INT DEFAULT 1,
  session_goal TEXT NOT NULL,
  status VARCHAR(32) DEFAULT 'ACTIVE',
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_heartbeat_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  tokens_consumed BIGINT DEFAULT 0,
  cost_usd NUMERIC(10,4) DEFAULT 0.0000,
  execution_count INT DEFAULT 0,
  savepoint_name VARCHAR(64),
  next_handoff_brief TEXT,
  reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_HARNESS',
  reg_user_id VARCHAR(64) DEFAULT 'SYSTEM',
  reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_HARNESS',
  mod_user_id VARCHAR(64) DEFAULT 'SYSTEM',
  mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS task_execution_loops (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64),
  task_id VARCHAR(64) NOT NULL,
  task_code VARCHAR(64) NOT NULL,
  phase_number INT NOT NULL,
  loop_number INT NOT NULL,
  loop_action VARCHAR(64) NOT NULL,
  model_id VARCHAR(64) NOT NULL,
  savepoint_name VARCHAR(64),
  ast_validation_passed BOOLEAN DEFAULT TRUE,
  diff_patch TEXT,
  tokens_consumed INT DEFAULT 0,
  latency_ms INT DEFAULT 0,
  reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_HARNESS',
  reg_user_id VARCHAR(64) DEFAULT 'SYSTEM',
  reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS phase_gate_logs (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(64),
  task_id VARCHAR(64) NOT NULL,
  task_code VARCHAR(64) NOT NULL,
  phase_number INT NOT NULL,
  phase_code VARCHAR(64) NOT NULL,
  overall_score INT NOT NULL,
  passed BOOLEAN NOT NULL DEFAULT FALSE,
  blockers JSONB DEFAULT '[]'::jsonb,
  warnings JSONB DEFAULT '[]'::jsonb,
  criteria_evaluations JSONB DEFAULT '[]'::jsonb,
  prescriptive_actions JSONB DEFAULT '[]'::jsonb,
  executed_action_id VARCHAR(64),
  action_execution_result VARCHAR(32),
  evaluated_by VARCHAR(64) DEFAULT 'GATEKEEPER_ENGINE',
  evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`,
    rollbackSql: `DROP TABLE IF EXISTS phase_gate_logs, task_execution_loops, harness_sessions CASCADE;`,
    schemaSnapshot: [
      { tableName: 'harness_sessions', description: 'AI 세션 수명주기, 30초 주기 하트비트 및 태스크 점유 락', columnCount: 24, primaryKey: 'id' },
      { tableName: 'task_execution_loops', description: '7종 하네스 루프 상태머신 이력 및 DB Savepoint 영속화', columnCount: 14, primaryKey: 'id' },
      { tableName: 'phase_gate_logs', description: '7단계 게이트키퍼 준수 규칙 평가 및 처방 액션 집행 로그', columnCount: 16, primaryKey: 'id' },
    ],
  },
  {
    version: 'v2.2.0',
    releasedAt: '2026-08-18 01:10:00',
    author: 'jkoogi (구진규)',
    summary: '서킷브레이커 상태 컬럼, 듀얼 DAG 분산 락 컬럼 추가 및 초기 3대 공급자 데이터 마이그레이션(DML) 원자적 적용',
    targetDatabase: 'jkadhp_dev',
    appliedTablesCount: 7,
    scriptName: 'V2_2_0__circuit_breaker_and_governance_data.sql',
    migrationSql: `-- V2_2_0__circuit_breaker_and_governance_data.sql (DDL + Atomic Data DML)
-- 1. AI Accounts 서킷 브레이커 컬럼 확장
ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS circuit_state VARCHAR(32) DEFAULT 'CLOSED';
ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMPTZ;
ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS primary_fallback_provider VARCHAR(32) DEFAULT 'GOOGLE';
ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS reg_user_id VARCHAR(64) DEFAULT 'jkoogi';
ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS mod_user_id VARCHAR(64) DEFAULT 'jkoogi';

-- 2. Task Nodes 듀얼 DAG 분산 락 컬럼 확장
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS git_branch VARCHAR(128) DEFAULT 'main';
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS target_git_branch VARCHAR(32) DEFAULT 'dev';
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS release_tag VARCHAR(64);
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS locked_by_session_id VARCHAR(64);
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS lock_acquired_at TIMESTAMP;
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]'::jsonb;
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS reg_user_id VARCHAR(64) DEFAULT 'jkoogi';
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS mod_user_id VARCHAR(64) DEFAULT 'jkoogi';

-- 3. Phase Gate Logs 처방 액션 결과 컬럼 확장
ALTER TABLE phase_gate_logs ADD COLUMN IF NOT EXISTS executed_action_id VARCHAR(64);
ALTER TABLE phase_gate_logs ADD COLUMN IF NOT EXISTS action_execution_result VARCHAR(32);

-- 4. Team Members 감사 컬럼 확장
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS reg_user_id VARCHAR(64) DEFAULT 'jkoogi';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
ALTER TABLE team_members ADD COLUMN IF NOT EXISTS mod_user_id VARCHAR(64) DEFAULT 'jkoogi';

-- 5. 데이터 마이그레이션 (Atomic Data DML): 3대 AI 공급자 기본 레코드 동기화
INSERT INTO ai_accounts (id, provider, account_name, total_token_quota, used_tokens, remaining_tokens, cost_monthly_limit_usd, status, circuit_state)
VALUES 
  ('acc_ant_01', 'ANTHROPIC', 'Anthropic Team Tier 4 (Primary)', 20000000, 3420000, 16580000, 400.00, 'HEALTHY', 'CLOSED'),
  ('acc_oai_01', 'OPENAI', 'OpenAI Tier 5 Shared Enterprise', 15000000, 4890000, 10110000, 300.00, 'HEALTHY', 'CLOSED'),
  ('acc_gem_01', 'GOOGLE', 'Google Gemini 3.7 Pro Platform (High-Speed)', 30000000, 2100000, 27900000, 150.00, 'HEALTHY', 'CLOSED')
ON CONFLICT (id) DO NOTHING;`,
    rollbackSql: `ALTER TABLE ai_accounts DROP COLUMN IF EXISTS circuit_state, DROP COLUMN IF EXISTS cooldown_until;
ALTER TABLE task_nodes DROP COLUMN IF EXISTS locked_by_session_id, DROP COLUMN IF EXISTS lock_acquired_at;`,
    schemaSnapshot: [
      { tableName: 'schema_migrations', description: '스키마 버전 관리 메타 테이블 (Flyway/Liquibase 표준)', columnCount: 14, primaryKey: 'version' },
      { tableName: 'ai_accounts', description: '3대 AI 공급자 API 계정, 토큰 쿼터 및 3-Tier 서킷 브레이커 상태', columnCount: 19, primaryKey: 'id' },
      { tableName: 'harness_sessions', description: 'AI 세션 수명주기, 30초 주기 하트비트, 태스크 락 및 비정상종료 복구', columnCount: 24, primaryKey: 'session_code' },
      { tableName: 'task_nodes', description: 'PDFowers 2계층 작업그래프 DAG 노드 및 7단계 전이 상태', columnCount: 20, primaryKey: 'id' },
      { tableName: 'task_execution_loops', description: '7종 하네스 루프 상태머신 이력 및 DB Savepoint 영속화', columnCount: 19, primaryKey: 'id' },
      { tableName: 'phase_gate_logs', description: '7단계 게이트키퍼 준수 규칙 평가 및 처방 액션 집행 로그', columnCount: 22, primaryKey: 'id' },
      { tableName: 'team_members', description: '6대 RBAC 권한, 일일 토큰 캡 및 소속 부서 관리', columnCount: 17, primaryKey: 'id' },
      { tableName: 'execution_metrics', description: '실시간 토큰 소비량, Latency(ms), Fallback 핫스왑 감사 로그', columnCount: 15, primaryKey: 'id' },
    ],
  },
];
