# [Issue #6] 금융/의료 PDF 내 개인정보(PII) 자동 마스킹 및 AES-256 암호화 보안 엔진 구축

- **이슈 번호**: #6
- **관련 태스크 ID**: `PDF-CRYPTO-03`, `MS-PDF-CORE-ENGINE`
- **담당자**: 구진규 (SUPER_ADMIN)
- **작업 브랜치**: `task/pdf-crypto-pii-03`
- **대상 브랜치**: `dev`
- **원격 저장소 이슈**: GitHub Issue #6 (등록 완료: https://github.com/jkoogit/jkadh-typep/issues/6)
- **등록 일시**: 2026-08-18 10:59:00 PDT (2026-08-19 02:59:00 KST)
- **상태**: IN_PROGRESS

---

## 1. 이슈 개요 및 배경 (Background & Requirements)
- 금융 거래 내역서, 보험 청구서, 병원 진료 기록부 등 비정형/정형 PDF 문서 내에 포함된 민감 개인정보(PII: 주민등록번호, 외국인등록번호, 금융 계좌번호, 신용카드번호, 환자 식별번호, 전화번호, 이메일 등)를 정밀 감지하고 안전하게 마스킹하는 보안 엔진이 요구됨.
- GDPR, 개인정보보호법 및 FIPS-140-2 표준을 준수하기 위해 감지된 PII 영역에 대한 **시각적 블랙아웃 마스킹(Visual Redaction Bounding Box)** 및 **AES-256-GCM 대칭키 기반 엔벨롭 암호화/인증 태그(Auth Tag) 무결성 검증** 기능을 구축함.

---

## 2. 3대 시나리오 기획 및 인터페이스 계약 (Scenarios & Contract)

### 3대 시나리오:
1. **필수 정상 시나리오 (Happy Path)**:
   - 금융/의료 PDF 텍스트 스트림 및 OCR 레이아웃 분석 ➔ 정규식(Regex) + AI 하이브리드 패턴 매칭으로 PII 감지.
   - 감지된 PII에 대해 1) 마스킹 텍스트(예: `900101-1******`, `123-45-******`) 생성, 2) PDF 시각적 마스킹 사각형 좌표 추출, 3) 원본 민감 데이터를 AES-256-GCM 알고리즘으로 암호화하여 Ciphertext, IV(12 bytes), AuthTag(16 bytes) 생성.
   - 복호화 키 제공 시 원본 PII로 100% 무손실 복호화 검증 통과.

2. **오류 복구 시나리오 (Error Recovery)**:
   - 잘못된 복호화 키, 손상된 Ciphertext 또는 변조된 AuthTag 입력 시 `CRYPTO_AUTH_TAG_MISMATCH(6002)` 예외를 즉시 포착하고 안전한 Fast-Fail 및 감사 로그 기록.
   - AI PII 감지 API 429/Timeout 발생 시 3계층 Proactive Fallback (`Claude 3.7` ➔ `Codex` ➔ `Gemini 3.7 Flash`) 체인 가동.

3. **예외 경계 시나리오 (Edge Bounds)**:
   - PII가 전혀 포함되지 않은 클린 문서 처리 시 빈 마스킹 목록 반환 및 암호화 바이패스.
   - 0바이트 빈 버퍼 또는 손상된 헤더 입력 시 크래시 없이 `NONE` 상태 안전 처리.
   - 10,000건 이상의 대량 토큰 및 복합 중첩 PII(예: 주민번호와 계좌번호가 연속된 문자열) 처리 시 충돌 없이 우선순위 기반 클러스터링 및 중복 마스킹 방지.

### TypeScript 인터페이스 계약:
- `PiiCategory`: `'RESIDENT_ID' | 'FOREIGNER_ID' | 'BANK_ACCOUNT' | 'CREDIT_CARD' | 'PHONE' | 'EMAIL' | 'MEDICAL_RECORD' | 'PASSPORT' | 'DRIVER_LICENSE'`
- `PiiDetectionMatch`: `{ id, category, originalValue, maskedValue, confidence, boundingBox, page, isAiInferred }`
- `EncryptedPayload`: `{ algorithm: 'AES-256-GCM', ivHex: string, authTagHex: string, ciphertextHex: string, keyId: string, encryptedAt: string }`
- `PdfCryptoRedactOptions`: `{ autoRedactVisual: boolean, maskingChar: string, secretKey?: string, detectCategories?: PiiCategory[], modelFallbackChain?: string[] }`
- `PdfCryptoRedactResult`: `{ taskId: string, totalPiiDetected: number, redactedPiiList: PiiDetectionMatch[], encryptedPayload?: EncryptedPayload, processingTimeMs: number, auditTrail: { engineVersion: string, modelUsed: string, fallbackTriggered: boolean } }`

---

## 3. 세부 작업 항목 (WBS)
- [x] **작업 브랜치 생성**: `task/pdf-crypto-pii-03`
- [x] **로컬 이슈 문서 및 원격 GitHub Issue #6 등록**
- [ ] **인터페이스 & 타입 정의 (`src/types/pdfCrypto.ts`)**: PII 범주 및 암복호화 데이터 모델 확정
- [ ] **코어 엔진 구현 (`src/services/PdfCryptoRedactionEngine.ts`)**:
  - 한국형/글로벌 PII 정규식 및 체크섬 유효성 검증기 (주민번호/외국인번호 검증 알고리즘 포함)
  - AES-256-GCM 표준 대칭키 암호화 및 복호화 무결성 검증기
  - 비정형 서술형 의료/금융 메모 내 AI 기반 PII 추론기
  - 3계층 Proactive Multi-Model Fallback 연동
- [ ] **3대 시나리오 단위 테스트 작성 (`src/services/PdfCryptoRedactionEngine.test.ts`)**:
  - Happy Path (금융/의료 PII 감지, 마스킹, AES-256-GCM 암복호화 라운드트립)
  - Error Recovery (손상된 AuthTag/잘못된 키 방어 및 429 핫스왑)
  - Edge Bounds (0바이트 버퍼, 클린 문서, 대량 배치 청킹)
- [ ] **1턴 자체 보완 리팩토링 & 린트 통과 (`tsc --noEmit`)**
- [ ] **PostgreSQL `jkadhp_dev` DB 상태 동기화 및 6대 거버넌스 승급**

---

## 4. 완료 조건 (Definition of Done)
1. TypeScript strict 타입 검증 0 Error (`tsc --noEmit`)
2. 3대 시나리오(정상/오류/경계) 테스트 100% Pass
3. `npm run build` 번들 빌드 성공
4. Phase 7 Gatekeeper 스펙 드리프트 0.0% 검증 완료
