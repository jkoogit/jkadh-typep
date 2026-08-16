# jkadh 아키텍처 및 Vibe Coding 거버넌스 문서 센터

본 디렉토리(`/docs`)는 **PDFowers** 프로젝트와 **jkadh (Jin-Kyu Architecture & Development Harness)** 프레임워크의 엔터프라이즈 아키텍처 표준, 7단계 엔드투엔드 라이프사이클, 작업그래프(DAG), 하네스 진화 비교, 다중 AI 모델 거버넌스 및 단일 개발 데이터베이스(`jkadhp_dev`) 운영 가이드라인을 현행화하여 관리하는 공식 문서 저장소입니다.

---

## 📚 문서 목차 (Documentation Index)

| 번호 | 문서 파일 | 주제 및 핵심 내용 | 최종 현행화일 |
|---|---|---|---|
| **01** | [`01-architecture-overview.md`](./01-architecture-overview.md) | **jkadh 아키텍처 개요 및 프로젝트 비전**<br/>- AI Vibe Coding 한계 극복 및 엔터프라이즈 무결성<br/>- PDFowers 타깃 도메인 및 4대 아키텍처 원칙 | 2026-08-15 |
| **02** | [`02-7phase-lifecycle.md`](./02-7phase-lifecycle.md) | **7단계 엔드투엔드 딜리버리 라이프사이클**<br/>- Phase 1 (검토)부터 Phase 7 (문서화 및 그래프 현행화)까지의 전 공정<br/>- 단계별 Gatekeeper 자동 검증 규칙 및 전담 AI 모델 배정 | 2026-08-15 |
| **03** | [`03-refactoring-standards.md`](./03-refactoring-standards.md) | **리팩토링 표준 가이드라인 & 코드 품질 기준**<br/>- 4대 핵심 리팩토링 원칙(기능 불변, DRY, 엄격한 타입, 도메인 명명)<br/>- 코드 스멜 카탈로그, AST 복잡도 개선 및 AI 프롬프트 지침 | 2026-08-15 |
| **04** | [`04-ai-model-governance.md`](./04-ai-model-governance.md) | **AI 모델 메타정보 매트릭스 & 핫스왑 Fallback 라우팅**<br/>- Claude 3.7, Codex, Gemini 3.7, Manus 특화 공정<br/>- 429 Quota/타임아웃 감지 시 3-Tier Circuit Breaker 라우팅 | 2026-08-15 |
| **05** | [`05-team-rbac-quota.md`](./05-team-rbac-quota.md) | **팀 공용 AI 계정 풀링 & RBAC 권한/토큰 한도 제어 정책**<br/>- ADMIN, ARCHITECT, ENGINEER, REVIEWER, AUDITOR 권한<br/>- 팀원별 일일/월간 토큰 예산 캡 및 모델 화이트리스트 | 2026-08-15 |
| **06** | [`06-database-architecture.md`](./06-database-architecture.md) | **`jkadhp_dev` PostgreSQL 단일 개발 데이터베이스 아키텍처**<br/>- stg/prd 없는 단일 DB 환경 트랜잭션/세이브포인트 격리<br/>- DDL 스키마, Task 상태 저장 및 마이그레이션 관리 | 2026-08-15 |
| **07** | [`07-operational-runbook.md`](./07-operational-runbook.md) | **운영 런북 & 장애 시나리오 복구 가이드 (Runbook)**<br/>- 429 Quota 고갈, 503 Provider 다운 대응 절차<br/>- Spec Drift 감지 및 회귀(Regression) 발생 시 롤백 프로세스 | 2026-08-15 |
| **08** | [`08-task-graph-management.md`](./08-task-graph-management.md) | **작업그래프(Task Graph DAG) 관리 및 프로젝트 진행 체계**<br/>- 작업 착수 검토부터 WBS 분할, 상태 머신 전이<br/>- PDF-OCR-04 등 실전 프로젝트 이력 및 Phase 7 DB 실시간 동기화 | 2026-08-15 |
| **09** | [`09-harness-architecture-comparison.md`](./09-harness-architecture-comparison.md) | **개발 하네스 점검 및 기존 jkadh 대비 비교 분석**<br/>- 세션시작, 태스크시작/처리/정리/승급, 세션종료, 루프 7대 영역 분석<br/>- 기존 Classic jkadh 대비 유지, 개선, 신규 현행화 내역 심층 매트릭스 | 2026-08-15 |

---

## 🛠️ 활용 가이드
* **개발자 / 에이전트**: 새 기능 구현 전 `02-7phase-lifecycle.md`, `08-task-graph-management.md`, `09-harness-architecture-comparison.md`를 필독하여 Gatekeeper 규칙과 하네스 절차를 준수합니다.
* **아키텍트 / 리드**: 모델 추가 및 RBAC 조정 시 `04-ai-model-governance.md`와 `05-team-rbac-quota.md`를 업데이트합니다.
* **DBA / 운영자**: 마이그레이션 및 장애 대응 시 `06-database-architecture.md`와 `07-operational-runbook.md`를 참조합니다.
