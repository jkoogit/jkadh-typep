# [PR #16] AI 모델별 토큰 쿼터 텔레메트리, Strategy/Circuit Breaker 구현 및 디자인 패턴 카탈로그 제정

- **PR 번호**: #16
- **관련 이슈**: Resolves #16 (`/docs/issues/08-telemetry-circuit-breaker.md`)
- **작업 브랜치**: `task/token-quota-telemetry`
- **타겟 브랜치**: `dev`
- **담당자**: 조정국 (mem-jkoo / SUPER_ADMIN)
- **작업 코드**: `PLAT-MON-08` (`WRK-MON-QUOTA-01`)
- **검증 결과**: 7개 테스트케이스 100% 통과 (Happy Path 3건, Error Recovery 2건, Edge Bounds 2건), TypeScript 컴파일 린트 0 오류

---

## 1. 개요 및 변경 목적 (Summary)

AI 공급자(Google, OpenAI, Anthropic, DeepSeek, Manus)마다 판이하게 다른 토큰 쿼터 및 Rate Limit 정책을 일관되게 관제하기 위해 **전략 패턴(Strategy Pattern)**과 **팩토리/레지스트리(Factory Pattern)**를 도입하였습니다.

또한, 429 Rate Limit 및 공급자 장애 발생 시 시스템 전체의 연쇄 지연을 차단하는 **서킷 브레이커(State & Circuit Breaker Pattern)**와 실시간 웹훅 알림을 구축하였으며, 비즈니스 로직에 적용된 패턴과 설계 의도, 장단점을 영구 관리하기 위해 **`DOC-STD-16` (디자인 패턴 및 기술 아키텍처 구현 카탈로그)**을 제정하였습니다.

---

## 2. 주요 변경 내역 (Key Changes)

### 2.1 전략 패턴 기반 토큰 쿼터 검증 엔진 (`src/services/quotaCheckers/*`)
- **`ITokenQuotaChecker`**: 공급자별 쿼터 조회 알고리즘을 캡슐화하는 표준 인터페이스 제정.
- **Type-A (정량 Usage API 지원 모델)**:
  - `GoogleGeminiQuotaChecker`: 일일 24시간 고정 윈도우(익일 00:00 UTC / 09:00 KST 리셋) 및 정확한 잔여 토큰 계산.
  - `OpenAiQuotaChecker`: 60초 롤링 윈도우 TPM/RPM 및 크레딧 소진율 산출.
- **Type-B (정량 API 미지원 / 헤더·프로브 모델)**:
  - `AnthropicQuotaChecker`: 응답 헤더(`anthropic-ratelimit-*`) 및 120초 쿨다운 연산.
  - `DeepSeekQuotaChecker`: 경량 0-Token 프로브 핑 및 수동 충전 정책 매핑.
  - `LocalManusQuotaChecker`: 로컬 인스턴스 샌드박스 핑 검증.
- **`TokenQuotaCheckerFactory`**: 공급자/모델 식별자 기반 Strategy 싱글톤 인스턴스 안전 생성 및 Flyweight 재사용.

### 2.2 서킷 브레이커 & 웹훅 디스패처 (`src/services/circuitBreakerService.ts`)
- `CLOSED` ➔ `OPEN` ➔ `HALF_OPEN` 3단계 상태머신 구현.
- 429 Rate Limit 또는 연속 실패 3회 도달 시 장애 공급자를 즉시 격리하고 차순위 Fallback 모델로 자동 우회.
- 쿨다운 경과 시 `HALF_OPEN` 시험 핑을 통한 Self-Healing 복구 및 Slack/Discord 웹훅 알림 발송.

### 2.3 4대 온디맨드 화면 이벤트 가드레일 (불필요 통신 0% 방어)
- 백그라운드 타이머 통신을 100% 배제하고 오직 4대 온디맨드 이벤트(로그인 1회, 트랜잭션 응답, 소진 모델 선별 체크, 모델 변경)에서만 동작하도록 설계.

### 2.4 거버넌스 및 기술 아키텍처 기준서 제정
- `/docs/16-design-patterns-and-technical-architecture-catalog.md`: GoF/클라우드 디자인 패턴 등록 규격, 장단점 분석 및 대상 기능 라이프사이클 관리.
- 백로그 `[BACKLOG-ARCH-PAT-01]` (기존 구현기능 패턴 전수조사 및 문서 현행화) 등록.

---

## 3. 검증 결과 (Verification & Quality Gates)

### 3.1 3대 시나리오 단위 테스트 결과 (7/7 PASS)
- **`TC-TEL-01` (Happy Path)**: Google Gemini Type-A 실시간 Usage API 조회 및 잔여 쿼터 계산 (PASS)
- **`TC-TEL-02` (Happy Path)**: Anthropic Type-B 응답 헤더 기반 Rate Limit 감지 및 연결성 판정 (PASS)
- **`TC-TEL-03` (Happy Path)**: 소진 모델 선별 온디맨드 체크 (정상 모델 2건 스킵으로 불필요 트래픽 0% 방어) (PASS)
- **`TC-TEL-04` (Error Recovery)**: 429 감지 시 서킷 OPEN 전이, 우회 모델 할당 및 Slack 웹훅 자동 발송 (PASS)
- **`TC-TEL-05` (Error Recovery)**: 쿨다운 만료 후 `HALF_OPEN` ➔ 헬스체크 성공 시 `CLOSED` Self-Healing 복구 (PASS)
- **`TC-TEL-06` (Edge Bounds)**: 100% 소진 모델 대상 복구 예상시간 및 복구 가이드 연산 (PASS)
- **`TC-TEL-07` (Edge Bounds)**: 미등록 신규 LLM 공급자 쿼리 시 안전한 기본 전략 인스턴스 팩토리 반환 (PASS)

### 3.2 TypeScript 컴파일러 린트
- `tsc --noEmit` 실행 결과 오류 0건 (Clean Build).

---

## 4. 데이터베이스 변경 사항 (Database Schema)

- **신규 테이블**: `token_quota_telemetry_logs`
- **6대 공통 감사 컬럼 주입**: `reg_sys_cd`, `reg_user_id`, `reg_dt`, `mod_sys_cd`, `mod_user_id`, `mod_dt`
- **거버넌스 준수**: `DOC-STD-15` 및 `DOC-STD-16` 표준 스탬프 확인 완료.
