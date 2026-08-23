/**
 * 🏛️ [JKADH PAT-BEH-01] Token Quota Checker Strategy Interface & Types
 * Reference: /docs/16-design-patterns-and-technical-architecture-catalog.md
 */

import { AIAccount } from '../../types';

export type QuotaCheckType = 
  | 'DIRECT_USAGE_API'   // Type-A: Real Usage / Balance API (Gemini, OpenAI Enterprise)
  | 'RESPONSE_HEADER'    // Type-B: Extract from x-ratelimit response headers (Anthropic)
  | 'PROBE_PING'         // Type-B: 0-Token Probe Ping test (DeepSeek, Custom Proxy)
  | 'LOCAL_PING';        // Type-C: Local LLM Endpoint connectivity (Ollama, Manus)

export type QuotaResetPolicy = 
  | 'DAILY_FIXED'        // Resets every 24h (e.g. 00:00 UTC / 09:00 KST)
  | 'ROLLING_WINDOW'     // 1-min / 5-min RPM/TPM rolling window
  | 'MONTHLY_BILLING'    // Monthly billing cycle limit
  | 'MANUAL_RELOAD';     // Requires manual credit refill

export interface QuotaCheckResult {
  modelId: string;
  provider: 'GOOGLE' | 'OPENAI' | 'ANTHROPIC' | 'DEEPSEEK' | 'MANUS';
  isAvailable: boolean;
  supportsQuotaApi: boolean;
  checkType: QuotaCheckType;
  totalQuota: number;
  usedTokens: number;
  remainingTokens: number;
  quotaPercentageUsed: number;
  circuitState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  latencyMs: number;
  checkedAt: string;
  message: string;
  estimatedRecoveryDt?: string;
  cooldownRemainingSec?: number;
  resetPolicy: QuotaResetPolicy;
  rawDetails?: Record<string, any>;
}

export interface RecoveryPlanEstimate {
  isRecovered: boolean;
  estimatedRecoveryDt?: string;
  cooldownRemainingSec: number;
  planDescription: string;
  recommendedAction: 'WAIT_COOLDOWN' | 'TRIGGER_PROBE_PING' | 'SWITCH_FALLBACK' | 'REFILL_CREDIT';
}

/**
 * Strategy Pattern Contract for AI Model Quota Checking
 */
export interface ITokenQuotaChecker {
  readonly provider: 'GOOGLE' | 'OPENAI' | 'ANTHROPIC' | 'DEEPSEEK' | 'MANUS';
  readonly supportsDirectApi: boolean;
  readonly defaultCooldownSec: number;
  readonly resetPolicy: QuotaResetPolicy;

  /**
   * On-Demand Quota & Health Verification
   */
  checkQuota(account: AIAccount, modelId: string): Promise<QuotaCheckResult>;

  /**
   * Calculate dynamic recovery estimate & plan
   */
  getRecoveryEstimate(account: AIAccount, modelId: string): RecoveryPlanEstimate;
}
