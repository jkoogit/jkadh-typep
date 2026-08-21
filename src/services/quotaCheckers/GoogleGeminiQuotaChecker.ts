/**
 * 🏛️ [Strategy Pattern] Google Gemini Quota Checker (Type-A: Direct Usage API)
 */
import { AIAccount } from '../../types';
import { ITokenQuotaChecker, QuotaCheckResult, QuotaResetPolicy, RecoveryPlanEstimate } from './types';

export class GoogleGeminiQuotaChecker implements ITokenQuotaChecker {
  readonly provider = 'GOOGLE' as const;
  readonly supportsDirectApi = true;
  readonly defaultCooldownSec = 300;
  readonly resetPolicy: QuotaResetPolicy = 'DAILY_FIXED';

  async checkQuota(account: AIAccount, modelId: string): Promise<QuotaCheckResult> {
    const startTime = Date.now();
    
    // Simulate lightweight direct Usage/Metric API call (~45ms)
    await new Promise((resolve) => setTimeout(resolve, 45));
    const latencyMs = Date.now() - startTime;

    const isExhausted = account.remainingTokens <= 0 || account.status === 'EXHAUSTED';
    const circuitState = isExhausted ? 'OPEN' : (account.circuitState || 'CLOSED');
    
    const percentageUsed = Math.min(100, Math.round((account.usedTokens / Math.max(1, account.totalTokenQuota)) * 100));

    // Type-A: Compute exact next daily reset (Next 09:00 KST / 00:00 UTC)
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setUTCHours(24, 0, 0, 0); // Next 00:00 UTC

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
      checkedAt: new Date().toISOString(),
      message: isExhausted
        ? `[Type-A API] 일일 쿼터가 모두 소진되었습니다. (익일 09:00 KST 자동 리셋 예정)`
        : `[Type-A API] 잔여 쿼터 ${(account.remainingTokens / 1000000).toFixed(2)}M (${100 - percentageUsed}% 가용)`,
      estimatedRecoveryDt: isExhausted ? nextReset.toISOString() : undefined,
      cooldownRemainingSec: isExhausted ? Math.round((nextReset.getTime() - now.getTime()) / 1000) : 0,
      resetPolicy: this.resetPolicy,
      rawDetails: {
        apiEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models/metrics',
        tier: account.tier,
      }
    };
  }

  getRecoveryEstimate(account: AIAccount, _modelId: string): RecoveryPlanEstimate {
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setUTCHours(24, 0, 0, 0);
    const cooldownSec = Math.max(0, Math.round((nextReset.getTime() - now.getTime()) / 1000));

    const isExhausted = account.remainingTokens <= 0 || account.status === 'EXHAUSTED';

    return {
      isRecovered: !isExhausted,
      estimatedRecoveryDt: isExhausted ? nextReset.toISOString() : undefined,
      cooldownRemainingSec: isExhausted ? cooldownSec : 0,
      planDescription: isExhausted 
        ? `Google Vertex/AI Studio 24시간 고정 윈도우 리셋 대기 (${Math.floor(cooldownSec / 3600)}시간 ${(Math.floor(cooldownSec / 60)) % 60}분 남음)`
        : '정상 가용 상태 (충분한 쿼터 확보)',
      recommendedAction: isExhausted ? 'SWITCH_FALLBACK' : 'WAIT_COOLDOWN'
    };
  }
}
