# [Issue #16] 토큰 쿼터 실시간 텔레메트리 & AI Provider 서킷 브레이커 웹훅 엔진 구축

- **이슈 번호**: #16 (GitHub Issue #14)
- **관련 태스크 ID**: `PLAT-MON-08`, `MS-PLAT-CORE-ENGINE`
- **담당자**: 조정국 (mem-jkoo / SUPER_ADMIN)
- **작업 브랜치**: `task/token-quota-telemetry`
- **대상 브랜치**: `dev` ➔ `stg` ➔ `main` (v2.2.0 배포 완료)
- **원격 저장소 이슈**: GitHub Issue #14 (https://github.com/jkoogit/jkadh-typep/issues/14)
- **등록 일시**: 2026-08-20 00:11:00 PDT (2026-08-20 16:11:00 KST)
- **상태**: CLOSED (PR #16 머지 및 PR #17/#18 v2.2.0 승급 완료)

---

## 1. 이슈 개요 및 배경 (Background & Requirements)

- **배경**:
  - JKADH AI 플랫폼에서 모델 라우터(`PLAT-ROUTER-02`) 및 볼트(`PLAT-VAULT-03`)를 통해 팀원별, 세션별로 분산된 AI API(Gemini, OpenAI, Anthropic) 요청이 급증함에 따라, **실시간 잔여 쿼터 측정, 비용 소진율 대시보드 및 Provider 장애/쿼터 초과 시 자동 폴백 및 웹훅 알림(Slack/Discord)**을 수행하는 텔레메트리 & 서킷 브레이커 엔진이 필수적임.

- **주요 목표**:
  1. **실시간 토큰 쿼터 텔레메트리 집계 엔진 (`TokenTelemetryService`) 구축**:
     - 모델별(Gemini 1.5 Pro/Flash, GPT-4o, Claude 3.5 Sonnet) 실시간 프롬프트/완성 토큰 사용량 집계
     - 사용자 및 팀 쿼터 임계치(80%, 95%, 100%) 도달 실시간 이벤트 감지
  2. **AI Provider 서킷 브레이커 (Circuit Breaker) & 웹훅 연동**:
     - 공급자별(Google, OpenAI, Anthropic) API 연속 실패율 및 Rate Limit 감지 시 `OPEN` 상태 전이
     - 차순위 공급자로의 계층형 자동 폴백(Fallback Chain) 트리거
     - 웹훅 발송 (Slack/Discord Webhook 포맷 지원)
  3. **3대 시나리오 단위 검증 스위트 (`src/test/telemetryCircuitBreaker.test.ts`) 구축**:
     - Happy Path (실시간 쿼터 소진 측정 및 대시보드 집계)
     - Error Recovery (공급자 Rate Limit 429 감지 시 서킷 브레이커 OPEN 및 차순위 모델 자동 절체)
     - Edge Bounds (동시 쿼터 한도 동시성 경합 방어 및 100% 도달 시 즉시 차단)
  4. **PostgreSQL 메타데이터 및 작업그래프 상태 갱신**:
     - `token_telemetry_logs` (Tier 3 로그) 적재 및 `task_nodes.status = 'IN_PROGRESS'` 갱신

---

## 2. 3대 시나리오 기획 및 인터페이스 계약 (Scenarios & Contract)

### 3대 시나리오:

1. **필수 정상 시나리오 (Happy Path)**:
   - AI 요청 발생 시 `TokenTelemetryService.recordUsage()`가 호출되어 모델별 토큰 사용량 및 잔여 쿼터를 실시간 차감하고, 임계치(80%) 미만에서는 정상 처리 응답을 반환함.
   - 웹 대시보드에서 팀원별/공급자별 실시간 소비율 차트가 정상 갱신됨.

2. **오류 복구 시나리오 (Error Recovery)**:
   - Primary AI 공급자(예: OpenAI)가 429 Too Many Requests 또는 503 Service Unavailable을 3회 연속 반환할 경우, 서킷 브레이커 상태가 `CLOSED` ➔ `OPEN`으로 즉시 전이되고, 차순위 Provider(Gemini Pro)로 자동 우회 실행(Fallback)되며 장애 알림 웹훅이 발송됨.
   - 60초 쿨다운 후 `HALF_OPEN` 상태에서 헬스체크 1건 성공 시 정상 `CLOSED`로 자동 복구됨.

3. **예외 경계 시나리오 (Edge Bounds)**:
   - 사용자의 잔여 쿼터가 0 이하로 소진된 상태에서 요청이 인입될 경우, `AI_QUOTA_EXHAUSTED` 예외를 즉각 반환하고 API 호출을 원천 차단함.
   - 웹훅 URL이 유효하지 않거나 오프라인일 때 메인 AI 트랜잭션이 중단되지 않고 로깅 후 정상 처리되는 안전 가드레일 제공.

---

## 3. 세부 작업 항목 (WBS)
- [x] **작업 브랜치 명세 확정**: `task/token-quota-telemetry`
- [x] **로컬 이슈 문서 작성**: `/docs/issues/08-telemetry-circuit-breaker.md`
- [x] **원격 GitHub Issue 등록**: Issue #14 (https://github.com/jkoogit/jkadh-typep/issues/14)
- [x] **전략 패턴 기반 온디맨드 쿼터 검증 엔진 (`src/services/quotaCheckers/*`)**
- [x] **AI Provider 서킷 브레이커 & 웹훅 디스패처 구현 (`src/services/circuitBreakerService.ts`)**
- [x] **3대 시나리오 단위 검증 스위트 작성 (`src/test/telemetryCircuitBreaker.test.ts`)**
- [x] **텔레메트리 & 서킷 브레이커 인터랙티브 UI 컴포넌트 구축 (`TokenTelemetryPanel.tsx`)**
- [x] **DB 메타데이터 및 작업그래프 상태 갱신 (`task_nodes` -> DONE)**
- [x] **1턴 자체 보완 리팩토링 및 린트 (`tsc --noEmit`) 무결점 검증**
- [x] **디자인 패턴 카탈로그 기준서 제정 (`DOC-STD-16`)**
- [x] **다단계 승급 PR (#16, #17, #18) 및 릴리즈 태그 (`v2.2.0`) 완료**
