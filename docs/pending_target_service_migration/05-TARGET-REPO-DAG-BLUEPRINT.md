# 05. [청사진] 타겟 서비스(PDF 뷰어/에디터) 전용 레포지토리 DAG 구축 설계서

- **문서 식별자**: `DOC-BLUEPRINT-TARGET-DAG-20260819-05`
- **대상 저장소**: `github.com/jkoogit/pdfowers-service` (신설 예정)
- **개요**: AI 개발 플랫폼(`jkadh-typep`) 뼈대 구축 및 안정화 완료 후, 타겟 서비스 레포지토리에 이식될 2계층 작업그래프(DAG) 설계도

---

## 1. 타겟 서비스 전용 작업그래프(DAG) 계층 구조

```
================================================================================
[L1 마일스톤] MS-PDFOWERS-APP : 엔터프라이즈 AI PDF 지능화 뷰어 & 편집 플랫폼
================================================================================
  │
  ├── [Foundation Core]
  │   ├── PDF-CORE-01: 메모리 절약형 바이너리 스트림 파서 & 가상 페이지 매퍼
  │   └── PDF-RENDER-02: Skia/Canvas 기반 300DPI 초고해상도 벡터 렌더러
  │
  ├── [AI Intelligence Engines]
  │   ├── PDF-OCR-04: 다국어 OCR & 바운딩박스 좌표 추출 엔진
  │   └── PDF-TABLE-05: 비구조화 표 AI 감지 및 Excel 구조화 변환기
  │
  ├── [Security & Compliance]
  │   ├── PDF-CRYPTO-03: 금융/의료 PII 자동 마스킹 & AES-256-GCM 암호화
  │   └── PDF-WATERMARK-02: 동적 벡터 워터마크 및 DRM 스탬프 엔진
  │
  └── [Interactive & Document Manipulation]
      ├── PDF-FORM-07: AcroForm 대화형 폼 자동인식 & PAdES 전자서명
      ├── PDF-MERGE-06: 무손실 다중 병합/분할 및 XREF 북마크 보존
      └── PDF-UI-VIEWER-08: 반응형 웹 PDF 인터랙티브 뷰어 컴포넌트
```

---

## 2. 타겟 서비스 저장소 디렉토리 구조 표준안

```text
pdfowers-service/
├── .github/
│   └── workflows/ci.yml
├── packages/
│   ├── core/           # PDF 바이너리 파서 및 기본 스트림
│   ├── renderer/       # 렌더링 및 뷰어 캔버스
│   ├── ocr/            # OCR 엔진
│   ├── table/          # 표 감지 및 추출기
│   ├── security/       # PII 마스킹 및 AES-256 암호화
│   ├── form/           # 폼 자동화 및 전자서명
│   └── merge-split/    # 무손실 병합 및 분할기
├── apps/
│   ├── web-viewer/     # React 기반 사용자 인터랙티브 뷰어 UI
│   └── api-server/     # Node.js PDF 가공 백엔드 API
└── docs/
    └── task_graph/     # 타겟 서비스 전용 DAG 및 하네스 문서
```

---

## 3. 이관 실행 체크리스트 (Migration Readiness Checklist)

- [ ] AI 개발 플랫폼(`jkadh-typep`) 6대 거버넌스 및 인프라 안정화 완료
- [ ] `pdfowers-service` GitHub 신규 레포지토리 생성
- [ ] `/docs/pending_target_service_migration/` 내 5종 인벤토리 소스코드 이관
- [ ] 타겟 레포지토리 전용 3대 시나리오 단위 테스트 실행 및 CI 그린라이트 확인
- [ ] 본 플랫폼 레포지토리에서 비즈니스 잔재 정제 및 플랫폼 모듈에만 집중
