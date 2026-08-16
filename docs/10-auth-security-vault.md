# 10. 회원 관리, 다중 역할(RBAC), AES-256 API Key Vault 및 하네스 루프 거버넌스

- **문서 번호**: `DOC-10-AUTH-VAULT`
- **최초 작성일**: 2026-08-16 01:30:00 KST
- **최종 개정일**: 2026-08-16 01:35:00 KST
- **작성자**: 구진규 (SUPER_ADMIN)
- **개정 번호**: v1.0.0

---

## 10.1 개요 (Overview)
본 문서는 jkadh AI DevPlatform의 엔터프라이즈 보안 및 하네스 루프 제어를 위한 4대 핵심 체계를 규정합니다:
1. **회원가입/로그인 및 다중 역할 기반 접근 제어 (RBAC)**
2. **SUPER_ADMIN_IDS 화이트리스트 기반 자동 최고관리자 승격 체계**
3. **개인 및 팀 AI Provider API Key / GPT 계정의 AES-256-GCM 암호화 Vault**
4. **하네스 7대 루프 상태 머신 (`LOOP_ANALYZE` ~ `LOOP_ROLLBACK`) 및 DB Savepoint 연동**

---

## 10.2 다중 역할 권한 매트릭스 (RBAC Matrix)

| 권한 역할 | 일일 토큰 한도 | 모델 접근 권한 | 작업그래프 조작 권한 | API Key Vault 접근 | Savepoint 롤백 권한 |
|---|---|---|---|---|---|
| **`SUPER_ADMIN` / `ADMIN`** | 무제한 / 2.0M | 전체 (Claude, GPT, Gemini, Manus) | 신규 추가, 삭제, 강제 승급, 잠금 해제 | 전사 공용 및 개인 Key 복호화 관리 | 무제한 롤백/복원 집행 |
| **`ARCHITECT`** | 1.5M | Claude 3.7, GPT Codex, Gemini Flash | Phase 1~4 설계 승인, DAG 파생 노드 분기 | 개인 Key 등록/수정 | 루프 단위 복원/롤백 |
| **`ENGINEER`** | 1.0M | GPT Codex, Gemini 3.7 Flash | Phase 5~6 코드 작성 및 루프 실행 | 개인 Key 등록/수정 | 루프 단위 자가치유/보완 |
| **`REVIEWER`** | 800K | Claude 3.7, Gemini Flash | Phase 3/7 시나리오 및 산출물 리뷰 승인 | 읽기 전용 | 루프 승인/반려 |
| **`AUDITOR`** | 500K | Gemini 3.7 Flash | 전 작업 및 세션 감사 로그 열람 | Vault 감사 로그 열람 | 불가 (Read Only) |

---

## 10.3 6대 공통 감사 컬럼 표준 (Audit Metadata Standard)

모든 엔터프라이즈 테이블은 다음 6대 감사 컬럼을 필수로 포함해야 합니다:

```sql
reg_sys_cd   VARCHAR(20)  NOT NULL DEFAULT 'JKADH_WEB',  -- 최초 등록 시스템 코드
reg_user_id  VARCHAR(50)  NOT NULL,                      -- 최초 등록 사용자 ID
reg_dt       TIMESTAMP    NOT NULL DEFAULT NOW(),        -- 최초 등록 일시
mod_sys_cd   VARCHAR(20)  NOT NULL DEFAULT 'JKADH_WEB',  -- 최종 수정 시스템 코드
mod_user_id  VARCHAR(50)  NOT NULL,                      -- 최종 수정 사용자 ID
mod_dt       TIMESTAMP    NOT NULL DEFAULT NOW()         -- 최종 수정 일시
```

---

## 10.4 DDL 스키마 명세 (PostgreSQL)

