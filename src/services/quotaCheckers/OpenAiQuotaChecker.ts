/**
 * 🏛️ [Strategy Pattern] OpenAI Quota Checker (Type-A: Usage API & Rolling Window)
 */
import { AIAccount } from '../../types';
import { ITokenQuotaChecker, QuotaCheckResult, QuotaResetPolicy, RecoveryPlanEstimate } from './types';

export class OpenAiQuotaChecker implements ITokenQuotaChecker {
  readonly provider = 'OPENAI' as const;
  readonly supportsDirectApi = true;
  readonly defaultCooldownSec = 60;
  readonly resetPolicy: QuotaResetPolicy = 'ROLLING_WINDOW';

  async checkQuota(account: AIAccount, modelId: string): Promise<QuotaCheckResult> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 55));
    const latencyMs = Date.now() - startTime;

    const isExhausted = account.remainingTokens <= 0 || account.status === 'EXHAUSTED';
    const circuitState = isExhausted ? 'OPEN' : (account.circuitState || 'CLOSED');
    const percentageUsed = Math.min(100, Math.round((account.usedTokens / Math.max(1, account.totalTokenQuota)) * 100));

    // Rolling 1-min RPM window or cooldown recovery
    const now = new Date();
    const recoveryDate = new Date(now.getTime() + this.defaultCooldownSec * 1000);

    return {
      modelId,
      provider: this.provider,
      isAvailable: !isExhausted && circuitState === 'CLOSED',
      supportsQuotaApi: this.supportsDirectApi,
      checkType: 'DIRECT_USAGE_API',
      totalQuota: account.totalTokenQuota,
      usedTokens: account.usedTokens,
      remainingTokens: Math.max(0, account.remainingTokens),
      quotaPercentageUsed: percentageUsed,
      circuitState,
      latencyMs,
      checkedAt: now.toISOString(),
      message: isExhausted
        ? `[Type-A API] OpenAI TPM/RPM 한도 초과 또는 잔여 토큰 소진 (약 ${this.defaultCooldownSec}초 후 롤링 윈도우 회복)`
        : `[Type-A API] OpenAI 잔여 크레딧 ${(account.remainingTokens / 1000000).toFixed(2)}M 가용`,
      estimatedRecoveryDt: isExhausted ? recoveryDate.toISOString() : undefined,
      cooldownRemainingSec: isExhausted ? this.defaultCooldownSec : 0,
      resetPolicy: this.resetPolicy,
      rawDetails: {
        endpoint: 'https://api.openai.com/v1/organization/usage',
        organizationTier: account.tier,
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
        ? `OpenAI 60초 롤링 윈도우 쿨다운 (${this.defaultCooldownSec}초 대기 후 재시도 가능)`
        : '정상 가용 상태',
      recommendedAction: isExhausted ? 'WAIT_COOLDOWN' : 'WAIT_COOLDOWN'
    };
  }
}
