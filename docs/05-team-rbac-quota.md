# 5. 팀 공용 AI 계정 풀 및 RBAC 거버넌스

## 5.1 RBAC 권한 매트릭스 (Role-Based Access Control)

| 역할 (Role) | 대상 인원 예시 | 접근 가능 모델 | 일일 토큰 캡 | 월간 예산 상한 | 권한 범위 |
|---|---|---|---|---|---|
| **ADMIN** | 구진규 (Lead) | 전 모델 (Claude, Codex, Gemini, Manus) | 2,000,000 | $250 | 계정 풀 관리, 쿼터 리셋, 멤버 권한 승격, DB 쿼리 실행 |
| **ARCHITECT** | 시니어 아키텍트 | Claude 3.7, ChatGPT Codex, Gemini 3.7 | 1,500,000 | $200 | 기획, 아키텍처 설계, 게이트키퍼 룰 설정 |
| **ENGINEER** | 김민지, 엔지니어 | ChatGPT Codex, Gemini 3.7 Flash | 1,000,000 | $150 | 코드 작성, 테스트 스위트 실행, 로컬 구현 |
| **REVIEWER** | 박준호, 코드 리뷰어 | Claude 3.7, ChatGPT Codex | 800,000 | $100 | PR 리뷰, AST 정적 분석, 3대 시나리오 검토 |
| **AUDITOR** | 정대원, 보안/컴플라이언스 | Gemini 3.7 Flash | 500,000 | $50 | 토큰 감사 로그 조회, PII 마스킹 정책 준수 확인 |

---

## 5.2 팀 공용 AI 계정 풀 (Shared Account Pooling)

개별 개발자가 개인 API 키를 발급받지 않고, 중앙에서 관리되는 엔터프라이즈 계정 풀을 경유하도록 통제합니다.

1. **Anthropic Workspace (Claude 3.7)**: 월간 $200 Tier-4 한도, 동시 요청 5개 제한.
2. **OpenAI Enterprise (Codex / GPT-4o)**: TPM 2,000,000, 일일 토큰 150만 캡.
3. **Google Cloud Vertex (Gemini 3.7)**: Pay-as-you-go, 분당 1,000 RPM 초고속 풀.
4. **Manus Autonomous Pods**: 2개의 격리된 브라우저/CLI 샌드박스 인스턴스.

---

## 5.3 토큰 쿼터 초과 시 정책
* **경고 (Soft Cap, 80%)**: 개발자 UI 상단에 노란색 경고 배지 노출 및 저비용 모델 전환 권고.
* **차단 (Hard Cap, 100%)**: 고비용 모델 호출이 즉시 인터셉트되며 Gemini 3.7 Flash로 강제 라우팅.
* **해제 프로세스**: 관리자(ADMIN)가 `TeamAccountManagerView`에서 토큰 쿼터 리셋 또는 승인 버튼 클릭.
