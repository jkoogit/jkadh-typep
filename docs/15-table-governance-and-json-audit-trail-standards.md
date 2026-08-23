# 🏛️ [JKADH 표준 15] 데이터베이스 테이블 관리 및 JSON 이력 거버넌스 표준 정책서 (Table Governance & JSON Audit Trail Standards)

- **문서 번호**: `DOC-STD-15`
- **표준 코드**: `JKADH-STD-DB-02`
- **책임자**: 조정국 (`mem-jkoo` / `SUPER_ADMIN`, Platform Architecture Lab)
- **적용 대상**: `jkadhp_dev` 단일 PostgreSQL 16.2 전(全) 테이블 및 데이터 모델 인터페이스
- **최신 개정일**: 2026-08-20 (v1.0.0)

---

## 1. 개요 및 정책 목적 (Purpose)

본 문서는 JKADH AI 소프트웨어 개발 플랫폼의 단일 데이터베이스(`jkadhp_dev`)에서 운용되는 모든 테이블에 대해 **"테이블 물리 컬럼 슬림화(업무 컬럼 중심) 및 관리용 메타데이터의 JSON 완전 위임"** 원칙에 입각한 거버넌스 정책을 정의합니다.

- **업무 컬럼 중심 테이블 설계**: 화면에 직접 조회·표시되거나 비즈니스 로직(WHERE, JOIN, ORDER BY)에 직접 사용되는 핵심 업무 데이터 및 6대 공통 감사 컬럼(`reg_dt`, `mod_dt` 등)만 물리 컬럼으로 유지합니다.
- **관리성 일시 및 전이 메타데이터의 JSON 위임**: 폐기일시, 삭제일시, 폐기사유, 이전 담당자/세션 이력, 컬럼별 변경 전후 Diff 등 **운영 감사 목적의 부가 정보는 `revision_history (JSONB)` 내부에서 100% 흡수·관리**하여 불필요한 테이블 컬럼 비대화를 원천 차단합니다.

---

## 2. 3-Tier 테이블 거버넌스 분류 체계 (3-Tier Classification Matrix)

