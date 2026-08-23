# 4. AI 모델 거버넌스 및 Fallback 라우팅 매트릭스

## 4.1 모델별 공정 최적화 매트릭스

| 모델명 | 제공업체 | Context | 1M 토큰당 비용 (In/Out) | 추천 단계 (Phase) | 핵심 역량 |
|---|---|---|---|---|---|
| **Claude 3.7 Sonnet** | Anthropic | 200K | $3.0 / $15.0 | **Phase 1, 3, 4, 7** | 기획, 3대 시나리오 추출, AST 아키텍처 설계, 코드 리뷰 |
| **ChatGPT Codex** | OpenAI | 128K | $2.5 / $10.0 | **Phase 5, 6** | 엄격한 타입 코드 생성, 단위 테스트 하네스, 버그 픽스 |
| **Gemini 3.7 Flash** | Google | 1M | $0.15 / $0.60 | **Phase 1, 2, 7** | 100만 컨텍스트 초저지연 분석, JSON Spec 실시간 검증 |
| **Manus Operator** | Manus | 64K | $5.0 / $25.0 | **Phase 2, 5** | 자율 브라우저/샌드박스 실행, E2E 통합 테스트, 자동 치유 |

---

## 4.2 Proactive Fallback 라우팅 메커니즘 (3-Tier Circuit Breaker)

```
[Primary Model 요청] (예: Claude 3.7 Sonnet)
        |
        +---> [HTTP 200 OK] ------> [Gatekeeper JSON Schema 검증] ---> 정상 완료
        |
        +---> [HTTP 429 Quota / 503 / Timeout 감지]
                    |
                    v
          [Circuit Breaker 인터셉터 작동 (<150ms)]
                    |
                    v
          [1차 Fallback 전환: ChatGPT Codex]
                    |
                    +---> [성공 시 복구 로그 기록]
                    |
                    +---> [실패 시 2차 Fallback: Gemini 3.7 Flash (1M Window)]
```

### 1. Fallback 트리거 조건
* HTTP 상태 코드: `429 Too Many Requests`, `503 Service Unavailable`, `504 Gateway Timeout`
* 클라이언트 타임아웃: 기획/설계 단계 > 15초, 코드 생성 단계 > 25초
* 스키마 위반: 반환된 JSON 출력이 Phase JSON Schema Draft-07 검증에 2회 연속 불일치할 경우

### 2. 비용 및 토큰 절감 지표
* 429 발생 시 무의미한 Exponential Backoff 대기 시간(평균 30초~2분)을 0초로 단축.
* 대량 컨텍스트 재시도 시 Gemini 3.7 Flash(비용 1/20)로 핫스왑되어 월간 API 예산 초과 방지.
