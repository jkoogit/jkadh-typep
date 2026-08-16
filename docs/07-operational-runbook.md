# 7. 운영 런북 및 장애 복구 가이드 (Operational Runbook)

## 7.1 시나리오 1: 429 Token Quota Exhaustion 발생 시

### 1.1 증상
* LLM 호출 시 `429 Too Many Requests` 또는 `insufficient_quota` 반환.
* 개발 파이프라인에서 작업 노드가 `BLOCKED` 상태로 전이될 위험 발생.

### 1.2 자동 복구 절차
1. 클라이언트 측 **3-Tier Circuit Breaker**가 오류를 감지하여 150ms 내에 차순위 모델(`gpt-4o-codex` 또는 `gemini-3-7-flash`)로 핫스왑.
2. 실행 로그에 `[WARN] Quota Exhausted on Claude 3.7. Fallback swapped to Gemini 3.7 Flash.` 기록.

### 1.3 수동 운영자 개입 (Admin Action)
1. **jkadh 대시보드 > 팀 & 계정 관리** 탭으로 이동.
2. 고갈된 Provider 계정 항목에서 **[토큰 쿼터 리셋]** 버튼 클릭.
3. 해당 팀원의 일일 토큰 한도가 소진된 경우, 멤버 카드에서 **[한도 증액]** 실행.

---

## 7.2 시나리오 2: 코드 생성 및 검증 중 회귀(Regression) / Gatekeeper 실패 시

### 2.1 증상
* Phase 6 코드 생성 후 정적 검증(`tsc --noEmit`, 린트) 실패 또는 Phase 7 리뷰 중 기획 불일치(Drift) 발견.

### 2.2 자동 복구 절차
1. **Gatekeeper Validator**가 즉시 다음 단계 전진을 차단하고 트랜잭션 롤백.
2. Phase 4 아키텍처 명세 및 Phase 5 테스트 벡터 스냅샷으로 코드베이스 롤백.

### 2.3 AI 재시도 절차
1. 실패한 컴파일 에러 또는 Gatekeeper 룰 불일치 사유를 캡처.
2. Fallback 모델(Claude 3.7 Sonnet 또는 Codex)로 프롬프트에 실패 로그를 주입하여 재작성 집행.

---

## 7.3 시나리오 3: `jkadhp_dev` DB 마이그레이션 충돌 시

### 3.1 증상
* 복수의 에이전트가 동시에 DDL 마이그레이션을 시도하여 `lock_timeout` 또는 스키마 버전 불일치 발생.

### 3.2 복구 절차
1. `task_nodes` 트랜잭션의 Savepoint로 롤백.
2. `DatabaseSchemaView`에서 `pg_stat_activity`를 조회하여 장기 대기 중인 트랜잭션 잠금 해제.
3. 마이그레이션 스크립트를 Idempotent(`IF NOT EXISTS`) 형태로 재조정 후 단독 실행.
