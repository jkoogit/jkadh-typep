# [Issue #9] 무손실 PDF 다중 병합/분할 및 아웃라인/북마크(XREF) 보존 엔진 구축

- **이슈 번호**: #9
- **관련 태스크 ID**: `PDF-MERGE-06`, `MS-PDF-CORE-ENGINE`
- **담당자**: 박준호 (mem-junho / ENGINEER) & 구진규 (SUPER_ADMIN)
- **작업 브랜치**: `task/pdf-merge-split-06`
- **대상 브랜치**: `dev`
- **원격 저장소 이슈**: GitHub Issue #9 (등록 완료: https://github.com/jkoogit/jkadh-typep/issues/9)
- **등록 일시**: 2026-08-18 11:22:00 PDT (2026-08-19 03:22:00 KST)
- **상태**: IN_PROGRESS

---

## 1. 이슈 개요 및 배경 (Background & Requirements)
- 대용량 PDF 문서(수십~수백 페이지, 복수 파일)를 병합하거나 특정 페이지/구간을 분할할 때, 기존 단순 스트림 결합 방식에서는 PDF 내부 객체 참조 ID 충돌, 상호 참조 테이블(XREF: Cross-Reference Table) 파손, 문서 구조 아웃라인(Outlines/Bookmarks) 인덱스 유실 문제가 빈번하게 발생함.
- ISO 32000-1 (PDF 1.7) 및 ISO 32000-2 (PDF 2.0) 표준 규격을 완벽히 준수하여:
  1. 복수 PDF 파일의 비동기 무손실 병합(Merge) 및 객체 ID(Obj ID / Gen ID) 동적 리매핑
  2. 세부 페이지 범위(Page Range: e.g. "1-3, 5, 8-12") 및 개별 페이지 단위 분할(Split)
  3. 계층형 아웃라인/북마크(Outlines/Bookmarks Tree) 계층 구조 및 상대 페이지 오프셋 무손실 재구축
  4. 증분 저장(Incremental Updates) 및 선형화(Linearization/Fast Web View) 헤더 대응 및 XREF/Trailer 스트림 재작성
- 3대 시나리오(Happy Path, Error Recovery, Edge Bounds) 및 3계층 Proactive Multi-Model Fallback 체인을 완벽히 지원하는 코어 엔진을 구축함.

---

## 2. 3대 시나리오 기획 및 인터페이스 계약 (Scenarios & Contract)

### 3대 시나리오:
1. **필수 정상 시나리오 (Happy Path)**:
   - 복수의 표준 PDF 바이너리 버퍼(`Buffer[]` 또는 `Uint8Array[]`)와 메타데이터 수신 시, 각 파일의 객체 카탈로그(Catalog), 페이지 트리(Pages Tree), 아웃라인(Outlines) 노드를 파싱.
   - 각 소스 문서의 객체 번호를 전역 고유 번호로 오프셋 변환(Re-indexing)하고, 상호 참조 테이블(XREF)과 Trailer 딕셔너리를 무손실 재구축하여 단일 병합 PDF 버퍼 생성.
   - 원본 문서들에 포함된 북마크 트리가 병합 문서의 대상 페이지 번호에 맞게 정확히 리매핑되어 보존됨.
   - 지정된 페이지 범위(`"1-2, 4"`) 분할 시 대상 페이지만 추출하고 고아 객체(Orphaned Objects)를 제거하여 가벼운 독립형 PDF 버퍼 생성.

2. **오류 복구 시나리오 (Error Recovery)**:
   - 손상된 PDF 헤더(`%PDF-` 매직 바이트 부재), 파손된 XREF 오프셋 또는 지원하지 않는 암호화 문서 입력 시 `PDF_MERGE_CORRUPT_OR_ENCRYPTED(5002)` 예외를 즉시 반환하고 격리.
   - 페이지 범위를 초과하는 인덱스 요청(예: 총 5페이지 문서에 "1-10" 요청) 시 자동 클램핑(Clamping) 및 경고 반환.
   - 대용량 처리 중 일시적 메모리 압박 또는 AI 레이아웃 파서 오류 발생 시 3계층 Proactive Fallback (`Claude 3.7` ➔ `Codex` ➔ `Gemini 3.7 Flash`) 라우팅 가동.

