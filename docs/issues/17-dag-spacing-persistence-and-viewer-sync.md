# [이슈 #34] DAG 간격 설정 로컬 영속화(LocalStorage) 및 TaskGraphViewer 여백 동기화

- **이슈 번호**: #34
- **작업 브랜치**: `task/dag-spacing-persistence-and-viewer-sync`
- **담당자**: @jkoogit (AI Assistant)
- **작성일자**: 2026-09-01
- **원격 이슈 URL**: https://github.com/jkoogit/jkadh-typep/issues/34

---

## 📌 1. 배경 및 개선 목적 (Problem Statement & Purpose)
- 직전 태스크(`PLAT-DAG-16`)에서 워크플로우 디자이너(`WorkflowDesigner.tsx`)에 상하·좌우 간격 슬라이더와 프리셋을 구현하였으나, 페이지 새로고침 시 기본값(`360x160`)으로 리셋되는 현상 존재.
- 또한 읽기 전용 모드인 `TaskGraphViewer.tsx`는 여전히 기존의 좁은 기본 간격을 유지하고 있어 대시보드 뷰와 편집 뷰 간의 여백 불일치 발생.
- **개선 목표**:
  1. `localStorage` 기반 간격 설정(`jkadh_dag_col_gap`, `jkadh_dag_row_gap`, `jkadh_dag_preset`) 영속화 및 자동 복원.
  2. `TaskGraphViewer.tsx` 읽기 모드 뷰어에도 쾌적한 기본 여백(수평 360px, 수직 160px) 및 조밀/표준/여유 뷰 프리셋 툴바 탑재.
  3. `TaskGraphViewer.tsx` 내 베지어 곡선 제어점 거리 비례 스케일링 및 엉킴 방지 알고리즘 동기화.

---

## 🏗️ 2. 상세 기획 및 설계 사양 (Design Specifications)

### 1) 로컬 스토리지 키 규격 및 안전 폴백 (Persistence Contract)
- `jkadh_dag_col_gap`: 숫자형 문자열 (기본: 360, 허용: 240~520)
- `jkadh_dag_row_gap`: 숫자형 문자열 (기본: 160, 허용: 90~300)
- `jkadh_dag_preset`: `'COMPACT' | 'STANDARD' | 'SPACIOUS'` (기본: 'STANDARD')
- **안전 클램핑(Clamp Fallback)**: 비정상 데이터나 파싱 실패 시 기본 `STANDARD (360x160)`으로 즉시 회복.

### 2) `TaskGraphViewer.tsx` 뷰 프리셋 및 쾌적 여백 연동
- 상단 툴바에 간소화된 3단 뷰 프리셋(`조밀/표준/여유`) 컨트롤 바 제공.
- 동일한 `localStorage` 키를 공유하여 디자이너에서 설정한 간격이 뷰어에서도 완벽하게 일치하도록 양방향 동기화.

---

## 🛠️ 3. 3대 시나리오 검증 계획 (Testing Scenarios)

1. **정상 시나리오 (Happy Path)**:
   - 사용자가 간격 슬라이더나 프리셋을 변경한 후 F5(새로고침)하거나 뷰어/디자이너 탭을 전환해도 설정한 간격과 카드 배치가 유지됨.
2. **오류 복구 시나리오 (Error Recovery)**:
   - `localStorage`에 유효하지 않은 문자열(예: `null`, `NaN`, `9999`)이 저장되어 있더라도 안전 클램프가 동작하여 기본 `STANDARD (360x160)`으로 자동 정상 복원.
3. **예외/경계 시나리오 (Edge Bounds)**:
   - 읽기 전용 대시보드 뷰어와 인터랙티브 디자이너 뷰 모두에서 다중 의존성 베지어 곡선이 왜곡 없이 미려하게 렌더링됨.
