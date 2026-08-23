# [Issue #14] 하네스 6대 라이프사이클 통합 CLI 도구 및 GitHub PR 자동화 스크립트 구축

- **이슈 번호**: #14
- **관련 태스크 ID**: `PLAT-CLI-07`, `MS-PLAT-CORE-ENGINE`
- **담당자**: 조정국 (mem-jkoo / SUPER_ADMIN)
- **작업 브랜치**: `task/harness-lifecycle-cli`
- **대상 브랜치**: `dev`
- **원격 저장소 이슈**: GitHub Issue #14 (https://github.com/jkoogit/jkadh-typep/issues/14)
- **등록 일시**: 2026-08-19 21:05:00 PDT (2026-08-20 13:05:00 KST)
- **상태**: IN_PROGRESS

---

## 1. 이슈 개요 및 배경 (Background & Requirements)

- **배경**:
  - JKADH AI 개발 플랫폼 거버넌스 규정(`/docs/12-task-lifecycle-governance-process.md` 및 `AGENTS.md`)에 정의된 **6대 하네스 라이프사이클**(`#세션시작` ➔ `#태스크시작` ➔ `#태스크처리` ➔ `#태스크정리` ➔ `#태스크승급` ➔ `#세션정리`)을 개발자 및 AI 에이전트가 완벽하게 준수하고 휴먼 에러(예: `feat/` 접두사 오용, `dev` 브랜치 직접 커밋, 필수 이슈/PR 문서 누락)를 원천 차단하기 위해 단일 통합 CLI 자동화 스크립트(`scripts/harnessCli.cjs`)가 요구됨.
  
- **주요 목표**:
  1. **하네스 6대 라이프사이클 원클릭 CLI 스크립트 (`scripts/harnessCli.cjs`) 구현**:
     - `start-task <TASK_CODE>`: 작업 브랜치(`task/*`) 체크아웃, 로컬 이슈 문서 생성, GitHub Issue REST API 호출 등록, DB 상태 `IN_PROGRESS` 전환
     - `wrapup-task <TASK_CODE>`: 작업 브랜치 커밋 및 푸시, PR 마크다운 문서 생성, GitHub PR(`task/*` ➔ `dev`) 생성, `dev` 머지 및 로컬 풀 동기화
     - `promote <TASK_CODE> dev stg main [VERSION_TAG]`: `dev` ➔ `stg` ➔ `main` 다단계 원격 PR 생성 및 자동 머지, 릴리즈 태깅(`v*.*.*`)
     - `verify <TASK_CODE>`: AST 정적 분석기(`AstValidator`) 및 린트(`tsc --noEmit`) 자동 검증
     - `session-status`: 실시간 하트비트, 활성 태스크, DB 연결 상태 모니터링
  2. **GitHub API 동기화 스크립트 (`scripts/githubSync.cjs`)와의 완벽한 양방향 통합**:
     - GitHub REST API v3를 활용한 Issue/PR 생성, 자동 병합, 이슈 종료
     - `GITHUB_TOKEN` 미설정 시 안전한 Dry-run(시뮬레이션) Fallback 제공
  3. **3대 시나리오 테스트 스위트 (`src/test/harnessCli.test.ts`) 구축**:
     - Happy Path (원클릭 시작 ➔ 정리 ➔ 승급 라이프사이클)
     - Error Recovery (토큰 누락 Dry-run 우회, Dirty Tree 방어, 충돌 롤백)
     - Edge Bounds (미등록 태스크 검증, 미해결 의존성 차단, 중복 실행 방어)
  4. **PostgreSQL 메타데이터 동기화**:
     - `harness_sessions`, `task_nodes`, `task_execution_loops` 테이블과의 실시간 상태 연동

---

## 2. 3대 시나리오 기획 및 인터페이스 계약 (Scenarios & Contract)

### 3대 시나리오:

1. **필수 정상 시나리오 (Happy Path)**:
   - `node scripts/harnessCli.cjs start-task PLAT-CLI-07` 실행:
     - `task/harness-lifecycle-cli` 브랜치를 생성/체크아웃하고 `/docs/issues/07-harness-lifecycle-cli.md` 및 GitHub Issue #14를 생성한 뒤 `task_nodes` 상태를 `IN_PROGRESS`로 갱신함.
   - 작업 완료 후 `node scripts/harnessCli.cjs wrapup-task PLAT-CLI-07` 실행:
     - 로컬 커밋 및 원격 푸시를 수행하고 `/docs/pull_requests/08-harness-lifecycle-cli.md` 및 GitHub PR을 생성한 후 `dev` 브랜치에 머지하고 로컬 `dev`를 최신화함.
   - `node scripts/harnessCli.cjs promote PLAT-CLI-07 dev stg main v2.1.0` 실행:
     - `dev` ➔ `stg` 및 `stg` ➔ `main` 순차 PR 생성/머지를 수행하고 Git 태그 `v2.1.0`을 발행함.

2. **오류 복구 시나리오 (Error Recovery)**:
   - `GITHUB_TOKEN` 환경변수가 주입되지 않은 오프라인/로컬 환경에서 CLI를 실행할 경우, 크래시 없이 `DRY_RUN_MODE`로 전환되어 로컬 마크다운 문서 및 Git 브랜치 작업을 정상 완수하고 원격 API 호출에 대한 시뮬레이션 로그를 출력함.
   - 워킹 디렉터리에 커밋되지 않은 파일이 남아있을 때 `start-task` 호출 시 `HARNESS_DIRTY_TREE_ERROR`를 반환하고 안전하게 중단하여 작업 유실을 방지함.

3. **예외 경계 시나리오 (Edge Bounds)**:
   - 유효하지 않은 태스크 코드(`PLAT-UNKNOWN-999`) 입력 시 `HARNESS_INVALID_TASK_CODE` 에러를 반환하고 사용 가능한 태스크 목록을 제안함.
   - 선행 의존 노드가 완료되지 않은 태스크를 착수하려 할 때 `HARNESS_UNRESOLVED_DEPENDENCY` 경고를 출력하고 실행을 차단함.

---

## 3. 세부 작업 항목 (WBS)
- [x] **작업 브랜치 명세 확정**: `task/harness-lifecycle-cli`
- [x] **로컬 이슈 문서 작성**: `/docs/issues/07-harness-lifecycle-cli.md`
- [x] **통합 CLI 아키텍처 및 코어 스크립트 구현 (`scripts/harnessCli.cjs`)**
- [x] **GitHub API 동기화 스크립트 연동 고도화 (`scripts/githubSync.cjs`)**
- [x] **3대 시나리오 단위 검증 스위트 작성 (`src/test/harnessCli.test.ts`)**
- [x] **3대 시나리오 웹 UI 카탈로그 대시보드 구축 (`src/components/VibeRunnerSandbox.tsx`)**
- [x] **거버넌스 기준서 제정**: `/docs/13-code-quality-and-lint-standards.md`, `/docs/14-harness-test-cases-catalog.md`, `/docs/15-table-governance-and-json-audit-trail-standards.md`
- [x] **DB 메타데이터 및 작업그래프 상태 갱신 (`task_nodes`, `harness_sessions`)**
- [x] **1턴 자체 보완 리팩토링 및 린트 (`tsc --noEmit`) 무결점 검증**

