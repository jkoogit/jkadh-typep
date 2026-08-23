# [PR #15] 하네스 6대 라이프사이클 통합 CLI 도구(`harnessCli.cjs`) 및 GitHub PR 자동화 스크립트 구축

- **PR 번호**: #15
- **관련 이슈**: Resolves #14 (`/docs/issues/07-harness-lifecycle-cli.md`)
- **작업 브랜치**: `task/harness-lifecycle-cli`
- **타겟 브랜치**: `dev`
- **담당자**: 조정국 (mem-jkoo / SUPER_ADMIN)
- **작업 코드**: `PLAT-CLI-07` (`WRK-CLI-CORE-01`)
- **검증 결과**: 7개 테스트케이스 100% 통과 (Happy Path 3건, Error Recovery 2건, Edge Bounds 2건), TypeScript 컴파일 린트 0 오류

---

## 1. 개요 및 변경 목적 (Summary)

JKADH AI 플랫폼의 6대 하네스 라이프사이클(`#세션시작` ➔ `#태스크시작` ➔ `#태스크처리` ➔ `#태스크정리` ➔ `#태스크승급` ➔ `#세션정리`) 거버넌스를 완벽히 준수하고 개발자 및 에이전트의 휴먼 에러를 원천 차단하기 위해 **통합 CLI 자동화 도구(`scripts/harnessCli.cjs`)**와 **GitHub REST API v3 동기화 모듈(`scripts/githubSync.cjs`)**을 구현하였습니다.

또한, 3대 시나리오(정상, 오류 복구, 예외 경계) 테스트 카탈로그, 린트 표준 가이드라인, 슬림 테이블 설계 및 JSON 이력 거버넌스 표준 문서를 공식 제정하였습니다.

---

## 2. 주요 변경 내역 (Key Changes)

### 2.1 하네스 통합 CLI 스크립트 (`scripts/harnessCli.cjs`)
- **`status`**: 현재 세션(`SES-20260820-08`), 활성 태스크(`PLAT-CLI-07`), 플랫폼 버전(`v2.0.0`), DB 스키마(`v2.2.0`) 실시간 브리핑.
- **`start-task <TASK>`**: `task/*` 브랜치 격리, 로컬 이슈 스캐폴딩, 원격 GitHub Issue #14 발행, `task_nodes` 상태 `IN_PROGRESS` 전이.
- **`verify <TASK>`**: TypeScript 엄격 린트(`tsc --noEmit`) 및 AST 정적 분석(`AstValidator`) 통합 검증 (100점 만점 통과).
- **`wrapup-task <TASK>`**: `dev` 직접 커밋 방어, PR 마크다운 생성, GitHub PR 발행, `dev` 원격 자동 머지 및 로컬 풀.
- **`promote <TASK> dev stg main [TAG]`**: `dev` ➔ `stg` ➔ `main` 다단계 원격 PR 생성/머지 및 릴리즈 태깅(`v2.1.0`).
- **`close-session`**: 세션 회고 보고서 생성 및 연관 이슈 전체 `CLOSED` 정리.

### 2.2 GitHub 동기화 고도화 (`scripts/githubSync.cjs`)
- GitHub REST API v3 기반 Issue/PR 생성, 자동 병합(`merge-pr`), 다단계 승급(`promote-pr`) 구현.
- `GITHUB_TOKEN` 미설정 시 안전한 **Safe Dry-Run 모드**로 자동 전환되어 로컬 문서/Git 작업을 100% 정상 완수하도록 지원.

### 2.3 3대 시나리오 단위 테스트 및 웹 대시보드 (`src/test/harnessCli.test.ts`, `VibeRunnerSandbox.tsx`)
- 7대 테스트케이스(정상 3건, 오류 2건, 예외 2건) 100% PASS 검증.
- `VibeRunnerSandbox.tsx` 내 `3대 시나리오 테스트 카탈로그` 탭 구축으로 실시간 카테고리 필터링 및 원클릭 재실행 지원.

