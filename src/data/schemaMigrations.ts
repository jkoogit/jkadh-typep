// Migration Registry: schema_migrations definition and atomic versioned scripts (v1.0.0, v2.0.0, v2.2.0)
export interface SchemaMigrationScript {
  version: string;
  description: string;
  scriptName: string;
  appliedAt?: string;
  appliedBy?: string;
  executionTimeMs?: number;
  success?: boolean;
  ddlAndDmlSql: string;
  rollbackSql: string;
}

export interface AppliedMigrationRecord {
  version: string;
  description: string;
  script_name: string;
  checksum: string;
  applied_by: string;
  applied_at: string;
  execution_time_ms: number;
  success: boolean;
}

export const SCHEMA_MIGRATIONS_TABLE_DDL = `
  CREATE TABLE IF NOT EXISTS schema_migrations (
    version VARCHAR(32) PRIMARY KEY,
    description VARCHAR(256) NOT NULL,
    script_name VARCHAR(128) NOT NULL,
    checksum VARCHAR(64),
    applied_by VARCHAR(64) DEFAULT 'SYSTEM',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time_ms INT DEFAULT 0,
    success BOOLEAN DEFAULT TRUE,
    reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV',
    reg_user_id VARCHAR(64) DEFAULT 'SYSTEM',
    reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV',
    mod_user_id VARCHAR(64) DEFAULT 'SYSTEM',
    mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  COMMENT ON TABLE schema_migrations IS 'JKADH Framework 스키마 버전 관리 메타 테이블 (Enterprise Migration Engine)';
`;

