# [Pull Request] 무손실 PDF 다중 병합/분할 및 아웃라인/북마크(XREF) 보존 엔진 구축

- **PR 번호**:
  - `task/pdf-merge-split-06` ➔ `dev`
  - `dev` ➔ `stg`
  - `stg` ➔ `main`
- **소스 브랜치 (Head)**: `task/pdf-merge-split-06` / `dev` / `stg`
- **타겟 브랜치 (Base)**: `dev` / `stg` / `main`
- **연결 이슈**: Resolves #9 (GitHub Issue #9)
- **작업자**: 박준호 (REVIEWER) / 구진규 (SUPER_ADMIN)
- **리뷰어/승인자**: 구진규 (SUPER_ADMIN)
- **릴리즈 버전**: `v1.9.0`
- **머지 상태**: IN_PROGRESS (3단계 승급 진행)

---

## 1. 변경 요약 (Summary of Changes)
- **타입 인터페이스 정의 (`src/types/pdfMergeSplit.ts`)**:
  - `PdfMergeOptions`, `PdfSplitOptions`, `PdfBookmarkNode`, `PdfParsedMetadata`, `PdfSplitOutputItem`, `PdfMergeResult`, `PdfSplitResult`
  - ISO 32000-1/2 표준 XREF 및 Trailer 객체 계약 정의
  - 5000번대 에러 코드 정의 (`PDF_EMPTY_BUFFER: 5001`, `PDF_MERGE_CORRUPT_OR_ENCRYPTED: 5002`, `PDF_MERGE_NO_INPUT: 5003`)
- **코어 엔진 구현 (`src/services/PdfMergeSplitEngine.ts`)**:
  - 바이너리 파서 및 XREF/Trailer 구조 분석기
  - 무손실 다중 PDF 병합 및 전역 페이지 오프셋 누적 리매핑
  - 계층형 아웃라인/북마크(Outlines) 트리 재귀 보존
  - 페이지 범위(`1-3, 5-8`) 및 단일 페이지 버스트(`BURST_EACH_PAGE`) 분할기
  - 3계층 Proactive Multi-Model Fallback (`Claude 3.7` ➔ `Codex` ➔ `Gemini 3.7 Flash`)
- **3대 시나리오 단위 테스트 구축 (`src/services/PdfMergeSplitEngine.test.ts`)**:
  - Happy Path (다중 PDF 무손실 병합, 북마크 전역 리매핑 및 페이지 범위 분할)
  - Error Recovery (손상/암호화 스트림 5002 방어 및 초과 범위 자동 클램핑)
  - Edge Bounds (0바이트 버퍼 Fast-Fail, 1페이지 버스트 분할 및 3계층 Deep 북마크 트리 보존)

---

## 2. 테스트 및 검증 증빙 (Verification Proof)
- **정적 타입 검사 (`tsc --noEmit`)**: 0 Errors, 0 Warnings
- **단위 테스트 (`PdfMergeSplitEngine.test.ts`)**: 3대 시나리오 100% Pass (3/3)
- **스펙 드리프트 점수**: 0.0% (Zero-Drift 달성)

---

## 3. 관련 이슈 해결
- Resolves #9
