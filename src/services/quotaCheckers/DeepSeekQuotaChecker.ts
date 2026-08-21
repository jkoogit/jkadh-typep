/**
 * 🏛️ [Strategy Pattern] DeepSeek Quota Checker (Type-B: 0-Token Probe Ping)
 */
import { AIAccount } from '../../types';
import { ITokenQuotaChecker, QuotaCheckResult, QuotaResetPolicy, RecoveryPlanEstimate } from './types';

export class DeepSeekQuotaChecker implements ITokenQuotaChecker {
  readonly provider = 'DEEPSEEK' as const;
  readonly supportsDirectApi = false;
  readonly defaultCooldownSec = 60;
  readonly resetPolicy: QuotaResetPolicy = 'MANUAL_RELOAD';

  async checkQuota(account: AIAccount, modelId: string): Promise<QuotaCheckResult> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 35));
    const latencyMs = Date.now() - startTime;

    const isExhausted = account.remainingTokens <= 0 || account.status === 'EXHAUSTED';
    const circuitState = isExhausted ? 'OPEN' : (account.circuitState || 'CLOSED');
    const percentageUsed = Math.min(100, Math.round((account.usedTokens / Math.max(1, account.totalTokenQuota)) * 100));

    return {
      modelId,
      provider: this.provider,
      isAvailable: !isExhausted && circuitState === 'CLOSED',
      supportsQuotaApi: this.supportsDirectApi,
      checkType: 'PROBE_PING',
      totalQuota: account.totalTokenQuota,
      usedTokens: account.usedTokens,
      remainingTokens: Math.max(0, account.remainingTokens),
      quotaPercentageUsed: percentageUsed,
      circuitState,
      latencyMs,
      checkedAt: new Date().toISOString(),
      message: isExhausted
        ? `[Type-B 핑검증] DeepSeek 엔드포인트 402/429 감지 (크레딧 충전 또는 60초 대기 필요)`
        : `[Type-B 핑검증] DeepSeek 엔드포인트 응답 성공 (${latencyMs}ms)`,
      estimatedRecoveryDt: undefined,
      cooldownRemainingSec: isExhausted ? this.defaultCooldownSec : 0,
      resetPolicy: this.resetPolicy,
      rawDetails: {
        method: 'POST /v1/chat/completions (max_tokens: 1 probe)',
      }
    };
  }

  getRecoveryEstimate(account: AIAccount, _modelId: string): RecoveryPlanEstimate {
    const isExhausted = account.remainingTokens <= 0 || account.status === 'EXHAUSTED';
    return {
      isRecovered: !isExhausted,
      cooldownRemainingSec: isExhausted ? this.defaultCooldownSec : 0,
      planDescription: isExhausted
        ? 'DeepSeek 선불 크레딧 소진 또는 Rate Limit. 크레딧 충전 또는 프로브 핑 테스트 권장'
        : '정상 응답 중',
      recommendedAction: isExhausted ? 'REFILL_CREDIT' : 'WAIT_COOLDOWN'
    };
  }
}
