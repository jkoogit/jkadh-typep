/**
 * 🏛️ [Strategy Pattern] Anthropic Quota Checker (Type-B: Response Header & Probe Ping)
 */
import { AIAccount } from '../../types';
import { ITokenQuotaChecker, QuotaCheckResult, QuotaResetPolicy, RecoveryPlanEstimate } from './types';

export class AnthropicQuotaChecker implements ITokenQuotaChecker {
  readonly provider = 'ANTHROPIC' as const;
  readonly supportsDirectApi = false; // Type-B: No public balance inquiry endpoint
  readonly defaultCooldownSec = 120;
  readonly resetPolicy: QuotaResetPolicy = 'ROLLING_WINDOW';

  async checkQuota(account: AIAccount, modelId: string): Promise<QuotaCheckResult> {
    const startTime = Date.now();
    // Simulate lightweight 0-token ping / header inspection (~30ms)
    await new Promise((resolve) => setTimeout(resolve, 30));
    const latencyMs = Date.now() - startTime;

    const isExhausted = account.remainingTokens <= 0 || account.status === 'EXHAUSTED';
    const circuitState = isExhausted ? 'OPEN' : (account.circuitState || 'CLOSED');
    const percentageUsed = Math.min(100, Math.round((account.usedTokens / Math.max(1, account.totalTokenQuota)) * 100));

    const now = new Date();
    const recoveryDate = new Date(now.getTime() + this.defaultCooldownSec * 1000);

    return {
      modelId,
      provider: this.provider,
      isAvailable: !isExhausted && circuitState === 'CLOSED',
      supportsQuotaApi: this.supportsDirectApi,
      checkType: 'RESPONSE_HEADER',
      totalQuota: account.totalTokenQuota,
      usedTokens: account.usedTokens,
      remainingTokens: Math.max(0, account.remainingTokens),
      quotaPercentageUsed: percentageUsed,
      circuitState,
      latencyMs,
      checkedAt: now.toISOString(),
      message: isExhausted
        ? `[Type-B 헤더감지] Anthropic Rate Limit 429 감지됨 (약 ${this.defaultCooldownSec}초 쿨다운 대기)`
        : `[Type-B 헤더감지] Anthropic 연결 정상 (추정 잔여 ${(account.remainingTokens / 1000000).toFixed(2)}M)`,
      estimatedRecoveryDt: isExhausted ? recoveryDate.toISOString() : undefined,
      cooldownRemainingSec: isExhausted ? this.defaultCooldownSec : 0,
      resetPolicy: this.resetPolicy,
      rawDetails: {
        headerMechanism: 'anthropic-ratelimit-requests-remaining',
        cooldownSeconds: this.defaultCooldownSec,
      }
    };
  }

  getRecoveryEstimate(account: AIAccount, _modelId: string): RecoveryPlanEstimate {
    const isExhausted = account.remainingTokens <= 0 || account.status === 'EXHAUSTED';
    const now = new Date();
    const recoveryDate = new Date(now.getTime() + this.defaultCooldownSec * 1000);

    return {
      isRecovered: !isExhausted,
      estimatedRecoveryDt: isExhausted ? recoveryDate.toISOString() : undefined,
      cooldownRemainingSec: isExhausted ? this.defaultCooldownSec : 0,
      planDescription: isExhausted
        ? `Anthropic Rate Limit 쿨다운 (${this.defaultCooldownSec}초 대기 후 프로브 핑 테스트 권장)`
        : '정상 가용 상태',
      recommendedAction: isExhausted ? 'TRIGGER_PROBE_PING' : 'WAIT_COOLDOWN'
    };
  }
}
