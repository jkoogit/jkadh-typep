import { DocumentationSection } from '../types';

export const SCHEMA_AND_OPERATIONS_DOCUMENTS: DocumentationSection[] = [
  {
    id: 'doc-schema-version-governance',
    category: 'DATABASE',
    titleKr: '12. 단일 개발 DB(jkadhp_dev) 스키마 버전 관리 및 테이블 관리 정책',
    titleEn: 'Schema Versioning, Comment Stamps & Table Management Policy',
    summary: '단일 개발 DB 환경에서의 테이블 버전 관리(v1.0.0~v2.2.0), Comment 기반 스키마 현행화 검사, 데이터 마이그레이션 DDL/DML 누적 관리 및 롤백 정책',
    tags: ['Database', 'Schema', 'Versioning', 'Migration', 'Comment Stamp', 'jkadhp_dev', 'Rollback', 'DDL'],
    lastUpdated: '2026-08-18',
    contentMarkdown: `# 12. 단일 개발 DB(jkadhp_dev) 스키마 버전 관리 및 테이블 관리 정책

- **문서 식별자**: \`DOC-STD-12-SCHEMA-GOVERNANCE\`
- **표준 버전**: \`v2.2.0\`
- **관리 주체**: JKADH Database Architecture Committee
- **적용 대상 DB**: Ubuntu 홈 서버 PostgreSQL 16.2 (\`jkadhp_dev\`)

---

## 1. 스키마 버전 관리 원칙 (Core Schema Versioning Rules)

### 1.1 테이블 코멘트(COMMENT ON TABLE) 버전 스탬프 의무화
모든 PostgreSQL 테이블은 DDL 생성 및 수정 시 메타데이터 코멘트에 공식 스키마 버전을 반드시 명시해야 합니다.
서비스 기동 시 및 DB 탐색기 진입 시 \`information_schema\` 및 \`pg_description\`을 조회하여 현재 DB의 테이블 버전과 코드베이스의 기대 버전(\`v2.2.0\`)을 비교 검사합니다.

\`\`\`sql
-- 예시: 테이블 생성/수정 시 버전 스탬프 부여
COMMENT ON TABLE ai_accounts IS 'jkadh_schema_v2.2.0: 3대 AI 공급자 API 계정, 토큰 쿼터 및 3-Tier 서킷 브레이커 상태';
COMMENT ON TABLE harness_sessions IS 'jkadh_schema_v2.2.0: AI 세션 수명주기, 30초 주기 하트비트, 태스크 락 및 비정상종료 복구';
COMMENT ON TABLE task_nodes IS 'jkadh_schema_v2.2.0: PDFowers 2계층 작업그래프 DAG 노드 및 7단계 전이 상태';
COMMENT ON TABLE task_execution_loops IS 'jkadh_schema_v2.2.0: 7종 하네스 루프 상태머신 이력 및 DB Savepoint 영속화';
COMMENT ON TABLE phase_gate_logs IS 'jkadh_schema_v2.2.0: 7단계 게이트키퍼 준수 규칙 평가 및 처방 액션 집행 로그';
COMMENT ON TABLE team_members IS 'jkadh_schema_v2.2.0: 6대 RBAC 권한, 일일 토큰 캡 및 소속 부서 관리';
COMMENT ON TABLE execution_metrics IS 'jkadh_schema_v2.2.0: 실시간 토큰 소비량, Latency(ms), Fallback 핫스왑 감사 로그';
\`\`\`

---

## 2. 8대 핵심 테이블 메타데이터 및 6대 표준 감사 컬럼 정책

모든 DB 테이블은 다음 **6대 공통 감사 컬럼**을 필수로 포함해야 하며, **Harness Phase 4 Gatekeeper 완료 조건**에서 전수 검증됩니다:

\`\`\`sql
reg_sys_cd   VARCHAR(32) NOT NULL DEFAULT 'JKADH_DEV',  -- 등록 시스템 코드
reg_user_id  VARCHAR(64) NOT NULL DEFAULT 'jkoogi',     -- 등록자 ID
reg_dt       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP, -- 등록 일시
mod_sys_cd   VARCHAR(32) NOT NULL DEFAULT 'JKADH_DEV',  -- 수정 시스템 코드
mod_user_id  VARCHAR(64) NOT NULL DEFAULT 'jkoogi',     -- 수정자 ID
mod_dt       TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP  -- 수정 일시
\`\`\`

| # | 테이블명 | 버전 | 컬럼수 | 용도 및 설명 | PK / 인덱스 |
|---|---|---|---|---|---|
| 1 | \`schema_migrations\` | \`v2.2.0\` | 14 | Flyway/Liquibase 표준 스키마 버전 관리 메타 테이블 | \`version (VARCHAR(32))\` |
| 2 | \`ai_accounts\` | \`v2.2.0\` | 19 | Anthropic, OpenAI, Gemini API 계정, 월간 토큰 쿼터, 3-Tier 서킷브레이커 | \`id (VARCHAR(64))\` |
| 3 | \`harness_sessions\` | \`v2.2.0\` | 24 | AI 개발 세션 수명주기, 30초 하트비트, 작업그래프 락, 스냅샷 복구 | \`id (PK)\`, \`session_code (UQ)\` |
| 4 | \`task_nodes\` | \`v2.2.0\` | 20 | PDFowers 2계층 작업그래프 노드, 7단계 라이프사이클 전이 상태, 점유 락 | \`id (PK)\`, \`code (UQ)\` |
| 5 | \`task_execution_loops\` | \`v2.2.0\` | 19 | 7종 하네스 루프 실행 단위(EXECUTE/REFINE/ROLLBACK), AST 검증, Savepoint | \`id (SERIAL PK)\`, \`task_code\` |
| 6 | \`phase_gate_logs\` | \`v2.2.0\` | 22 | 7단계 공정별 게이트키퍼 준수 규칙 평가 점수, 진단 결함, 처방 액션 피드백 | \`id (SERIAL PK)\`, \`task_id\` |
| 7 | \`team_members\` | \`v2.2.0\` | 17 | 6대 RBAC 권한(SUPER_ADMIN~AUDITOR), 화이트리스트 모델, 일일 토큰 캡 | \`id (VARCHAR(64))\` |
| 8 | \`execution_metrics\` | \`v2.2.0\` | 15 | 실시간 토큰 소비량, 지연 시간(ms), Fallback 핫스왑 감사 로그 | \`id (SERIAL PK)\`, \`timestamp\` |

---

## 3. Harness 거버넌스 완료조건(Gatekeeper) 스키마 검증 연동

1. **Phase 4 완료 조건 자동 검증**:
   - \`rule: ddl_syntax_valid_for_postgres && has_all_audit_cols(["reg_sys_cd","reg_user_id","reg_dt","mod_sys_cd","mod_user_id","mod_dt"])\`
2. **시스템 기동 시 자동 무결성 점검**:
   - 시스템 기동 시 8개 전체 테이블의 6대 감사 컬럼 누락 여부를 자동 점검하여 누락 시 게이트키퍼 Blocker를 발생시키고 배포를 사전 차단합니다.

---

## 3. 스키마 변경 이력 및 마이그레이션 쿼리 누적 관리

### 3.1 누적 버전 이력 (Version History)
- **v1.0.0 (2026-08-10)**: 초기 4대 기본 엔티티(\`ai_accounts\`, \`team_members\`, \`task_nodes\`, \`execution_metrics\`) 생성
- **v2.0.0 (2026-08-16)**: 세션 거버넌스(\`harness_sessions\`), 7종 루프(\`task_execution_loops\`), 게이트키퍼 로그(\`phase_gate_logs\`) 신규 구축
- **v2.2.0 (2026-08-18)**: 서킷브레이커(\`circuit_state\`, \`cooldown_until\`), 듀얼 DAG 분산 락, 테이블 코멘트 버전 스탬프 전면 현행화

### 3.2 데이터 마이그레이션 및 구조 변경 정책 (Migration Safety)
1. **무손실 컬럼 추가 원칙**: 기존 테이블 구조 변경 시 \`ALTER TABLE ... ADD COLUMN IF NOT EXISTS\` 구문을 사용하며, 기본값(\`DEFAULT\`)을 명시하여 기존 레코드의 무결성을 보장합니다.
2. **트랜잭션 격리**: 모든 마이그레이션 DDL/DML은 단일 트랜잭션(\`BEGIN; ... COMMIT;\`) 내에서 수행되며, 오류 발생 시 즉시 \`ROLLBACK\`됩니다.
3. **Savepoint 보존**: 마이그레이션 직전 PostgreSQL 세이브포인트(\`SAVEPOINT sp_schema_migration_v2_2_0\`)를 생성합니다.
4. **롤백 스크립트 페어링**: 마이그레이션 SQL 작성 시 반드시 상응하는 롤백 SQL을 \`src/data/schemaVersions.ts\`에 동시 등록합니다.
`,
  },
  {
    id: 'doc-task-scenarios-and-exceptions',
    category: 'RUNBOOK',
    titleKr: '13. 작업 정보, 3대 시나리오 정의 및 예외처리·복구 방안 정책',
    titleEn: 'Task Specifications, 3-Tier Scenarios & Failure Recovery Runbook',
    summary: 'PDFowers 작업 노드별 정상(Happy Path)/오류(Error Recovery)/예외(Edge-case) 3대 시나리오 명세 및 429 Quota 고갈, 프로세스 강제종료, 스키마 불일치 3대 장애 복구 런북',
    tags: ['Task', 'Scenario', 'Exception', 'Recovery', 'Runbook', '429 Quota', 'Heartbeat', 'Savepoint'],
    lastUpdated: '2026-08-18',
    contentMarkdown: `# 13. 작업 정보, 3대 시나리오 정의 및 예외처리·복구 방안 정책

- **문서 식별자**: \`DOC-RUNBOOK-13-SCENARIOS-RECOVERY\`
- **표준 버전**: \`v2.2.0\`
- **관리 주체**: JKADH Core Operations & Governance Team

---

## 1. 작업 정의 및 3대 시나리오 작성 표준 (3-Tier Scenario Specification)

jkadh Phase 3(작업 기획) 단계에서는 모든 단위 작업(Task)에 대해 아래 **3대 시나리오**를 의무적으로 전수 작성해야 게이트키퍼를 통과할 수 있습니다:

\`\`\`
+-----------------------------------------------------------------------------------+
|                           작업별 3대 필수 시나리오 구조                           |
+-----------------------------------------------------------------------------------+
| 1. NORMAL (Happy Path)     : 정상적인 입력값과 기대 동작 및 정상 상태 전이         |
| 2. ERROR (Error Recovery)  : 입력 오류, 네트워크 순단, 파일 손상 시의 자가 복구    |
| 3. EXCEPTION (Edge Bounds) : 429 쿼터 초과, 메모리 고갈, 프로세스 강제종료 대응     |
+-----------------------------------------------------------------------------------+
\`\`\`

### 1.1 핵심 작업별 시나리오 정의 예시

#### [PDF-OCR-04] 다국어 고해상도 OCR & 레이아웃 좌표 추출
- **NORMAL**: 표준 300DPI PDF 입력 시 바운딩 박스 JSON 및 신뢰도 98% 텍스트 정상 추출
- **ERROR**: 손상되거나 왜곡된 스캔본 입력 시 이진화(Binarization) 및 콘트라스트 보정 후 2차 재시도
- **EXCEPTION**: 500페이지 초과 대용량 파일 또는 OCR 엔진 타임아웃 발생 시, 10페이지 단위 스트림 분할 청킹 및 GPT-4o ➔ Claude ➔ Gemini 핫스왑 실행

#### [PDF-TABLE-05] 비구조화 표(Table) 감지 및 Excel 구조화 변환
- **NORMAL**: 표 외곽선 및 병합 셀(Colspan/Rowspan)이 포함된 재무제표를 2차원 배열 및 계층형 JSON으로 파싱
- **ERROR**: 선이 없는 표(Borderless Table) 감지 실패 시 공백 기반 휴리스틱 좌표 분할 알고리즘 가동
- **EXCEPTION**: 중첩된 다중 표 구조에서 순환 셀 참조 발견 시 표 영역별 격리 파싱 및 경고 메타 주입

---

## 2. 3대 주요 장애 상황 및 예외처리·복구 방안 (Failure Recovery Runbook)

### 시나리오 1: AI Provider 429 Rate Limit 및 토큰 쿼터 고갈
* **증상**: Anthropic 또는 OpenAI API 호출 시 HTTP 429 / Quota Exceeded 응답 수신
* **자동 감지 및 조치**:
  1. 서킷 브레이커가 \`OPEN\` 상태로 즉시 전이 (150ms 이내).
  2. \`ai_accounts\` 테이블의 \`circuit_state = 'OPEN'\`, \`cooldown_until = NOW() + INTERVAL '5 MINUTE'\` 갱신.
  3. 사전에 정의된 차순위 핫스왑 모델(예: \`Gemini 3.7 Flash\`)로 파이프라인 무중단 자동 우회.
  4. 쿨다운 만료 시 \`HALF_OPEN\` 시험 요청을 전송하여 정상 복귀 확인.

### 시나리오 2: 세션 비정상 종료 (Crash / Network Timeout / Heartbeat 유실)
* **증상**: 브라우저 탭 종료 또는 컨테이너 강제 재시작으로 하트비트가 90초 이상 두절됨.
* **복구 절차**:
  1. 하네스 모니터가 \`harness_sessions\`의 \`status\`를 \`STALE\`로 마킹하고 작업 점유 락(\`locked_by_session_id\`)을 안전 해제.
  2. 다음 세션 착수 시 최종 유효 세이브포인트(\`savepoint_name\`)를 탐색하여 데이터 롤백 또는 재개 브리프 로드.
  3. \`is_recovered = TRUE\` 플래그 및 복구 로그 기록.

### 시나리오 3: 원격 DB 스키마 불일치 (Schema Drift / Missing Tables)
* **증상**: PostgreSQL 연결 시 \`relation "xxx" does not exist\` 또는 테이블 코멘트 버전 불일치 발생.
* **복구 절차**:
  1. **[개발 DB 탐색기]** 상단의 **[스키마 현행화 검사]** 배너에 불일치 항목 및 누락 컬럼 자동 노출.
  2. **[1-클릭 스키마 현행화 (v2.2.0)]** 버튼 클릭 시 누적 마이그레이션 SQL(\`src/data/schemaVersions.ts\`)이 일괄 적용되어 무손실로 테이블 및 코멘트 버전 스탬프 동기화.
`,
  },
  {
    id: 'doc-ux-loading-and-feedback-standards',
    category: 'HARNESS',
    titleKr: '14. 대화형 UX 및 비동기 작업 로딩 피드백 표준 가이드라인',
    titleEn: 'Interactive UX & Asynchronous Loading State Feedback Standard',
    summary: '버튼/카드 클릭 시 진행 중 로딩 아이콘 표출 규칙, 단일 카드 vs 전체 헤더 로딩 생명주기 분리, 낙관적 UI 및 중복 방지 비활성화 UX 표준',
    tags: ['UX', 'UI', 'Loading State', 'Spinner', 'Feedback', 'Card Action', 'Header Action', 'Accessibility'],
    lastUpdated: '2026-08-18',
    contentMarkdown: `# 14. 대화형 UX 및 비동기 작업 로딩 피드백 표준 가이드라인

- **문서 식별자**: \`DOC-STD-14-UX-LOADING-FEEDBACK\`
- **표준 버전**: \`v1.0.0\`
- **관리 주체**: JKADH Frontend & Human-Centered UX Architecture Committee
- **적용 대상**: 모든 대시보드 뷰, DB 탐색기, 하네스 실행 및 거버넌스 제어 컴포넌트

---

## 1. 핵심 UX 로딩 및 상호작용 피드백 원칙 (Core Principles)

모든 사용자 인터랙션은 사용자가 시스템의 작업 진행 상황을 직관적으로 인지할 수 있도록 즉각적이고 명확한 시각 피드백을 제공해야 합니다.

### 1.1 즉각적인 액션 피드백 (Immediate Visual Feedback)
* 사용자가 비동기 작업(API 호출, DB 마이그레이션, AI 추론 실행 등)을 트리거하는 버튼을 클릭하면 즉시 해당 버튼 내부에 회전형 로딩 인디케이터(Spinning Loader)를 표시합니다.
* 텍스트 라벨 또한 \`"현행화"\` ➔ \`"현행화 처리중..."\` 또는 \`"전체 현행화 진행중..."\`과 같이 현재 진행형 동사로 전환합니다.

### 1.2 범위별 로딩 수명주기 분리 (Card Scope vs Global Header Scope)
1. **단일 카드 버튼 (Card-level Action)**:
   * 특정 테이블 카드나 개별 작업 노드의 액션 버튼을 클릭했을 때:
   * **해당 카드의 버튼**에만 타겟 집중형 로딩 아이콘(\`animate-spin\`)과 하이라이트 스타일을 표시합니다.
   * 백엔드 처리가 완료되고 해당 엔티티의 상태 갱신이 완료되는 시점에 로딩을 해제합니다.
2. **전체 헤더 버튼 (Header/Global Action)**:
   * 상단 네비게이션 헤더, 일괄 현행화, 전체 새로고침 등 전체 시스템 단위의 액션 버튼을 클릭했을 때:
   * 헤더 버튼에 글로벌 로딩 스피너를 유지하며, **모든 하위 테이블 및 데이터 마이그레이션과 상태 동기화가 완전히 끝날 때까지** 로딩 상태를 유지합니다.
   * 작업 도중 다른 연관 카드들의 중복 클릭을 방지하기 위해 \`disabled\` 잠금 상태를 일괄 적용합니다.

---

## 2. 인터랙션 상태 머신 및 시각 가이드 (Interaction State Machine)

\`\`\`
+---------------+      사용자 클릭      +----------------------+      서버 응답 수신      +---------------+
| IDLE (대기)   | -------------------> | PROCESSING (처리 중) | -----------------------> | SUCCESS / IDLE|
|  [현행화]     |                      |  [↻ 현행화 처리중...] |                          |  [최신 동기화] |
+---------------+                      +----------------------+                          +---------------+
                                                  |
                                                  | 오류 발생 시
                                                  v
                                       +----------------------+
                                       | ERROR (오류 피드백)  |
                                       |  [경고 툴팁 및 복구] |
                                       +----------------------+
\`\`\`

### 2.1 중복 실행 방지 (Idempotency & Re-entry Protection)
* 로딩 중인 상태에서는 버튼을 \`disabled\` 처리하고 포인터 이벤트를 비활성화하여 의도치 않은 이중 제출(Double Submission) 및 레이스 컨디션을 100% 방지합니다.
* 비활성화된 버튼의 투명도는 \`opacity-50\`으로 낮추고, 툴팁을 통해 현재 실행 중인 작업의 성격을 안내합니다.

### 2.2 실시간 데이터 재검증 (Live Re-fetch & Toast)
* 비동기 작업이 종료되면 단순 UI 토글에 그치지 않고, 반드시 원격 API/DB 쿼리를 재조회(\`getDbTables\`, \`runSchemaCheck\`)하여 실제 영속화 결과가 반영되었음을 시각적으로 입증합니다.
`,
  },
];
