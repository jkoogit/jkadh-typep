# [이슈 #30] 작업그래프(DAG) 카드 상하·좌우 여백 조절 및 화살표 엉킴 방지 레이아웃 최적화

- **이슈 번호**: #30
- **작업 브랜치**: `task/dag-spacing-and-layout-optimizer`
- **담당자**: @jkoogit (AI Assistant)
- **작성일자**: 2026-08-31
- **원격 이슈 URL**: https://github.com/jkoogit/jkadh-typep/issues/30

---

## 📌 1. 배경 및 문제점 (Problem Statement)
- 현재 2계층 작업그래프(TaskGraphViewer 및 WorkflowDesigner) 화면에서 노드 카드 간 상하 간격이 좁게 배치되어 카드가 서로 붙어 보임.
- 좌우 간격 또한 좁고 고정되어 있어 노드 간 의존 관계를 나타내는 베지어 곡선 화살표들이 서로 겹치거나 카드 본문을 가로지르며 시각적으로 엉키는 현상 발생.
- 복잡한 다중 의존 노드(Multi-dependency DAG)를 다룰 때 전체 워크플로우 흐름 파악의 가독성 저하.

---

## 🏗️ 2. 상세 기획 및 설계 사양 (Design Specifications)

### 1) 상하(Vertical) & 좌우(Horizontal) 동적 간격 제어 툴바 (Spacing Control Bar)
- **간격 컨트롤러 UI**: DAG 뷰어 상단 툴바에 직관적인 간격 조절 UI 배치
  - **수평 간격(Col Gap / X-Spacing)**: 슬라이더 (220px ~ 500px, 기본 360px) + 수치 표시
  - **수직 간격(Row Gap / Y-Spacing)**: 슬라이더 (80px ~ 300px, 기본 160px) + 수치 표시
  - **3단계 원터치 프리셋 버튼**:
    - `조밀 (Compact)`: X: 260px, Y: 100px
    - `표준 (Standard)`: X: 360px, Y: 160px (기본값)
    - `여유 (Spacious)`: X: 460px, Y: 220px
  - **자동 정렬 (Auto-Layout) 버튼**: 계층별 위상 정렬(Topological Level Layout)을 재계산하여 노드들을 균등하게 자동 재배치.

### 2) 계층형 자동 레이아웃 알고리즘 고도화 (Sugiyama-style Leveling)
- **의존성 기반 레벨 계산**:
  - 부모 노드가 없는 루트 노드 ➔ `Level 0`
  - 종속 노드 ➔ `Max(Parent Levels) + 1`
- **레벨 내 수직 배치 & 인덱싱**:
  - 동일 레벨 내의 노드들은 `Y = BaseY + Index * (CardHeight + RowGap)`으로 겹침 없이 수직 분산.
  - 레벨 간 수평 배치는 `X = BaseX + Level * ColGap`으로 넓게 확보.

### 3) 베지어 곡선 화살표 경로 최적화 (Edge Routing & Detangling)
- **다중 연결 오프셋 분산 (Dispersed Connection Pins)**:
  - 동일한 노드에서 나가는(Source) 또는 들어오는(Target) 엣지가 여러 개인 경우, 단일 핀에 겹치지 않고 노드 높이/너비에 따라 `Y 오프셋(예: -12px, 0px, +12px)`을 부여하여 분산.
- **제어점(Control Points) 거리 비례 스케일링**:
  - `dx = targetX - sourceX` 거리에 비례하여 제어점 오프셋 `min(dx * 0.5, 120)`을 동적 적용하여 곡선이 카드를 파고들지 않고 자연스럽게 호를 그리도록 개선.
- **화살표 시각적 계층화**:
  - 활성/포커스 노드의 엣지는 z-index 최상위 및 네온 하이라이트 부여, 비활성 엣지는 부드러운 반투명 처리로 복잡도 완화.

---

## 🛠️ 3. 3대 시나리오 검증 계획 (Testing Scenarios)

1. **정상 시나리오 (Happy Path)**:
   - 사용자가 상단 슬라이더나 프리셋 버튼을 클릭하여 간격을 조절하면 모든 노드와 연결 화살표의 좌표가 실시간으로 부드럽게 재계산되어 여백이 쾌적하게 확보됨.
2. **오류 복구 시나리오 (Error Recovery)**:
   - 과도하게 작거나 큰 비정상적 간격 수치가 주입될 경우 안전 클램프(Min X: 200px / Min Y: 80px, Max X: 600px / Max Y: 400px)가 작동하여 화면 깨짐을 원천 방지.
3. **예외/경계 시나리오 (Edge Bounds)**:
   - 10개 이상의 다중 의존 노드가 상호 교차하는 복잡한 DAG 구조에서도 분산 핀 오프셋 알고리즘이 동작하여 화살표가 1줄로 겹치지 않고 분리되어 가독성 유지.
