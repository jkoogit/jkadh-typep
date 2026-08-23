# 00. 타겟 서비스(PDF 뷰어/에디터) 분리 이관 정책 및 거버넌스 원칙

- **문서 식별자**: `DOC-POLICY-MIGRATION-20260819-00`
- **관리 주체**: JKADH 플랫폼 아키텍처 거버넌스 위원회
- **적용 대상**:
  - 본 플랫폼 저장소: `jkoogit/jkadh-typep` (JKADH AI 개발 플랫폼 전용 레포지토리)
  - 향후 신설 타겟 서비스 저장소: `jkoogit/pdfowers-service` (또는 타겟 PDF 서비스 전용 레포지토리)
- **제정 일시**: 2026-08-19 (KST)
- **상태**: `OFFICIALLY_ENACTED` (공식 발효)

---

## 1. 제정 배경 및 문제 정의 (Context & Problem Statement)

### 1.1 저장소 및 작업 영역의 혼선 해소
지금까지 본 저장소(`jkadh-typep`) 내에서 **AI 개발 플랫폼(JKADH DevPlatform)** 인프라 구축과 **타겟 프로젝트(PDF 뷰어/에디터 비즈니스 엔진)** 개발이 단일 작업그래프 상에 혼재되어 진행되었습니다.

- **현재 플랫폼 상태**: AI 모델 거버넌스, 6대 라이프사이클 하네스, 단일 DB 트랜잭션 격리, 다중 모델 서킷 브레이커, 스키마 버전 관리 등 **AI 개발 플랫폼 자체의 뼈대와 인프라가 아직 고도화·안정화되는 과정**에 있습니다.
- **타겟 서비스 상태**: 타겟 서비스(PDF 뷰어)는 아직 공식 프로젝트 킥오프 및 전용 원격 저장소가 개설되지 않았으며, 플랫폼 인프라가 완전히 안정화된 이후 독립 프로젝트로 착수될 예정입니다.

따라서 현시점부터 **AI 개발 플랫폼과 타겟 서비스의 작업 영역을 엄격히 분리**하고, 기 구현된 PDF 비즈니스 엔진들을 **[보류 및 이관 대기(ON_HOLD_PENDING_MIGRATION)]** 상태로 격리 보관합니다.

---

## 2. 2대 독립 저장소 분리 아키텍처 원칙

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [저장소 A] JKADH AI 개발 플랫폼 (Platform Repository: jkadh-typep)        │
├──────────────────────────────────────────────────────────────────────────┤
│  • 역할: AI 에이전틱 코딩 거버넌스, 6대 하네스 라이프사이클 오케스트레이터       │
│  • 핵심 모듈: Multi-Model Router, Circuit Breaker, Single-DB Isolation,  │
│              7-Phase Vibe Runner, Schema Migration Manager, API Vault    │
│  • 작업그래프: 순수 AI 개발 플랫폼 뼈대 구축 및 인프라 고도화 DAG 관리    │
└──────────────────────────────────────────────────────────────────────────┘
                                   ║
       [격리 경계: 플랫폼 뼈대 안정화 후 타겟 서비스 레포로 순차 이관]
                                   ║
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ [저장소 B] 타겟 서비스 레포지토리 (Target Service: pdfowers-service)       │
├──────────────────────────────────────────────────────────────────────────┤
│  • 역할: 엔드유저 대상 고해상도 PDF 뷰어, 편집, OCR, 표 추출, 암호화 상용 서비스 │
│  • 이관 대상: PDF-CORE-01, PDF-OCR-04, PDF-TABLE-05, PDF-FORM-07,         │
│              PDF-CRYPTO-03, PDF-MERGE-06 및 전용 뷰어 UI 컴포넌트         │
│  • 작업그래프: 타겟 서비스 전용 독자적 L1/L2 DAG 구축 및 원격 레포지토리 관리 │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 기 구현 PDF 모듈의 보류 및 이관 대상 목록 (Migration Inventory)

현재 본 플랫폼 레포지토리에 구현된 PDF 비즈니스 로직은 다음과 같이 완벽히 보존되어 있으며, 타겟 서비스 저장소 개설 즉시 이관됩니다.

| 작업 코드 | 기능 명칭 | 기 구현 소스 파일 | 타겟 서비스 이관 대상 경로 | 이관 준비 상태 |
|---|---|---|---|:---:|
| **`PDF-CORE-01`** | PDF 스트림 파서 & 가상 메모리 매퍼 | `src/data/initialData.ts` (Stream Core) | `packages/core/src/parser/` | 🟢 준비 완료 |
| **`PDF-OCR-04`** | 다국어 고해상도 OCR & 바운딩박스 | `src/data/initialData.ts` (PdfOcrEngine) | `packages/ocr/src/engine/` | 🟢 준비 완료 |
| **`PDF-TABLE-05`** | 비구조화 표 AI 감지 & Excel 변환 | `src/services/PdfTableExtractor.ts` | `packages/table/src/extractor/` | 🟢 준비 완료 |
| **`PDF-FORM-07`** | 대화형 PDF 폼 자동인식 & PAdES 전자서명 | `src/services/PdfFormSignatureEngine.ts`<br>`src/types/pdfForm.ts` | `packages/form/src/signer/` | 🟢 준비 완료 |
| **`PDF-CRYPTO-03`**| 개인정보(PII) 마스킹 & AES-256 암호화 | `src/services/PdfCryptoRedactionEngine.ts`<br>`src/types/pdfCrypto.ts` | `packages/security/src/crypto/` | 🟢 준비 완료 |
| **`PDF-MERGE-06`** | 무손실 다중 병합/분할 & XREF 북마크 보존 | `src/services/PdfMergeSplitEngine.ts`<br>`src/types/pdfMergeSplit.ts` | `packages/merge-split/src/engine/` | 🟢 준비 완료 |

---

## 4. 향후 타겟 서비스 개설 시 이관 절차 (Migration Execution Steps)

1. **타겟 서비스 원격 저장소 생성**:
   - `github.com/jkoogit/pdfowers-service` 저장소 신설 및 기본 모노레포 구조 세팅 (`bun` / `pnpm workspace`).
2. **타겟 서비스 전용 작업그래프(DAG) 초기화**:
   - `MS-PDF-CORE-ENGINE` L1 루트 마일스톤 생성 및 L2 서브태스크 노드 배치.
3. **보류 소스코드 및 테스트 슈트 이전**:
   - 본 `/docs/pending_target_service_migration/` 폴더 내의 각 인벤토리 명세서에 따라 소스코드, 타입 정의, 단위 테스트 슈트를 타겟 레포로 복사 및 의존성 주입.
4. **플랫폼 레포지토리 내 비즈니스 잔재 정제**:
   - 이관 완료 확인 후 본 플랫폼 레포지토리에서는 순수 플랫폼 하네스 및 오케스트레이터만 남기고 비즈니스 로직을 슬림화.

---

## 5. 결론 및 개발 우선순위 가이드라인

- **현재 최우선 과제**: **JKADH AI 개발 플랫폼 뼈대(인프라/거버넌스/다중모델/DB트랜잭션) 구현 및 안정화**
- **타겟 서비스(PDF 뷰어) 작업**: 본 보류 문서에 안전하게 락을 걸어두고, 플랫폼 안정화 완료 후 공식 타겟 레포지토리에서 본격 개시함.
