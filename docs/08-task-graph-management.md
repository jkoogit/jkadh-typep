# 8. 작업그래프(Task Graph DAG) 관리 및 브랜치형 누적·파생 이력 체계

## 8.1 2계층 작업그래프(Dual-Graph) 아키텍처 및 저장소 분리 원칙

**jkadh 작업그래프**는 **[AI 개발 플랫폼 자체 구축 활성 DAG]**와 **[타겟 서비스(PDF 뷰어) 분리 이관 대기 보류 그래프]**를 엄격히 구분하여 관리합니다.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ [1영역: 활성] JKADH AI 개발 플랫폼 뼈대 구축 DAG (Active Platform DAG)     │
│  - 6대 하네스 라이프사이클 거버넌스 (PLAT-GOV-01)                       │
│  - 멀티 모델 3-Tier Fallback 서킷 브레이커 (PLAT-ROUTER-02)              │
│  - AES-256 API Key 암호화 볼트 & 팀 RBAC 권한 격리 (PLAT-VAULT-03)       │
│  - 단일 DB(jkadhp_dev) 트랜잭션 격리 및 스키마 매니저 (PLAT-DB-04)        │
│  - 2계층 듀얼 작업그래프(DAG) 오케스트레이터 (PLAT-DAG-05)              │
│  - 실시간 7-Phase Vibe Runner 샌드박스 (PLAT-VIBE-06)                   │
└──────────────────────────────────────────────────────────────────────────┘
                                   ║
       [격리 보관 경계: /docs/pending_target_service_migration/]
                                   ║
                                   ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ [2영역: 보류/이관대기] 타겟 서비스 비즈니스 엔진 (On-Hold Migration Backlog) │
│  - 타겟 저장소: github.com/jkoogit/pdfowers-service (신설 예정)          │
│  - 보류 모듈: PDF-CORE-01, PDF-OCR-04, PDF-TABLE-05, PDF-FORM-07,       │
│              PDF-CRYPTO-03, PDF-MERGE-06                                │
│  - 이관 절차: 플랫폼 뼈대 안정화 완료 후 타겟 전용 레포로 100% 완전 이전 │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 8.2 2계층 작업그래프 ASCII 다이어그램 (Dual-Graph Log)