3. **예외 경계 시나리오 (Edge Bounds)**:
   - 단일 페이지 문서, 빈 북마크 트리를 가진 문서, 0바이트 빈 버퍼 입력 시 크래시 없이 안전하게 예외/경계 처리.
   - 100개 이상의 다중 파일 또는 총 1,000페이지 이상의 초대형 문서 병합 시 청킹(Chunking) 기반 스트리밍 병합으로 메모리 안정성 유지.
   - 중첩된 5단계 이상의 딥 북마크 트리(Deep Nested Bookmark Tree)의 재귀적 페이지 인덱스 재계산 무결성 보장.

### TypeScript 인터페이스 계약 (`src/types/pdfMergeSplit.ts`):
- `PdfDocumentInput`: `{ id: string; name: string; buffer: Uint8Array | Buffer; sizeBytes: number; pageCount?: number; bookmarksCount?: number; }`
- `PdfBookmarkNode`: `{ id: string; title: string; targetPageIndex: number; children?: PdfBookmarkNode[]; isExpanded?: boolean; color?: string; }`
- `PdfMergeOptions`: `{ preserveBookmarks: boolean; generateBookmarkPerDocument: boolean; customDocumentTitles?: string[]; linearizeFastWebView?: boolean; compressionLevel?: 'NONE' | 'FAST' | 'HIGH'; }`
- `PdfSplitRange`: `{ rangeId: string; startPage: number; endPage: number; outputName?: string; }`
- `PdfSplitOptions`: `{ splitMode: 'BY_PAGE_RANGES' | 'EXTRACT_EVERY_N_PAGES' | 'BURST_EACH_PAGE'; ranges?: PdfSplitRange[]; preserveBookmarks: boolean; }`
- `PdfMergeResult`: `{ taskId: string; success: boolean; outputBuffer: Uint8Array; totalPages: number; mergedDocumentsCount: number; bookmarksTree: PdfBookmarkNode[]; processingTimeMs: number; memoryPeakMb: number; xrefEntriesCount: number; }`
- `PdfSplitResult`: `{ taskId: string; success: boolean; splitOutputs: Array<{ name: string; pageRange: string; pageCount: number; outputBuffer: Uint8Array; bookmarksCount: number }>; totalCreatedFiles: number; processingTimeMs: number; }`

---

## 3. 세부 작업 항목 (WBS)
- [x] **작업 브랜치 생성**: `task/pdf-merge-split-06`
- [x] **로컬 이슈 문서 및 원격 GitHub Issue #9 등록**
- [ ] **인터페이스 & 타입 정의 (`src/types/pdfMergeSplit.ts`)**: 병합/분할, 북마크, XREF 및 옵션 스키마 확정
- [ ] **코어 엔진 구현 (`src/services/PdfMergeSplitEngine.ts`)**:
  - PDF 바이너리 토크나이저 및 객체/카탈로그/XREF 파서
  - 무손실 다중 PDF 객체 리매핑 및 병합(Merge) 엔진
  - 범위/개별 페이지 추출 및 분할(Split) 엔진
  - 계층형 아웃라인/북마크 트리 인덱스 재구축 및 오프셋 보정기
  - 3계층 Proactive Fallback 연동 및 청킹 메모리 관리자
- [ ] **3대 시나리오 단위 테스트 작성 (`src/services/PdfMergeSplitEngine.test.ts`)**:
  - Happy Path (다중 PDF 무손실 병합, 북마크 보존, 범위 분할 라운드트립)
  - Error Recovery (손상된 헤더/초과 범위 방어 및 Fallback 스왑)
  - Edge Bounds (0바이트 버퍼, 단일 페이지, 깊은 중첩 북마크 트리, 대량 청킹)
- [ ] **1턴 자체 보완 리팩토링 & 린트 통과 (`tsc --noEmit`)**
- [ ] **PostgreSQL `jkadhp_dev` DB 상태 동기화 및 6대 거버넌스 승급**

---

## 4. 완료 조건 (Definition of Done)
1. TypeScript strict 타입 검증 0 Error (`tsc --noEmit`)
2. 3대 시나리오(정상/오류/경계) 테스트 100% Pass
3. `npm run build` 번들 빌드 성공
4. Phase 7 Gatekeeper 스펙 드리프트 0.0% 검증 완료
