/**
 * 🏛️ [JKADH PAT-BEH-01] Token Telemetry & On-Demand Quota Service
 * Reference: /docs/16-design-patterns-and-technical-architecture-catalog.md
 */

import { AIAccount, ModelMeta } from '../types';
import { TokenQuotaCheckerFactory, QuotaCheckResult } from './quotaCheckers';
import { CircuitBreakerService } from './circuitBreakerService';

export interface TelemetryUsageLog {
  id: string;
  timestamp: string;
  userId: string;
  modelId: string;
  provider: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUSD: number;
  latencyMs: number;
  success: boolean;
  httpStatus: number;
  errorMessage?: string;
}

export class TokenTelemetryService {
  private static instance: TokenTelemetryService;
  private readonly usageLogs: TelemetryUsageLog[] = [];
  private readonly checkerFactory = TokenQuotaCheckerFactory.getInstance();
  private readonly circuitBreaker = CircuitBreakerService.getInstance();

  private constructor() {}

  public static getInstance(): TokenTelemetryService {
    if (!TokenTelemetryService.instance) {
      TokenTelemetryService.instance = new TokenTelemetryService();
    }
    return TokenTelemetryService.instance;
  }

  /**
   * [이벤트 1 & 4] 단일 모델 온디맨드 쿼터 검증 (Strategy Pattern 적용)
   */
  public async checkSingleModelQuota(account: AIAccount, modelId: string): Promise<QuotaCheckResult> {
    const checker = this.checkerFactory.getChecker(account.provider);
    const result = await checker.checkQuota(account, modelId);

    // If check returns available and account was exhausted/open, recover state
    if (result.isAvailable && (account.status === 'EXHAUSTED' || account.circuitState !== 'CLOSED')) {
      this.circuitBreaker.handleSuccess(account, modelId);
    }

    return result;
  }

  /**
   * [이벤트 3] 소진된 모델만 선별하여 온디맨드 복구 체크 (불필요 통신 0% 방어)
   */
  public async checkExhaustedModelsOnly(
    accounts: AIAccount[],
    models: ModelMeta[]
  ): Promise<{ results: QuotaCheckResult[]; checkedCount: number; skippedCount: number }> {
    // Check cooldown expirations first
    accounts.forEach((acc) => this.circuitBreaker.evaluateCooldownTransition(acc));

    // Target ONLY accounts that are EXHAUSTED or circuit OPEN/HALF_OPEN
    const targetAccounts = accounts.filter(
      (acc) => acc.status === 'EXHAUSTED' || acc.circuitState === 'OPEN' || acc.circuitState === 'HALF_OPEN'
    );

    const results: QuotaCheckResult[] = [];

    for (const acc of targetAccounts) {
      const associatedModel = models.find((m) => m.provider === acc.provider) || models[0];
      const modelId = associatedModel ? associatedModel.id : `${acc.provider.toLowerCase()}-default`;
      const result = await this.checkSingleModelQuota(acc, modelId);
      results.push(result);
    }

    return {
      results,
      checkedCount: targetAccounts.length,
      skippedCount: accounts.length - targetAccounts.length,
    };
  }

  /**
   * [이벤트 1] 로그인 시 전체 활성 모델 1회 온디맨드 검증
   */
  public async checkAllActiveOnLogin(accounts: AIAccount[], models: ModelMeta[]): Promise<QuotaCheckResult[]> {
    const results: QuotaCheckResult[] = [];
    for (const acc of accounts) {
      const model = models.find((m) => m.provider === acc.provider);
      const modelId = model ? model.id : `${acc.provider.toLowerCase()}-primary`;
      const result = await this.checkSingleModelQuota(acc, modelId);
      results.push(result);
    }
    return results;
  }

  /**
   * [이벤트 2] 트랜잭션 실행 중 토큰 소진 및 사용량 기록 (백그라운드 통신 없이 응답으로만 처리)
   */
  public recordUsage(params: {
    userId: string;
    account: AIAccount;
    model: ModelMeta;
    promptTokens: number;
    completionTokens: number;
    latencyMs: number;
    success: boolean;
    httpStatus?: number;
    errorMessage?: string;
  }): {
    log: TelemetryUsageLog;
    circuitOpened: boolean;
    fallbackModelId?: string;
  } {
    const { userId, account, model, promptTokens, completionTokens, latencyMs, success, httpStatus = 200, errorMessage } = params;
    const totalTokens = promptTokens + completionTokens;

    // Calculate USD cost
    const inputCost = (promptTokens / 1_000_000) * model.inputPricePerMillion;
    const outputCost = (completionTokens / 1_000_000) * model.outputPricePerMillion;
    const estimatedCostUSD = Number((inputCost + outputCost).toFixed(4));

    // Update in-memory account usage
    account.usedTokens += totalTokens;
    account.remainingTokens = Math.max(0, account.totalTokenQuota - account.usedTokens);
    account.currentCostUSD = Number((account.currentCostUSD + estimatedCostUSD).toFixed(2));

    let circuitOpened = false;
    let fallbackModelId: string | undefined;

    if (!success || httpStatus === 429 || httpStatus === 402 || account.remainingTokens <= 0) {
      const res = this.circuitBreaker.handleFailure(account, model.id, httpStatus, errorMessage);
      circuitOpened = res.circuitOpened;
      fallbackModelId = res.fallbackModelId;
    } else {
      this.circuitBreaker.handleSuccess(account, model.id);
    }

    const log: TelemetryUsageLog = {
      id: `TLOG-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      userId,
      modelId: model.id,
      provider: model.provider,
      promptTokens,
      completionTokens,
      totalTokens,
      estimatedCostUSD,
      latencyMs,
      success,
      httpStatus,
      errorMessage,
    };

    this.usageLogs.unshift(log);

    // Keep memory bound (max 100 logs)
    if (this.usageLogs.length > 100) {
      this.usageLogs.pop();
    }

    return {
      log,
      circuitOpened,
      fallbackModelId,
    };
  }

  public getUsageLogs(): TelemetryUsageLog[] {
    return [...this.usageLogs];
  }

  public getRecoveryEstimate(account: AIAccount, modelId: string) {
    const checker = this.checkerFactory.getChecker(account.provider);
    return checker.getRecoveryEstimate(account, modelId);
  }
}
