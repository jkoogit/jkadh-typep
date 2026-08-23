# JKADH AI Platform Governance & Agent Instructions (AGENTS.md)

## 🏛️ 절대 제약 원칙: 6대 하네스 라이프사이클 거버넌스 준수 의무

AI 어시스턴트는 사용자의 개발 요청을 수신했을 때 무분별하게 소스코드를 직접 수정하는 행위를 엄격히 금지하며, 반드시 `/docs/12-task-lifecycle-governance-process.md`에 규정된 **6대 하네스 라이프사이클 프로세스**를 순차적으로 준수해야 합니다.

```
#세션시작 ──> #태스크시작 ──> #태스크처리 ──> #태스크정리 ──> #태스크승급 ──> #세션정리
```

---

### 1. #세션시작 (Session Initialization)
- **세션명 초안 정의**: 브랜치명이 아닌 명확하고 직관적인 **한글 세션명**으로 정의합니다.
- **작업계획 검토**: 2계층 작업그래프(DAG)의 선행 의존 노드 완료 상태를 확인합니다.
- **작업기획 논의**: 이번 세션에서 완결할 핵심 스코프 및 리스크 범위를 1턴 협의합니다.
- **세션정보 추가 (DB)**: PostgreSQL `harness_sessions` 테이블에 세션을 등록합니다.
- **태스크시작 프롬프트 작성**: 1차 작업 노드 진입을 위한 `#태스크시작` 프롬프트를 출력합니다.

---