```sql
-- 1. 회원 및 계정 테이블 (members)
CREATE TABLE members (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'ARCHITECT', 'ENGINEER', 'REVIEWER', 'AUDITOR')),
    department VARCHAR(100),
    daily_token_limit BIGINT NOT NULL DEFAULT 1000000,
    tokens_used_today BIGINT NOT NULL DEFAULT 0,
    monthly_budget_usd NUMERIC(10, 2) NOT NULL DEFAULT 100.00,
    cost_used_usd NUMERIC(10, 4) NOT NULL DEFAULT 0.0000,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'RATE_LIMITED')),
    is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
    reg_sys_cd VARCHAR(20) NOT NULL DEFAULT 'JKADH_WEB',
    reg_user_id VARCHAR(50) NOT NULL,
    reg_dt TIMESTAMP NOT NULL DEFAULT NOW(),
    mod_sys_cd VARCHAR(20) NOT NULL DEFAULT 'JKADH_WEB',
    mod_user_id VARCHAR(50) NOT NULL,
    mod_dt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. 개인/팀 AI API Key Vault 테이블 (user_api_vaults)
CREATE TABLE user_api_vaults (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    provider VARCHAR(20) NOT NULL CHECK (provider IN ('OPENAI', 'ANTHROPIC', 'GOOGLE', 'MANUS', 'CUSTOM')),
    key_alias VARCHAR(100) NOT NULL,
    encrypted_api_key TEXT NOT NULL,       -- AES-256-GCM 암호화된 키 값
    key_iv VARCHAR(64) NOT NULL,           -- GCM 초기화 벡터
    key_tag VARCHAR(64) NOT NULL,          -- GCM 인증 태그
    masked_key VARCHAR(50) NOT NULL,       -- sk-proj-...k9Fa
    is_team_shared BOOLEAN NOT NULL DEFAULT FALSE,
    daily_quota_limit BIGINT NOT NULL DEFAULT 500000,
    used_tokens BIGINT NOT NULL DEFAULT 0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    reg_sys_cd VARCHAR(20) NOT NULL DEFAULT 'JKADH_WEB',
    reg_user_id VARCHAR(50) NOT NULL,
    reg_dt TIMESTAMP NOT NULL DEFAULT NOW(),
    mod_sys_cd VARCHAR(20) NOT NULL DEFAULT 'JKADH_WEB',
    mod_user_id VARCHAR(50) NOT NULL,
    mod_dt TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 3. 세부 하네스 루프 실행 이력 테이블 (task_execution_loops)
CREATE TABLE task_execution_loops (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL REFERENCES task_nodes(id) ON DELETE CASCADE,
    phase_number INT NOT NULL CHECK (phase_number BETWEEN 1 AND 7),
    loop_number INT NOT NULL,
    loop_action VARCHAR(30) NOT NULL CHECK (loop_action IN (
        'LOOP_ANALYZE', 'LOOP_EXECUTE', 'LOOP_REFINE', 'LOOP_ABORT', 
        'LOOP_APPROVE', 'LOOP_DISCARD', 'LOOP_RESTORE', 'LOOP_ROLLBACK'
    )),
    model_id VARCHAR(50) NOT NULL,
    savepoint_id VARCHAR(100),
    ast_validation_passed BOOLEAN NOT NULL DEFAULT FALSE,
    error_summary TEXT,
    tokens_consumed BIGINT NOT NULL DEFAULT 0,
    latency_ms INT NOT NULL DEFAULT 0,
    snapshot_diff_json JSONB,
    reg_sys_cd VARCHAR(20) NOT NULL DEFAULT 'JKADH_ENGINE',
    reg_user_id VARCHAR(50) NOT NULL,
    reg_dt TIMESTAMP NOT NULL DEFAULT NOW(),
    mod_sys_cd VARCHAR(20) NOT NULL DEFAULT 'JKADH_ENGINE',
    mod_user_id VARCHAR(50) NOT NULL,
    mod_dt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

## 10.5 개정 이력 (Revision History)

| 버전 | 개정 일시 | 개정자 | 개정 사유 및 상세 내용 |
|---|---|---|---|
| **v1.0.0** | 2026-08-16 01:35 | 구진규 (SUPER_ADMIN) | 최초 제정: RBAC 다중 역할 매트릭스, AES-256 Vault 스키마, 하네스 루프 7대 상태머신 및 6대 감사 컬럼 표준화 |