데이터베이스 내 모든 테이블은 UPDATE 빈도, 감사 추적 필요성, 레코드 생애주기에 따라 다음 3대 등급으로 엄격히 분류됩니다:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        3-Tier 테이블 거버넌스 및 JSON 감사 이력 분류 매트릭스                     │
├─────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│ Tier 1: 필수 대상 (Core) │ Tier 2: 메타/설정 (Meta)  │ Tier 3: 불변 로그 (Append-Only)   │
├─────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ • 거버넌스 핵심 마스터     │ • 환경 설정 및 상태 전이 │ • 시계열 텔레메트리/실행 로그     │
│ • revision_history 필수  │ • 중요 상태 전이만 기록  │ • revision_history 절대 금지      │
│ • 물리 컬럼: 순수 업무용 │ • 물리 컬럼: 순수 설정용 │ • INSERT 전용, UPDATE 차단       │
│ • 관리/이력: JSONB 완전위임│ • 관리/이력: JSONB 위임  │ • JSON 이력 불필요 (자체가 로그)  │
└─────────────────────────┴──────────────────────────┴───────────────────────────────────┘
```

### 2.1 [Tier 1] 핵심 마스터 엔티티 (Core Masters - 필수 적용)
- **정의**: 비즈니스 및 거버넌스의 기준이 되는 데이터로, "누가/언제/어떤 세션에서/왜 값을 변경했는지"에 대한 감사 추적이 필수적인 테이블.
- **물리 컬럼 규칙 (Slim Table Design)**:
  1. 업무 식별자 및 비즈니스 데이터 컬럼 (예: `task_code`, `title`, `test_target` 등)
  2. 업무 상태 플래그: `status VARCHAR(20)` (`ACTIVE`, `DEPRECATED`, `DELETED`)
  3. JSON 관리 컬럼: `revision_history JSONB NOT NULL DEFAULT '[]'::jsonb`, `revision_count INT NOT NULL DEFAULT 0`
  4. 6대 공통 감사 컬럼: `reg_sys_cd`, `reg_user_id`, `reg_dt`, `mod_sys_cd`, `mod_user_id`, `mod_dt`
  5. **🚨 물리 컬럼 제외 대상**: `deprecated_dt`, `deleted_dt`, `deprecation_reason`, `origin_*` 등은 별도 컬럼으로 두지 않고 **`revision_history` JSON 내부 객체로 완전 위임**.
- **대상 테이블**: `task_nodes`, `test_case_catalogs`, `team_members`, `api_vault_keys`

---

### 2.2 [Tier 2] 메타 및 설정 엔티티 (Configuration/Meta - 조건부 적용)
- **정의**: 설정 값이나 세션 상태를 관리하는 테이블로, 일반적인 카운터/하트비트 갱신은 제외하고 **핵심 목표 변경 및 비정상 종료 등 주요 전이 이벤트만 JSON에 선별 기록**.
- **대상 테이블**: `harness_sessions`, `ai_accounts`

---

### 2.3 [Tier 3] 불변 시계열/실행 로그 엔티티 (Append-Only Logs - 적용 절대 금지)
- **정의**: 매 트랜잭션마다 신규 레코드로 INSERT만 발생하고 UPDATE가 발생하지 않는 고빈도 시계열 데이터. (JSON 이력 추가 시 심각한 DB I/O 낭비 유발)
- **대상 테이블**: `schema_migrations`, `phase_gate_logs`, `task_execution_loops`, `token_telemetry_logs`

---

## 3. 플랫폼 전수 테이블 거버넌스 카탈로그 (Table Catalog)

| 테이블명 | 거버넌스 등급 | JSON 이력 관리 | 물리 컬럼 정책 | UPDATE 빈도 | 관리 목적 및 정책 |
|---|:---:|:---:|:---:|:---:|---|
| **`task_nodes`** | **Tier 1 (Core)** | **`적용 (필수)`** | **`순수 업무 컬럼`** | 낮음 | 태스크 담당자, 일정, 의존성, 7-Phase 상태 전이의 책임 추적 |
| **`test_case_catalogs`** | **Tier 1 (Core)** | **`적용 (필수)`** | **`순수 업무 컬럼`** | 낮음 | 3대 시나리오 테스트 명세 개정, 담당 작업 변경, 폐기 사유 추적 |
| **`team_members`** | **Tier 1 (Core)** | **`적용 (필수)`** | **`순수 업무 컬럼`** | 매우 낮음 | SUPER_ADMIN 승격, 토큰 쿼터 한도 증액, 권한 변경 보안 감사 |
| **`api_vault_keys`** | **Tier 1 (Core)** | **`적용 (필수)`** | **`순수 업무 컬럼`** | 매우 낮음 | API Key 로테이션, 권한 범위 변경 이력 추적 (단, 키 값 제외) |
| **`harness_sessions`** | **Tier 2 (Meta)** | **`조건부 적용`** | **`순수 설정 컬럼`** | 보통 | 하트비트는 제외, 세션 목표 변경 및 강제 종료 사유만 기록 |
| **`ai_accounts`** | **Tier 2 (Meta)** | **`조건부 적용`** | **`순수 설정 컬럼`** | 보통 | 월간 예산 증액, 서킷 브레이커 상태 변경 이력만 기록 |
| **`schema_migrations`** | **Tier 3 (Log)** | **`금지 (불필요)`**| **`순수 불변 컬럼`** | 없음 | Flyway/Liquibase 표준 불변 형상 마이그레이션 이력 |
| **`phase_gate_logs`** | **Tier 3 (Log)** | **`금지 (불필요)`**| **`순수 로그 컬럼`** | 없음 | 7-Phase Gatekeeper 검증 결과 불변 시계열 로그 |
| **`task_execution_loops`** | **Tier 3 (Log)** | **`금지 (불필요)`**| **`순수 루프 컬럼`** | 없음 | 샌드박스 7-Phase 루프 실행 및 세이브포인트 스냅샷 로그 |

---

## 4. 표준 JSON 수정이력 스키마 규격 (`revision_history JSONB`)

관리 정보(폐기일시, 삭제일시, 사유, 이전 세션/작업 맥락, 변경 Diff)를 완벽히 흡수하는 **표준 JSONB 데이터 명세**입니다:

```json
[
  {
    "rev": 1,
    "action": "CREATE",
    "event_dt": "2026-08-19T21:05:00Z",
    "actor": {
      "user_id": "mem-jkoo",
      "user_name": "조정국 (SUPER_ADMIN)"
    },
    "origin_context": {
      "task_graph_id": "DAG-PLAT-01",
      "session_id": "SES-20260820-08",
      "task_code": "PLAT-CLI-07",
      "work_id": "WRK-CLI-STATUS-01"
    },
    "reason": "최초 테스트케이스 및 태스크 생성"
  },
  {
    "rev": 2,
    "action": "UPDATE_SPEC",
    "event_dt": "2026-08-20T13:30:00Z",
    "actor": {
      "user_id": "mem-jkoo",
      "user_name": "조정국 (SUPER_ADMIN)"
    },
    "current_context": {
      "session_id": "SES-20260820-08",
      "task_code": "PLAT-CLI-07",
      "work_id": "WRK-CLI-STATUS-01"
    },
    "diff": {
      "status": { "before": "PLANNED", "after": "IN_PROGRESS" },
      "assigned_to": { "before": "mem-minji", "after": "mem-jkoo" }
    },
    "reason": "6대 하네스 라이프사이클 CLI 자동화 작업 착수 및 아키텍트 직접 배정"
  },
  {
    "rev": 3,
    "action": "DEPRECATE",
    "event_dt": "2026-09-01T10:00:00Z",
    "actor": {
      "user_id": "mem-jkoo",
      "user_name": "조정국 (SUPER_ADMIN)"
    },
    "deprecated_info": {
      "deprecated_dt": "2026-09-01T10:00:00Z",
      "reason": "PLAT-VIBE-06 모듈 개편으로 구형 인터페이스 폐기"
    }
  }
]
```

---

## 5. DDL 구현 템플릿 (`V2_3_0__test_catalog_and_json_audit_trail.sql`)

```sql
-- =============================================================================
-- V2.3.0 DB Migration: Slim Table Design with JSON-Delegated Admin Metadata
-- =============================================================================

