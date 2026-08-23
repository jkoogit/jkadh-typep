# 03. [보류/이관대기] 개인정보(PII) 마스킹 & AES-256-GCM 암호화 보안 엔진 인벤토리

- **작업 코드**: `PDF-CRYPTO-03`
- **현재 상태**: `ON_HOLD_PENDING_MIGRATION` (보류 및 타겟 서비스 이관 대기)
- **보류 사유**: AI 개발 플랫폼 뼈대 안정화 선행 진행으로 인한 비즈니스 엔진 이관 대기
- **이관 대상 원격 레포지토리**: `github.com/jkoogit/pdfowers-service` (신설 예정)

---

## 1. 구현 자산 인벤토리 (Implemented Assets)

### 1.1 소스 파일 및 인터페이스
1. **타입 정의**: `src/types/pdfCrypto.ts`
   - `PiiCategory` (주민번호, 여권번호, 운전면허, 신용카드, 계좌번호, 전화번호, 이메일, 의료진단 등 9개 범주)
   - `RedactionStrategy` (`PARTIAL_ASTERISK`, `FULL_BLACKOUT`, `CATEGORY_TOKEN`, `PSEUDONYMIZE`)
   - `CryptoErrorCode` (`CRYPTO_ERR_6001` ~ `6006`)
2. **코어 서비스**: `src/services/PdfCryptoRedactionEngine.ts`
   - `PdfCryptoRedactionEngine` 클래스: 하이브리드 PII 정규식 + LLM 감지기, Modulo-11 / Luhn 알고리즘 유효성 검사기, FIPS-140-2 호환 AES-256-GCM 암복호화기 및 16-byte Poly1305 Auth Tag 무결성 검증기.
3. **단위 테스트**: `src/services/PdfCryptoRedactionEngine.test.ts`
   - 3대 시나리오 100% 통과 검증 슈트.

---

## 2. 타겟 레포지토리 이관 계획

- **타겟 패키지 경로**:
  - `packages/security/src/types/pdfCrypto.ts`
  - `packages/security/src/crypto/PdfCryptoRedactionEngine.ts`
- **타겟 테스트 경로**:
  - `packages/security/src/__tests__/PdfCryptoRedactionEngine.test.ts`
