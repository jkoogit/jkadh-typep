# 🏛️ [JKADH 문서 14] 하네스 라이프사이클 테스트케이스 목록 및 검증 카탈로그

- **문서 번호**: `DOC-TC-14`
- **표준 코드**: `JKADH-CATALOG-TEST-01`
- **책임자**: 조정국 (`mem-jkoo` / `SUPER_ADMIN`, Platform Architecture Lab)
- **최신 개정일**: 2026-08-20 (v1.0.0)

---

## 1. 개요 및 목적 (Overview)

본 문서는 JKADH AI 개발 플랫폼의 6대 하네스 라이프사이클과 작업그래프(DAG) 노드별 **3대 시나리오(정상, 예외, 오류) 단위 테스트케이스 목록**을 표준 체계에 따라 체계적으로 관리하는 공식 카탈로그입니다.

모든 테스트케이스는 **테스트ID, 작업그래프ID, 세션ID, 태스크ID, 작업ID, 테스트대상, 테스트내용, 테스트구분** 메타데이터를 포함하며, 자동화 테스트 스위트(`src/test/harnessCli.test.ts` 등)와 100% 상호 추적(Traceability)됩니다.

---

## 2. 하네스 6대 라이프사이클 CLI (`PLAT-CLI-07`) 테스트케이스 명세 목록

| 테스트ID | 작업그래프ID | 세션ID | 태스크ID | 작업ID | 테스트대상 | 테스트내용 | 테스트구분 | 검증결과 |
|:---:|:---:|:---:|:---:|:---:|---|---|:---:|:---:|
| **`TC-CLI-01`** | `DAG-PLAT-01` | `SES-20260820-08` | `PLAT-CLI-07` | `WRK-CLI-STATUS-01` | `scripts/harnessCli.cjs` (`getHarnessStatus`) | 세션 식별자, 활성 태스크, 플랫폼 릴리즈(`v2.0.0`), DB 스키마(`v2.2.0`) 정상 브리핑 조회 | **정상 (Happy Path)** | **`PASS` (100%)** |
| **`TC-CLI-02`** | `DAG-PLAT-01` | `SES-20260820-08` | `PLAT-CLI-07` | `WRK-CLI-START-02` | `scripts/harnessCli.cjs` (`startTask`) | `task/*` 브랜치 자동 격리, 로컬 이슈 문서 생성 및 GitHub Issue 연동 정상 처리 | **정상 (Happy Path)** | **`PASS` (100%)** |
| **`TC-CLI-03`** | `DAG-PLAT-01` | `SES-20260820-08` | `PLAT-CLI-07` | `WRK-CLI-PROMOTE-03` | `scripts/harnessCli.cjs` (`promoteTask`) | `dev` ➔ `stg` ➔ `main` 다단계 원격 PR 발행, 자동 머지 및 릴리즈 태깅(`v2.1.0`) 정상 수행 | **정상 (Happy Path)** | **`PASS` (100%)** |
| **`TC-CLI-04`** | `DAG-PLAT-01` | `SES-20260820-08` | `PLAT-CLI-07` | `WRK-CLI-DRYRUN-04` | `scripts/githubSync.cjs` (Dry-Run Fallback) | `GITHUB_TOKEN` 미설정 시 크래시 없이 Safe Dry-run 모드로 전환되어 로컬 문서 및 브랜치 작업 완수 | **오류 (Error Recovery)** | **`PASS` (100%)** |
| **`TC-CLI-05`** | `DAG-PLAT-01` | `SES-20260820-08` | `PLAT-CLI-07` | `WRK-CLI-GUARD-05` | `scripts/harnessCli.cjs` (`wrapupTask` Guard) | `dev`, `stg`, `main` 등 상위 브랜치에서 직접 wrapup/커밋 시도 시 `HARNESS_DIRECT_DEV_COMMIT_PROHIBITED` 차단 | **오류 (Error Recovery)** | **`PASS` (100%)** |
| **`TC-CLI-06`** | `DAG-PLAT-01` | `SES-20260820-08` | `PLAT-CLI-07` | `WRK-CLI-EDGE-06` | `scripts/harnessCli.cjs` (`startTask` Validation) | 미등록 또는 비유효 태스크 코드 입력 시 `HARNESS_INVALID_TASK_CODE` 예외 발생 및 가용 목록 제안 | **예외 (Edge Bounds)** | **`PASS` (100%)** |
| **`TC-CLI-07`** | `DAG-PLAT-01` | `SES-20260820-08` | `PLAT-CLI-07` | `WRK-CLI-EDGE-07` | `scripts/harnessCli.cjs` (`checkDependencies`) | 선행 의존 태스크가 `DONE`이 아닐 경우 `HARNESS_UNRESOLVED_DEPENDENCY` 예외로 착수 차단 | **예외 (Edge Bounds)** | **`PASS` (100%)** |

---

## 3. 누적 플랫폼 코어 엔진 테스트케이스 요약 (`PLAT-VIBE-06` 등)

| 테스트ID | 작업그래프ID | 세션ID | 태스크ID | 작업ID | 테스트대상 | 테스트내용 | 테스트구분 | 검증결과 |
|:---:|:---:|:---:|:---:|:---:|---|---|:---:|:---:|
| **`TC-VIBE-01`** | `DAG-PLAT-01` | `SES-20260819-VIBE-07` | `PLAT-VIBE-06` | `WRK-VIBE-AST-01` | `AstValidator.ts` | TypeScript AST 정적 구문 및 6대 공통 감사 컬럼 무결성 검증 | **정상 (Happy Path)** | **`PASS` (100%)** |
| **`TC-VIBE-02`** | `DAG-PLAT-01` | `SES-20260819-VIBE-07` | `PLAT-VIBE-06` | `WRK-VIBE-TYPE-02` | `AstValidator.ts` | `any` 타입 키워드 직접 사용 시 정적 AST 탐지 및 자동 거절 | **오류 (Error Recovery)** | **`PASS` (100%)** |
| **`TC-VIBE-03`** | `DAG-PLAT-01` | `SES-20260819-VIBE-07` | `PLAT-VIBE-06` | `WRK-VIBE-SYNTAX-03`| `AstValidator.ts` | 불완전한 구문 및 괄호 불일치 휴리스틱 감지 및 보고 | **예외 (Edge Bounds)** | **`PASS` (100%)** |

---

## 4. 개정 이력 (Revision History)

| 버전 | 개정 일자 | 개정자 | 개정 내용 요약 |
|---|---|---|---|
| **v1.0.0** | 2026-08-20 | 조정국 (SUPER_ADMIN) | 하네스 CLI(`PLAT-CLI-07`) 7대 테스트케이스 및 Vibe AST 검증 카탈로그 최초 제정 |
