# Pull Request: [Issue #45] 개발기능 관리(세션 거버넌스) 수치 타입 TypeError 복구 및 렌더링 안정화

- **작업 브랜치**: `task/admin-session-gov-numeric-type-fix`
- **타겟 브랜치**: `dev`
- **해결 이슈**: Resolves #45

## 1. 개요 및 변경 목적
- 개발기능 관리 메뉴 진입 시 하네스 세션 거버넌스(`SessionGovernanceView`)에서 발생하는 `cost_usd.toFixed is not a function` TypeError 런타임 오류를 완벽히 해결함.
- PostgreSQL `NUMERIC` / `BIGINT` 반환값의 문자열 유입에 대비한 3-Tier 안전 헬퍼 함수 구축.

## 2. 주요 변경 사항
1. **프론트엔드 안전 헬퍼 적용 (`SessionGovernanceView.tsx`)**:
   - `formatSessionCostUsd(val, fallback)`: null/undefined/문자열/NaN 방어 및 4자리 소수점 문자열 반환.
   - `formatSessionTokens(val, fallback)`: k-단위 변환 및 예외 방어.
   - `formatSessionExecCount(val, fallback)`: 정수형 변환 및 예외 방어.
   - 유효한 0값(`0`, `"0"`, `"0.0000"`)이 모의값으로 덮어씌워지지 않도록 널 병합 처리.
2. **백엔드 정규화 (`server.ts`)**:
   - `/api/session/current` 조회 시 `tokens_consumed`, `cost_usd`, `execution_count` 필드를 명시적 `Number()`로 캐스팅하여 정규화된 JSON 응답 보장.
3. **단위 테스트 스위트 (`src/test/sessionGovNumericSafety.test.ts`)**:
   - 3대 시나리오(Happy Path, Error Recovery, Edge Bounds) 총 10개 테스트 케이스 전수 통과.

## 3. 검증 결과
- **단위 테스트**: 10/10 PASS (소요 시간: 0.28ms)
- **TypeScript 린트**: `tsc --noEmit` 0개 오류 통과
- **애플릿 컴파일**: `compile_applet` 빌드 성공
