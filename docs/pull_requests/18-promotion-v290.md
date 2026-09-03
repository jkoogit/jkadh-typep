# [PROMOTION v2.9.0] dev ➔ stg ➔ main 다단계 승급 및 릴리즈 완료 보고

- **릴리즈 버전**: `v2.9.0`
- **승급 일자**: 2026-09-01
- **승급 담당**: @jkoogit (AI Assistant)
- **GitHub Release URL**: https://github.com/jkoogit/jkadh-typep/releases/tag/v2.9.0

---

## 🚀 다단계 승급 PR 체인 내역

1. **`dev` ➔ `stg` 승급**:
   - **GitHub PR**: [PR #32](https://github.com/jkoogit/jkadh-typep/pull/32)
   - **머지 결과**: SHA `0eadce1` (Merged)
2. **`stg` ➔ `main` 승급**:
   - **GitHub PR**: [PR #33](https://github.com/jkoogit/jkadh-typep/pull/33)
   - **머지 결과**: SHA `fd9190d` (Merged)
3. **릴리즈 태그 발급**:
   - **Tag**: `v2.9.0` (Origin Release Tag 생성 완료)

---

## 📌 v2.9.0 핵심 탑재 기능 (Release Highlights)

1. **작업그래프(DAG) 인터랙티브 상하·좌우 간격 제어 툴바 (`WorkflowDesigner.tsx`)**:
   - 수평 간격(Col Gap, 240~520px) 및 수직 간격(Row Gap, 90~300px) 조절 슬라이더 탑재.
   - 조밀(270×105), 표준(360×160), 여유(460×220) 3단 원터치 프리셋 지원.
   - 위상 정렬(Topological Leveling) 기반 실시간 자동 정렬(Auto-Layout) 액션 연동.
2. **베지어 곡선 화살표 라우팅 고도화 (Bezier Detangling)**:
   - 거리 비례 제어점 오프셋 스케일링으로 급격한 꺾임 및 화살표 간 겹침 방지.
   - 역방향 및 동일 열 연결 시 루프 회피 알고리즘을 적용하여 카드를 가로지르지 않는 외곽 경로 구현.
3. **타입 안전성 및 번들 무결성**:
   - `tsc --noEmit` 린트 및 Vite Production 빌드 100% 검증.