```text
================================================================================
[상단 1영역] JKADH AI 개발 플랫폼 핵심 인프라 활성 DAG (ACTIVE PLATFORM DAG)
================================================================================
*   (PLAT-08) [BACKLOG] PLAT-MON-08: 토큰 쿼터 실시간 텔레메트리 & 서킷 브레이커 웹훅
│   ├── 의존: PLAT-ROUTER-02, PLAT-VAULT-03
│   └── 목표: 실시간 AI 비용 모니터링 & Slack 알림 연동 / 담당: 이대원
│
*   (PLAT-07) [BACKLOG] PLAT-CLI-07: 하네스 6대 라이프사이클 통합 CLI & GitHub PR 자동화
│   ├── 의존: PLAT-GOV-01, PLAT-VIBE-06
│   └── 목표: 로컬 터미널 및 CI/CD 환경 거버넌스 자동화 / 담당: 구진규
│
*   (PLAT-06) [DONE] PLAT-VIBE-06: 실시간 7-Phase Vibe Runner 및 AST 자동 검증기
│   ├── 의존: PLAT-DAG-05, PLAT-ROUTER-02
│   └── 완료: 실시간 코드 생성 샌드박스 및 TypeScript AST 정적 무결점 검증 엔진 구축 / 담당: 구진규
│
*   (PLAT-MIG) [DONE: Milestone] PLAT-MIG-00: 타겟 서비스(PDF 뷰어) 분리·보류 및 이관 인벤토리 수립 ⭐️
│   ├── 의존: PLAT-GOV-01, PLAT-DAG-05
│   ├── 시점: 2026-08-19 15:30 (타겟 서비스 분리 결정 및 보류 거버넌스 발효)
│   └── 완료: 6대 PDF 모듈 ON_HOLD 전환 및 /docs/pending_target_service_migration/ 수립
│
*   (PLAT-05) [DONE] PLAT-DAG-05: 2계층 듀얼 작업그래프(DAG) 오케스트레이터 & 시각화
│   ├── 의존: PLAT-GOV-01
│   └── 완료: 상향식 이력 및 파생 백로그 실시간 렌더링 검증 완료
│
*   (PLAT-04) [DONE] PLAT-DB-04: PostgreSQL 단일 DB Savepoint 격리 & 스키마 관리자
│   ├── 의존: PLAT-GOV-01
│   └── 완료: 6대 공통 감사 컬럼 주입, v2.2.0 스키마 동기화 완료
│
*   (PLAT-03) [DONE] PLAT-VAULT-03: AES-256 API Key 볼트 & 팀 RBAC 권한 격리
│   ├── 의존: PLAT-GOV-01
│   └── 완료: SUPER_ADMIN 승격 및 암호화 볼트 보안 감사 완료
│
*   (PLAT-02) [DONE] PLAT-ROUTER-02: 멀티 모델(Claude/Codex/Gemini) 3-Tier Fallback
│   ├── 의존: PLAT-GOV-01
│   └── 완료: 429 RateLimit 시 300ms 내 핫스왑 복구 엔진 완료
│
*   (PLAT-01) [DONE: Foundation Base] PLAT-GOV-01: 6대 하네스 라이프사이클 거버넌스
    └── 완료: #세션시작 -> #태스크시작 -> #태스크처리 -> #태스크정리 -> #태스크승급 -> #세션정리 표준 수립

--------------------------------------------------------------------------------
▲ [분리 격리 경계: 플랫폼 뼈대 완료 후 타겟 서비스 레포지토리로 순차 이관]
--------------------------------------------------------------------------------

================================================================================
[하단 2영역] 타겟 서비스(PDFowers) 분리 이관 대기 보류 목록 (ON-HOLD MIGRATION)
================================================================================
*   (TASK-HOLD-05) [ON_HOLD] PDF-MERGE-06: 무손실 PDF 다중 병합/분할 및 북마크 보존 (v1.9.0)
*   (TASK-HOLD-04) [ON_HOLD] PDF-CRYPTO-03: 개인정보(PII) 마스킹 & AES-256 암호화 (v1.8.0)
*   (TASK-HOLD-03) [ON_HOLD] PDF-FORM-07: 대화형 PDF 폼 자동인식 & PAdES 전자서명 (v1.7.0)
*   (TASK-HOLD-02) [ON_HOLD] PDF-TABLE-05: PDF 비구조화 표(Table) AI 감지 및 Excel 변환
*   (TASK-HOLD-01) [ON_HOLD] PDF-OCR-04: 다국어 고해상도 OCR & 레이아웃 좌표 추출
*   (TASK-HOLD-00) [ON_HOLD] PDF-CORE-01: PDF 토큰 스트림 파서 & 가상 메모리 매퍼
```

---

## 8.3 활성 기본서비스(플랫폼) 작업 명세표 (Active Base Service Tasks)

| 작업 코드 | 작업명 | 모듈 | 선행 의존 노드 | 상태 | 현재 단계 | 담당 / 모델 |
|---|---|---|---|:---:|:---:|---|
| **`PLAT-GOV-01`** | 6대 하네스 라이프사이클 거버넌스 | `GOVERNANCE` | None (Root) | **`DONE`** | Phase 7 완료 | 구진규 / Claude 3.7 |
| **`PLAT-ROUTER-02`**| 멀티 모델 3-Tier Fallback 라우터 | `MODEL_ROUTER` | `PLAT-GOV-01` | **`DONE`** | Phase 7 완료 | 구진규 / Claude ➔ Gemini |
| **`PLAT-VAULT-03`** | AES-256 API Key 볼트 & 팀 RBAC | `SECURITY_VAULT`| `PLAT-GOV-01` | **`DONE`** | Phase 7 완료 | 구진규 / Codex |
| **`PLAT-DB-04`** | PostgreSQL 단일 DB 트랜잭션 격리 | `DB_MIGRATION` | `PLAT-GOV-01` | **`DONE`** | Phase 7 완료 | 구진규 / Gemini Flash |
| **`PLAT-DAG-05`** | 2계층 듀얼 작업그래프 오케스트레이터 | `ORCHESTRATOR` | `PLAT-GOV-01` | **`DONE`** | Phase 7 완료 | 구진규 / Claude 3.7 |
| **`PLAT-MIG-00`** | 타겟 서비스 분리·보류 거버넌스 수립 | `GOVERNANCE` | `PLAT-DAG-05` | **`DONE`** | Phase 7 완료 (2026-08-19) | 구진규 / Claude 3.7 |
| **`PLAT-VIBE-06`** | 실시간 7-Phase Vibe Runner 샌드박스 | `VIBE_RUNNER` | `PLAT-DAG-05` | **`DONE`** | Phase 7 완료 | 구진규 / Claude 3.7 |
| **`PLAT-CLI-07`** | 하네스 6대 라이프사이클 통합 CLI | `GOVERNANCE` | `PLAT-GOV-01` | **`BACKLOG`** | Phase 1 대기 | 구진규 / Codex |
| **`PLAT-MON-08`** | 토큰 쿼터 실시간 텔레메트리 & 웹훅 | `MODEL_ROUTER` | `PLAT-ROUTER-02`| **`BACKLOG`** | Phase 1 대기 | 이대원 / Gemini Flash |

