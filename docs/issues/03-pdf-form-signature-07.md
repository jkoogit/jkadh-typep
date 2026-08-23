# [Issue #3] 대화형 PDF 폼(AcroForm/XFA) 필드 자동 인식 및 전자서명(PAdES) 엔진 구축

- **이슈 번호**: #3
- **관련 태스크 ID**: `PDF-FORM-07`, `MS-PDF-CORE-ENGINE`
- **담당자**: 구진규 (SUPER_ADMIN)
- **작업 브랜치**: `task/pdf-form-signature-07`
- **대상 브랜치**: `dev`
- **원격 저장소 이슈**: GitHub Issue #3 (동기화 완료)
- **등록 일시**: 2026-08-18 10:26:00 PDT (2026-08-19 02:26:00 KST)
- **상태**: CLOSED (Merged via PR #8)

---

## 1. 이슈 개요 및 배경 (Background & Requirements)
- 정형 AcroForm 필드(텍스트박스, 체크박스, 라디오, 콤보박스) 및 스캔된 비정형 PDF 문서 내 양식 영역(밑줄, 박스형 빈칸)을 고정밀 감지하는 파서가 필요함.
- 법적 효력과 문서 무결성을 보장하기 위해 ISO 32000-1 / PAdES (PDF Advanced Electronic Signatures) 표준 호환 전자서명 메타데이터 및 시각적 서명 필드 바인딩 엔진을 구현함.

---

## 2. 3대 시나리오 기획 및 인터페이스 계약 (Scenarios & Contract)

### 3대 시나리오:
1. **필수 정상 시나리오 (Happy Path)**:
   - AcroForm / XFA 딕셔너리 정밀 파싱 ➔ 필드 타입별(`TEXT`, `CHECKBOX`, `RADIO`, `CHOICE`, `SIGNATURE`) 정규화 추출.
   - PAdES 호환 시각적 전자서명 좌표 매핑 및 검증 해시 메타데이터 생성.
2. **오류 복구 시나리오 (Error Recovery)**:
   - 손상된 AcroForm / 순환 참조 필드 발견 시 `FORM_ERR_7001` 예외 포착 및 휴리스틱 비정형 필드 추론 엔진으로 자동 전환.
   - AI OCR 레이아웃 분석 429/Timeout 시 3계층 Proactive Fallback 체인(`Claude` ➔ `Codex` ➔ `Gemini`) 가동.
3. **예외 경계 시나리오 (Edge Bounds)**:
   - 0개 필드 빈 문서, 1,000개 이상 대량 양식 필드 처리 시 가상 메모리 청킹 및 바운딩 박스 오버랩 자동 정규화.

### TypeScript 인터페이스 계약:
- `PdfFormFieldType`: `'TEXT' | 'CHECKBOX' | 'RADIO' | 'CHOICE' | 'SIGNATURE'`
- `PdfFormField`: `{ id, name, type, boundingBox, defaultValue, value, isRequired, isReadOnly, options? }`
- `PdfSignatureSpec`: `{ signerName, reason, location, contactInfo, timestamp, visualRect, certThumbprint }`
- `PdfFormExtractResult`: `{ totalFields, fields, formType: 'ACROFORM' | 'XFA' | 'INFERRED', signatureCount, signatures }`

---

## 3. 세부 작업 항목 (WBS)
- [ ] **인터페이스 & 타입 정의 (`src/types/pdfForm.ts`)**: 필드 및 서명 인터페이스 확정
- [ ] **코어 엔진 구현 (`src/services/PdfFormSignatureEngine.ts`)**:
  - AcroForm / XFA 표준 필드 파서
  - 스캔 문서 비정형 빈칸 필드 추론기
  - PAdES 표준 호환 전자서명 스탬프 및 무결성 검증기
  - 3계층 Multi-Model Fallback 연동
- [ ] **3대 시나리오 단위 검증 & 1턴 추가 보완**:
  - 린트(`tsc --noEmit`) 0 Error 통과 및 번들 빌드 검증
- [ ] **PostgreSQL `jkadhp_dev` 동기화**: `task_nodes` 및 `task_execution_loops` 감사 로그 기록

---

## 4. 완료 조건 (Definition of Done)
1. TypeScript strict 타입 검증 0 Error
2. 3대 시나리오(정상/오류/경계) 테스트 완료
3. `compile_applet` 번들 빌드 성공
4. Phase 7 Gatekeeper 스펙 드리프트 0.0% 검증 완료
