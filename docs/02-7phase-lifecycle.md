# 2. 7단계 Vibe Coding 라이프사이클 및 프로세스 정책 (Lifecycle & Process Policies)

## 2.1 공정 개요
AI 주도 개발(Vibe Coding)의 품질 저하와 환각(Hallucination)을 원천 차단하기 위해 작업 검토부터 문서 동기화까지 엄격한 7단계 공정 파이프라인 및 자동화 게이트키퍼(Gatekeeper) 통제를 적용합니다.

```
[Phase 1: 검토] ➔ [Phase 2: 선정] ➔ [Phase 3: 시나리오] ➔ [Phase 4: 인터페이스] ➔ [Phase 5: 테스트] ➔ [Phase 6: 구현/루프] ➔ [Phase 7: 승급/문서]
```

---

## 2.2 7단계 공정별 처리 시나리오, 완료조건 및 예외처리 정책

### Phase 1: 작업대상 검토 (Target Review)
* **전담 AI**: `Gemini 3.7 Flash` (1M 초장문 AST & DAG 의존성 분석)
* **입력**: 코드베이스 파일 트리, 소스 코드, `task_nodes`
* **정상 시나리오**: 변경 대상 모듈의 상위/하위 의존성을 추적하여 순환 참조 여부 및 영향 반경(Blast Radius)을 산출하고 `phases_payload`에 기록.
* **완료조건 (Gatekeeper Rule)**: 
  * `no_cyclic_dependencies == true` (순환 참조 0건)
  * `all_upstream_nodes_resolved == true` (선행 의존 작업 완료)
* **예외/장애 처리**:
  * 선행 작업 미완료 시 `BLOCKED` 상태로 전이하고 대기 큐로 전환.

### Phase 2: 작업선정/우선순위 (Task Selection & Priority)
* **전담 AI**: `Gemini 3.7 Flash` / `Claude 3.7 Sonnet`
* **입력**: `team_members`, `ai_accounts`
* **정상 시나리오**: 담당자 RBAC 권한과 일일 토큰 가용량(`daily_token_limit - daily_token_used`)을 검증하고 Sprint 큐에 배정.
* **완료조건 (Gatekeeper Rule)**:
  * `assignee_has_model_permission == true`
  * `daily_quota_headroom > estimated_tokens`
* **예외/장애 처리**:
  * 토큰 한도 초과 시 관리자에게 쿼터 리셋 알림을 전송하고 경량 모델(`gemini-3-7-flash`)로 배정 전환.

### Phase 3: 3대 시나리오 정의 (3-Core Scenario Planning)
* **전담 AI**: `Claude 3.7 Sonnet` (심층 추론 및 엣지케이스 설계)
* **입력**: 요구사항 명세, 기획안
* **정상 시나리오**: 
  1. **정상 경로 (Happy Path)**
  2. **오류 복구 경로 (Error Recovery - 429/Timeout/Invalid Input)**
  3. **예외 경계 경로 (Edge Bounds - Extreme Payload/Zero Data)** 3대 시나리오를 명세표로 구조화.
* **완료조건 (Gatekeeper Rule)**:
  * `scenarios.has_all(["NORMAL", "ERROR", "EXCEPTION"]) == true`
  * `error_recovery_defined == true`
* **예외/장애 처리**:
  * 오류 복구 경로 누락 시 게이트키퍼가 점수를 60점으로 제한하고 Claude에게 `RETRY_FIX` 처방 조치 발동.

### Phase 4: 아키텍처/인터페이스 설계 (Architecture & Contract Design)
* **전담 AI**: `Claude 3.7 Sonnet`
* **입력**: 3대 시나리오 명세표
* **정상 시나리오**: TypeScript Strict 모드 인터페이스(`any` 사용 금지), JSON Schema Draft-07, DB DDL 마이그레이션 스크립트를 확정.
* **완료조건 (Gatekeeper Rule)**:
  * `no_any_types == true`
  * `json_schema_valid == true`
* **예외/장애 처리**:
  * `any` 타입 또는 느슨한 타입 검출 시 자동 린터가 실패 처리하고 명시적 제네릭/유니온 타입으로 자동 리팩터링.

### Phase 5: 테스트 스위트 설계 (Test Suite & Chaos Design)
* **전담 AI**: `ChatGPT Codex` / `Manus Agent`
* **입력**: Phase 3 시나리오 + Phase 4 인터페이스
* **정상 시나리오**: 3대 시나리오와 1:1 매핑되는 단위/통합 테스트 및 429 서킷 브레이커 카오스 주입 테스트 벡터 작성.
* **완료조건 (Gatekeeper Rule)**:
  * `all_scenarios_have_test_cases == true`
  * `circuit_breaker_test_defined == true`
* **예외/장애 처리**:
  * 카오스 테스트 누락 시 자동 픽스처 생성기가 429 주입 테스트 케이스를 자동 병합.

### Phase 6: 코드 작성 & 1차 구현 (Code Generation & 7-Loop)
* **전담 AI**: `ChatGPT Codex` / `Claude 3.7 Sonnet`
* **입력**: 확정된 인터페이스, 테스트 픽스처
* **정상 시나리오**: 7종 하네스 루프(`LOOP_EXECUTE` ➔ `LOOP_REFINE`)를 돌며 코드 작성, 세이브포인트 생성, `tsc --noEmit` 정적 검증 통과.
* **완료조건 (Gatekeeper Rule)**:
  * `tsc_no_emit_passed == true`
  * `eslint_errors == 0`
  * `fallback_try_catch_implemented == true`
* **예외/장애 처리**:
  * 컴파일 에러 발생 시 `SAVEPOINT_ROLLBACK` 실행 후 직전 안정 스냅샷 복원 + `RETRY_FIX` 자동 패치.
  * 429 발생 시 150ms 내 차순위 모델로 `FALLBACK_SWAP` 실행.

### Phase 7: 문서화 & 그래프 동기화 (Documentation & Promotion)
* **전담 AI**: `Gemini 3.7 Flash` / `Claude 3.7 Sonnet`
* **입력**: 구현 코드, 게이트키퍼 로그
* **정상 시나리오**: 기획 명세 일치율(Drift 0%) 검증, 세션 회고 보고서(`/docs/report/02-...md`) 생성, Git 브랜치 승급(`dev` ➔ `main`) 및 `task_nodes.status = 'DONE'` 갱신.
* **완료조건 (Gatekeeper Rule)**:
  * `spec_drift_score == 0`
  * `work_review_report_generated == true`
  * `task_graph_synced_to_db == true`
* **예외/장애 처리**:
  * 기획 불일치(Drift) 발견 시 승급 차단 및 Phase 4 인터페이스 재동기화.

---

## 2.3 세션 수명주기 및 하트비트 정책 (Session Lifecycle & Recovery)
1. **하트비트 주기**: 30초마다 `/api/session/heartbeat` 호출을 통해 세션 활성 상태 유지.
2. **세션 좀비 방지**: 60초 이상 하트비트 미수신 시 해당 세션을 `STALE` 상태로 전이하고 작업 락(`locked_by_session_id`) 자동 해제.
3. **세션 재개 (Session Resumption)**: 새 세션 진입 시 최신 `savepoint_name`과 `next_handoff_brief`를 로드하여 중단 지점부터 100% 무손실 이어받기.
