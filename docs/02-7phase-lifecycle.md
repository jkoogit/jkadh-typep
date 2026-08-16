# 2. 7단계 엔드투엔드 딜리버리 라이프사이클 (jkadh Vibe Coding Standard)

jkadh 표준은 모든 소프트웨어 작업 노드를 다음 **7단계 공정**으로 분할하여 순차 집행하며, 각 단계마다 프로그래밍된 Gatekeeper 자동 검증을 통과해야만 다음 단계로 전진(Advance)합니다.

---

## 2.1 공정 요약 매트릭스

| 단계 | 명칭 | 코드 | 전담 모델 | 주요 산출물 | 게이트키퍼 통과 조건 |
|---|---|---|---|---|---|
| **Phase 1** | **작업대상 검토** | `PHASE_1_TARGET_REVIEW` | Gemini 3.7 Flash | Dependency Graph, Impact Radius Matrix | 의존성 순환 없음, 상위 노드 완료 |
| **Phase 2** | **작업 선정 및 우선순위화** | `PHASE_2_TASK_SELECTION` | Gemini 3.7 Flash / Claude 3.7 | Task Selection Card, Resource Sheet | 담당자 모델 권한 충족, 토큰 예산 여유 |
| **Phase 3** | **작업목표 / 3대 시나리오 정의** | `PHASE_3_TASK_PLANNING` | Claude 3.7 Sonnet | Scenario Spec Doc, State Transition Table | 3대 시나리오 전수 정의, 복구 로직 포함 |
| **Phase 4** | **아키텍처 및 인터페이스 설계** | `PHASE_4_ARCHITECTURE_DESIGN` | Claude 3.7 Sonnet | TypeScript Contracts, PostgreSQL DDL | JSON Schema 적합성, Any 타입 0건 |
| **Phase 5** | **테스트 스위트 및 하네스 설계** | `PHASE_5_TEST_SUITE_DESIGN` | ChatGPT Codex / Manus | Test Plan, Chaos Injection Fixtures | 1:1 시나리오 매핑, 429 주입 케이스 수립 |
| **Phase 6** | **코드 작성 및 1차 구현** | `PHASE_6_CODE_GENERATION` | ChatGPT Codex / Claude 3.7 | Source Code (`PdfOcrEngine.ts`), Build Artifacts | `tsc --noEmit` 통과, 린트 에러 0건 |
| **Phase 7** | **문서 작성 및 작업그래프 현행화** | `PHASE_7_DOCUMENTATION_AND_GRAPH_SYNC` | Gemini 3.7 Flash / Claude 3.7 | Work Review Report, Updated DAG, Backlog | 기획 대비 일치율 100%, 후속 백로그 동기화 |

---

## 2.2 단계별 상세 명세

### Phase 1: 작업대상 검토 (Work Target Review)
* **목적**: 대상 코드베이스(PDFowers)의 모듈 간 의존성 DAG, 영향 반경, 입력/출력 인터페이스 분석
* **전담 모델**: `Gemini 3.7 Flash` (대용량 컨텍스트 1M 분석)
* **산출물**: Dependency Graph JSON, Impact Radius Matrix
* **Gatekeeper Rule**: `no_cyclic_dependencies && all_upstream_nodes_resolved`

### Phase 2: 작업 선정 및 우선순위화 (Task Selection & Prioritization)
* **목적**: 비즈니스 ROI, 복잡도(1~10), 토큰 예측량, 실패 위험도를 종합 산정하여 Sprint 작업 큐 배정
* **전담 모델**: `Gemini 3.7 Flash` / `Claude 3.7 Sonnet`
* **산출물**: Task Selection Card, Resource Allocation Sheet
* **Gatekeeper Rule**: `assignee_has_model_permission && daily_quota_headroom > estimated_tokens`

### Phase 3: 작업목표 / 세부명세 / 3대 시나리오 정의 (Task Planning)
* **목적**: **Happy Path (정상)**, **Error Recovery (오류)**, **Edge-case Bounds (예외)** 3대 시나리오 전수 작성
* **전담 모델**: `Claude 3.7 Sonnet (Thinking)`
* **산출물**: Scenario Specification Doc, State Transition Table, Fallback Ruleset JSON
* **Gatekeeper Rule**: `scenarios.has_all(["NORMAL", "ERROR", "EXCEPTION"]) && error_recovery_defined`

### Phase 4: 아키텍처 및 인터페이스 설계 (Architecture & Interface Design)
* **목적**: TypeScript 엄격 인터페이스, JSON Schema Draft-07 계약, `jkadhp_dev` PostgreSQL DDL 정의
* **전담 모델**: `Claude 3.7 Sonnet`
* **산출물**: Contract Interface TS, Postgres Migration SQL, Sequence Diagram
* **Gatekeeper Rule**: `json_schema_valid && no_any_types && strict_null_checks`

### Phase 5: 테스트 스위트 및 하네스 설계 (Test Suite & Failure Injection Design)
* **목적**: 3대 시나리오를 1:1 매핑하는 테스트 벡터 수립, 429 Quota 고갈 및 타임아웃 장애 주입 케이스 설계
* **전담 모델**: `ChatGPT Codex` / `Manus Operator`
* **산출물**: Test Suite Plan, Failure Injection Matrix, Mockless Fixture Definitions
* **Gatekeeper Rule**: `all_scenarios_have_test_cases && fallback_circuit_breaker_test_defined`

### Phase 6: 코드 작성 및 1차 구현 (Code Generation & Sandbox Execution)
* **목적**: 설계 명세 기반 고신뢰도 TypeScript 구현, 린트/컴파일 검증, 런타임 샌드박스 실행
* **전담 모델**: `ChatGPT Codex` / `Claude 3.7 Sonnet`
* **산출물**: Source Code (`PdfOcrEngine.ts`), Compiled ES Module, Execution Benchmark
* **Gatekeeper Rule**: `tsc_no_emit_passed && eslint_errors == 0 && fallback_try_catch_implemented`

### Phase 7: 문서 작성 및 작업그래프 현행화 (Work Review, Backlog & Task Graph Synchronization)
* **목적**: 작업 결과 리뷰 보고서 생성, 기획 명세 대비 구현 드리프트(Drift) 0% 검증, 미처리 작업(Backlog) 식별 및 상위 작업그래프/DB 실시간 동기화
* **전담 모델**: `Gemini 3.7 Flash` / `Claude 3.7 Sonnet`
* **산출물**: Release Notes MD, Updated Task Graph DAG, Pending Backlog Tickets
* **Gatekeeper Rule**: `work_review_report_generated && spec_drift_score == 0 && task_graph_synced_to_db`
