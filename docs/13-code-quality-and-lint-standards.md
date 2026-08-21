# 🏛️ [JKADH 표준 13] 코드 품질 및 린트 거버넌스 기준서 (Code Quality & Lint Standards)

- **문서 번호**: `DOC-STD-13`
- **표준 코드**: `JKADH-STD-LINT-01`
- **책임자**: 조정국 (`mem-jkoo` / `SUPER_ADMIN`, Platform Architecture Lab)
- **적용 대상**: `jkadh-typep` 플랫폼 엔진 및 전체 하위 서비스 코드베이스
- **최신 개정일**: 2026-08-20 (v1.0.0)

---

## 1. 개요 및 거버넌스 목적 (Purpose)

본 문서는 JKADH AI 소프트웨어 개발 플랫폼에서 생산되는 모든 소스코드(TypeScript/Node.js/React/PostgreSQL)에 대해 **무결점(Zero-Defect) 코드 품질, 엄격한 정적 타입 안정성, 7-Phase Vibe AST 규칙 및 자동화 린트 검증 기준**을 정의합니다.

AI 에이전트와 개발자는 6대 하네스 라이프사이클 3단계(`#태스크처리`) 및 7-Phase Vibe 루프의 `LOOP_GATEKEEPER` 통과 시 본 기준을 100% 충족해야만 상위 환경 승급이 허용됩니다.

---

## 2. 4대 핵심 정적 분석 및 린트 기준 (Core Lint Standards)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        JKADH 4대 품질 린트 및 AST 거버넌스 필터                             │
├─────────────────────┬─────────────────────┬─────────────────────┬──────────────────────┤
│ 1. TypeScript Strict│ 2. AST Rules        │ 3. 6 Audit Columns  │ 4. 3-Scenario Tests  │
│ • strict: true      │ • NO_EXPLICIT_ANY   │ • reg_sys_cd, dt..  │ • Happy Path (필수)   │
│ • tsc --noEmit      │ • AST Guardrail     │ • mod_sys_cd, dt..  │ • Error Recovery (오류)│
│ • 0 Compiler Errors │ • 100% Type Safety  │ • PostgreSQL DDL    │ • Edge Bounds (예외) │
└─────────────────────┴─────────────────────┴─────────────────────┴──────────────────────┘
```

### 2.1 [기준 1] TypeScript 컴파일러 린트 기준 (`tsc --noEmit`)
- **실행 원칙**: 소스 커밋 전 반드시 `npx tsc --noEmit` 또는 `node scripts/harnessCli.cjs verify <TASK_CODE>`를 실행하여 **0개의 에러**를 보장해야 합니다.
- **필수 tsconfig 컴파일러 옵션**:
  1. `strict: true`: 모든 엄격한 타입 검사 플래그 강제
  2. `noImplicitAny: true`: 타입 명시가 누락된 암시적 `any` 원천 차단
  3. `strictNullChecks: true`: `null` 및 `undefined`에 대한 철저한 방어 코딩
  4. `noUnusedLocals: true`: 선언 후 미사용된 로컬 변수 방치 금지
  5. `noUnusedParameters: true`: 미사용 파라미터 경고/차단

---

### 2.2 [기준 2] 7-Phase Vibe AST 규칙 (`AstValidator`)
`src/services/AstValidator.ts` 엔진을 통해 정적 코드 AST 구문 트리를 자동 분석합니다.

| 규칙 식별자 | 검증 내용 | 위반 시 패널티 | 조치 방안 |
|---|---|:---:|---|
| **`NO_EXPLICIT_ANY`** | `any` 키워드 직접 선언/캐스팅 전면 금지 | **-40점 (Gatekeeper Fail)** | 구체적 인터페이스(`interface`), 제네릭(`T`), 또는 `unknown`으로 대체 |
| **`BAN_TS_IGNORE`** | `@ts-ignore`, `@ts-nocheck` 주석 사용 금지 | **-50점 (즉시 탈락)** | 올바른 타입 가드(`is`, `typeof`, `instanceof`) 작성 |
| **`STRICT_PROMISE_AWAIT`**| 비동기 함수 내 `await` 누락 방지 | **-20점** | `async/await` 동기화 및 `try/catch` 에러 처리 |
| **`NO_EVAL_OR_DYNAMIC`** | `eval()` 및 동적 코드 생성 금지 | **-100점 (보안 위반)** | 정적 파서 및 표준 맵 객체 활용 |

---

### 2.3 [기준 3] 데이터 모델 6대 공통 감사 컬럼 검증 (`AUDIT_COLUMNS_CHECK`)
PostgreSQL DDL 및 TypeScript DB 모델 인터페이스 작성 시 다음 **6대 공통 감사 컬럼**이 누락되지 않아야 합니다:

```sql
-- 모든 테이블 필수 6대 감사 컬럼 규격
reg_sys_cd   VARCHAR(20)  NOT NULL DEFAULT 'JKADH_PLATFORM', -- 최초 등록 시스템 코드
reg_user_id  VARCHAR(50)  NOT NULL,                          -- 최초 등록 사용자 ID
reg_dt       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,-- 최초 등록 일시
mod_sys_cd   VARCHAR(20)  NOT NULL DEFAULT 'JKADH_PLATFORM', -- 최종 수정 시스템 코드
mod_user_id  VARCHAR(50)  NOT NULL,                          -- 최종 수정 사용자 ID
mod_dt       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP -- 최종 수정 일시
```

---

### 2.4 [기준 4] 3대 시나리오 단위 테스트 구현 의무 (`THREE_SCENARIOS_TEST`)
모든 비즈니스 로직 및 코어 엔진은 다음 3대 시나리오 단위 테스트를 의무적으로 작성해야 합니다:
1. **정상 시나리오 (Happy Path)**: 표준 입력 및 의도된 제어 흐름에 대한 성공 검증
2. **오류 복구 시나리오 (Error Recovery)**: 예외 발생 시 크래시 없는 Safe Fallback 및 자가치유 검증
3. **예외 경계 시나리오 (Edge Bounds)**: 비유효 파라미터, 누락 필드, 한계값(Boundary) 방어 검증

---

## 3. 엄격한 안티패턴 방지 목록 (Prohibited Anti-Patterns)

1. **상위 브랜치(`dev`, `stg`, `main`) 직접 커밋 금지**:
   - 모든 수정은 `task/{태스크명}` 브랜치에서만 커밋하고 GitHub PR 머지 파이프라인을 통과해야 함.
2. **디버깅용 `console.log` 및 `debugger` 프로덕션 잔존 금지**:
   - `scripts/harnessCli.cjs` 또는 전용 로거(`logger.info()`)를 통해서만 제어된 로그 출력 허용.
3. **매직 넘버/하드코딩 상수 금지**:
   - 타임아웃, 포트, 재시도 횟수 등은 `src/types.ts` 또는 환경 설정 파일로 상수화.

---

## 4. 개정 이력 (Revision History)

| 버전 | 개정 일자 | 개정자 | 개정 내용 요약 |
|---|---|---|---|
| **v1.0.0** | 2026-08-20 | 조정국 (SUPER_ADMIN) | TypeScript 엄격 린트 기준, 7-Phase AST 4대 필터 및 6대 감사 컬럼 표준 최초 제정 |
