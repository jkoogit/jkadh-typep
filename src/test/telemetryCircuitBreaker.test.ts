/**
 * 🏛️ [JKADH PLAT-MON-08] 3-Scenario Unit Tests for Token Telemetry & Circuit Breaker
 * Testing Strategy Pattern, Factory Pattern, and State/Circuit Breaker Resilience
 */

import { AIAccount, ModelMeta } from '../types';
import { TokenQuotaCheckerFactory } from '../services/quotaCheckers';
import { TokenTelemetryService } from '../services/telemetryService';
import { CircuitBreakerService } from '../services/circuitBreakerService';

export interface TestCaseResult {
  id: string;
  category: 'HAPPY_PATH' | 'ERROR_RECOVERY' | 'EDGE_BOUNDS';
  target: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

export async function runTelemetryCircuitBreakerTests(): Promise<{
  passedCount: number;
  totalCount: number;
  results: TestCaseResult[];
}> {
  const results: TestCaseResult[] = [];
  const telemetryService = TokenTelemetryService.getInstance();
  const circuitBreaker = CircuitBreakerService.getInstance();
  const factory = TokenQuotaCheckerFactory.getInstance();

  const mockAccountGoogle: AIAccount = {
    id: 'acc-google-test',
    provider: 'GOOGLE',
    accountName: 'Google Gemini Pro Account',
    apiKeyMasked: 'AIzaSy********************',
    totalTokenQuota: 10_000_000,
    usedTokens: 2_000_000,
    remainingTokens: 8_000_000,
    costMonthlyLimitUSD: 100,
    currentCostUSD: 20,
    status: 'HEALTHY',
    errorCount24h: 0,
    circuitState: 'CLOSED',
    tier: 'Enterprise',
  };

  const mockAccountAnthropic: AIAccount = {
    id: 'acc-claude-test',
    provider: 'ANTHROPIC',
    accountName: 'Anthropic Claude Account',
    apiKeyMasked: 'sk-ant-api********************',
    totalTokenQuota: 5_000_000,
    usedTokens: 1_000_000,
    remainingTokens: 4_000_000,
    costMonthlyLimitUSD: 150,
    currentCostUSD: 30,
    status: 'HEALTHY',
    errorCount24h: 0,
    circuitState: 'CLOSED',
    tier: 'Tier-4',
  };

  const mockAccountExhausted: AIAccount = {
    id: 'acc-openai-exhausted',
    provider: 'OPENAI',
    accountName: 'OpenAI Exhausted Account',
    apiKeyMasked: 'sk-proj********************',
    totalTokenQuota: 5_000_000,
    usedTokens: 5_000_000,
    remainingTokens: 0,
    costMonthlyLimitUSD: 200,
    currentCostUSD: 200,
    status: 'EXHAUSTED',
    errorCount24h: 3,
    circuitState: 'OPEN',
    cooldownUntil: new Date(Date.now() + 60_000).toISOString(),
    primaryFallbackModelId: 'gemini-1.5-pro',
    tier: 'Developer',
  };

  const mockModelGemini: ModelMeta = {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'GOOGLE',
    version: '1.5',
    contextWindow: 2000000,
    inputPricePerMillion: 1.25,
    outputPricePerMillion: 5.0,
    reasoningTier: 'HIGH',
    codeScore: 92,
    avgLatencyMs: 450,
    recommendedPhases: [1, 2, 3, 4, 5, 6, 7],
    primaryCapabilities: ['Code Generation', 'Large Context'],
    fallbackOrder: ['claude-3-7-sonnet', 'gpt-4o'],
    tokenEstimationDifficulty: 'EXACT',
    description: 'Google Multimodal LLM',
    isAvailable: true,
  };

  // ---------------------------------------------------------------------------
  // [1] Happy Path 1: Type-A Strategy Quota Check (Google Gemini Direct API)
  // ---------------------------------------------------------------------------
  const t1Start = Date.now();
  const resGoogle = await telemetryService.checkSingleModelQuota(mockAccountGoogle, 'gemini-1.5-pro');
  const t1Passed =
    resGoogle.supportsQuotaApi === true &&
    resGoogle.checkType === 'DIRECT_USAGE_API' &&
    resGoogle.isAvailable === true &&
    resGoogle.remainingTokens === 8_000_000;
  results.push({
    id: 'TC-TEL-01',
    category: 'HAPPY_PATH',
    target: 'GoogleGeminiQuotaChecker (Strategy)',
    name: 'Type-A 실시간 Usage API 조회 및 잔여 쿼터 계산',
    passed: t1Passed,
    durationMs: Date.now() - t1Start,
    details: `검증타입: ${resGoogle.checkType}, 잔여: ${(resGoogle.remainingTokens / 1_000_000).toFixed(1)}M, 가용: ${resGoogle.isAvailable}`,
  });

  // ---------------------------------------------------------------------------
  // [2] Happy Path 2: Type-B Strategy Quota Check (Anthropic Response Header)
  // ---------------------------------------------------------------------------
  const t2Start = Date.now();
  const resAnthropic = await telemetryService.checkSingleModelQuota(mockAccountAnthropic, 'claude-3-5-sonnet');
  const t2Passed =
    resAnthropic.supportsQuotaApi === false &&
    resAnthropic.checkType === 'RESPONSE_HEADER' &&
    resAnthropic.isAvailable === true;
  results.push({
    id: 'TC-TEL-02',
    category: 'HAPPY_PATH',
    target: 'AnthropicQuotaChecker (Strategy)',
    name: 'Type-B 응답 헤더 기반 Rate Limit 감지 및 연결성 판정',
    passed: t2Passed,
    durationMs: Date.now() - t2Start,
    details: `검증타입: ${resAnthropic.checkType}, 직통API지원: ${resAnthropic.supportsQuotaApi}, 상태: ${resAnthropic.message}`,
  });

  // ---------------------------------------------------------------------------
  // [3] Happy Path 3: On-Demand Filter (소진 모델만 타겟팅, 건강한 모델 0% 통신)
  // ---------------------------------------------------------------------------
  const t3Start = Date.now();
  const filterRes = await telemetryService.checkExhaustedModelsOnly(
    [mockAccountGoogle, mockAccountAnthropic, mockAccountExhausted],
    [mockModelGemini]
  );
  const t3Passed = filterRes.checkedCount === 1 && filterRes.skippedCount === 2;
  results.push({
    id: 'TC-TEL-03',
    category: 'HAPPY_PATH',
    target: 'TokenTelemetryService.checkExhaustedModelsOnly',
    name: '소진 모델 선별 온디맨드 체크 (정상 모델 2건 스킵으로 불필요 트래픽 0% 방어)',
    passed: t3Passed,
    durationMs: Date.now() - t3Start,
    details: `검사된 소진모델: ${filterRes.checkedCount}건, 스킵된 정상모델: ${filterRes.skippedCount}건`,
  });

  // ---------------------------------------------------------------------------
  // [4] Error Recovery 1: 429 Rate Limit 감지 시 Circuit Breaker OPEN 및 Fallback
  // ---------------------------------------------------------------------------
  const t4Start = Date.now();
  const testAccountFail: AIAccount = { ...mockAccountGoogle, circuitState: 'CLOSED', consecutiveFailures: 0 };
  const failRes = telemetryService.recordUsage({
    userId: 'mem-jkoo',
    account: testAccountFail,
    model: mockModelGemini,
    promptTokens: 1000,
    completionTokens: 0,
    latencyMs: 120,
    success: false,
    httpStatus: 429,
    errorMessage: 'Resource Exhausted / Rate Limit',
  });
  const t4Passed =
    testAccountFail.circuitState === 'OPEN' &&
    testAccountFail.status === 'EXHAUSTED' &&
    failRes.circuitOpened === true &&
    circuitBreaker.getWebhookLogs().length > 0;
  results.push({
    id: 'TC-TEL-04',
    category: 'ERROR_RECOVERY',
    target: 'CircuitBreakerService (State & Webhook)',
    name: '429 Rate Limit 감지 시 서킷 OPEN 전이 및 Slack 웹훅 자동 발송',
    passed: t4Passed,
    durationMs: Date.now() - t4Start,
    details: `서킷상태: ${testAccountFail.circuitState}, 소진상태: ${testAccountFail.status}, 웹훅로그수: ${circuitBreaker.getWebhookLogs().length}`,
  });

  // ---------------------------------------------------------------------------
  // [5] Error Recovery 2: 쿨다운 후 헬스체크 성공 시 Self-Healing 복구
  // ---------------------------------------------------------------------------
  const t5Start = Date.now();
  const testAccountHealing: AIAccount = {
    ...mockAccountGoogle,
    circuitState: 'OPEN',
    status: 'EXHAUSTED',
    cooldownUntil: new Date(Date.now() - 1000).toISOString(), // Cooldown expired
  };
  circuitBreaker.evaluateCooldownTransition(testAccountHealing);
  const isHalfOpen = testAccountHealing.circuitState === 'HALF_OPEN';
  circuitBreaker.handleSuccess(testAccountHealing, 'gemini-1.5-pro');
  const isClosedAgain = testAccountHealing.circuitState === 'CLOSED' && testAccountHealing.status === 'HEALTHY';
  const t5Passed = isHalfOpen && isClosedAgain;
  results.push({
    id: 'TC-TEL-05',
    category: 'ERROR_RECOVERY',
    target: 'CircuitBreakerService.evaluateCooldownTransition',
    name: '쿨다운 만료 후 HALF_OPEN ➔ 헬스체크 성공 시 CLOSED 자가 복구 (Self-Healing)',
    passed: t5Passed,
    durationMs: Date.now() - t5Start,
    details: `HALF_OPEN 전이확인: ${isHalfOpen}, 최종 CLOSED 복구: ${isClosedAgain}`,
  });

  // ---------------------------------------------------------------------------
  // [6] Edge Bounds 1: 100% 소진 시 정확한 리셋 예상시각 연산
  // ---------------------------------------------------------------------------
  const t6Start = Date.now();
  const estimate = telemetryService.getRecoveryEstimate(mockAccountExhausted, 'gpt-4o');
  const t6Passed =
    estimate.isRecovered === false &&
    estimate.cooldownRemainingSec > 0 &&
    typeof estimate.planDescription === 'string';
  results.push({
    id: 'TC-TEL-06',
    category: 'EDGE_BOUNDS',
    target: 'OpenAiQuotaChecker.getRecoveryEstimate',
    name: '완전 소진 모델 대상 복구 예상시간 및 복구 가이드 연산',
    passed: t6Passed,
    durationMs: Date.now() - t6Start,
    details: `쿨다운잔여: ${estimate.cooldownRemainingSec}초, 복구설명: ${estimate.planDescription}`,
  });

  // ---------------------------------------------------------------------------
  // [7] Edge Bounds 2: 미등록 신규 공급자 입력 시 Factory 안전 폴백
  // ---------------------------------------------------------------------------
  const t7Start = Date.now();
  const unknownChecker = factory.getChecker('UNKNOWN_FUTURE_LLM_PROVIDER');
  const t7Passed = unknownChecker !== null && typeof unknownChecker.checkQuota === 'function';
  results.push({
    id: 'TC-TEL-07',
    category: 'EDGE_BOUNDS',
    target: 'TokenQuotaCheckerFactory (OCP & Registry)',
    name: '미등록 신규 LLM 공급자 쿼리 시 안전한 기본 전략 인스턴스 반환',
    passed: t7Passed,
    durationMs: Date.now() - t7Start,
    details: `기본제공전략: ${unknownChecker.provider}, 직통API지원여부: ${unknownChecker.supportsDirectApi}`,
  });

  const passedCount = results.filter((r) => r.passed).length;
  return {
    passedCount,
    totalCount: results.length,
    results,
  };
}
