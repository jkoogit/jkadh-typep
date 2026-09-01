# [PR #31] 작업그래프(DAG) 카드 상하·좌우 여백 조절 및 화살표 엉킴 방지 레이아웃 최적화

- **PR 번호**: #31
- **해결 이슈**: Resolves #30
- **소스 브랜치**: `task/dag-spacing-and-layout-optimizer`
- **타겟 브랜치**: `dev` (머지 완료: SHA `d1e88b2`)
- **작업자**: @jkoogit (AI Assistant)
- **머지 일자**: 2026-09-01
- **원격 PR URL**: https://github.com/jkoogit/jkadh-typep/pull/31

---

## 📌 주요 변경 사항 (Key Changes)

1. **인터랙티브 간격 제어 툴바 (`WorkflowDesigner.tsx`)**:
   - **수평(Col Gap) 슬라이더**: 240px ~ 520px (기본 360px) 실시간 인터랙션.
   - **수직(Row Gap) 슬라이더**: 90px ~ 300px (기본 160px) 실시간 인터랙션.
   - **3단계 원터치 프리셋 버튼**:
     - `조밀 (Compact)`: 270px × 105px
     - `표준 (Standard)`: 360px × 160px
     - `여유 (Spacious)`: 460px × 220px
   - **원클릭 자동 정렬 (Auto-Layout)**: 위상 정렬 기반 레벨별 격자 균등 재배치.

2. **베지어 곡선 화살표 라우팅 고도화 (Bezier Detangling)**:
   - 거리 비례 가중치 제어점 오프셋(`Math.min(dx * 0.45, 180)`) 적용으로 급격한 꺾임 및 겹침 방지.
   - 역방향/수직 연결 시 루프 회피 알고리즘으로 카드를 가로지르지 않고 외곽으로 라우팅.

---

## 🧪 품질 및 검증 내역 (Quality Assurance)
- **TypeScript 타입 체크**: `tsc --noEmit` 전체 검사 통과 (0 errors).
- **Vite 번들링 빌드**: `compile_applet` 정상 통과.
- **Git 원격 동기화**: `task/*` ➔ 원격 PR #31 ➔ `dev` 원격 머지 ➔ 로컬 `dev` Fast-forward 동기화 완료.
