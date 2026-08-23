# 04. [보류/이관대기] 무손실 PDF 다중 병합/분할 및 XREF/북마크 보존 엔진 인벤토리

- **작업 코드**: `PDF-MERGE-06`
- **현재 상태**: `ON_HOLD_PENDING_MIGRATION` (보류 및 타겟 서비스 이관 대기)
- **보류 사유**: AI 개발 플랫폼 뼈대 안정화 선행 진행으로 인한 비즈니스 엔진 이관 대기
- **이관 대상 원격 레포지토리**: `github.com/jkoogit/pdfowers-service` (신설 예정)

---

## 1. 구현 자산 인벤토리 (Implemented Assets)

### 1.1 소스 파일 및 인터페이스
1. **타입 정의**: `src/types/pdfMergeSplit.ts`
   - `PdfMergeDocumentSpec`, `MergeOptions`, `SplitOptions`, `SplitMode` (`PAGE_RANGES`, `BURST_EACH_PAGE`, `FIXED_CHUNK_SIZE`, `BOOKMARK_BASED`)
   - `MergeSplitErrorCode` (`MERGE_ERR_5101` ~ `5106`)
2. **코어 서비스**: `src/services/PdfMergeSplitEngine.ts`
   - `PdfMergeSplitEngine` 클래스: ISO 32000-1/2 표준 바이너리 파서, 전역 페이지 오프셋 리매핑 계층형 아웃라인/북마크 트리 보존기, XREF 상호참조 테이블 및 트레일러 포인터 재구축기, 범위/버스트 분할기.
3. **단위 테스트**: `src/services/PdfMergeSplitEngine.test.ts`
   - 3대 시나리오 100% 통과 검증 슈트.

---

## 2. 타겟 레포지토리 이관 계획

- **타겟 패키지 경로**:
  - `packages/merge-split/src/types/pdfMergeSplit.ts`
  - `packages/merge-split/src/engine/PdfMergeSplitEngine.ts`
- **타겟 테스트 경로**:
  - `packages/merge-split/src/__tests__/PdfMergeSplitEngine.test.ts`
