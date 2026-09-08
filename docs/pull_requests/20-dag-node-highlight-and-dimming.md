# [PR #42] DAG 선택 노드 연관 계통(선행·후속) 테두리 동적 하이라이트 & 캔버스 딤(Dimming) 시각화 엔진 구축

- **PR 번호**: #42
- **해결 이슈**: Resolves #41
- **소스 브랜치**: `task/dag-node-highlight-and-dimming`
- **타겟 브랜치**: `dev`
- **작업자**: @jkoogit (AI Assistant)
- **머지 일자**: 2026-09-08
- **원격 PR URL**: https://github.com/jkoogit/jkadh-typep/pull/42

---

## 📌 주요 변경 사항 (Key Changes)

1. **DAG 연관 계통 재귀 탐색 엔진 구현 (`/src/services/dagLineageEngine.ts`)**:
   - `computeDagLineage(selectedId, tasks)`: BFS/DFS 큐 기반 조상(Upstream) 및 자손(Downstream) 전파 경로 정밀 추출.
   - `visited Set` 순환 참조(Cycle) 방어 로직 탑재 (스택오버플로 및 무한 루프 원천 차단).
   - 비존재 노드(Ghost ID) 및 빈 선택값(Null/Empty) 전달 시 100% 원본 가시성(`NORMAL`) 안전 복원 Fallback 보장.
   - 노드 및 베지어 곡선 연결선(Edge)의 계통 역할 판정 유틸리티 함수(`getNodeHighlightRole`, `getEdgeHighlightRole`) 제공.

2. **`WorkflowDesigner.tsx` SVG 캔버스 & 인터랙티브 노드 동적 하이라이트 통합**:
   - SVG `<defs>`에 관계별 마커 화살표 헤드 3종 신설:
     - `arrowhead-upstream`: 에메랄드 (#34D399)
     - `arrowhead-downstream`: 바이올렛 (#A78BFA)
     - `arrowhead-dimmed`: 저채도 딤 (#30363D, opacity 0.25)
   - 베지어 연결선(Bezier Curve Edge) 계통별 스트로크 색상, 굵기(2.5px vs 1px), 오파시티(1.0 vs 0.15) 동적 분기.
   - 노드 카드 역할별 링 및 글로우 스타일:
     - 선택 노드(Self): `ring-2 ring-blue-500 shadow-xl scale-[1.02] bg-[#1C2128]`
     - 선행 노드(Upstream): `ring-2 ring-emerald-400 shadow-lg bg-[#0d1d17]`
     - 후속 노드(Downstream): `ring-2 ring-purple-400 shadow-lg bg-[#171226]`
     - 비연관 노드(Unrelated): `opacity-20 hover:opacity-80 transition-opacity bg-[#161B22]/60`
   - 상단 캔버스에 선택 노드 코드/명칭 및 `선행 N건 / 후속 N건 / 딤 N건 / 선택 해제` 실시간 계통 컨트롤 툴바 배치.

3. **`TaskGraphViewer.tsx` 읽기 모드(BRANCH & GRID) 뷰어 연관 계통 하이라이트 동기화**:
   - `selectedTaskId` 변경 시 `computeDagLineage`를 통한 실시간 계통 계산 및 상단 상태 요약 툴바 노출.
   - 미진행 파생 백로그(`BRANCH - Pending`) 및 작업 이력 DAG(`BRANCH - History`)의 노드 카드 테두리 및 타임라인 불릿 인디케이터에 3색 계통 링 동적 적용.
   - 클래식 그리드(`GRID`) 뷰 모드의 모든 태스크 카드에 선행/후속/Self 배지 및 딤 오파시티 일관 적용.

4. **3대 시나리오 전수 검증 유닛 테스트 구축 (`/src/test/dagHighlightEngine.test.ts`)**:
   - **HAPPY_PATH** (3건): 중간 노드 계통 분리, 노드 역할 판정, 베지어 엣지 역할 판정 100% 통과.
   - **ERROR_RECOVERY** (3건): 순환 참조 그래프 방어(0.02ms), 유령 노드 격리, 선택 해제 복원 100% 통과.
   - **EDGE_BOUNDS** (3건): 루트 노드(Upstream=0), 리프 노드(Downstream=0), 고립 노드(딤 100%) 경계치 100% 통과.
   - 총 9/9 테스트 올그린(All Green) 달성.

---

## 🧪 품질 및 검증 내역 (Quality Assurance)
- **TypeScript 타입 체크**: `tsc --noEmit` 무오류 통과.
- **프로덕션 빌드 무결성**: `compile_applet` (Vite Build) 완벽 통과.
- **3대 시나리오 자동화 테스트**: 9/9 Test Cases Pass (100%).
- **하네스 거버넌스 준수**: `task/dag-node-highlight-and-dimming` 브랜치 커밋 ➔ GitHub PR #42 발급 ➔ `dev` 머지 절차 준수.
