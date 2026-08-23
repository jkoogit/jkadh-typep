# 11. 세션 종료 회고 보고서 작성 규격 및 표준 템플릿 (Session Report Standard)

- **문서 식별자**: `DOC-STD-11-SESSION-REPORT`
- **표준 버전**: `v1.0.0`
- **관리 주체**: JKADH 아키텍처 거버넌스 위원회 / SUPER_ADMIN
- **적용 대상**: 모든 AI 개발 세션 종료(Session Teardown) 시 의무 작성

---

## 1. 목적 및 문서 관리 원칙 (Governance Rules)

1. **순번 및 파일명 명명 규칙**:
   - 저장 경로: `/docs/report/`
   - 파일명 형식: `{순번(2자리)}-{YYYY-MM-DD}-{한글보고서제목}.md`
   - 예시: `/docs/report/01-2026-08-16-세션종료-회고-보고서.md`
2. **트래킹 메타데이터 헤더 의무화**:
   - 문서 최상단에 식별자, 세션 ID, 일시, 작성자, 릴리즈 태그, Git 브랜치, 토큰 소비량, 비용, AST 검증 상태, 스펙 드리프트 점수 명시.
3. **작업그래프(DAG) 단위 작업 명시 및 문서 앵커/상호 링크 의무화**:
   - 세션에서 다룬 상위 L1(마일스톤) / L2(단위 태스크) 코드, 명칭, 상태 표기.
   - 보고서 내 각 섹션 및 관련 표준 문서(`/docs/10-auth-security-vault.md`, `/docs/09-harness-architecture-comparison.md` 등)로 이동 가능한 **Markdown 앵커/하이퍼링크** 필수 구성.
4. **차기 세션 인계 브리프 (Handoff Brief) 의무화**:
   - 차기 세션의 1순위 착수 태스크 ID, 착수 단계(Phase 1~7), 추천 분기 브랜치를 명확히 제시.

---

## 2. 표준 보고서 템플릿 (Standard Template)

```markdown
# {순번}. {YYYY-MM-DD} 세션 종료 회고 및 하네스 작업 결산 보고서

- **문서 식별자**: \`DOC-REPORT-{YYYYMMDD}-{순번}\`
- **세션 ID**: \`SES-{YYYYMMDD}-{SESSION_CODE}\`
- **작성 일시**: {YYYY-MM-DD HH:MM:SS} KST
- **작성자**: {이름} ({역할})
- **대상 프로젝트**: {프로젝트명}
- **작업 브랜치**: \`{작업브랜치}\` ➔ \`dev\` / \`stg\` / \`main\`
- **릴리즈 버전**: \`{버전태그}\`
- **세션 상태**: \`SESSION_COMPLETED_SAFE\`

---

## 📑 목차 (Table of Contents)
1. [세션 실행 메타데이터 및 추적 요약](#1-세션-실행-메타데이터-및-추적-요약-session-tracking-metadata)
2. [작업그래프(DAG) 단위 작업 상태 요약](#2-작업그래프dag-단위-작업-상태-요약-task-graph-status)
3. [금일 세션 주요 작업 내용 및 상세 링크](#3-금일-세션-주요-작업-내용-및-상세-링크-accomplishments)
4. [하네스 관점의 자체 평가 및 회고 (KPT)](#4-하네스-관점의-자체-평가-및-회고-harness-retrospective)
5. [다음 작업 계획 및 세션 인계 브리프](#5-다음-작업-계획-및-세션-인계-브리프-next-task-handoff)
6. [개정 및 감사 이력](#6-개정-및-감사-이력-audit-history)

---

## 1. 세션 실행 메타데이터 및 추적 요약 (Session Tracking Metadata)

| 메타데이터 항목 | 세션 집계 값 | 비고 / 검증 상태 |
|---|---|---|
| **소비 토큰 총계** | \`{토큰수} Tokens\` | 일일 Soft Cap ({한도}) 대비 {백분율}% 소비 |
| **누적 개발 비용** | \`${비용} USD\` | 월간 예산 대비 정상 범위 |
| **해결 GitHub Issues** | \`#{이슈번호}\` | {이슈 제목} |
| **원격 저장소 동기화** | \`origin/main\`, \`origin/dev\`, \`origin/stg\` | 커밋 \`{커밋해시}\` 동기화 100% |
| **TypeScript AST 검증** | \`npm run build\` (Exit 0) | 에러 0건, 경고 0건, 컴파일 무결점 |
| **스펙 드리프트 점수** | \`0.0% (Zero-Drift)\` | 문서(/docs) ↔ DDL ↔ 소스코드 100% 일치 |
| **DB Savepoint 상태** | \`{세이브포인트명}\` | 트랜잭션 정상 보관 및 풀 Safe Drainage |

---

## 2. 작업그래프(DAG) 단위 작업 상태 요약 (Task Graph Status)

| 계층 | 작업 코드 (Task ID) | 단위 작업명 | 담당 모델 | Phase | 진행 상태 |
|---|---|---|---|---|:---:|
| **L1 (Milestone)** | \`{L1_CODE}\` | {L1 명칭} | \`{MODEL}\` | - | \`COMPLETED\` |
| **L2 (Unit Task)** | \`{L2_CODE}\` | {L2 명칭} | \`{MODEL}\` | Phase {N} | \`{STATUS}\` |

---

## 3. 금일 세션 주요 작업 내용 및 상세 링크 (Accomplishments)

### ① {작업 주제 1}
- 내용 기술...
- **관련 문서 링크**: [{문서명}](../{상대경로})

---

## 4. 하네스 관점의 자체 평가 및 회고 (Harness Retrospective)

\`\`\`text
[Keep - 잘 유지된 점]
1. ...
[Problem - 발생했던 병목 및 위험]
1. ...
[Try - 다음 세션을 위한 실무 개선안]
1. ...
\`\`\`

---

## 5. 다음 작업 계획 및 세션 인계 브리프 (Next Task Handoff)

### 📌 차기 세션 1순위 착수 작업: \`[{TASK_ID}]\` {태스크명}
1. **작업 대상**: ...
2. **착수 단계**: **Phase {N} ➔ Phase {N+1}**
3. **추천 진입 브랜치**: \`feat/{브랜치명}\`

---

## 6. 개정 및 감사 이력 (Audit History)

| 버전 | 일시 | 작성자/감사자 | 승인 상태 | 비고 |
|---|---|---|---|---|
| **v1.0.0** | {YYYY-MM-DD HH:MM} | {작성자} | \`APPROVED\` | 세션 종료 정례 회고 보고서 제정 |
```