-- 1. 테스트케이스 마스터 테이블 (순수 업무 컬럼 중심)
CREATE TABLE IF NOT EXISTS test_case_catalogs (
    test_id             VARCHAR(50) PRIMARY KEY, -- e.g. 'TC-CLI-01'
    
    -- 업무 식별 및 소속
    task_graph_id       VARCHAR(50) NOT NULL,
    session_id          VARCHAR(50) NOT NULL,
    task_code           VARCHAR(50) NOT NULL,
    work_id             VARCHAR(50) NOT NULL,
    
    -- 테스트 업무 명세
    test_target         VARCHAR(150) NOT NULL,
    test_category       VARCHAR(20) NOT NULL, -- 'HAPPY_PATH', 'EDGE_BOUNDS', 'ERROR_RECOVERY'
    description         TEXT NOT NULL,
    
    -- 업무 상태 (ACTIVE: 정상, DEPRECATED: 폐기, DELETED: 논리삭제)
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    
    -- 관리정보 및 변경 이력 완전 위임 (JSONB)
    revision_count      INT NOT NULL DEFAULT 0,
    revision_history    JSONB NOT NULL DEFAULT '[]'::jsonb,
    
    -- 6대 공통 감사 컬럼 (등록/수정 일시 및 작업자)
    reg_sys_cd          VARCHAR(20) NOT NULL DEFAULT 'JKADH_PLATFORM',
    reg_user_id         VARCHAR(50) NOT NULL,
    reg_dt              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mod_sys_cd          VARCHAR(20) NOT NULL DEFAULT 'JKADH_PLATFORM',
    mod_user_id         VARCHAR(50) NOT NULL,
    mod_dt              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. 기존 task_nodes 테이블 JSON 감사 이력 확장
ALTER TABLE task_nodes 
  ADD COLUMN IF NOT EXISTS revision_count INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS revision_history JSONB NOT NULL DEFAULT '[]'::jsonb;

-- 3. GIN 인덱스 생성 (JSONB 역방향 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_test_catalogs_history ON test_case_catalogs USING gin (revision_history);
CREATE INDEX IF NOT EXISTS idx_task_nodes_history ON task_nodes USING gin (revision_history);
```

---

## 6. 개정 이력 (Revision History)

| 버전 | 개정 일자 | 개정자 | 개정 내용 요약 |
|---|---|---|---|
| **v1.0.0** | 2026-08-20 | 조정국 (SUPER_ADMIN) | 3-Tier 테이블 거버넌스 분류 기준, 표준 JSONB 감사 이력 스키마 및 생애주기 정책 공식 제정 |
| **v1.1.0** | 2026-08-20 | 조정국 (SUPER_ADMIN) | 테이블 물리 컬럼 슬림화 원칙 확정: 폐기/삭제일시 및 관리성 메타데이터를 JSONB 내부로 100% 위임 반영 |