export const MIGRATION_SCRIPTS: SchemaMigrationScript[] = [
  {
    version: 'v1.0.0',
    description: 'Initial 4 Core Entities (ai_accounts, task_nodes, execution_metrics, team_members)',
    scriptName: 'V1_0_0__initial_core_entities.sql',
    ddlAndDmlSql: `
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
        reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV',
        reg_user_id VARCHAR(64) DEFAULT 'jkoogi',
        reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV',
        mod_user_id VARCHAR(64) DEFAULT 'jkoogi',
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
        reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV',
        reg_user_id VARCHAR(64) DEFAULT 'jkoogi',
        reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV',
        mod_user_id VARCHAR(64) DEFAULT 'jkoogi',
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
        status VARCHAR(32) DEFAULT 'SUCCESS',
        reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV',
        reg_user_id VARCHAR(64) DEFAULT 'SYSTEM',
        reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV',
        mod_user_id VARCHAR(64) DEFAULT 'SYSTEM',
        mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV',
        reg_user_id VARCHAR(64) DEFAULT 'jkoogi',
        reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV',
        mod_user_id VARCHAR(64) DEFAULT 'jkoogi',
        mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    rollbackSql: `DROP TABLE IF EXISTS team_members, execution_metrics, task_nodes, ai_accounts CASCADE;`,
  },
  {
    version: 'v2.0.0',
    description: 'Harness Governance (harness_sessions, task_execution_loops, phase_gate_logs)',
    scriptName: 'V2_0_0__harness_governance_and_loops.sql',
    ddlAndDmlSql: `
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
        reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_HARNESS',
        mod_user_id VARCHAR(64) DEFAULT 'SYSTEM',
        mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_HARNESS',
        reg_user_id VARCHAR(64) DEFAULT 'SYSTEM',
        reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_HARNESS',
        mod_user_id VARCHAR(64) DEFAULT 'SYSTEM',
        mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `,
    rollbackSql: `DROP TABLE IF EXISTS phase_gate_logs, task_execution_loops, harness_sessions CASCADE;`,
  },
  {
    version: 'v2.2.0',
    description: '3-Tier Circuit Breaker, Dual DAG Distributed Locks & Data Harmonization Seed',
    scriptName: 'V2_2_0__circuit_breaker_and_governance_data.sql',
    ddlAndDmlSql: `
      -- 1. Alter ai_accounts for circuit breaker and standard audit metadata
      ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS circuit_state VARCHAR(32) DEFAULT 'CLOSED';
      ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS cooldown_until TIMESTAMPTZ;
      ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS primary_fallback_provider VARCHAR(32) DEFAULT 'GOOGLE';
      ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
      ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS reg_user_id VARCHAR(64) DEFAULT 'jkoogi';
      ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
      ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS mod_user_id VARCHAR(64) DEFAULT 'jkoogi';
      ALTER TABLE ai_accounts ADD COLUMN IF NOT EXISTS mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      -- 2. Alter task_nodes for dual DAG & lock and standard audit metadata
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS git_branch VARCHAR(128) DEFAULT 'main';
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS target_git_branch VARCHAR(32) DEFAULT 'dev';
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS release_tag VARCHAR(64);
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS locked_by_session_id VARCHAR(64);
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS lock_acquired_at TIMESTAMP;
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS dependencies JSONB DEFAULT '[]'::jsonb;
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS reg_user_id VARCHAR(64) DEFAULT 'jkoogi';
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS mod_user_id VARCHAR(64) DEFAULT 'jkoogi';
      ALTER TABLE task_nodes ADD COLUMN IF NOT EXISTS mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      -- 3. Alter phase_gate_logs and task_execution_loops audit metadata
      ALTER TABLE phase_gate_logs ADD COLUMN IF NOT EXISTS executed_action_id VARCHAR(64);
      ALTER TABLE phase_gate_logs ADD COLUMN IF NOT EXISTS action_execution_result VARCHAR(32);
      ALTER TABLE phase_gate_logs ADD COLUMN IF NOT EXISTS reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_HARNESS';
      ALTER TABLE phase_gate_logs ADD COLUMN IF NOT EXISTS reg_user_id VARCHAR(64) DEFAULT 'SYSTEM';
      ALTER TABLE phase_gate_logs ADD COLUMN IF NOT EXISTS reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE phase_gate_logs ADD COLUMN IF NOT EXISTS mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_HARNESS';
      ALTER TABLE phase_gate_logs ADD COLUMN IF NOT EXISTS mod_user_id VARCHAR(64) DEFAULT 'SYSTEM';
      ALTER TABLE phase_gate_logs ADD COLUMN IF NOT EXISTS mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE task_execution_loops ADD COLUMN IF NOT EXISTS mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_HARNESS';
      ALTER TABLE task_execution_loops ADD COLUMN IF NOT EXISTS mod_user_id VARCHAR(64) DEFAULT 'SYSTEM';
      ALTER TABLE task_execution_loops ADD COLUMN IF NOT EXISTS mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      -- 4. Alter team_members and execution_metrics audit metadata
      ALTER TABLE team_members ADD COLUMN IF NOT EXISTS reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
      ALTER TABLE team_members ADD COLUMN IF NOT EXISTS reg_user_id VARCHAR(64) DEFAULT 'jkoogi';
      ALTER TABLE team_members ADD COLUMN IF NOT EXISTS reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE team_members ADD COLUMN IF NOT EXISTS mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
      ALTER TABLE team_members ADD COLUMN IF NOT EXISTS mod_user_id VARCHAR(64) DEFAULT 'jkoogi';
      ALTER TABLE team_members ADD COLUMN IF NOT EXISTS mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      ALTER TABLE execution_metrics ADD COLUMN IF NOT EXISTS reg_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
      ALTER TABLE execution_metrics ADD COLUMN IF NOT EXISTS reg_user_id VARCHAR(64) DEFAULT 'SYSTEM';
      ALTER TABLE execution_metrics ADD COLUMN IF NOT EXISTS reg_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
      ALTER TABLE execution_metrics ADD COLUMN IF NOT EXISTS mod_sys_cd VARCHAR(32) DEFAULT 'JKADH_DEV';
      ALTER TABLE execution_metrics ADD COLUMN IF NOT EXISTS mod_user_id VARCHAR(64) DEFAULT 'SYSTEM';
      ALTER TABLE execution_metrics ADD COLUMN IF NOT EXISTS mod_dt TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

      -- 5. Atomic Data Migration: Seed Initial AI Accounts
      INSERT INTO ai_accounts (id, provider, account_name, total_token_quota, used_tokens, remaining_tokens, cost_monthly_limit_usd, status, circuit_state, reg_sys_cd, reg_user_id, mod_sys_cd, mod_user_id)
      VALUES 
        ('acc_ant_01', 'ANTHROPIC', 'Anthropic Team Tier 4 (Primary)', 20000000, 3420000, 16580000, 400.00, 'HEALTHY', 'CLOSED', 'JKADH_DEV', 'jkoogi', 'JKADH_DEV', 'jkoogi'),
        ('acc_oai_01', 'OPENAI', 'OpenAI Tier 5 Shared Enterprise', 15000000, 4890000, 10110000, 300.00, 'HEALTHY', 'CLOSED', 'JKADH_DEV', 'jkoogi', 'JKADH_DEV', 'jkoogi'),
        ('acc_gem_01', 'GOOGLE', 'Google Gemini 3.7 Pro Platform (High-Speed)', 30000000, 2100000, 27900000, 150.00, 'HEALTHY', 'CLOSED', 'JKADH_DEV', 'jkoogi', 'JKADH_DEV', 'jkoogi')
      ON CONFLICT (id) DO NOTHING;
    `,
    rollbackSql: `
      ALTER TABLE ai_accounts DROP COLUMN IF EXISTS circuit_state, DROP COLUMN IF EXISTS cooldown_until;
      ALTER TABLE task_nodes DROP COLUMN IF EXISTS locked_by_session_id, DROP COLUMN IF EXISTS lock_acquired_at;
    `,
  },
];

export const LATEST_SCHEMA_VERSION = MIGRATION_SCRIPTS[MIGRATION_SCRIPTS.length - 1].version;
