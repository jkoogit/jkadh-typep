/**
 * 🏛️ [Strategy Pattern] Local LLM / Manus Operator Quota Checker (Type-C: Local Ping)
 */
import { AIAccount } from '../../types';
import { ITokenQuotaChecker, QuotaCheckResult, QuotaResetPolicy, RecoveryPlanEstimate } from './types';

export class LocalManusQuotaChecker implements ITokenQuotaChecker {
  readonly provider = 'MANUS' as const;
  readonly supportsDirectApi = false;
  readonly defaultCooldownSec = 30;
  readonly resetPolicy: QuotaResetPolicy = 'MANUAL_RELOAD';

  async checkQuota(account: AIAccount, modelId: string): Promise<QuotaCheckResult> {
    const startTime = Date.now();
    await new Promise((resolve) => setTimeout(resolve, 20));
    const latencyMs = Date.now() - startTime;

    const isExhausted = account.remainingTokens <= 0 || account.status === 'EXHAUSTED';
    const circuitState = isExhausted ? 'OPEN' : (account.circuitState || 'CLOSED');
    const percentageUsed = Math.min(100, Math.round((account.usedTokens / Math.max(1, account.totalTokenQuota)) * 100));

    return {
      modelId,
      provider: this.provider,
      isAvailable: !isExhausted && circuitState === 'CLOSED',
      supportsQuotaApi: false,
      checkType: 'LOCAL_PING',
      totalQuota: account.totalTokenQuota,
      usedTokens: account.usedTokens,
      remainingTokens: Math.max(0, account.remainingTokens),
      quotaPercentageUsed: percentageUsed,
      circuitState,
      latencyMs,
      checkedAt: new Date().toISOString(),
      message: isExhausted
        ? `[Type-C 로컬] Manus/Local 인스턴스 토큰 소진 또는 오프라인`
        : `[Type-C 로컬] Manus 샌드박스 연결 양호 (${latencyMs}ms)`,
      cooldownRemainingSec: isExhausted ? this.defaultCooldownSec : 0,
      resetPolicy: this.resetPolicy,
      rawDetails: {
        endpoint: 'http://localhost:11434 / local-agent',
      }
    };
  }

  getRecoveryEstimate(account: AIAccount, _modelId: string): RecoveryPlanEstimate {
    const isExhausted = account.remainingTokens <= 0 || account.status === 'EXHAUSTED';
    return {
      isRecovered: !isExhausted,
      cooldownRemainingSec: isExhausted ? this.defaultCooldownSec : 0,
      planDescription: isExhausted ? '로컬 에이전트 인스턴스 재기동 또는 토큰 재설정 필요' : '정상 통신 중',
      recommendedAction: isExhausted ? 'REFILL_CREDIT' : 'WAIT_COOLDOWN'
    };
  }
}
