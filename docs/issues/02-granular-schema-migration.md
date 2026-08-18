# [Issue #2] PostgreSQL 스키마 개별/그룹/전체 단위 현행화 및 원격 브릿지 마이그레이션 체계 고도화

- **이슈 번호**: #2
- **관련 태스크 ID**: `DB-SCHEMA-MIGRATE-02`, `DEV-PLATFORM-GOV-01`
- **담당자**: 구진규 (SUPER_ADMIN)
- **작업 브랜치**: `task/db-granular-schema-migration`
- **대상 브랜치**: `dev`
- **원격 저장소 이슈**: GitHub Issue #2 (동기화 완료)
- **등록 일시**: 2026-08-18 16:30:00 KST
- **상태**: CLOSED (Merged via PR #5, #6, #7)

---

## 1. 이슈 개요 및 배경 (Background & Requirements)
- 기존에는 `DevDatabaseExplorerView`에서 "스키마 현행화" 실행 시 모든 8개 테이블이 일괄 재생성/마이그레이션되어, 특정 테이블(예: `task_nodes`, `ai_accounts`) 또는 특정 도메인 그룹만 선별적으로 스키마를 업데이트하거나 오류를 격리할 수 없었음.
- 이에 따라 **① 개별 테이블 단위(TABLE Scope)**, **② 기능 도메인 그룹 단위(GROUP Scope - 하네스 거버넌스 4개, AI 계정/운영 3개, 메타 인프라 1개)**, **③ 전체 테이블 단위(ALL Scope)**로 세분화된 스키마 마이그레이션 제어 체계를 구축함.

---

## 2. 세부 작업 항목 (WBS)
- [x] **백엔드 마이그레이션 엔진 고도화 (`server.ts`)**:
  - `TABLE_MIGRATION_REGISTRY` 딕셔너리 구축 (테이블별 DDL, 감사 컬럼, 코멘트 스탬프 격리)
  - `/api/remote-db/init-schema` 엔드포인트에 `scope`, `targetTable`, `targetGroup` 옵션 파라미터 지원
- [x] **프론트엔드 API 서비스 확장 (`src/services/api.ts`)**:
  - `initRemoteDbSchema` 함수 인터페이스 확장 (`scope: 'ALL' | 'GROUP' | 'TABLE'`, `targetTable`, `targetGroup`)
- [x] **DevDatabaseExplorerView UI 컴포넌트 전면 고도화 (`src/components/DevDatabaseExplorerView.tsx`)**:
  - 테이블 카드별 `[단독 현행화 (TABLE)]` 버튼 추가
  - 상단 필터 탭(`전체`, `하네스`, `계정/운영`, `메타`) 및 `[이 그룹만 현행화]` 원클릭 트리거 제공
  - 선택 테이블 상세 헤더에 `[이 테이블 단독 현행화]`, `[소속 그룹 현행화]`, `[전체 현행화]` 액션 분리
  - 상단 액션 바에 `[전체 현행화 (ALL)]` 및 `[그룹별 선택 ▾]` 드롭다운 추가
  - PostgreSQL SQL 콘솔에서 테이블 누락 에러 발생 시 `[이 테이블만 단독 생성]` 옵션 제공
- [x] **하네스 라이프사이클 거버넌스 프로세스 문서화 (`docs/12-task-lifecycle-governance-process.md`)**:
  - `#태스크시작` (이슈 생성, 브랜치 정의, 기획 검토) ➔ `#태스크처리` ➔ `#태스크정리` (PR 생성) ➔ `#태스크승급` (dev ➔ stg ➔ main 배포) 4단계 표준 정립

---

## 3. 완료 조건 및 검증 결과 (Definition of Done)
1. TypeScript 정적 컴파일(`tsc --noEmit` & `lint_applet`): 0 Error 무결점 통과
2. Vite 번들 빌드(`compile_applet` / `npm run build`): 정상 빌드 완료
3. 우분투 PostgreSQL `jkadhp_dev` DB 개별/그룹/전체 DDL 및 DML 동기화 정상 작동 확인
4. Phase 7 Gatekeeper 스펙 드리프트 0.0% 검증 완료
