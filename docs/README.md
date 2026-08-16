# jkadh AI DevPlatform - Architecture & Standards Documentation

본 저장소의 `/docs` 디렉토리는 jkadh 엔터프라이즈 AI 소프트웨어 개발 플랫폼의 공식 표준 문서 집합입니다.

---

## 📚 표준 문서 목록 (Standard Documents)

| 번호 | 문서 파일명 | 문서 제목 | 핵심 내용 | 개정 버전 |
|---|---|---|---|---|
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

---

## 📑 정례 회고 및 결산 리포트 (`/docs/report`)

| 일자/순번 | 리포트 파일명 | 세션 ID | 작업 내용 및 주요 결산 |
|---|---|---|---|
| **01 (08-16)** | `01-2026-08-16-세션종료-회고-보고서.md` | `SES-20260816-AUTH-VAULT-02` | RBAC, AES-256 Vault, 7종 루프 상태머신 완료 및 [PDF-OCR-04] 인계 브리프 |

---

## 🔒 문서 거버넌스 원칙 (Documentation Governance)
1. **이중 동기화 원칙 (Dual-Sync Guard)**: 로컬 Markdown 문서 수정 시 PostgreSQL DB `task_nodes` 및 `agent_session_logs`에 100% 동시 반영.
2. **개정 이력 의무화**: 모든 문서는 최하단에 [개정 이력 (Revision History)] 표를 필수로 유지.
3. **스펙 무결성**: Phase 7 Gatekeeper 통과 시 문서와 소스코드 간의 스펙 일치율 100점 만점 검증.
