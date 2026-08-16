# [Issue #1] 2계층 듀얼 작업그래프 및 상향식 이력 관리 체계 구축 (PDF-OCR-04)

- **이슈 번호**: #1
- **관련 태스크 ID**: `PDF-OCR-04`, `PDF-WATERMARK-02`, `PDF-TABLE-05`
- **담당자**: 구진규 (ADMIN), 김민지 (ENGINEER)
- **작업 브랜치**: `feat/task-graph-dual-dag`
- **대상 브랜치**: `dev`
- **등록 일시**: 2026-08-15 23:25:00 KST
- **상태**: CLOSED (Merged via PR #1)

---

## 1. 이슈 개요 및 배경
- 기존 단일 그리드 기반 태스크 목록에서는 선행 작업 진행 중 도출된 **신규 파생 요구사항(미진행 백로그)**과 **기존 검증/완료된 작업 이력** 간의 인과관계 및 상향 누적(Bottom-up) 흐름을 파악하기 어려움.
- Git 브랜치 커밋 로그(`git log --graph`) 원리를 차용한 **2계층 듀얼 작업그래프(상단: 미진행 파생 백로그, 하단: 상향 누적 작업 이력)**를 구현하고, Phase 7 Gatekeeper 통과 태스크에 대한 자동 승급 체계를 구축함.

---

## 2. 세부 작업 항목 (WBS)
- [x] **상단 미진행 파생 백로그 UI 분리**: 파생 원천 노드, 추가 시점, 추가 사유, 목표 마일스톤 메타정보 표시
- [x] **하단 상향 누적(Bottom-up) DAG UI 구현**: 초기 기반작업(`PDF-CORE-01`)부터 최신 진행작업까지 타임라인 브랜치 렌더링
- [x] **문서 렌더러 마크다운 모듈 통합**: `react-markdown` 라이브러리 연동 및 빌드 안정화
- [x] **가이드 문서 현행화**: `/docs/08-task-graph-management.md`, `/docs/09-harness-architecture-comparison.md` 작성
- [x] **태스크 승급(Promotion) 집행**: `PDF-OCR-04` 및 `PDF-WATERMARK-02`를 `DONE`으로 승급, `PDF-TABLE-05` 의존성 잠금 해제

---

## 3. 완료 조건 및 검증 결과 (Definition of Done)
1. TypeScript 정적 컴파일(`tsc --noEmit`) 0 Error 검증 통과
2. Vite 번들 빌드(`npm run build`) 정상 완료
3. Phase 7 Gatekeeper 스펙 검증 점수 100점 만점 획득
