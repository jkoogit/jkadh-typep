# jkadh AI DevPlatform - Architecture & Standards Documentation

본 저장소의 `/docs` 디렉토리는 jkadh 엔터프라이즈 AI 소프트웨어 개발 플랫폼의 공식 표준 문서 집합입니다.

---

## 📚 표준 문서 목록 (Standard Documents)

| 번호 | 문서 파일명 | 문서 제목 | 핵심 내용 | 개정 버전 |
|---|---|---|---|---|
| **00** | `00-terminology-glossary.md` | 서비스 체계 용어 정의 & 커뮤니케이션 | 기본서비스(인프라/플랫폼) vs 대상서비스(PDF) 용어 및 모호성 해결 원칙 | v1.0.0 |
| **01** | `01-architecture-overview.md` | 아키텍처 총괄 개요 | 3계층 아키텍처, 실시간 오케스트레이션, 무중단 서킷 브레이커 | v1.1.0 |
| **02** | `02-7phase-lifecycle.md` | 7단계 딜리버리 라이프사이클 | Phase 1~7 공정 정의 및 Gatekeeper 0% 스펙 드리프트 검증 규칙 | v1.1.0 |
| **03** | `03-refactoring-standards.md` | 리팩토링 및 클린 코드 표준 | 단일 책임 원칙, AST 정적 검증, 안티패턴 방지 | v1.1.0 |
| **04** | `04-ai-model-governance.md` | 멀티 모델 거버넌스 및 장애 복구 | Claude/Codex/Gemini 역할 배정, 429 핫스왑 Fallback 체인 | v1.1.0 |
| **05** | `05-team-rbac-quota.md` | 팀 권한(RBAC) 및 쿼터 관리 | 역할별 일일 토큰 캡, 승인 프로세스, 예산 통제 | v1.1.0 |
| **06** | `06-database-architecture.md` | `jkadhp_dev` DB 아키텍처 | PostgreSQL 스키마, 6대 공통 감사 컬럼, Savepoint 트랜잭션 | v1.1.0 |
| **07** | `07-operational-runbook.md` | 운영 런북 및 장애 대응 | 429 Rate Limit 탈출, 스펙 드리프트 자가치유, 장애 복구 | v1.1.0 |
| **08** | `08-task-graph-management.md` | 2계층 듀얼 작업그래프 관리 | 상단 미진행 백로그 + 하단 상향 누적 DAG 타임라인 관리 | v1.1.0 |
| **09** | `09-harness-architecture-comparison.md`| 하네스 7대 영역 & 루프 상태머신 | 세션/태스크 시작-처리-정리-승급-종료 및 7종 루프 제어 | v1.2.0 |
| **10** | `10-auth-security-vault.md` | 회원 RBAC 및 AES-256 Vault | SUPER_ADMIN 승격, API Key 암호화 볼트, 루프 트랜잭션 DDL | v1.0.0 |
| **11** | `11-session-report-standard.md` | 세션 회고 보고서 작성 규격 | 보고서 명명 규칙, DAG 단위 작업, 메타 헤더 및 표준 템플릿 | v1.0.0 |
| **12** | `12-task-lifecycle-governance-process.md` | JKADH 6대 하네스 라이프사이클 거버넌스 | #세션시작(한글세션명), #태스크시작(task/*브랜치/이슈발행), #태스크처리, #태스크정리(PR), #태스크승급, #세션정리 | v1.1.0 |
| **13** | `13-code-quality-and-lint-standards.md` | 코드 품질 및 린트 거버넌스 기준서 | TypeScript 컴파일러 린트, 7-Phase AST 4대 필터 및 6대 감사 컬럼 표준 | v1.0.0 |
| **14** | `14-harness-test-cases-catalog.md` | 하네스 라이프사이클 테스트케이스 목록 | 3대 시나리오(정상/예외/오류) 8대 메타데이터 테스트케이스 카탈로그 | v1.0.0 |
| **15** | `15-table-governance-and-json-audit-trail-standards.md` | 테이블 관리 및 JSON 이력 거버넌스 표준 | 3-Tier 대상 분류, 표준 JSONB 감사 이력 스키마, 생애주기 및 6대 감사 컬럼 | v1.1.0 |
| **16** | `16-design-patterns-and-technical-architecture-catalog.md` | 디자인 패턴 및 기술 아키텍처 구현 카탈로그 | Strategy, Factory, Circuit Breaker 등 비즈니스 로직 패턴화 및 적용기능 라이프사이클 | v1.0.0 |

---

## 📑 이슈 및 풀 리퀘스트 거버넌스 (`/docs/issues`, `/docs/pull_requests`)

