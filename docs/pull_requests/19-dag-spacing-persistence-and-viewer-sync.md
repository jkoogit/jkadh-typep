# [PR #35] DAG 간격 설정 로컬 영속화(LocalStorage) 및 TaskGraphViewer 여백 동기화

- **PR 번호**: #35 (예정/생성)
- **해결 이슈**: Resolves #34
- **소스 브랜치**: `task/dag-spacing-persistence-and-viewer-sync`
- **타겟 브랜치**: `dev`
- **작업자**: @jkoogit (AI Assistant)
- **머지 일자**: 2026-09-01
- **원격 PR URL**: https://github.com/jkoogit/jkadh-typep/pull/35

---

## 📌 주요 변경 사항 (Key Changes)

1. **LocalStorage 기반 간격 설정 영속화 (`WorkflowDesigner.tsx`)**:
   - `jkadh_dag_col_gap`, `jkadh_dag_row_gap`, `jkadh_dag_preset` 키를 통한 영구 저장.
   - 브라우저 새로고침(F5) 및 세션 재진입 시 기존 설정 자동 복원.
   - 데이터 손상/null 방지를 위한 안전 범위 클램핑(Clamping Fallback: 240~520px / 90~300px) 로직 구축.

2. **양방향 실시간 동기화 이벤트 파이프라인**:
   - `CustomEvent('jkadh_dag_spacing_updated')` 및 `window.storage` 이벤트 리스너를 통한 컴포넌트 간 실시간 동기화.
   - 슬라이더 및 프리셋 변경 즉시 뷰어 및 디자이너 전역 반영.

3. **`TaskGraphViewer.tsx` 읽기 모드 뷰어 여백 동기화**:
   - 상단 헤더 툴바에 3단 뷰 프리셋(`조밀/표준/여유`) 퀵 컨트롤러 탑재.
   - 파생 브랜치 뷰(`BRANCH`) 및 전체 그리드 뷰(`GRID`)의 카드 패딩과 컨테이너 갭을 프리셋에 맞춰 유기적으로 비례 조절.

---

## 🧪 품질 및 검증 내역 (Quality Assurance)
- **TypeScript 무결성 검증**: `tsc --noEmit` 무오류 통과.
- **Vite 프로덕션 빌드**: `compile_applet` 정상 빌드 완료.
- **하네스 라이프사이클 거버넌스 준수**: 태스크 시작 ➔ 7-Phase 검증 ➔ 로컬 커밋 ➔ GitHub PR 및 승급 프로세스 실행.
