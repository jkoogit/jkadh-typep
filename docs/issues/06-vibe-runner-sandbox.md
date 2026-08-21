# [Issue #13] 실시간 7-Phase Vibe Runner 샌드박스 & AST 자동 검증기 엔진 구축

- **이슈 번호**: #13
- **관련 태스크 ID**: `PLAT-VIBE-06`, `MS-PLAT-CORE-ENGINE`
- **담당자**: 구진규 (mem-jkoo / SUPER_ADMIN)
- **작업 브랜치**: `task/vibe-runner-sandbox`
- **대상 브랜치**: `dev`
- **원격 저장소 이슈**: GitHub Issue #13 (등록 완료: https://github.com/jkoogit/jkadh-typep/issues/13)
- **등록 일시**: 2026-08-19 16:57:33 PDT (2026-08-20 08:57:33 KST)
- **상태**: IN_PROGRESS

---

## 1. 이슈 개요 및 배경 (Background & Requirements)

- **배경**: AI 에이전트가 코드를 작성할 때 환각(Hallucination), 구문 오류, 타입 불일치, 스펙 드리프트가 발생하는 문제를 원천 방지하기 위해, JKADH 기본서비스(AI 개발 플랫폼) 핵심 엔진으로서 **7-Phase Vibe 순환 루프(`LOOP_ANALYZE` ➔ `LOOP_DESIGN` ➔ `LOOP_EXECUTE` ➔ `LOOP_TEST` ➔ `LOOP_REFINE` ➔ `LOOP_SECOPS` ➔ `LOOP_GATEKEEPER`)를 실시간 인터랙티브하게 실행하고 TypeScript AST(추상 구문 트리) 정적 무결점 검증을 수행하는 런타임 샌드박스 엔진**을 구축함.
- **주요 목표**:
  1. **실시간 7-Phase Vibe 루프 실행 엔진 (`src/services/VibeRunnerEngine.ts`)**:
     - 7개 Phase 상태 머신(State Machine) 전이 및 단계별 산출물(명세서, 설계도, 코드, 테스트 결과, 보안 점검표, Gatekeeper 점수) 생성/파싱
  2. **TypeScript AST 정적 무결점 검증기 (`src/services/AstValidator.ts`)**:
     - 생성된 코드에 대해 TypeScript Compiler API 기반 AST 파싱, 누락된 import/export, 타입 불일치, 비표준 구문 검출
  3. **1턴 자체 복구 루프 (Auto-Healing Loop)**:
     - Phase 4(TEST) 또는 Phase 7(GATEKEEPER) 불합격 시 1턴 자체 보완 프롬프트를 자동 생성하여 무결점(Score 100점) 달성 유도
  4. **인터랙티브 샌드박스 시각화 UI 컴포넌트 (`src/components/VibeRunnerSandbox.tsx`)**:
     - 각 Phase별 실행 로그, 토큰 소모량, AST 분석 트리, 실시간 렌더링 프리뷰 및 수동/자동 트리거 제어

---

## 2. 3대 시나리오 기획 및 인터페이스 계약 (Scenarios & Contract)

### 3대 시나리오:

1. **필수 정상 시나리오 (Happy Path)**:
   - 사용자가 태스크 프롬프트(예: "단일 DB Savepoint 롤백 관리 컴포넌트 생성")를 전달하고 Vibe Runner를 실행하면, Phase 1(ANALYZE)부터 Phase 7(GATEKEEPER)까지 순차적으로 상태가 전이됨.
   - Phase 3에서 생성된 TypeScript 코드가 AST 정적 검증기를 통과하고, Phase 4에서 3대 시나리오 테스트가 100% 통과하며, Phase 7 Gatekeeper 점수가 95점 이상으로 확정되어 최종 산출물 패키지가 생성됨.
   - 각 단계별 실행 시간, 토큰 소진량, 사용된 AI 모델(Claude 3.7 / Codex / Gemini Flash) 텔레메트리가 실시간으로 기록됨.

2. **오류 복구 시나리오 (Error Recovery)**:
   - Phase 3 코드 생성 중 문법 오류나 TypeScript 타입 에러(`TS2304`, `TS2322` 등) 발생 시, `VIBE_AST_PARSE_ERROR` 이벤트를 발생시키고 `LOOP_REFINE`(1턴 추가 보완) 단계로 자동 라우팅하여 결함을 자체 수정.
   - 주 AI Provider(Claude 3.7)에서 429 RateLimit 발생 시, 기존 `PLAT-ROUTER-02` 서킷 브레이커와 연동되어 차순위 모델(Codex ➔ Gemini 3.7 Flash)로 300ms 내 핫스왑되어 루프가 중단 없이 지속됨.

3. **예외 경계 시나리오 (Edge Bounds)**:
   - 비정형 프롬프트나 빈 입력 수신 시 `VIBE_INVALID_SPEC_INPUT` 방어적 에러를 반환하고 기본 템플릿 제안.
   - 순환 참조(Circular Dependency)를 유발하는 잘못된 타입 정의나 10,000줄 이상의 대용량 코드 생성 시 타임아웃(30초) 및 청크 분할 검증을 적용하여 브라우저 메인 스레드 블로킹 방지.

### TypeScript 인터페이스 계약 (`src/types/vibeRunner.ts`):
- `VibePhaseType`: `'LOOP_ANALYZE' | 'LOOP_DESIGN' | 'LOOP_EXECUTE' | 'LOOP_TEST' | 'LOOP_REFINE' | 'LOOP_SECOPS' | 'LOOP_GATEKEEPER'`
- `VibePhaseStatus`: `'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'HEALING'`
- `VibePhaseResult`: `{ phase: VibePhaseType; status: VibePhaseStatus; durationMs: number; tokensUsed: number; modelUsed: string; artifacts: Record<string, any>; errors?: string[]; score?: number; }`
- `AstValidationReport`: `{ isValid: boolean; syntaxErrors: string[]; typeErrors: string[]; missingImports: string[]; exportedSymbols: string[]; complexityScore: number; }`
- `VibeSessionState`: `{ sessionId: string; taskId: string; currentPhase: VibePhaseType; phases: Record<VibePhaseType, VibePhaseResult>; totalTokens: number; totalDurationMs: number; finalCode: string; gatekeeperPassed: boolean; }`

---

## 3. 세부 작업 항목 (WBS)
- [x] **작업 브랜치 명세 확정**: `task/vibe-runner-sandbox`
- [x] **로컬 이슈 문서 및 원격 GitHub Issue #13 등록**
- [ ] **인터페이스 & 타입 정의 (`src/types/vibeRunner.ts`)**: 7-Phase 상태, AST 검증 리포트, 샌드박스 세션 스키마
- [ ] **TypeScript AST 정적 검증기 (`src/services/AstValidator.ts`)**: 코드 구문 트리 파싱 및 린트/타입 무결성 검증
- [ ] **7-Phase Vibe Runner 오케스트레이션 엔진 (`src/services/VibeRunnerEngine.ts`)**: 상태 머신 전이 및 Fallback 연동
- [ ] **인터랙티브 샌드박스 UI 컴포넌트 (`src/components/VibeRunnerSandbox.tsx`)**: 실시간 실행 뷰어 및 제어 패널
- [ ] **3대 시나리오 테스트 작성 (`src/test/vibeRunner.test.ts`)** 및 `tsc --noEmit` 검증
