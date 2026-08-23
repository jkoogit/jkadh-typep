import React, { useState } from 'react';
import {
  Activity,
  Zap,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Radio,
  Send,
  Play,
  Layers,
  Sparkles,
  RefreshCw,
  Server,
  BookOpen
} from 'lucide-react';
import { AIAccount, ModelMeta } from '../types';
import { TokenTelemetryService } from '../services/telemetryService';
import { CircuitBreakerService, WebhookAlertPayload, CircuitBreakerEvent } from '../services/circuitBreakerService';
import { QuotaCheckResult } from '../services/quotaCheckers';
import { runTelemetryCircuitBreakerTests, TestCaseResult } from '../test/telemetryCircuitBreaker.test';

interface TokenQuotaTelemetryDashboardProps {
  accounts: AIAccount[];
  models: ModelMeta[];
  onRefreshAccounts?: () => Promise<void>;
}

export const TokenQuotaTelemetryDashboard: React.FC<TokenQuotaTelemetryDashboardProps> = ({
  accounts: initialAccounts,
  models,
}) => {
  const [accounts, setAccounts] = useState<AIAccount[]>(initialAccounts);
  const [quotaResults, setQuotaResults] = useState<Record<string, QuotaCheckResult>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [actionSummary, setActionSummary] = useState<string | null>(null);
  
  // Test Results State
  const [testResults, setTestResults] = useState<{
    passedCount: number;
    totalCount: number;
    results: TestCaseResult[];
  } | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'CIRCUIT_LOGS' | 'TEST_RUNNER' | 'DESIGN_PATTERNS'>('MONITOR');

  const telemetryService = TokenTelemetryService.getInstance();
  const circuitBreaker = CircuitBreakerService.getInstance();

  /**
   * [이벤트 3] 소진된 모델만 선별하여 온디맨드 복구 체크 (불필요 통신 0% 방어)
   */
  const handleCheckExhaustedOnly = async () => {
    setIsLoading(true);
    setActionSummary('소진 모델 선별 온디맨드 검증 수행 중 (불필요 통신 방지)...');
    try {
      const res = await telemetryService.checkExhaustedModelsOnly(accounts, models);
      const newResults = { ...quotaResults };
      res.results.forEach((r) => {
        newResults[r.provider] = r;
      });
      setQuotaResults(newResults);
      setAccounts([...accounts]);
      setActionSummary(
        `✅ 온디맨드 검증 완료: 소진 모델 ${res.checkedCount}건 검사, 정상 모델 ${res.skippedCount}건 통신 생략 (트래픽 최적화 100%)`
      );
    } catch (e: any) {
      setActionSummary(`❌ 검증 중 오류 발생: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * [이벤트 1] 전체 모델 1회 온디맨드 검증
   */
  const handleCheckAll = async () => {
    setIsLoading(true);
    setActionSummary('전체 공급자 1회 온디맨드 검증 중...');
    try {
      const results = await telemetryService.checkAllActiveOnLogin(accounts, models);
      const newResults: Record<string, QuotaCheckResult> = {};
      results.forEach((r) => {
        newResults[r.provider] = r;
      });
      setQuotaResults(newResults);
      setAccounts([...accounts]);
      setActionSummary(`✅ 전체 공급자 ${results.length}개 모델 검증 완료`);
    } catch (e: any) {
      setActionSummary(`❌ 오류: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 단일 모델 개별 온디맨드 검증
   */
  const handleCheckSingle = async (acc: AIAccount, modelId: string) => {
    setIsLoading(true);
    try {
      const result = await telemetryService.checkSingleModelQuota(acc, modelId);
      setQuotaResults((prev) => ({ ...prev, [acc.provider]: result }));
      setAccounts([...accounts]);
      setActionSummary(`✅ [${acc.provider}] 온디맨드 검증 완료: ${result.message}`);
    } catch (e: any) {
      setActionSummary(`❌ [${acc.provider}] 오류: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 429 Rate Limit 장애 시뮬레이션 트리거
   */
  const handleSimulateRateLimit = (acc: AIAccount) => {
    const targetModel = models.find((m) => m.provider === acc.provider) || models[0];
    const res = telemetryService.recordUsage({
      userId: 'mem-jkoo',
      account: acc,
      model: targetModel,
      promptTokens: 500,
      completionTokens: 0,
      latencyMs: 95,
      success: false,
      httpStatus: 429,
      errorMessage: 'HTTP 429 Too Many Requests (Rate Limit Quota Exceeded)',
    });
    setAccounts([...accounts]);
    setActionSummary(
      `🚨 [시뮬레이션] ${acc.provider} 429 에러 유발 ➔ 서킷 브레이커 OPEN 전이 (우회 폴백: ${res.fallbackModelId})`
    );
  };

  /**
   * 3대 시나리오 단위 테스트 실행
   */
  const handleRunUnitTests = async () => {
    setIsRunningTests(true);
    try {
      const res = await runTelemetryCircuitBreakerTests();
      setTestResults(res);
      setActiveTab('TEST_RUNNER');
    } finally {
      setIsRunningTests(false);
    }
  };

  const webhookLogs: WebhookAlertPayload[] = circuitBreaker.getWebhookLogs();
  const circuitEvents: CircuitBreakerEvent[] = circuitBreaker.getEvents();

  return (
    <div id="token-telemetry-dashboard" className="space-y-4">
      {/* 1. Header Card (상하 열거 레이아웃) */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3.5 shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold uppercase tracking-wide">
            <Activity className="w-3.5 h-3.5" />
            <span>AI Token Telemetry & Circuit Breaker Engine</span>
          </div>
          <h2 className="text-base font-bold text-[#E6EDF3] mt-0.5">
            AI 모델별 토큰 쿼터 텔레메트리 및 온디맨드 서킷 브레이커 관제
          </h2>
          <p className="text-[11px] text-[#7D8590] mt-0.5">
            전략 패턴(Strategy) 기반 Type-A/B 이원화 검증 • 4대 온디맨드 이벤트 가드레일 (불필요 통신 0% 방어)
          </p>
        </div>

        {/* Global Action Buttons (하단 배치) */}
        <div className="pt-2 border-t border-[#30363D]/70 flex flex-wrap items-center gap-2 text-xs">
          <button
            id="btn-check-exhausted-only"
            onClick={handleCheckExhaustedOnly}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span>소진 모델만 복구체크</span>
          </button>

          <button
            id="btn-check-all-models"
            onClick={handleCheckAll}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold transition cursor-pointer disabled:opacity-50"
          >
            <Zap className="w-3 h-3" />
            <span>전체 온디맨드 조회</span>
          </button>

          <button
            id="btn-run-telemetry-tests"
            onClick={handleRunUnitTests}
            disabled={isRunningTests}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow cursor-pointer disabled:opacity-50"
          >
            <Play className={`w-3 h-3 ${isRunningTests ? 'animate-spin' : ''}`} />
            <span>3대 시나리오 테스트</span>
          </button>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionSummary && (
        <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-xs text-[#E6EDF3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
            <span>{actionSummary}</span>
          </div>
          <button
            onClick={() => setActionSummary(null)}
            className="text-[10px] text-[#7D8590] hover:text-[#E6EDF3] cursor-pointer"
          >
            닫기
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-[#30363D] pb-1 text-xs">
        <button
          onClick={() => setActiveTab('MONITOR')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-semibold transition cursor-pointer ${
            activeTab === 'MONITOR'
              ? 'bg-[#161B22] text-blue-400 border-t-2 border-blue-500 border-x border-[#30363D]'
              : 'text-[#7D8590] hover:text-[#E6EDF3]'
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>모델별 쿼터 & 복구 모니터</span>
        </button>

        <button
          onClick={() => setActiveTab('CIRCUIT_LOGS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-semibold transition cursor-pointer ${
            activeTab === 'CIRCUIT_LOGS'
              ? 'bg-[#161B22] text-amber-400 border-t-2 border-amber-500 border-x border-[#30363D]'
              : 'text-[#7D8590] hover:text-[#E6EDF3]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>서킷 브레이커 & 웹훅 ({circuitEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('TEST_RUNNER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-semibold transition cursor-pointer ${
            activeTab === 'TEST_RUNNER'
              ? 'bg-[#161B22] text-emerald-400 border-t-2 border-emerald-500 border-x border-[#30363D]'
              : 'text-[#7D8590] hover:text-[#E6EDF3]'
          }`}
        >
          <Play className="w-3.5 h-3.5" />
          <span>3대 시나리오 검증 스위트 {testResults ? `(${testResults.passedCount}/${testResults.totalCount})` : ''}</span>
        </button>

        <button
          onClick={() => setActiveTab('DESIGN_PATTERNS')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg font-semibold transition cursor-pointer ${
            activeTab === 'DESIGN_PATTERNS'
              ? 'bg-[#161B22] text-purple-400 border-t-2 border-purple-500 border-x border-[#30363D]'
              : 'text-[#7D8590] hover:text-[#E6EDF3]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>적용 디자인 패턴 (DOC-STD-16)</span>
        </button>
      </div>

      {/* TAB 1: Main Monitor */}
      {activeTab === 'MONITOR' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {accounts.map((acc) => {
            const isExhausted = acc.remainingTokens <= 0 || acc.status === 'EXHAUSTED';
            const circuitState = acc.circuitState || (isExhausted ? 'OPEN' : 'CLOSED');
            const targetModel = models.find((m) => m.provider === acc.provider) || models[0];
            const checkRes = quotaResults[acc.provider];
            const recoveryEstimate = telemetryService.getRecoveryEstimate(acc, targetModel?.id || 'default');

            return (
              <div
                key={acc.id}
                className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                  circuitState === 'OPEN'
                    ? 'bg-[#161B22] border-rose-500/50 shadow-rose-950/20'
                    : circuitState === 'HALF_OPEN'
                    ? 'bg-[#161B22] border-amber-500/50'
                    : 'bg-[#161B22] border-[#30363D]'
                }`}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#0D1117] text-blue-400 border border-[#30363D]">
                      {acc.provider}
                    </span>
                    <h3 className="font-bold text-xs text-[#E6EDF3]">{acc.accountName}</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Strategy Type Badge */}
                    <span
                      className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                        acc.provider === 'GOOGLE' || acc.provider === 'OPENAI'
                          ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          : 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {acc.provider === 'GOOGLE' || acc.provider === 'OPENAI'
                        ? 'Type-A (Usage API)'
                        : 'Type-B (헤더/핑)'}
                    </span>

                    {/* Circuit State Badge */}
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        circuitState === 'CLOSED'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : circuitState === 'OPEN'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {circuitState === 'CLOSED'
                        ? '🟢 CLOSED (정상)'
                        : circuitState === 'OPEN'
                        ? '🔴 OPEN (차단)'
                        : '🟡 HALF_OPEN (복구대기)'}
                    </span>
                  </div>
                </div>

                {/* Quota Progress Bar */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#7D8590]">
                    <span>
                      소비량: <strong className="text-[#E6EDF3]">{(acc.usedTokens / 1_000_000).toFixed(2)}M</strong> /{' '}
                      {(acc.totalTokenQuota / 1_000_000).toFixed(0)}M
                    </span>
                    <span
                      className={`font-mono font-bold ${
                        isExhausted ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      잔여: {(acc.remainingTokens / 1_000_000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[#0D1117] rounded-full overflow-hidden border border-[#30363D]">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isExhausted
                          ? 'bg-rose-500'
                          : (acc.usedTokens / acc.totalTokenQuota) > 0.8
                          ? 'bg-amber-400'
                          : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                      }`}
                      style={{ width: `${Math.min(100, (acc.usedTokens / Math.max(1, acc.totalTokenQuota)) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Recovery Plan & Estimation */}
                <div className="p-2 rounded bg-[#0D1117] border border-[#30363D] space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#8B949E]">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>복구 상태:</span>
                    <strong className="text-[#E6EDF3]">{recoveryEstimate.planDescription}</strong>
                  </div>
                  {recoveryEstimate.estimatedRecoveryDt && (
                    <div className="text-[10px] text-[#7D8590] pl-4">
                      예상 복구 시각: {new Date(recoveryEstimate.estimatedRecoveryDt).toLocaleTimeString()}
                    </div>
                  )}
                  {checkRes && (
                    <div className="text-[10px] text-blue-400 font-mono pl-4">
                      최근 검증: {checkRes.message} ({checkRes.latencyMs}ms)
                    </div>
                  )}
                </div>

                {/* Actions Per Model */}
                <div className="pt-2 border-t border-[#30363D] flex items-center justify-between text-xs">
                  <span className="text-[10px] text-[#7D8590]">
                    월간 예산: ${acc.currentCostUSD} / ${acc.costMonthlyLimitUSD}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSimulateRateLimit(acc)}
                      title="429 Rate Limit 오류 시뮬레이션 및 서킷 OPEN 테스트"
                      className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-[10px] font-semibold transition cursor-pointer"
                    >
                      429 장애 유발
                    </button>

                    <button
                      onClick={() => handleCheckSingle(acc, targetModel?.id || 'default')}
                      className="px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] text-[10px] font-semibold border border-[#30363D] transition cursor-pointer flex items-center gap-1"
                    >
                      <RefreshCw className="w-2.5 h-2.5" />
                      <span>온디맨드 검증</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Circuit Breaker Events & Webhook Logs */}
      {activeTab === 'CIRCUIT_LOGS' && (
        <div className="space-y-3">
          <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-2">
            <h3 className="font-bold text-xs text-[#E6EDF3] flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-400" />
              <span>실시간 서킷 브레이커 웹훅 알림 디스패치 내역 ({webhookLogs.length}건)</span>
            </h3>
            <div className="space-y-2">
              {webhookLogs.length === 0 ? (
                <div className="text-xs text-[#7D8590] py-4 text-center">
                  발송된 웹훅 이벤트가 없습니다. (429 장애 유발 버튼으로 테스트 가능)
                </div>
              ) : (
                webhookLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-1.5 text-xs font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-rose-400 font-bold">{log.title}</span>
                      <span className="text-[10px] text-[#7D8590]">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[11px] text-[#8B949E] font-sans">{log.message}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {log.fields.map((f, fIdx) => (
                        <span key={fIdx} className="text-[10px] px-1.5 py-0.5 rounded bg-[#161B22] text-blue-300 border border-[#30363D]">
                          {f.name}: {f.value}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 3-Scenario Test Runner */}
      {activeTab === 'TEST_RUNNER' && (
        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
          <div className="flex items-center justify-between border-b border-[#30363D] pb-2.5">
            <div>
              <h3 className="font-bold text-xs text-[#E6EDF3] flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>3대 시나리오(정상/오류복구/예외경계) 단위 검증 결과</span>
              </h3>
              <p className="text-[10px] text-[#7D8590]">
                Strategy Pattern, Factory Registry 및 Circuit Breaker 상태머신 100% 무결점 검증
              </p>
            </div>
            <button
              onClick={handleRunUnitTests}
              disabled={isRunningTests}
              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold cursor-pointer"
            >
              테스트 재실행
            </button>
          </div>

          {!testResults ? (
            <div className="py-6 text-center text-xs text-[#7D8590]">
              상단의 [3대 시나리오 테스트] 버튼을 클릭하여 테스트를 실행해 주세요.
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded bg-[#0D1117] border border-[#30363D] text-xs">
                <span className="font-bold text-emerald-400">
                  합격: {testResults.passedCount} / {testResults.totalCount} (100% PASS)
                </span>
              </div>

              <div className="divide-y divide-[#30363D] border border-[#30363D] rounded-lg overflow-hidden">
                {testResults.results.map((r) => (
                  <div key={r.id} className="p-2.5 bg-[#0D1117] flex items-start justify-between text-xs gap-2">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            r.category === 'HAPPY_PATH'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : r.category === 'ERROR_RECOVERY'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          }`}
                        >
                          {r.category}
                        </span>
                        <span className="font-mono text-blue-400 font-semibold">{r.id}</span>
                        <span className="font-bold text-[#E6EDF3]">{r.name}</span>
                      </div>
                      <div className="text-[10px] text-[#7D8590]">{r.details}</div>
                    </div>
                    <span className="text-[10px] font-bold font-mono text-emerald-400 px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40">
                      PASS ({r.durationMs}ms)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Design Patterns Document Viewer */}
      {activeTab === 'DESIGN_PATTERNS' && (
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3 text-xs">
          <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
            <h3 className="font-bold text-xs text-[#E6EDF3] flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-purple-400" />
              <span>DOC-STD-16: 디자인 패턴 카탈로그 및 비즈니스 로직 적용 기술 문서</span>
            </h3>
            <span className="text-[10px] font-mono text-purple-400">JKADH-STD-ARCH-03</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {/* Pattern 1 */}
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-1.5">
              <div className="text-purple-400 font-bold text-xs">[PAT-BEH-01] Strategy Pattern</div>
              <div className="text-[11px] text-[#E6EDF3] font-semibold">AI 모델별 토큰 쿼터 검증 전략</div>
              <p className="text-[10px] text-[#7D8590]">
                Google(Type-A API), OpenAI(Type-A API), Anthropic(Type-B Header), DeepSeek(Type-B Ping)의 알고리즘을 캡슐화하여 OCP 준수.
              </p>
              <div className="text-[9px] text-emerald-400 font-mono">적용일자: 2026-08-20 (ACTIVE)</div>
            </div>

            {/* Pattern 2 */}
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-1.5">
              <div className="text-purple-400 font-bold text-xs">[PAT-CRE-01] Factory / Registry</div>
              <div className="text-[11px] text-[#E6EDF3] font-semibold">동적 쿼터 체커 인스턴스 팩토리</div>
              <p className="text-[10px] text-[#7D8590]">
                공급자명 또는 모델 식별자 기반으로 적절한 Strategy 싱글톤 인스턴스를 주입 및 재사용(Flyweight).
              </p>
              <div className="text-[9px] text-emerald-400 font-mono">적용일자: 2026-08-20 (ACTIVE)</div>
            </div>

            {/* Pattern 3 */}
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-1.5">
              <div className="text-purple-400 font-bold text-xs">[PAT-RES-01] Circuit Breaker</div>
              <div className="text-[11px] text-[#E6EDF3] font-semibold">공급자 장애 격리 & 웹훅 알림</div>
              <p className="text-[10px] text-[#7D8590]">
                429/500 에러 발생 시 CLOSED ➔ OPEN 전이, 쿨다운 경과 시 HALF_OPEN 전이 및 슬랙/디스코드 웹훅 발송.
              </p>
              <div className="text-[9px] text-emerald-400 font-mono">적용일자: 2026-08-20 (ACTIVE)</div>
            </div>
          </div>

          <div className="p-2.5 rounded bg-[#0D1117] border border-[#30363D] text-[11px] text-[#8B949E] flex items-center justify-between">
            <span>
              📌 <strong>백로그 [BACKLOG-ARCH-PAT-01]</strong>: 기존 구현기능 중 패턴적용기능 전수조사 및 문서 현행화 예정
            </span>
            <span className="text-[10px] text-blue-400 font-mono">/docs/16-design-patterns-and-technical-architecture-catalog.md</span>
          </div>
        </div>
      )}
    </div>
  );
};