---

## 8.4 타겟 서비스 이관 대기 보류 명세표 (On-Hold Target Tasks)

| 작업 코드 | 작업명 | 기 구현 파일 | 타겟 서비스 이관 대상 경로 | 이관 상태 |
|---|---|---|---|:---:|
| **`PDF-CORE-01`** | PDF 스트림 파서 & 가상 메모리 매퍼 | `src/data/initialData.ts` | `packages/core/src/parser/` | `ON_HOLD_READY` |
| **`PDF-OCR-04`** | 다국어 고해상도 OCR & 좌표 추출 | `src/data/initialData.ts` | `packages/ocr/src/engine/` | `ON_HOLD_READY` |
| **`PDF-TABLE-05`** | 비구조화 표 AI 감지 및 Excel 변환 | `src/services/PdfTableExtractor.ts` | `packages/table/src/extractor/` | `ON_HOLD_READY` |
| **`PDF-FORM-07`** | 대화형 PDF 폼 자동인식 & 서명 | `src/services/PdfFormSignatureEngine.ts` | `packages/form/src/signer/` | `ON_HOLD_READY` |
| **`PDF-CRYPTO-03`**| 개인정보(PII) 마스킹 & AES-256 | `src/services/PdfCryptoRedactionEngine.ts` | `packages/security/src/crypto/` | `ON_HOLD_READY` |
| **`PDF-MERGE-06`** | 무손실 PDF 다중 병합/분할 | `src/services/PdfMergeSplitEngine.ts` | `packages/merge-split/src/engine/` | `ON_HOLD_READY` |

---

## 8.5 jkadh 고도화 작업관리 방안 제안 (Work Management Innovations)

2계층 듀얼 작업그래프 구조와 파생 추적성을 극대화하기 위한 **4대 고도화 방안**:

### 1. 파생 태스크-원천 태스크 간 컨텍스트 자동 상속 (Lineage Context Inheritance)
- **개념**: 파생 태스크(`PDF-TABLE-05`)가 생성될 때, 원천 태스크(`PDF-OCR-04`)의 Phase 4 아키텍처 JSON 스키마 및 Phase 5 테스트 픽스처를 자동으로 상속 복제.
- **효과**: 신규 파생 작업 기획 시 0부터 문서를 작성할 필요 없이 상위 노드의 인터페이스 정합성을 100% 보장.

### 2. 태스크 브랜치-DB 세이브포인트 1:1 바인딩 (Branch-Savepoint Coupling)
- **개념**: Git 브랜치(`feature/pdf-ocr`)가 생성될 때 `jkadhp_dev` DB에 해당 태스크 전용 Transaction Savepoint(`SP_TASK_PDF_OCR_04`)를 자동 발급.
- **효과**: 개발 또는 검증 실패 시 Git 커밋 롤백과 DB 롤백이 원클릭으로 동기화되어 개발 DB 오염 방지.

### 3. DAG 의존성 기반 자동 백로그 잠금 해제 (Event-Driven Promotion)
- **개념**: 하단 이력의 상위 노드(`PDF-OCR-04`)가 `DONE` 상태로 전이되면, 상단 미진행 그래프의 자식 노드(`PDF-TABLE-05`)에 Webhook 이벤트를 발행.
- **효과**: 후속 작업의 상태가 `PLANNED`에서 `DEVELOPING`으로 자동 전환되며 전담 AI 모델에 시나리오 생성 프롬프트 자동 디스패치.

### 4. 작업 단위별 토큰·비용 소모량 실시간 누적 메트릭 (Token Consumption Tracking)
- **개념**: 그래프 각 노드 우측에 실시간 누적 소모 토큰(`Tokens: 45.2k ($0.18)`)을 태깅.
- **효과**: 태스크별 실제 ROI를 정량 측정하고, 예산 초과 위험 시 조기에 저비용 모델(Gemini Flash)로 핫스왑 라우팅.
