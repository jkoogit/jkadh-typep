# [이슈 #41] DAG 선택 노드 연관 계통(선행·후속) 테두리 동적 하이라이트 & 캔버스 딤(Dimming) 시각화 엔진 구축

- **이슈 번호**: #41
- **상태**: `IN_PROGRESS`
- **작업 브랜치**: `task/dag-node-highlight-and-dimming`
- **태스크 코드**: `PLAT-DAG-19`
- **담당자**: @jkoogit (AI Assistant)
- **작성일자**: 2026-09-08
- **원격 이슈 URL**: https://github.com/jkoogit/jkadh-typep/issues/41

---

## 📌 1. 배경 및 개선 목적 (Problem Statement & Purpose)
- 복잡한 2계층 작업그래프(DAG)에서 특정 노드를 선택했을 때 해당 노드가 어떤 선행 의존성(Upstream Dependencies)을 필요로 하고, 어떤 후속 파생 태스크(Downstream Dependents)에 영향을 주는지 한눈에 식별하기 어려운 시각적 인지 부하(Cognitive Load) 존재.
- 단순한 단일 선택 하이라이트를 넘어, 전체 그래프 토폴로지 상에서 **선행 조상 계통(Ancestors)**과 **후속 자손 계통(Descendants)**을 실시간 재귀 탐색하여 차별화된 시각적 피드백(에메랄드 vs 바이올렛 링)을 제공하고, 비연관 노드 및 연결선을 딤(Dimming) 처리하여 가독성을 극대화함.

---

## 🏗️ 2. 상세 기획 및 설계 사양 (Design Specifications)

### 1) 실시간 그래프 재귀 계통 탐색 엔진 (`findDagLineage`)
- **선행 조상(Upstream)**: BFS/DFS 역방향 추적 (`node.dependencies` ➔ 조상 노드 재귀 수집)
- **후속 자손(Downstream)**: Adjacency Inverted Map 기반 순방향 추적 (`child.dependencies.includes(parent)` ➔ 자손 노드 재귀 수집)
- **순환 참조(Cycle) 방어**: `visited: Set<string>` 메모이제이션으로 무한 루프 원천 차단.

### 2) 관계형 테두리 하이라이트 분기 계약 (Visual Contracts)
- **선택 노드 (Self)**: `ring-2 ring-blue-500 shadow-xl bg-[#1C2128] border-blue-400 opacity-100 scale-[1.02] z-30`
- **선행 조상 노드 (Upstream)**: `ring-2 ring-emerald-400/90 shadow-lg bg-[#12231c] border-emerald-400 opacity-100 z-20`
- **후속 자손 노드 (Downstream)**: `ring-2 ring-purple-400/90 shadow-lg bg-[#1e172a] border-purple-400 opacity-100 z-20`
- **비연관 노드 (Unrelated)**: `opacity-20 hover:opacity-75 transition-opacity duration-200 z-10`

### 3) 베지어 SVG 연결선(Edge) 지능형 하이라이트 & 딤
- **선행 연결선 (Upstream Edge)**: `stroke-emerald-400 stroke-[2.8] opacity-100` (에메랄드 화살표 마커)
- **후속 연결선 (Downstream Edge)**: `stroke-purple-400 stroke-[2.8] opacity-100` (바이올렛 화살표 마커)
- **비연관 연결선 (Unrelated Edge)**: `stroke-slate-700 stroke-[1.2] opacity-15 stroke-dasharray="2 2"`

### 4) 양방향 동기화 및 캔버스 상호작용
- `WorkflowDesigner.tsx` (D&D 캔버스) 및 `TaskGraphViewer.tsx` (브랜치/그리드 뷰어) 전역 동시 탑재.
- 캔버스 빈 영역 클릭 시 즉시 선택 해제 및 100% 가시성 복구.
- 상단 인포 바: 선택 노드 정보 및 선행/후속/딤 노드 수 실시간 요약 표시.

---

## 🛠️ 3. 3대 시나리오 검증 계획 (Testing Scenarios)

1. **정상 시나리오 (Happy Path)**:
   - 노드 클릭 시 즉시 Self(블루), Upstream(에메랄드), Downstream(바이올렛)으로 정확히 분류 하이라이트되고, 무관 노드와 엣지는 opacity-20/15로 즉각 딤 처리됨. 빈 캔버스 클릭 시 즉시 100% 정상 복구.
2. **오류 복구 시나리오 (Error Recovery)**:
   - 순환 참조(Cyclic Dependencies) 데이터 또는 미존재 의존성 ID가 포함된 잘못된 노드 데이터가 입력되어도 `visited Set` 기반 방어로 브라우저 멈춤 없이 안전하게 처리.
3. **예외/경계 시나리오 (Edge Bounds)**:
   - Root 노드(선행 의존 0개) 선택 시 Upstream 0개 정상 처리.
   - Leaf 노드(후속 의존 0개) 선택 시 Downstream 0개 정상 처리.
   - 고립 노드(선행 0, 후속 0) 선택 시 Self만 하이라이트되고 나머지 전체 노드 정상 딤 처리.
   - 노드 내부 액션 버튼 클릭 시 `e.stopPropagation()`으로 원치 않는 선택/해제 간섭 차단.