### 2. #태스크시작 (Task Initialization)
- **작업 브랜치 생성**: 반드시 `task/{태스크명}` 접두사 규격을 준수합니다. (`feat/` 금지)
- **이슈 생성 (로컬 문서 + 원격 레포)**:
  - `/docs/issues/{번호}-{태스크명}.md` 문서를 생성합니다.
  - 원격 저장소에 이슈를 등록하고 이슈 번호(#)를 확정합니다.
- **태스크작업 기획 논의**: 3대 시나리오(필수 정상/오류 복구/예외 경계) 및 인터페이스 계약을 확정합니다.
- **태스크정보 추가 (DB)**: `task_nodes` 상태를 `IN_PROGRESS`로 갱신합니다.
- **🚨 Hard Gate**: 이슈 생성 및 기획 검토가 완료되기 전에는 어떠한 소스코드 수정/생성 툴도 호출할 수 없습니다.

---

### 3. #태스크처리 (Task Execution & Loop Harness)
- **7-Phase Vibe 루프 순환**: `LOOP_ANALYZE` ➔ `LOOP_DESIGN` ➔ `LOOP_EXECUTE` ➔ `LOOP_TEST` ➔ `LOOP_REFINE` ➔ `LOOP_SECOPS` ➔ `LOOP_GATEKEEPER` 실행.
- **3대 시나리오 테스트 구현**: 정상(Happy Path), 예외(Edge Bounds), 오류(Error Recovery) 테스트 작성 및 린트 통과 (`tsc --noEmit`).
- **1턴 추가 보완**: 구현 후 발견된 잠재 결함을 1턴 자체 보완 리팩토링합니다.
- **DB 물리적 적용 확인**: DDL 실행 후 6대 감사 컬럼 주입, 테이블 버전 코멘트 스탬프, `schema_migrations` 등록 및 데이터 적용 결과를 SELECT 쿼리로 물리적 검증합니다.

---

### 4. #태스크정리 (Task Wrap-Up)
- **🚨 절대 dev 직접 커밋/로컬 직병합 금지 (Strict No-Direct-Commit to `dev`)**:
  - 모든 소스코드 수정은 반드시 `task/{태스크명}` 브랜치에서만 커밋하고 원격 저장소에 푸시(`git push origin task/...`)합니다.
- **원격 GitHub PR 생성 (로컬 문서 + GitHub REST API)**:
  - `/docs/pull_requests/{번호}-{태스크명}.md` 문서를 생성합니다.
  - GitHub REST API (`node scripts/githubSync.cjs create-pr` 또는 `promoteBranchWithPR`)를 호출하여 원격 **GitHub Pull Request(PR)**를 공식 생성하고, 작업 브랜치(`task/*`)와 타겟(`dev`), 해결 이슈(`Resolves #...`) 및 상세 변경 명세를 등록합니다.
- **원격 dev 브랜치 PR 머지**:
  - GitHub API (`node scripts/githubSync.cjs merge-pr`)를 통해 원격 PR을 `dev`에 머지한 후, 로컬 `dev`를 pull하여 최신 상태로 동기화합니다.
- **작업자 소스 리뷰**: PR 내 변경 파일 Diff 최종 검토 및 빌드 무결성을 확인합니다.
- **태스크승급 프롬프트 작성**: 상위 환경 승급을 위한 `#태스크승급` 프롬프트를 출력합니다.

---

### 5. #태스크승급 (Task Promotion)
- **다단계 승급 처리 (반드시 원격 PR 생성 및 머지 거버넌스 준수)**:
  - `dev` ➔ `stg` 대상 GitHub PR을 원격에 생성하고 머지합니다 (`node scripts/githubSync.cjs promote-pr dev stg ...`).
  - `stg` ➔ `main` 대상 GitHub PR을 원격에 생성하고 머지합니다 (`node scripts/githubSync.cjs promote-pr stg main ...`).
  - 릴리즈 태그(`v*.*.*`)를 생성하고 원격에 푸시합니다.
- **미구현 기능 및 보완사항 정리**: 작업 완료 내역 및 추가 파생 백로그를 결산합니다.
- **태스크 정보 정리 (DB)**: `task_nodes.status = 'DONE'` 갱신 및 `phase_gate_logs` 점수를 기록합니다.
- **작업목록 및 다음 프롬프트 표시**:
  - 진행 작업 목록 현황을 표시합니다.
  - 잔여 작업 존재 시 ➔ **다음 작업 `#태스크시작` 프롬프트** 표시.
  - 모든 작업 완료 시 ➔ **`#세션정리` 프롬프트** 표시.

---

### 6. #세션정리 (Session Wrap-Up & Retrospective)
- **작업내용 정리 & 문서 현행화**: 아키텍처 다이어그램 및 백로그 문서를 현행화합니다.
- **세션명 현행화**: 실제 완수된 작업을 반영하여 **한글 세션명**을 최종 갱신합니다.
- **회고 문서 작성**: `/docs/report/{순번}-{날짜}-세션종료-회고-보고서.md`를 작성합니다.
- **문서 및 배포누락 소스 승급**: PR 작성 후 `dev` ➔ `stg` ➔ `main` 최종 배포합니다.
- **이슈 현행화 및 종료**: 원격/로컬 이슈 전체를 `CLOSED` 처리합니다.
- **작업그래프 & 세션 DB 정리**: 차기 노드 잠금 해제(`PLANNED`) 및 `harness_sessions.status = 'COMPLETED'` 기록.
- **다음 세션 인계 프롬프트 작성**: 차기 세션에서 바로 이어받을 수 있는 완벽한 컨텍스트 브리프를 출력합니다.

---

## 🎨 UI/UX 거버넌스 및 계층화 원칙 (UI Design Standards)

1. **정보 노출 빈도 기반 2계층 수납 원칙 (Frequency-Based Exposure Hierarchy)**:
   - **상시 노출 (L1: Header / Main Canvas)**: 작업 진행 중 매 순간 확인·조작해야 하는 핵심 지표 및 기본 네비게이션에만 한정합니다. (예: 현재 활성 세션 상태 배지, 유저 롤 라벨, 햄버거 메뉴 등)
   - **레이어 은닉 (L2: Popover / Dropdown / Modal)**: 매번 참고·변경하지 않는 설정성 기능(테마 변경기, API Key Vault, 상세 권한 정보 등)은 메인 화면에 상시 노출하는 것이 과하므로 팝업 레이어/프로필 드롭다운 내부로 수납하여 시각적 노이즈(Visual Clutter)를 최소화합니다.
2. **저빈도·고정 정보의 불필요한 중복 표기 최소화 (Reduce Low-Frequency Redundancy)**:
   - 자주 확인하거나 상태 변화가 잦은 핵심 지표가 아니라면, 고정된 메타데이터(예: 앱 버전 `v2.2.0 Stable` 등)를 여러 영역(헤더, 사이드바 등)에 불필요하게 반복 노출하지 않고 가장 적합한 단일 위치에 집중 배치하여 화면의 시각적 간결성을 유지합니다.
3. **전역 텍스트 선택성 보장 (Global Text Selection)**:
   - 디버깅, 로그 참조 및 프롬프트 복사를 위해 UI 전반의 모든 텍스트는 드래그 및 복사가 가능하도록 `user-select: text`를 기본 유지합니다.
