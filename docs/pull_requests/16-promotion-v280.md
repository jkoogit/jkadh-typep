# [PROMOTION v2.8.0] dev ➔ stg ➔ main 다단계 승급 및 릴리즈 완료 보고

- **릴리즈 버전**: `v2.8.0`
- **승급 일자**: 2026-08-31
- **승급 담당**: @jkoogit (AI Assistant)
- **GitHub Release URL**: https://github.com/jkoogit/jkadh-typep/releases/tag/v2.8.0

---

## 🚀 다단계 승급 PR 체인 내역

1. **`dev` ➔ `stg` 승급**:
   - **GitHub PR**: [PR #28](https://github.com/jkoogit/jkadh-typep/pull/28)
   - **머지 결과**: SHA `6515e9d` (Merged)
2. **`stg` ➔ `main` 승급**:
   - **GitHub PR**: [PR #29](https://github.com/jkoogit/jkadh-typep/pull/29)
   - **머지 결과**: SHA `de86f36` (Merged)
3. **릴리즈 태그 발급**:
   - **Tag**: `v2.8.0` (Origin Release Tag 생성 완료)

---

## 📌 v2.8.0 핵심 탑재 기능 (Release Highlights)

1. **무태스크 소스/문서 수정 방지 하드 게이트 (`AGENTS.md`)**:
   - 단위 기능 개발, 버그 수정, 리팩토링 및 모든 설계/가이드/명세 문서(`src/*`, `scripts/*`, `docs/*`) 작업 시 `#태스크시작`을 거치지 않는 임의 수정을 원천 차단.
   - 단일 프롬프트 일괄/루프 주문 시에도 각 하네스 단계(이슈 ➔ 7-Phase ➔ PR ➔ 승급)를 투명하게 실행 및 표준 프롬프트 보고하도록 규정.
2. **Git 무결성 가드 및 자가치유 파이프라인 (Git Integrity Guard)**:
   - `.git` 메타데이터 디렉터리 보호 및 임의 삭제/변조 금지.
   - 샌드박스 동기화 글리치 감지 시 미커밋 소스코드 100% 무손실 보존 자가치유(Auto-Healing Fallback) 체계 확립.
3. **2계층 DAG 인터랙티브 워크플로우 디자이너 (`WorkflowDesigner.tsx`)**:
   - 2계층 작업그래프 시각 편집기 정식 연동 (노드 D&D, 베지어 핀 연결/해제).
   - DFS 기반 순환 종속성(Cycle) 실시간 탐지 및 차단 배너 연동.
   - 전체 TypeScript(`tsc --noEmit`) 린트 및 번들 빌드 무결성 확보.
