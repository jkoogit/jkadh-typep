# 9. 개발 하네스 점검 및 기존 jkadh 대비 비교 분석 (Harness Architecture & Evolution)

## 9.1 개요
본 문서는 기존 **Classic jkadh 프레임워크**의 하네스 아키텍처를 면밀히 분석하고, 이번 **JKADH AI DevPlatform (PDFowers)** 프로젝트에서 계승(Maintained), 개선(Improved), 신규 현행화(Modernized)한 하네스 제어 메커니즘을 7대 생애주기 영역별로 비교 분석하여 정리한 공식 레퍼런스입니다.

---

## 9.2 7대 핵심 하네스 라이프사이클 비교 매트릭스

| 하네스 영역 (Harness Stage) | 기존 Classic jkadh 방식 | 현행 JKADH AI DevPlatform (PDFowers) 개선점 | 진화 분류 |
|---|---|---|---|
| **1. 세션시작 (Session Start)** | 로컬 환경 변수(`.env`) 로드 및 단일 API 키 인증 | **멀티 Provider 계정 풀링, RBAC 기반 팀원 토큰 쿼터(Soft/Hard Cap) 및 모델 헬스체크 자동 초기화** | **대폭 개선 (Enhanced)** |
| **2. 태스크시작 (Task Start)** | 로컬 파일시스템의 JSON 태스크 정의서 단순 로드 | **작업그래프(Task DAG) 선행 의존성 해제 검증, 3대 시나리오(Happy/Error/Edge) 템플릿 강제 주입** | **체계화 (Standardized)** |
| **3. 태스크처리 (Task Process)** | 단일 LLM에 거대 프롬프트 일괄 전달 후 코드 수신 | **7단계 분할 공정, 모델별 전담 배정(Claude 기획/설계, Codex 코드, Gemini 검증), 3-Tier Circuit Breaker (<150ms 핫스왑)** | **핵심 고도화 (Core Innovation)** |
| **4. 태스크정리 (Task Cleanup)** | 런타임 종료 후 임시 디렉토리 단순 삭제 | **`jkadhp_dev` 단일 DB Savepoint 롤백, AST 정적 검증(`tsc --noEmit`), 메모리/토큰 소비 감사 로그 영속화** | **격리 강화 (Hardened)** |
| **5. 태스크승급 (Task Advance)** | 개발자의 수동 승인 또는 단순 exit code 0 확인 | **Phase별 Gatekeeper 자동 검증 룰(JSON Schema Draft-07, 스펙 드리프트 0% 점수) 통과 시에만 자동 승급** | **무결성 강제 (Zero-Drift)** |
| **6. 세션종료 (Session Terminate)** | CLI 프로세스 단순 종료 | **일일/월간 토큰 소비 집계, 잔여 예산 갱신, 후속 백로그 티켓 자동 발굴 및 PostgreSQL 상태 동기화** | **거버넌스 통합 (Governance)** |
| **7. 루프관련 (Loop & Resilience)** | 고정 횟수 단순 재시도 (Linear Retry Loop) | **429/503 즉시 회피형 지능형 Fallback 체인, 스펙 드리프트 자가 치유(Self-Healing) 피드백 루프** | **지능화 (Self-Healing)** |

---

## 9.3 영역별 상세 하네스 분석

### 1. 세션시작 하네스 (Session Start Harness)
* **기존 jkadh**:
  * 단일 개발자가 개인 API 키를 `.env`에 설정하고 단일 세션으로 구동.
  * 팀 단위 예산 통제나 모델별 쿼터 분기 기능 부재.
* **현행 개선점**:
  * **중앙 집중형 AI 계정 풀**: Anthropic, OpenAI, Google, Manus 4개 Provider 계정의 실시간 잔여 쿼터와 지연시간을 헬스체크.
  * **RBAC 토큰 가드**: 팀원 역할(`ADMIN`, `ARCHITECT`, `ENGINEER`, `REVIEWER`, `AUDITOR`)에 따라 일일 토큰 캡(500K ~ 2M) 및 모델 화이트리스트 자동 적용.

### 2. 태스크시작 하네스 (Task Start Harness)
* **기존 jkadh**:
  * 독립된 태스크 파일을 읽어 바로 프롬프트 생성에 진입하여 선후행 작업 간의 인터페이스 충돌 위험 존재.
