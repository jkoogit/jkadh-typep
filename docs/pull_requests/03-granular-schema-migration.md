# [Pull Request #5, #6, #7] PostgreSQL 스키마 개별/그룹/전체 현행화 및 하네스 거버넌스 프로세스 v1.6.0 승급

- **PR 번호**:
  - PR #5: `task/db-granular-schema-migration` ➔ `dev`
  - PR #6: `dev` ➔ `stg`
  - PR #7: `stg` ➔ `main`
- **소스 브랜치 (Head)**: `task/db-granular-schema-migration` / `dev` / `stg`
- **타겟 브랜치 (Base)**: `dev` / `stg` / `main`
- **연결 이슈**: Resolves #2 (GitHub Issue #2)
- **작업자**: 구진규 (SUPER_ADMIN)
- **리뷰어/승인자**: 구진규 (SUPER_ADMIN)
- **머지 및 배포 일시**: 2026-08-18 17:00:00 KST
- **릴리즈 버전**: `v1.6.0` (Tag 완료)
- **머지 상태**: MERGED (`dev` ➔ `stg` ➔ `main` 3단계 승급 및 배포 완료)
- **원격 저장소 PR**: GitHub PR #5, #6, #7 (동기화 완료)

---

## 1. 변경 요약 (Summary of Changes)
- **백엔드 DDL/DML 마이그레이션 격리 엔진 (`server.ts`)**:
  - `TABLE_MIGRATION_REGISTRY`를 통해 8개 테이블을 `HARNESS_GOV`, `CORE_OPS`, `META_INFRA`로 분류하고 테이블별 독립 DDL 실행 기능 구현.
  - `/api/remote-db/init-schema` 엔드포인트의 granular scope (`ALL`, `GROUP`, `TABLE`) 처리.
- **프론트엔드 API 통신 계약 확장 (`src/services/api.ts`)**:
  - `initRemoteDbSchema(options)` 파라미터 규격화.
- **`DevDatabaseExplorerView` UI 인터페이스 전면 개선 (`src/components/DevDatabaseExplorerView.tsx`)**:
  - 테이블 카드별 단독 현행화 (`TABLE` Scope) 버튼.
  - 그룹별 탭 필터링 및 원클릭 그룹 현행화 (`GROUP` Scope) 버튼.
  - 상단 액션 바의 전체 현행화 및 드롭다운 선택 메뉴.
  - 대화형 SQL 콘솔 누락 테이블 단독 생성 연계.
- **하네스 4단계 작업 라이프사이클 프로세스 표준 수립 (`docs/12-task-lifecycle-governance-process.md`)**:
  - `#태스크시작` (이슈 생성, 브랜치 할당, 4-Phase 기획 검토)
  - `#태스크처리` (루프 실행, AST 검증, 세이브포인트)
  - `#태스크정리` (PR 생성, 드리프트 0% 검증)
  - `#태스크승급` (dev ➔ stg ➔ main 다단계 승급 및 DB 동기화)

---

## 2. 테스트 및 검증 증빙 (Verification Proof)
- **정적 타입 검사 (`tsc --noEmit`)**: 0 Errors, 0 Warnings
- **번들 빌드 검증 (`npm run build`)**: Vite + esbuild bundling Pass
- **라이브 환경 배포 (`Cloud Run`)**:
  - Development (`ais-dev-*.run.app`): `dev` 브랜치 소스 반영 및 가동 완료
  - Staging & Production (`ais-pre-*.run.app`): `main` 브랜치 최종 승급 완료
- **원격 PostgreSQL `jkadhp_dev`**: `schema_migrations` v2.2.0 메타 데이터 정합성 일치
