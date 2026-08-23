# 02. [보류/이관대기] PDF 폼(AcroForm) 및 전자서명(PAdES) 엔진 인벤토리

- **작업 코드**: `PDF-FORM-07`
- **현재 상태**: `ON_HOLD_PENDING_MIGRATION` (보류 및 타겟 서비스 이관 대기)
- **보류 사유**: AI 개발 플랫폼 뼈대 안정화 선행 진행으로 인한 비즈니스 엔진 이관 대기
- **이관 대상 원격 레포지토리**: `github.com/jkoogit/pdfowers-service` (신설 예정)

---

## 1. 구현 자산 인벤토리 (Implemented Assets)

### 1.1 소스 파일 및 인터페이스
1. **타입 정의**: `src/types/pdfForm.ts`
   - `FormFieldType` (`TEXT`, `CHECKBOX`, `RADIO`, `SIGNATURE`, `DROPDOWN`)
   - `SignatureStandard` (`PADES_B_B`, `PADES_B_T`, `PADES_B_LT`, `PADES_B_LTA`)
   - `FormErrorCode` (`FORM_ERR_4101` ~ `4106`)
2. **코어 서비스**: `src/services/PdfFormSignatureEngine.ts`
   - `PdfFormSignatureEngine` 클래스: AcroForm 필드 자동 감지, 인터랙티브 폼 값 채우기(Flattening 옵션 지원), X.509 인증서 기반 SHA-256 서명 바이트 다이제스트 및 PAdES 레벨 타임스탬프 주입.
3. **단위 테스트**: `src/services/PdfFormSignatureEngine.test.ts`
   - 3대 시나리오(Happy Path, Error Recovery, Edge Bounds) 100% 통과 검증 슈트.

---

## 2. 타겟 레포지토리 이관 계획

- **타겟 패키지 경로**:
  - `packages/form/src/types/pdfForm.ts`
  - `packages/form/src/signer/PdfFormSignatureEngine.ts`
- **타겟 테스트 경로**:
  - `packages/form/src/__tests__/PdfFormSignatureEngine.test.ts`