* **현행 개선점**:
  * **DAG 의존성 가드**: `PDF-PARSER-01` 등 상위 노드가 `DONE` 상태가 아니면 하위 노드(`PDF-OCR-04`)의 착수를 차단.
  * **3대 시나리오 템플릿 의무화**: 정상(Happy Path), 오류 복구(Error Recovery), 극단 경계값(Edge-case Bounds) 시나리오 입력 필드를 강제 주입.

### 3. 태스크처리 하네스 (Task Processing Harness)
* **기존 jkadh**:
  * 단일 모델(예: GPT-4)에 기획부터 코드 작성까지 한 번에 요청하여 긴 컨텍스트에서 환각 및 세부 요구사항 누락(Drift) 빈발.
  * 429 Quota 에러 발생 시 Exponential Backoff로 수 분간 전체 파이프라인 정체.
* **현행 개선점**:
  * **7단계 공정 분할 (Phase 1~7)**: 모델의 고유 특기에 따라 기획/설계는 Claude 3.7 Sonnet, 코드 작성은 ChatGPT Codex, 대량 검증/현행화는 Gemini 3.7 Flash로 특화 배정.
  * **Proactive Circuit Breaker**: 429/503 에러 또는 15초 이상 지연 발생 시 150ms 내에 차순위 모델로 무중단 핫스왑 실행.

### 4. 태스크정리 하네스 (Task Cleanup & Teardown Harness)
* **기존 jkadh**:
  * 빌드 후 생성된 임시 파일(`.tmp`)을 삭제하는 수준에 그쳐, 단일 DB 환경에서 이전 테스트 데이터가 남아 오염 유발.
* **현행 개선점**:
  * **Savepoint 트랜잭션 롤백**: `jkadhp_dev` 단일 개발 DB에서 작업 노드별 Savepoint를 생성하여, 검증 실패 시 작업 이전 상태로 완벽 롤백.
  * **실행 메트릭 영속화**: 소비 토큰, 소요 시간, 비용(USD), Fallback 이력을 `model_execution_logs` 테이블에 자동 기록.

### 5. 태스크승급 하네스 (Task Advancement & Promotion Harness)
* **기존 jkadh**:
  * Phase 간 승급이 개발자의 육안 확인이나 모호한 프롬프트 판단에 의존.
* **현행 개선점**:
  * **프로그래머블 Gatekeeper Engine**:
    * Phase 1: `no_cyclic_dependencies`
    * Phase 3: `scenarios.has_all(["NORMAL", "ERROR", "EXCEPTION"])`
    * Phase 4: `json_schema_valid && no_any_types`
    * Phase 6: `tsc_no_emit_passed && eslint_errors == 0`
    * Phase 7: `spec_drift_score == 0 && task_graph_synced_to_db`
  * 룰 미충족 시 다음 단계 UI 버튼이 비활성화되며 사유를 실시간 로깅.

### 6. 세션종료 하네스 (Session Termination Harness)
* **기존 jkadh**:
  * 프로세스 종료 시 작업 결과가 개별 파일로만 남아 상위 관리자나 팀원이 진행 상황을 파악하기 어려움.
* **현행 개선점**:
  * **종합 거버넌스 리포트 생성**: 세션 동안 소비된 총 토큰, 비용, 모델별 분담률 자동 산출.
  * **작업그래프 및 백로그 DB 동기화**: 미해결 과제를 후속 백로그 티켓으로 발행하고, `jkadhp_dev` DB `task_nodes` 레코드에 반영.

### 7. 루프관련 하네스 (Loop & Resilience Harness)
* **기존 jkadh**:
  * `for (i=0; i<3; i++)` 식의 동일 모델 재시도 루프를 사용하여 Quota 고갈 시 모든 재시도가 연속 실패.
* **현행 개선점**:
  * **지능형 자가 치유(Self-Healing) 피드백 루프**: 컴파일 에러나 린트 오류 발생 시 에러 AST를 캡처하여 Fallback 모델의 프롬프트에 자동 주입해 1회 내에 즉시 수정.
  * **멀티 티어 Fallback 체인**: `Claude 3.7 ➔ Codex ➔ Gemini 3.7 Flash` 순으로 지연 없이 계단식 하향 전환.

---

## 9.4 요약 및 실무 적용 권고사항
이번 프로젝트에서 현행화된 하네스는 **"인간 개발자의 개입을 최소화하면서도, AI의 비결정론적 한계를 결정론적 게이트키퍼와 단일 DB 트랜잭션으로 통제"**하는 데 초점을 맞추고 있습니다. 모든 엔지니어와 에이전트는 본 하네스 규격을 준수하여 작업을 집행해야 합니다.
