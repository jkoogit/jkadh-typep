# [PR #27] 무태스크 소스/문서 수정 방지 거버넌스 가드 및 2계층 DAG 워크플로우 디자이너 편입 (v2.8.0)

- **PR 번호**: #27
- **해결 이슈**: Resolves #26
- **소스 브랜치**: `task/task-governance-workflow-designer`
- **타겟 브랜치**: `dev` (머지 완료: SHA `23f8566`)
- **작업자**: @jkoogit (AI Assistant)
- **머지 일자**: 2026-08-31
- **원격 PR URL**: https://github.com/jkoogit/jkadh-typep/pull/27

---

## 📌 주요 변경 사항 (Key Changes)

1. **`AGENTS.md` 거버넌스 가드 강화**:
   - **무태스크 소스/문서 수정 방지 하드 게이트**: 단위 기능 개발, 버그 수정, 리팩토링 및 모든 설계/가이드/명세 문서 작업(`src/*`, `scripts/*`, `docs/*`) 시 `#태스크시작`을 거치지 않은 직접 수정을 원천 금지.
   - **일괄/루프 작업 투명성 보장**: 단일 프롬프트 일괄 주문 시에도 전 하네스 단계(이슈, 7-Phase, PR, 머지, 승급)를 거치도록 명문화.
   - **Git 무결성 가드**: `.git` 디렉터리 보호 및 이상 감지 시 `Auto-Healing Fallback` 표준 복구 파이프라인 수립.

2. **2계층 DAG 워크플로우 디자이너 (`WorkflowDesigner.tsx`) 정식 편입**:
   - 카드 드래그 앤 드롭, 출력 핀(●) 기반 베지어 곡선 의존성 결선 및 클릭 해제 인터페이스.
   - DFS 기반 순환 종속성(Cycle) 실시간 탐지 및 차단 배너 연동.
   - 로컬 상태 변경사항 저장 및 되돌리기 영속화.

---

## 🧪 품질 및 검증 내역 (Quality Assurance)
- **TypeScript 무결성**: `tsc --noEmit` 전체 검사 통과 (0 errors).
- **Vite 번들링 빌드**: `compile_applet` 정상 통과.
- **Git 원격 동기화**: `task/*` ➔ 원격 PR #27 생성 ➔ `dev` 원격 머지 ➔ 로컬 `dev` Fast-forward 동기화 완료.
