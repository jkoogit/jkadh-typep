# 01. [보류/이관대기] PDF 코어 스트림, OCR & 표 추출 엔진 인벤토리

- **작업 코드**: `PDF-CORE-01`, `PDF-OCR-04`, `PDF-TABLE-05`
- **현재 상태**: `ON_HOLD_PENDING_MIGRATION` (보류 및 타겟 서비스 이관 대기)
- **보류 사유**: AI 개발 플랫폼 뼈대 안정화 선행 진행으로 인한 비즈니스 엔진 이관 대기
- **이관 대상 원격 레포지토리**: `github.com/jkoogit/pdfowers-service` (신설 예정)

---

## 1. 구현 자산 인벤토리 (Implemented Assets)

### 1.1 소스 파일 및 인터페이스
1. **`src/data/initialData.ts`**:
   - `PdfOcrEngine`: Tesseract & Vision AI 하이브리드 OCR 엔진, 다단계 핫스왑 Fallback 체인 탑재.
2. **`src/services/PdfTableExtractor.ts`**:
   - `PdfTableExtractor`: 선 없는 비정형 표(Borderles Table) 셀 좌표 감지, 병합 셀(Rowspan/Colspan) 정규화, RFC-4180 호환 CSV / Excel JSON 변환기.

---

## 2. 주요 기능 및 아키텍처 스펙

- **바이너리 유효성 검증**: `%PDF-` 매직 바이트 검사 및 300DPI 좌표계 정규화.
- **표 추출 런북 규칙**: `TABLE_ERR_5001` (셀 좌표 미인식), `TABLE_ERR_5002` (복합 병합 오류), `TABLE_ERR_5003` (변환 실패) 자동 복구.
- **Fallback 체인**: `Claude 3.7 Sonnet` ➔ `ChatGPT Codex` ➔ `Gemini 3.7 Flash`.

---

## 3. 타겟 레포지토리 이관 계획

- **타겟 패키지 경로**:
  - `packages/core/src/parser/StreamParser.ts`
  - `packages/ocr/src/engine/PdfOcrEngine.ts`
  - `packages/table/src/extractor/PdfTableExtractor.ts`
- **타겟 테스트 경로**:
  - `packages/ocr/src/__tests__/PdfOcrEngine.test.ts`
  - `packages/table/src/__tests__/PdfTableExtractor.test.ts`
