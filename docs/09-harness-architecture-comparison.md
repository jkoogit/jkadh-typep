# 9. 개발 하네스 점검 및 루프 상태머신 거버넌스 (Harness Architecture & Evolution)

- **문서 번호**: `DOC-09-HARNESS-GOVERNANCE`
- **개정 일시**: 2026-08-16 01:35:00 KST
- **개정 버전**: v1.2.0

---

## 9.1 개요
본 문서는 기존 **Classic jkadh 프레임워크**의 하네스 아키텍처를 면밀히 분석하고, 이번 **JKADH AI DevPlatform (PDFowers)** 프로젝트에서 계승(Maintained), 개선(Improved), 신규 현행화(Modernized)한 하네스 제어 메커니즘을 7대 생애주기 영역 및 **7종 세부 루프 상태머신(Loop State Machine)**별로 규정합니다.

---

## 9.2 7대 핵심 하네스 라이프사이클 비교 매트릭스

| 하네스 영역 (Harness Stage) | 기존 Classic jkadh 방식 | 현행 JKADH AI DevPlatform (PDFowers) 개선점 | 진화 분류 |
|---|---|---|---|
| **1. 세션시작 (Session Start)** | 로컬 환경 변수(`.env`) 로드 및 단일 API 키 인증 | **멀티 Provider 계정 풀링, RBAC 기반 팀원 토큰 쿼터(Soft/Hard Cap) 및 모델 헬스체크 자동 초기화** | **대폭 개선 (Enhanced)** |
| **2. 태스크시작 (Task Start)** | 로컬 파일시스템의 JSON 태스크 정의서 단순 로드 | **작업그래프(Task DAG) 선행 의존성 해제 검증, 3대 시나리오(Happy/Error/Edge) 템플릿 강제 주입** | **체계화 (Standardized)** |
| **3. 태스크처리 (Task Process)** | 단일 LLM에 거대 프롬프트 일괄 전달 후 코드 수신 | **7단계 분할 공정, 모델별 전담 배정(Claude 기획/설계, Codex 코드, Gemini 검증), 3-Tier Circuit Breaker (<150ms 핫스왑)** | **핵심 고도화 (Core Innovation)** |
| **4. 태스크정리 (Task Cleanup)** | 런타임 종료 후 임시 디렉토리 단순 삭제 | **`jkadhp_dev` 단일 DB Savepoint 롤백, AST 정적 검증(`tsc --noEmit`), 메모리/토큰 소비 감사 로그 영속화** | **격리 강화 (Hardened)** |
| **5. 태스크승급 (Task Advance)** | 개발자의 수동 승인 또는 단순 exit code 0 확인 | **Phase별 Gatekeeper 자동 검증 룰(JSON Schema Draft-07, 스펙 드리프트 0% 점수) 통과 시에만 자동 승급** | **무결성 강제 (Zero-Drift)** |
| **6. 세션종료 (Session Terminate)** | CLI 프로세스 단순 종료 | **일일/월간 토큰 소비 집계, 잔여 예산 갱신, 후속 백로그 티켓 자동 발굴 및 PostgreSQL 상태 동기화** | **거버넌스 통합 (Governance)** |
| **7. 루프제어 (Loop & Resilience)** | 고정 횟수 단순 재시도 (Linear Retry Loop) | **7대 세부 루프 상태머신(`LOOP_ANALYZE` ➔ `LOOP_EXECUTE` ➔ `LOOP_REFINE` ➔ `LOOP_ABORT` ➔ `LOOP_APPROVE` ➔ `LOOP_DISCARD` ➔ `LOOP_RESTORE` ➔ `LOOP_ROLLBACK`)** | **지능화 (Self-Healing)** |

---

## 9.3 7종 세부 루프 제어 액션 상태 머신 (Loop State Machine)

```text
       ┌────────────────────────────────────────────────────────┐
       │                [1] LOOP_ANALYZE (루프분석)              │
       │        - AST 파싱, 에러 원인 분석, 최적 모델 선정        │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                [2] LOOP_EXECUTE (루프실행)             │
       │       - 선정 모델 코드 생성 및 샌드박스 컴파일 검증     │
       └──────────────┬──────────────────────────┬──────────────┘
                      │ (오류 발생)               │ (정상 완료)
                      ▼                          ▼
┌───────────────────────────────┐      ┌───────────────────────────────┐
│     [3] LOOP_REFINE (루프보완) │      │    [5] LOOP_APPROVE (루프승인) │
│ - Fallback 모델 에러 피드백   │      │ - Gatekeeper 단위 조건 확정   │
│ - 최대 2회 자가 치유(Heal)    │      │ - 스냅샷 저장 및 다음 단계 전진│
└──────────────┬────────────────┘      └───────────────────────────────┘
               │ (3회 연속 실패/Quota 고갈)
               ▼
┌───────────────────────────────┐      ┌───────────────────────────────┐
│     [4] LOOP_ABORT (루프중단)  │ ───► │    [7] LOOP_ROLLBACK (루프롤백)│
│ - 서킷 브레이커 즉시 가동      │      │ - DB Savepoint 복구           │
│ - 비정상 프로세스 즉각 격리   │      │ - 태스크 착수 시점으로 원복   │
└───────────────────────────────┘      └───────────────────────────────┘
```

---

## 9.4 개정 이력 (Revision History)

| 버전 | 개정 일시 | 개정자 | 개정 사유 및 상세 내용 |
|---|---|---|---|
| **v1.2.0** | 2026-08-16 01:35 | 구진규 (SUPER_ADMIN) | 7종 세부 루프 상태머신(분석/실행/보완/중단/승인/삭제/복원/롤백) 및 DB Savepoint 롤백 메커니즘 현행화 |
| **v1.1.0** | 2026-08-15 23:25 | 김민지 (ENGINEER) | 7대 라이프사이클 비교 매트릭스 및 게이트키퍼 룰 초안 수립 |
