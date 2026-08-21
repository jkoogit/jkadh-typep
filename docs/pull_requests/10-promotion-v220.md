# [Promotion PR #17 & #18] 토큰 쿼터 실시간 텔레메트리 & 서킷 브레이커 웹훅 엔진 v2.2.0 다단계 승급

- **PR 번호**: #17 (`dev` ➔ `stg`), #18 (`stg` ➔ `main`)
- **소스 브랜치 (Head)**: `dev` / `stg`
- **타겟 브랜치 (Base)**: `stg` / `main`
- **연결 이슈**: Resolves #14, Resolves #16
- **작업 코드**: `PLAT-MON-08` (`WRK-MON-QUOTA-01`)
- **작업자**: 조정국 (mem-jkoo / SUPER_ADMIN)
- **리뷰어/승인자**: 조정국 (SUPER_ADMIN)
- **머지 일시**: 2026-08-20 02:05:00 PDT (2026-08-20 18:05:00 KST)
- **릴리즈 버전**: `v2.2.0` (Tag: `v2.2.0` 완료)
- **머지 상태**: MERGED (`dev` ➔ `stg` ➔ `main` 배포 승급 완료)

---

## 1. 승급 요약 (Summary of Promoted Scope)

### 1.1 전략 패턴(Strategy Pattern) 기반 토큰 쿼터 검증 엔진 (`ITokenQuotaChecker`)
- **Type-A (정량 Usage API 지원 모델)**:
  - `GoogleGeminiQuotaChecker`: 일일 24시간 고정 윈도우(00:00 UTC / 09:00 KST 리셋) 및 정확한 잔여 토큰 계산.
  - `OpenAiQuotaChecker`: 60초 롤링 윈도우 TPM/RPM 및 크레딧 소진율 산출.
- **Type-B (정량 API 미지원 / 응답 헤더 및 경량 프로브 모델)**:
  - `AnthropicQuotaChecker`: 응답 헤더(`anthropic-ratelimit-*`) 및 120초 쿨다운 연산.
  - `DeepSeekQuotaChecker`: 경량 0-Token 프로브 핑 및 수동 충전 정책 매핑.
  - `LocalManusQuotaChecker`: 로컬 인스턴스 샌드박스 핑 검증.
- **`TokenQuotaCheckerFactory`**: 공급자/모델 식별자 기반 Strategy 싱글톤 인스턴스 안전 생성 및 Flyweight 재사용.

### 1.2 서킷 브레이커(Circuit Breaker Pattern) 상태머신 & 실시간 웹훅 연동
- `CLOSED` ➔ `OPEN` ➔ `HALF_OPEN` 3단계 상태머신 구현.
- 429 Rate Limit 또는 연속 실패 3회 도달 시 장애 공급자를 즉시 격리하고 차순위 Fallback 모델로 자동 우회.
- 쿨다운 경과 시 `HALF_OPEN` 시험 핑을 통한 Self-Healing 복구 및 Slack/Discord 웹훅 알림 발송.

### 1.3 4대 온디맨드 화면 이벤트 가드레일 (불필요 통신 0% 방어)
- 백그라운드 무한 루프 통신을 배제하고 1) 로그인 1회, 2) 트랜잭션 응답, 3) 소진 모델 선별 온디맨드 클릭, 4) 모델 변경 이벤트에서만 쿼터 체크 트리거.

### 1.4 디자인 패턴 및 기술 아키텍처 구현 카탈로그 제정 (`DOC-STD-16`)
- `/docs/16-design-patterns-and-technical-architecture-catalog.md` 문서 제정 및 `[BACKLOG-ARCH-PAT-01]` 백로그 등록.

---

## 2. 테스트 및 품질 검증 증빙 (Verification Proof)

| 검증 항목 | 결과 | 상세 내용 |
|---|:---:|---|
| **TypeScript AST & Lint** | **PASS** | `tsc --noEmit` 실행 결과 0 에러 (Clean Build) |
| **단위 테스트 (3대 시나리오)** | **PASS** | Happy Path 3건, Error Recovery 2건, Edge Bounds 2건 100% 통과 |
| **Vite Applet 빌드** | **PASS** | `npm run build` 정적 번들 생성 완료 |
| **DB 공통 감사 컬럼** | **PASS** | `token_quota_telemetry_logs` 테이블 6대 감사 컬럼 주입 완료 |
| **스펙 드리프트** | **0.0%** | 게이트키퍼 준수 점수 98점 / 스펙 불일치 0건 |