### 2.4 거버넌스 기준서 3종 공식 제정
1. `/docs/13-code-quality-and-lint-standards.md`: TS 컴파일러 린트, 7-Phase AST 4대 필터 및 6대 감사 컬럼 표준
2. `/docs/14-harness-test-cases-catalog.md`: 8대 메타데이터 기반 3대 시나리오 테스트케이스 카탈로그
3. `/docs/15-table-governance-and-json-audit-trail-standards.md`: 3-Tier 대상 분류, 슬림 테이블 설계(순수 업무 컬럼 유지) 및 관리 메타데이터 `revision_history (JSONB)` 완전 위임 표준

---

## 3. 3대 시나리오 검증 결과 (7 / 7 통과)

| 테스트ID | 대상 | 구분 | 검증 내용 | 결과 |
|:---:|---|:---:|---|:---:|
| **`TC-CLI-01`** | `harnessCli.cjs` | **정상 (Happy Path)** | 세션/태스크/버전 상태 브리핑 정상 조회 | **`PASS`** |
| **`TC-CLI-02`** | `harnessCli.cjs` | **정상 (Happy Path)** | `task/*` 브랜치 격리 및 이슈 생성/연동 | **`PASS`** |
| **`TC-CLI-03`** | `harnessCli.cjs` | **정상 (Happy Path)** | `dev` ➔ `stg` ➔ `main` 다단계 원격 PR 및 태깅 | **`PASS`** |
| **`TC-CLI-04`** | `githubSync.cjs` | **오류 (Error Recovery)** | GITHUB_TOKEN 부재 시 Safe Dry-run 자동 전환 | **`PASS`** |
| **`TC-CLI-05`** | `harnessCli.cjs` | **오류 (Error Recovery)** | `dev/main` 상위 브랜치 직접 커밋 방어 차단 | **`PASS`** |
| **`TC-CLI-06`** | `harnessCli.cjs` | **예외 (Edge Bounds)** | 미등록 태스크 코드 입력 시 가용 목록 안내 | **`PASS`** |
| **`TC-CLI-07`** | `harnessCli.cjs` | **예외 (Edge Bounds)** | 선행 의존 미해결 태스크 착수 차단 | **`PASS`** |

---

## 4. 변경 파일 목록 (Modified & Created Files)

- **생성된 파일**:
  - `scripts/harnessCli.cjs` (하네스 라이프사이클 통합 CLI)
  - `scripts/githubSync.cjs` (GitHub REST API 동기화 및 Dry-run 모듈)
  - `src/test/harnessCli.test.ts` (3대 시나리오 단위 검증 스위트)
  - `docs/13-code-quality-and-lint-standards.md` (코드 품질 및 린트 기준서)
  - `docs/14-harness-test-cases-catalog.md` (하네스 테스트케이스 카탈로그)
  - `docs/15-table-governance-and-json-audit-trail-standards.md` (테이블 거버넌스 및 JSON 감사 표준)
  - `docs/issues/07-harness-lifecycle-cli.md` (이슈 #14 명세서)
  - `docs/pull_requests/08-harness-lifecycle-cli.md` (PR #15 명세서)
- **수정된 파일**:
  - `docs/README.md` (문서 인덱스 및 PR 추적표 갱신)
  - `src/types.ts` (`TaskGraphNode.status`에 `IN_PROGRESS` 유니온 추가)
  - `src/data/initialData.ts` (`PLAT-CLI-07` 태스크 상태 `IN_PROGRESS` 및 WBS 최신화)
  - `src/components/VibeRunnerSandbox.tsx` (3대 시나리오 테스트 카탈로그 탭 추가)

---

## 5. 작업자 소스 리뷰 및 승인 요청
- 모든 변경 사항은 `tsc --noEmit` 린트와 `npm run build`를 100% 통과하였으며, `dev` 브랜치로의 원격 PR 머지를 승인합니다.
