/**
 * 🏛️ [JKADH PAT-RES-01] AI Provider Circuit Breaker Service
 * Reference: /docs/16-design-patterns-and-technical-architecture-catalog.md
 */

import { AIAccount, ModelMeta } from '../types';
import { TokenQuotaCheckerFactory } from './quotaCheckers';

export interface CircuitBreakerEvent {
  id: string;
  provider: string;
  modelId: string;
  fromState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  toState: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  reason: string;
  timestamp: string;
  cooldownUntil?: string;
  consecutiveFailures: number;
}

export interface WebhookAlertPayload {
  channel: 'SLACK' | 'DISCORD' | 'WEBHOOK_HTTP';
  event: 'CIRCUIT_OPEN' | 'CIRCUIT_RECOVERED' | 'QUOTA_EXHAUSTED' | 'QUOTA_THRESHOLD_80';
  title: string;
  provider: string;
  modelId: string;
  severity: 'INFO' | 'WARN' | 'CRITICAL';
  message: string;
  recommendedFallbackModelId?: string;
  timestamp: string;
  fields: { name: string; value: string; inline?: boolean }[];
}

export class CircuitBreakerService {
  private static instance: CircuitBreakerService;
  private readonly events: CircuitBreakerEvent[] = [];
  private readonly webhookLog: WebhookAlertPayload[] = [];
  private readonly FAILURE_THRESHOLD = 3;

  private constructor() {}

  public static getInstance(): CircuitBreakerService {
    if (!CircuitBreakerService.instance) {
      CircuitBreakerService.instance = new CircuitBreakerService();
    }
    return CircuitBreakerService.instance;
  }

  /**
   * Handle successful call
   */
  public handleSuccess(account: AIAccount, modelId: string): void {
    const prevState = account.circuitState || 'CLOSED';
    account.consecutiveFailures = 0;

    if (prevState === 'HALF_OPEN' || prevState === 'OPEN') {
      account.circuitState = 'CLOSED';
      account.status = 'HEALTHY';
      account.cooldownUntil = undefined;

      const event: CircuitBreakerEvent = {
        id: `CBE-${Date.now()}`,
        provider: account.provider,
        modelId,
        fromState: prevState,
        toState: 'CLOSED',
        reason: '헬스체크 / 트랜잭션 성공으로 정상 상태 복구 (Self-Healing)',
        timestamp: new Date().toISOString(),
        consecutiveFailures: 0,
      };
      this.events.unshift(event);

      this.sendWebhookAlert({
        channel: 'SLACK',
        event: 'CIRCUIT_RECOVERED',
        title: `[Circuit Breaker RECOVERED] ${account.provider} / ${modelId}`,
        provider: account.provider,
        modelId,
        severity: 'INFO',
        message: `서킷 브레이커가 정상 CLOSED 상태로 복구되었습니다.`,
        timestamp: new Date().toISOString(),
        fields: [
          { name: '공급자', value: account.provider, inline: true },
          { name: '복구 모델', value: modelId, inline: true },
          { name: '현재 상태', value: '🟢 CLOSED (정상 통신)', inline: true },
        ],
      });
    }
  }

  /**
   * Handle failure (429 Rate Limit, 500 Server Error)
   */
  public handleFailure(
    account: AIAccount,
    modelId: string,
    errorStatus: number = 429,
    errorMessage: string = 'Rate Limit / Quota Exceeded'
  ): { circuitOpened: boolean; fallbackModelId?: string } {
    account.consecutiveFailures = (account.consecutiveFailures || 0) + 1;
    const isRateLimit = errorStatus === 429 || errorStatus === 402;
    const shouldOpen = isRateLimit || account.consecutiveFailures >= this.FAILURE_THRESHOLD;

    if (shouldOpen && account.circuitState !== 'OPEN') {
      const checker = TokenQuotaCheckerFactory.getInstance().getChecker(account.provider);
      const cooldownSec = checker.defaultCooldownSec;
      const cooldownUntil = new Date(Date.now() + cooldownSec * 1000).toISOString();

      const prevState = account.circuitState || 'CLOSED';
      account.circuitState = 'OPEN';
      account.status = isRateLimit ? 'EXHAUSTED' : 'ERROR';
      account.cooldownUntil = cooldownUntil;

      const event: CircuitBreakerEvent = {
        id: `CBE-${Date.now()}`,
        provider: account.provider,
        modelId,
        fromState: prevState,
        toState: 'OPEN',
        reason: `${errorStatus} 에러 (${errorMessage}) - 실패 임계치 ${account.consecutiveFailures}회 도달`,
        timestamp: new Date().toISOString(),
        cooldownUntil,
        consecutiveFailures: account.consecutiveFailures,
      };
      this.events.unshift(event);

      // Webhook Alert Dispatch
      this.sendWebhookAlert({
        channel: 'SLACK',
        event: isRateLimit ? 'QUOTA_EXHAUSTED' : 'CIRCUIT_OPEN',
        title: `🚨 [Circuit Breaker OPEN] ${account.provider} (${modelId}) 장애/소진 감지`,
        provider: account.provider,
        modelId,
        severity: 'CRITICAL',
        message: `${account.provider} API가 소진/차단되어 서킷 브레이커가 OPEN 되었습니다. 차순위 모델로 자동 우회합니다.`,
        recommendedFallbackModelId: account.primaryFallbackModelId || 'gemini-1.5-pro',
        timestamp: new Date().toISOString(),
        fields: [
          { name: '오류 코드', value: `HTTP ${errorStatus}`, inline: true },
          { name: '쿨다운 대기', value: `${cooldownSec}초 (예상: ${cooldownUntil.split('T')[1].substring(0, 8)})`, inline: true },
          { name: '우회 모델', value: account.primaryFallbackModelId || 'gemini-1.5-pro', inline: true },
        ],
      });

      return {
        circuitOpened: true,
        fallbackModelId: account.primaryFallbackModelId || 'gemini-1.5-pro',
      };
    }

    return { circuitOpened: false };
  }

  /**
   * Check if circuit has cooled down and should transition to HALF_OPEN
   */
  public evaluateCooldownTransition(account: AIAccount): boolean {
    if (account.circuitState === 'OPEN' && account.cooldownUntil) {
      const now = Date.now();
      const cooldownTime = new Date(account.cooldownUntil).getTime();
      if (now >= cooldownTime) {
        account.circuitState = 'HALF_OPEN';
        this.events.unshift({
          id: `CBE-${Date.now()}`,
          provider: account.provider,
          modelId: 'ALL',
          fromState: 'OPEN',
          toState: 'HALF_OPEN',
          reason: '쿨다운 만료에 따른 HALF_OPEN 전이 (단일 프로브 핑 대기)',
          timestamp: new Date().toISOString(),
          consecutiveFailures: 0,
        });
        return true;
      }
    }
    return false;
  }

  public sendWebhookAlert(payload: WebhookAlertPayload): void {
    this.webhookLog.unshift(payload);
    // Non-blocking Webhook dispatch
    console.log(`[Circuit Breaker Webhook] ${payload.severity} [${payload.channel}] ${payload.title} -> Dispatched.`);
  }

  public getEvents(): CircuitBreakerEvent[] {
    return [...this.events];
  }

  public getWebhookLogs(): WebhookAlertPayload[] {
    return [...this.webhookLog];
  }
}
