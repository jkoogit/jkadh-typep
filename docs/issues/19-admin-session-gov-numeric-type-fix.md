# [Issue #45] 개발기능 관리(세션 거버넌스) 수치 타입 TypeError 복구 및 렌더링 안정화

## 1. 이슈 개요
- **이슈 번호**: #45 (로컬 추적: 19)
- **작업 브랜치**: `task/admin-session-gov-numeric-type-fix`
- **해결 목적**: 개발기능 관리 메뉴 진입 시 PostgreSQL NUMERIC/BIGINT 반환 필드(`cost_usd`, `tokens_consumed`)의 문자열 타입으로 인한 `toFixed is not a function` 런타임 크래시를 방어하고, 3대 시나리오(정상/오류 복구/예외 경계)에 걸친 안전한 포맷팅 엔진을 구축함.

## 2. 결함 원인 분석
- `SessionGovernanceView.tsx`에서 `session?.cost_usd`가 PostgreSQL 드라이버(`pg`)에 의해 `"0.0000"` 문자열로 유입될 때 `(session?.cost_usd || 1.4285).toFixed(4)` 호출로 인해 TypeError 발생.
- `tokens_consumed` 또한 `"0"` 문자열 상태에서 사칙연산 처리 시 예기치 못한 결함 방어 필요.
- `||` 연산자 사용으로 인해 실제 유효한 `0` 값(`cost_usd: 0`)이 들어왔을 때 기본 모의값(`1.4285`)으로 오염되는 문제.

## 3. 3대 시나리오 설계 (3-Tier Scenario Specification)
1. **정상 시나리오 (Happy Path)**:
   - 숫자형(`12.5`), 숫자형 문자열(`"12.5000"`), 정수형(`340000`) 유입 시 올바르게 `$12.5000`, `340.0k`로 변환 렌더링.
2. **오류 복구 시나리오 (Error Recovery)**:
   - `null`, `undefined`, `NaN`, 파싱 불가능한 문자열(`"invalid"`) 유입 시 오류 없이 기본 안전값(`$0.0000`, `0.0k`)으로 폴백.
3. **예외 경계 시나리오 (Edge Bounds)**:
   - `cost_usd = 0`, `tokens_consumed = 0` 등 0값 유입 시 Nullish Coalescing(`??`) 및 안전한 파서로 모의값 치환 없이 `$0.0000`, `0.0k`를 정확히 표시.

## 4. 변경 대상 파일
- `src/components/SessionGovernanceView.tsx`: 안전한 수치 파싱 헬퍼 함수 도입 및 뷰 렌더링 보호
- `server.ts`: `/api/session/current` 및 `/api/sessions` 반환 시 수치 필드 정규화
- `src/test/sessionGovNumericSafety.test.ts`: 3대 시나리오에 대한 단위 테스트 스위트 작성