| 번호/식별자 | 이슈 파일명 | PR 파일명 | 작업 브랜치 / 연결 태스크 및 승급 상태 |
|---|---|---|---|
| **#1** | `01-task-graph-dual-dag.md` | `01-task-graph-dual-dag.md` | `task/task-graph-dual-dag` (`PDF-OCR-04`) - `MERGED` |
| **#2** | `02-granular-schema-migration.md` | `03-granular-schema-migration.md` | `task/db-granular-schema-migration` (`v1.6.0`) - `MERGED` |
| **#3** | `03-pdf-form-signature-07.md` | `04-pdf-form-signature-07.md` | `task/pdf-form-signature-07` (`PDF-FORM-07`, `v1.7.0`) - `MERGED` |
| **#6** | `06-vibe-runner-sandbox.md` | `07-vibe-runner-sandbox.md` | `task/vibe-runner-sandbox` (`PLAT-VIBE-06`, `v2.0.0`) - `MERGED` |
| **#7** | `07-harness-lifecycle-cli.md` | `08-harness-lifecycle-cli.md` | `task/harness-lifecycle-cli` (`PLAT-CLI-07`, `v2.1.0`) - `MERGED` (Resolves #14) |
| **#8** | `08-telemetry-circuit-breaker.md` | - (작성예정) | `task/token-quota-telemetry` (`PLAT-MON-08`, `v2.2.0`) - `IN_PROGRESS` (Issue #14) |



---

## 📦 타겟 서비스(PDF 뷰어) 분리 이관 대기 보류 문서 (`/docs/pending_target_service_migration`)

| 번호 | 문서 파일명 | 문서 제목 | 핵심 내용 | 이관 대상 레포 |
|---|---|---|---|---|
| **00** | `00-TARGET-SERVICE-MIGRATION-POLICY.md` | 타겟 서비스 분리 이관 정책 및 거버넌스 원칙 | 플랫폼 레포(`jkadh-typep`) vs 타겟 서비스 레포 분리 기준 및 이관 절차 | `pdfowers-service` |
| **01** | `01-PDF-CORE-OCR-TABLE-INVENTORY.md` | PDF 코어 스트림, OCR & 표 추출 엔진 인벤토리 | `PDF-CORE-01`, `PDF-OCR-04`, `PDF-TABLE-05` 구현 자산 및 이관 계획 | `pdfowers-service` |
| **02** | `02-PDF-FORM-SIGNATURE-INVENTORY.md` | PDF 폼 및 전자서명(PAdES) 엔진 인벤토리 | `PDF-FORM-07` AcroForm 및 PAdES 전자서명 구현 자산 및 이관 계획 | `pdfowers-service` |
| **03** | `03-PDF-CRYPTO-PII-INVENTORY.md` | PII 마스킹 & AES-256 암호화 엔진 인벤토리 | `PDF-CRYPTO-03` PII 비식별화 및 AES-256-GCM 암호화 구현 자산 | `pdfowers-service` |
| **04** | `04-PDF-MERGE-SPLIT-INVENTORY.md` | 무손실 PDF 다중 병합/분할 엔진 인벤토리 | `PDF-MERGE-06` 무손실 병합/분할 및 XREF 북마크 보존 구현 자산 | `pdfowers-service` |
| **05** | `05-TARGET-REPO-DAG-BLUEPRINT.md` | 타겟 서비스 전용 레포 DAG 구축 설계서 | 타겟 서비스 저장소 전용 L1/L2 DAG 구조 및 마일스톤 설계 | `pdfowers-service` |

---

## 📑 정례 회고 및 결산 리포트 (`/docs/report`)

| 일자/순번 | 리포트 파일명 | 세션 ID | 작업 내용 및 주요 결산 |
|---|---|---|---|
| **01 (08-16)** | `01-2026-08-16-세션종료-회고-보고서.md` | `SES-20260816-AUTH-VAULT-02` | RBAC, AES-256 Vault, 7종 루프 상태머신 완료 및 [PDF-OCR-04] 인계 브리프 |
| **02 (08-17)** | `02-2026-08-17-세션종료-회고-보고서.md` | `SES-20260817-GATE-PROMOTION-01` | 7단계 Gatekeeper 통과 및 [PDF-OCR-04] 승급 완료 |
| **03 (08-18)** | `03-2026-08-18-세션종료-회고-보고서.md` | `SES-20260818-PDF-TABLE-05` | 듀얼 DAG 관리 체계, 스키마 마이그레이션 고도화 및 세션 정례 결산 |
| **04 (08-18)** | `04-2026-08-18-세션종료-회고-보고서.md` | `SES-20260818-PDF-FORM-07` | 6대 거버넌스 수립, [PDF-FORM-07] AcroForm/PAdES 전자서명 엔진 완료 (`v1.7.0`) |

---

## 🔒 문서 거버넌스 원칙 (Documentation Governance)
1. **이중 동기화 원칙 (Dual-Sync Guard)**: 로컬 Markdown 문서 수정 시 PostgreSQL DB `task_nodes` 및 `agent_session_logs`에 100% 동시 반영.
2. **개정 이력 의무화**: 모든 문서는 최하단에 [개정 이력 (Revision History)] 표를 필수로 유지.
3. **스펙 무결성**: Phase 7 Gatekeeper 통과 시 문서와 소스코드 간의 스펙 일치율 100점 만점 검증.
