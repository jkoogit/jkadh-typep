import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Code2,
  Database,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Bug,
  Check,
  Terminal,
  Activity,
  Award,
  ListChecks,
  Lock,
  Flame,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import { ModelMeta, TaskGraphNode } from '../types';
import { VibeRunnerEngine } from '../services/VibeRunnerEngine';
import { AstValidator } from '../services/AstValidator';
import { SecOpsEngine } from '../services/SecOpsEngine';
import { VibePhaseExecutionResult, FipsSecOpsReport } from '../types/vibeRunner';
import { runHarnessCliUnitTests, HarnessCliTestResult } from '../test/harnessCli.test';
import { runSecOpsAutoHealingUnitTests, SecOpsTestScenarioResult } from '../test/secopsAutoHealing.test';

interface VibeRunnerSandboxProps {
  tasks: TaskGraphNode[];
  models: ModelMeta[];
  defaultTaskId?: string;
}

const SECOPS_PRESETS = {
  CLEAN: `// [Happy Path] FIPS-140-3 3단계 보안 규정 및 6대 감사 컬럼 완비 클린 코드
import { db } from '../db';

export interface UserAccount {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_deleted: boolean;
  version: number;
}

export async function getUserById(userId: string): Promise<UserAccount | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}`,
  SECRET_LEAK: `// [Error] Level 1: 하드코딩된 API Key 노출 결함
export async function generateContent(prompt: string) {
  const claudeKey = "sk-ant-api03-abcdef1234567890abcdef1234567890";
  const geminiKey = "AIzaSyD1234567890AbcdefGhijklMnopQrstu";
  return { claudeKey, geminiKey, prompt };
}`,
  SQLI_AND_AUDIT: `// [Error] Level 2 SQL Injection + Level 3 6대 감사 컬럼 누락
export interface CustomerProfile {
  id: string;
  name: string;
}

export async function fetchCustomerData(customerId: string) {
  const apiKey = "sk-ant-api03-abcdef1234567890abcdef1234567890";
  const query = "SELECT * FROM users WHERE id = '" + customerId + "'";
  return query;
}`,
  DESTRUCTIVE_ATTACK: `// [Edge Bounds] Level 3: 파괴적 DDL 쿼리 (즉시 실행 차단 및 롤백)
export async function dangerousWipeData() {
  const destructiveQuery = "DROP TABLE users CASCADE;";
  return destructiveQuery;
}`,
};

export const VibeRunnerSandbox: React.FC<VibeRunnerSandboxProps> = ({
  tasks,
  models,
  defaultTaskId,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    defaultTaskId || tasks.find((t) => t.code === 'PLAT-SECOPS-12')?.id || tasks[0]?.id
  );
  const [activeTab, setActiveTab] = useState<'RUNNER' | 'FIPS_SECOPS' | 'AST_CHECKER' | 'UNIT_TESTS'>('FIPS_SECOPS');
  const [isExecutingAll, setIsExecutingAll] = useState<boolean>(false);
  const [currentRunningPhase, setCurrentRunningPhase] = useState<number | null>(null);
  const [phaseResults, setPhaseResults] = useState<Record<number, VibePhaseExecutionResult>>({});
  const [forceFallback, setForceFallback] = useState<boolean>(false);
  const [testCategoryFilter, setTestCategoryFilter] = useState<'ALL' | '정상' | '예외' | '오류' | 'SECOPS'>('ALL');
  const [harnessTests, setHarnessTests] = useState<HarnessCliTestResult[]>(() => runHarnessCliUnitTests());
  const [secOpsTests, setSecOpsTests] = useState<SecOpsTestScenarioResult[]>(() => runSecOpsAutoHealingUnitTests());

  // SecOps Playground State
  const [secOpsCode, setSecOpsCode] = useState<string>(SECOPS_PRESETS.SQLI_AND_AUDIT);
  const [secOpsReport, setSecOpsReport] = useState<FipsSecOpsReport>(() =>
    SecOpsEngine.audit(SECOPS_PRESETS.SQLI_AND_AUDIT, { isDbSchema: true })
  );
  const [healedDiffSummary, setHealedDiffSummary] = useState<string[]>([]);
  const [isAutoHealingTriggered, setIsAutoHealingTriggered] = useState<boolean>(false);

  // AST Direct Playground state
  const [customCode, setCustomCode] = useState<string>(`// JKADH Platform Component AST Verification Example
import React, { useState } from 'react';

export interface VibeTelemetryState {
  id: string;
  task_code: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_deleted: boolean;
  version: number;
}

export class VibeAstValidatorEngine {
  private count: number = 0;

  public executeTask(): boolean {
    return true;
  }
}
`);
  const [astValidationReport, setAstValidationReport] = useState(
    AstValidator.validate(customCode, { isDbSchema: true })
  );

  const currentTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  // Re-run unit tests
  const handleRerunTests = () => {
    setHarnessTests(runHarnessCliUnitTests());
    setSecOpsTests(runSecOpsAutoHealingUnitTests());
  };

  // Execute single phase
  const handleRunSinglePhase = async (phaseNum: number) => {
    setCurrentRunningPhase(phaseNum);
    try {
      const res = await VibeRunnerEngine.executePhase({
        task: currentTask,
        phaseNumber: phaseNum,
        models,
        forceFallback,
      });
      setPhaseResults((prev) => ({ ...prev, [phaseNum]: res }));
    } catch (e) {
      console.error(e);
    } finally {
      setCurrentRunningPhase(null);
    }
  };

  // Run all 7 phases sequentially
  const handleRunAll7Phases = async () => {
    setIsExecutingAll(true);
    setPhaseResults({});
    try {
      for (let p = 1; p <= 7; p++) {
        setCurrentRunningPhase(p);
        const res = await VibeRunnerEngine.executePhase({
          task: currentTask,
          phaseNumber: p,
          models,
          forceFallback: p === 4 && forceFallback,
        });
        setPhaseResults((prev) => ({ ...prev, [p]: res }));
        await new Promise((r) => setTimeout(r, 200));
      }
    } finally {
      setIsExecutingAll(false);
      setCurrentRunningPhase(null);
    }
  };

  // Handle SecOps Code Change
  const handleSecOpsCodeChange = (text: string) => {
    setSecOpsCode(text);
    setIsAutoHealingTriggered(false);
    setHealedDiffSummary([]);
    const report = SecOpsEngine.audit(text, { isDbSchema: true });
    setSecOpsReport(report);
  };

  // Load Preset
  const handleLoadPreset = (key: keyof typeof SECOPS_PRESETS) => {
    const code = SECOPS_PRESETS[key];
    setSecOpsCode(code);
    setIsAutoHealingTriggered(false);
    setHealedDiffSummary([]);
    const report = SecOpsEngine.audit(code, { isDbSchema: true });
    setSecOpsReport(report);
  };

  // Trigger 1-Turn Auto-Healing
  const handleTriggerAutoHealing = () => {
    const outcome = SecOpsEngine.autoHeal(secOpsCode, secOpsReport, { isDbSchema: true });
    setSecOpsCode(outcome.healedCode);
    setSecOpsReport(outcome.report);
    setIsAutoHealingTriggered(true);
    setHealedDiffSummary(outcome.report.autoHealingDetails?.diffSummary || []);
  };

  // Trigger real-time AST check on code edit
  const handleCustomCodeChange = (text: string) => {
    setCustomCode(text);
    const rep = AstValidator.validate(text, { isDbSchema: true, isTestFile: false });
    setAstValidationReport(rep);
  };

  const totalTokens = Object.values(phaseResults).reduce((acc, cur) => acc + cur.tokensConsumed, 0);
  const totalDuration = Object.values(phaseResults).reduce((acc, cur) => acc + cur.durationMs, 0);
  const avgScore =
    Object.values(phaseResults).length > 0
      ? Math.round(
          Object.values(phaseResults).reduce((acc, cur) => acc + cur.outputArtifact.gatekeeperScore, 0) /
            Object.values(phaseResults).length
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Bar */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#E6EDF3] flex items-center gap-2">
                실시간 7-Phase Vibe Runner 샌드박스 & FIPS-140-3 3단계 보안 감사기
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-500/20 text-pink-300 font-mono border border-pink-500/30">
                  PLAT-SECOPS-12
                </span>
              </h2>
              <p className="text-xs text-[#7D8590] mt-0.5">
                FIPS-140-3 3단계 정적 AST 보안 감사, 위험 토큰 실시간 탐지 및 1턴 자율 치유(Auto-Healing) 엔진
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-t border-[#30363D] pt-3">
          <div className="flex items-center gap-1 bg-[#0D1117] p-1 rounded-lg border border-[#30363D]">
            <button
              onClick={() => setActiveTab('FIPS_SECOPS')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'FIPS_SECOPS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#7D8590] hover:text-[#E6EDF3]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              FIPS-140-3 보안 & Auto-Healing
            </button>
            <button
              onClick={() => setActiveTab('RUNNER')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'RUNNER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#7D8590] hover:text-[#E6EDF3]'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              7-Phase 순환 실행기
            </button>
            <button
              onClick={() => setActiveTab('AST_CHECKER')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'AST_CHECKER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#7D8590] hover:text-[#E6EDF3]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              AST 무결점 분석기
            </button>
            <button
              onClick={() => setActiveTab('UNIT_TESTS')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'UNIT_TESTS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#7D8590] hover:text-[#E6EDF3]'
              }`}
            >
              <ListChecks className="w-3.5 h-3.5" />
              3대 시나리오 테스트 카탈로그
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'FIPS_SECOPS' ? (
        /* FIPS-140-3 3-Level SecOps & Auto-Healing View */
        <div className="space-y-4">
          {/* Level 1/2/3 Status Header Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#7D8590] uppercase">FIPS 종합 준수 점수</span>
                <Award className="w-4 h-4 text-yellow-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-2xl font-black font-mono ${
                    secOpsReport.fipsScore === 100
                      ? 'text-emerald-400'
                      : secOpsReport.fipsScore >= 70
                      ? 'text-amber-400'
                      : 'text-red-400'
                  }`}
                >
                  {secOpsReport.fipsScore}
                </span>
                <span className="text-xs text-[#7D8590]">/ 100점</span>
              </div>
              <span className="text-[10px] text-[#8B949E] block">
                {secOpsReport.isCompliant ? '✓ 게이트키퍼 통과 승인' : '⚠ 보안 결함 탐지 (조치 필요)'}
              </span>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#7D8590] uppercase">Level 1: Secret Vault</span>
                <Lock className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-sm font-bold">
                {secOpsReport.level1SecretScanPassed ? (
                  <span className="text-emerald-400 flex items-center gap-1">✓ 무결점 (No Leaks)</span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">✕ API Key 노출 검출</span>
                )}
              </div>
              <span className="text-[10px] text-[#8B949E] block">Anthropic / OpenAI / Gemini / AWS 키 탐지</span>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#7D8590] uppercase">Level 2: Injection 방어</span>
                <Flame className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-sm font-bold">
                {secOpsReport.level2InjectionScanPassed ? (
                  <span className="text-emerald-400 flex items-center gap-1">✓ 방어 통과 ($1 바인딩)</span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1">⚠ 원시 SQL 결합 검출</span>
                )}
              </div>
              <span className="text-[10px] text-[#8B949E] block">Prepared Statement & eval() 검사</span>
            </div>

            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#7D8590] uppercase">Level 3: Governance DDL</span>
                <ShieldAlert className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-sm font-bold">
                {secOpsReport.isBlocked ? (
                  <span className="text-red-400 font-bold flex items-center gap-1">🚨 파괴적 DDL 차단됨</span>
                ) : secOpsReport.level3GovernancePassed ? (
                  <span className="text-emerald-400 flex items-center gap-1">✓ 6대 감사 컬럼 완비</span>
                ) : (
                  <span className="text-purple-300 flex items-center gap-1">⚠ 감사 컬럼 누락</span>
                )}
              </div>
              <span className="text-[10px] text-[#8B949E] block">DROP 차단 & 6대 공통 감사 컬럼</span>
            </div>
          </div>

          {/* Main SecOps Editor & Findings Pane */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Code Editor with Presets */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                <h3 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-blue-400" />
                  FIPS 보안 감사 대상 소스코드
                </h3>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">
                  {secOpsReport.sha256Signature.slice(0, 20)}...
                </span>
              </div>

              {/* Preset Selector */}
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <span className="text-[#7D8590] self-center mr-1">시나리오 프리셋:</span>
                <button
                  onClick={() => handleLoadPreset('CLEAN')}
                  className="px-2 py-1 rounded bg-[#0D1117] hover:bg-[#21262D] text-[#E6EDF3] border border-[#30363D] transition cursor-pointer"
                >
                  1. 정상 (Happy 100점)
                </button>
                <button
                  onClick={() => handleLoadPreset('SECRET_LEAK')}
                  className="px-2 py-1 rounded bg-[#0D1117] hover:bg-[#21262D] text-red-300 border border-red-800/40 transition cursor-pointer"
                >
                  2. API Key 노출 (Leak)
                </button>
                <button
                  onClick={() => handleLoadPreset('SQLI_AND_AUDIT')}
                  className="px-2 py-1 rounded bg-[#0D1117] hover:bg-[#21262D] text-amber-300 border border-amber-800/40 transition cursor-pointer"
                >
                  3. SQLi & 감사컬럼 결함
                </button>
                <button
                  onClick={() => handleLoadPreset('DESTRUCTIVE_ATTACK')}
                  className="px-2 py-1 rounded bg-[#0D1117] hover:bg-[#21262D] text-purple-300 border border-purple-800/40 transition cursor-pointer"
                >
                  4. 악성 DROP 차단
                </button>
              </div>

              <textarea
                rows={14}
                value={secOpsCode}
                onChange={(e) => handleSecOpsCodeChange(e.target.value)}
                className="w-full p-3 rounded-lg bg-[#0D1117] border border-[#30363D] font-mono text-xs text-[#E6EDF3] focus:ring-1 focus:ring-blue-500 leading-relaxed"
              />

              {/* Auto-Healing Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-[#30363D]">
                <span className="text-[11px] text-[#7D8590]">
                  {isAutoHealingTriggered
                    ? '✓ 1턴 Auto-Healing 자율 치유가 성공적으로 적용되었습니다.'
                    : secOpsReport.findings.some((f) => f.autoHealable)
                    ? '⚠ 자동 치유 가능한 보안 취약점이 검출되었습니다.'
                    : '안전한 코드입니다.'}
                </span>

                <button
                  onClick={handleTriggerAutoHealing}
                  disabled={!secOpsReport.findings.some((f) => f.autoHealable) || isAutoHealingTriggered}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                    secOpsReport.findings.some((f) => f.autoHealable) && !isAutoHealingTriggered
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-md'
                      : 'bg-[#21262D] text-[#7D8590] cursor-not-allowed border border-[#30363D]'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5" />
                  1턴 Auto-Healing 자율 치유 실행
                </button>
              </div>
            </div>

            {/* Right: SecOps Findings & Auto-Healing Diff */}
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
                  <h3 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    FIPS-140-3 3단계 감사 결과 및 탐지 목록 ({secOpsReport.findings.length}건)
                  </h3>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      secOpsReport.isBlocked
                        ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                        : secOpsReport.isCompliant
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {secOpsReport.isBlocked ? 'EXECUTION BLOCKED' : secOpsReport.isCompliant ? 'FIPS PASSED' : 'VULNERABLE'}
                  </span>
                </div>

                {/* Block Alert if any */}
                {secOpsReport.isBlocked && (
                  <div className="p-3 rounded-lg bg-red-950/40 border border-red-800/60 text-xs space-y-1">
                    <span className="font-bold text-red-400 flex items-center gap-1">
                      <ShieldAlert className="w-4 h-4" /> 🚨 치명적 파괴 쿼리 차단 안내
                    </span>
                    <p className="text-red-200 text-[11px]">{secOpsReport.blockReason}</p>
                  </div>
                )}

                {/* Auto-Healing Diff Summary if applied */}
                {healedDiffSummary.length > 0 && (
                  <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/50 text-xs space-y-1.5">
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> 1턴 Auto-Healing 자율 리팩토링 내역:
                    </span>
                    <ul className="space-y-1 text-[11px] text-emerald-200 pl-4 list-disc">
                      {healedDiffSummary.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Findings List */}
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {secOpsReport.findings.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#7D8590] border border-dashed border-[#30363D] rounded-lg">
                      <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                      FIPS-140-3 3단계 보안 감사 100점 만점 통과입니다. 검출된 취약점이 없습니다.
                    </div>
                  ) : (
                    secOpsReport.findings.map((f) => (
                      <div
                        key={f.id}
                        className={`p-3 rounded-lg border text-xs space-y-1 ${
                          f.severity === 'CRITICAL'
                            ? 'bg-red-950/20 border-red-800/40'
                            : f.severity === 'HIGH'
                            ? 'bg-amber-950/20 border-amber-800/40'
                            : 'bg-purple-950/20 border-purple-800/40'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold text-[11px] ${
                              f.severity === 'CRITICAL'
                                ? 'text-red-400'
                                : f.severity === 'HIGH'
                                ? 'text-amber-400'
                                : 'text-purple-300'
                            }`}
                          >
                            [Level {f.level}] {f.ruleId}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-black/40 text-[#E6EDF3]">
                            {f.severity}
                          </span>
                        </div>
                        <p className="text-[#E6EDF3] text-[11px]">{f.description}</p>
                        {f.healingStrategy && (
                          <div className="text-[10px] text-[#7D8590] pt-1 border-t border-[#30363D]/40 font-mono">
                            치유 전략: {f.healingStrategy}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* FIPS Seal Metadata */}
              <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[10px] font-mono text-[#7D8590] flex items-center justify-between">
                <span>FIPS-140-3 Audit Seal</span>
                <span className="text-blue-400 font-bold">{secOpsReport.sha256Signature}</span>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 'RUNNER' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left Panel: Target Task & Run Controls */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-4">
              <h3 className="text-xs font-bold text-[#E6EDF3] uppercase tracking-wider text-[#7D8590]">
                대상 작업 노드 선택
              </h3>

              <div className="space-y-2">
                <select
                  value={selectedTaskId}
                  onChange={(e) => {
                    setSelectedTaskId(e.target.value);
                    setPhaseResults({});
                  }}
                  className="w-full p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] text-xs font-medium focus:ring-1 focus:ring-blue-500 cursor-pointer"
                >
                  {tasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.code}] {t.title}
                    </option>
                  ))}
                </select>

                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] text-xs space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#7D8590]">모듈 / 위험도:</span>
                    <span className="font-mono text-indigo-400 font-bold">{currentTask.module} / {currentTask.riskLevel}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#7D8590]">타겟 브랜치:</span>
                    <span className="font-mono text-emerald-400 font-bold">{currentTask.gitBranch || 'task/fips-secops-autohealing'}</span>
                  </div>
                  <p className="text-[11px] text-[#8B949E] pt-1 border-t border-[#21262D] leading-relaxed">
                    {currentTask.description}
                  </p>
                </div>
              </div>

              {/* Simulation Options */}
              <div className="space-y-3 pt-2 border-t border-[#30363D]">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-950/20 border border-amber-800/40">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-[#E6EDF3] block">서킷 브레이커 장애 주입</span>
                      <span className="text-[10px] text-[#7D8590]">Phase 4에서 429 에러 발생 시 차순위 핫스왑</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={forceFallback}
                    onChange={(e) => setForceFallback(e.target.checked)}
                    className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleRunAll7Phases}
                  disabled={isExecutingAll}
                  className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition ${
                    isExecutingAll
                      ? 'bg-blue-600/50 text-blue-200 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white cursor-pointer shadow-md'
                  }`}
                >
                  {isExecutingAll ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      7-Phase 오케스트레이션 순환 실행 중...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      7-Phase 전체 순차 실행 (시뮬레이션)
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Execution Metrics Summary */}
            {Object.keys(phaseResults).length > 0 && (
              <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-blue-400" />
                  실행 세션 텔레메트리
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-[#0D1117] border border-[#30363D]">
                    <span className="text-[10px] text-[#7D8590] block">총 소요 시간</span>
                    <span className="font-mono text-xs font-bold text-blue-400">{totalDuration}ms</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0D1117] border border-[#30363D]">
                    <span className="text-[10px] text-[#7D8590] block">총 토큰 소비</span>
                    <span className="font-mono text-xs font-bold text-pink-400">{totalTokens.toLocaleString()}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#0D1117] border border-[#30363D]">
                    <span className="text-[10px] text-[#7D8590] block">평균 게이트 점수</span>
                    <span className="font-mono text-xs font-bold text-emerald-400">{avgScore} / 100</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel: 7-Phase Timeline Cards */}
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
              const res = phaseResults[pNum];
              const isRunning = currentRunningPhase === pNum;
              const phaseInfo = currentTask.phases.find((p) => p.phaseNumber === pNum) || currentTask.phases[0];

              return (
                <div
                  key={pNum}
                  className={`bg-[#161B22] border rounded-xl p-4 transition ${
                    isRunning
                      ? 'border-blue-500 shadow-blue-500/10 shadow-lg'
                      : res
                      ? 'border-[#30363D]'
                      : 'border-[#21262D] opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-[#0D1117] border border-[#30363D] flex items-center justify-center font-mono text-xs font-bold text-[#7D8590]">
                        0{pNum}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-2">
                          {phaseInfo?.nameKr || `Phase 0${pNum}`}
                          {res?.isFallbackTriggered && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              서킷 브레이커 핫스왑 발동
                            </span>
                          )}
                        </h4>
                        <span className="text-[10px] font-mono text-[#7D8590]">
                          {phaseInfo?.assignedModelId || 'claude-3-7-sonnet'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {res && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          {res.outputArtifact.gatekeeperScore}점 통과
                        </span>
                      )}
                      <button
                        onClick={() => handleRunSinglePhase(pNum)}
                        disabled={isRunning || isExecutingAll}
                        className="px-2.5 py-1 rounded bg-[#0D1117] hover:bg-[#21262D] text-[#E6EDF3] border border-[#30363D] text-[11px] font-medium transition cursor-pointer"
                      >
                        {isRunning ? '실행 중...' : '단독 실행'}
                      </button>
                    </div>
                  </div>

                  {/* Artifact & Ast Report Preview if completed */}
                  {res && (
                    <div className="mt-3 pt-3 border-t border-[#21262D] text-xs space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-[#7D8590]">
                        <span>소요: {res.durationMs}ms | 소비: {res.tokensConsumed.toLocaleString()} Tokens</span>
                        <span className="font-mono text-emerald-400">{res.savepointName}</span>
                      </div>
                      <p className="text-[11px] text-[#8B949E]">{res.outputArtifact.description}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'AST_CHECKER' ? (
        /* AST Direct Code Checker View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
              <h3 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-blue-400" />
                TypeScript 코드 실시간 AST 에디터
              </h3>
              <span className="text-[10px] font-mono text-[#7D8590]">실시간 구문 트리 파싱</span>
            </div>
            <textarea
              rows={16}
              value={customCode}
              onChange={(e) => handleCustomCodeChange(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#0D1117] border border-[#30363D] font-mono text-xs text-[#E6EDF3] focus:ring-1 focus:ring-blue-500 leading-relaxed"
            />
          </div>

          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
              <h3 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                AST 정적 검증 및 거버넌스 진단 리포트
              </h3>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  astValidationReport.isValid
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-red-500/20 text-red-300 border border-red-500/30'
                }`}
              >
                {astValidationReport.isValid ? 'PASSED (100% 무결점)' : 'FAILED (결함 탐지)'}
              </span>
            </div>

            {/* Diagnostics List */}
            <div className="space-y-3 text-xs">
              {astValidationReport.syntaxErrors.length > 0 && (
                <div className="p-3 rounded-lg bg-red-950/20 border border-red-800/40 space-y-1">
                  <span className="font-bold text-red-400 text-xs block">구문 에러 (Syntax Errors):</span>
                  {astValidationReport.syntaxErrors.map((err, i) => (
                    <div key={i} className="text-red-300 text-[11px] font-mono pl-2">
                      • {err}
                    </div>
                  ))}
                </div>
              )}

              {astValidationReport.typeErrors.length > 0 && (
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 space-y-1">
                  <span className="font-bold text-amber-400 text-xs block">
                    타입 엄격성 결함 (Strict Type Violations):
                  </span>
                  {astValidationReport.typeErrors.map((err, i) => (
                    <div key={i} className="text-amber-300 text-[11px] font-mono pl-2">
                      • {err}
                    </div>
                  ))}
                </div>
              )}

              {/* Checklist */}
              <div className="space-y-2 p-3 rounded-lg bg-[#0D1117] border border-[#30363D]">
                <span className="font-bold text-[#E6EDF3] text-xs block mb-2">JKADH 거버넌스 룰체크</span>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#7D8590]">6대 감사 컬럼 포함 여부:</span>
                  <span className={astValidationReport.hasAuditColumns ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                    {astValidationReport.hasAuditColumns ? '✓ 완비됨' : '⚠ 누락'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#7D8590]">any 타입 사용 금지:</span>
                  <span
                    className={
                      astValidationReport.typeErrors.length === 0
                        ? 'text-emerald-400 font-bold'
                        : 'text-red-400 font-bold'
                    }
                  >
                    {astValidationReport.typeErrors.length === 0 ? '✓ 충족 (No any)' : '✕ 위반 (any 검출)'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-[#7D8590]">AST 복잡도 점수:</span>
                  <span className="text-blue-400 font-mono font-bold">{astValidationReport.complexityScore} / 100</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* UNIT_TESTS Catalog View */
        <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#30363D] pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2">
                <ListChecks className="w-4 h-4 text-blue-400" />
                하네스 6대 라이프사이클 & FIPS-140-3 3대 시나리오 테스트 카탈로그
              </h3>
              <p className="text-xs text-[#7D8590] mt-0.5">
                정상(Happy Path), 1턴 자율치유(Auto-Healing), 예외경계(Edge Bounds) 단위 테스트
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-[#0D1117] p-1 rounded-lg border border-[#30363D] text-[11px]">
                {(['ALL', 'SECOPS', '정상', '오류', '예외'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTestCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                      testCategoryFilter === cat
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-[#7D8590] hover:text-[#E6EDF3]'
                    }`}
                  >
                    {cat === 'ALL' ? '전체' : cat}
                  </button>
                ))}
              </div>

              <button
                onClick={handleRerunTests}
                className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                테스트 재실행
              </button>
            </div>
          </div>

          {/* SecOps 3-Scenario Tests Section */}
          {(testCategoryFilter === 'ALL' || testCategoryFilter === 'SECOPS') && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" /> [PLAT-SECOPS-12] FIPS-140-3 & Auto-Healing 3대 시나리오 테스트
              </h4>
              <div className="overflow-x-auto border border-[#30363D] rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0D1117] text-[#7D8590] border-b border-[#30363D] text-[11px] font-mono">
                      <th className="py-2.5 px-3">테스트ID</th>
                      <th className="py-2.5 px-3">시나리오</th>
                      <th className="py-2.5 px-3">대상 룰셋</th>
                      <th className="py-2.5 px-3">테스트 명세 & 검증 결과</th>
                      <th className="py-2.5 px-3 text-center">점수 변화</th>
                      <th className="py-2.5 px-3 text-center">결과</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262D]">
                    {secOpsTests.map((st) => (
                      <tr key={st.testId} className="hover:bg-[#1C2128] transition">
                        <td className="py-2.5 px-3 font-mono font-bold text-pink-400">{st.testId}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              st.scenario.includes('Happy')
                                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                : st.scenario.includes('Auto-Healing')
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                            }`}
                          >
                            {st.scenario}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-cyan-300 text-[11px]">{st.targetRule}</td>
                        <td className="py-2.5 px-3 max-w-sm">
                          <div className="font-medium text-[#E6EDF3] leading-snug">{st.description}</div>
                          <div className="text-[10px] text-[#7D8590] mt-0.5 font-mono">{st.details}</div>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-xs">
                          {st.initialScore}점 ➔ <span className="text-emerald-400">{st.finalScore}점</span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            <Check className="w-3 h-3" /> PASS
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Harness CLI Tests Table */}
          {testCategoryFilter !== 'SECOPS' && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> 하네스 거버넌스 CLI 3대 시나리오 테스트
              </h4>
              <div className="overflow-x-auto border border-[#30363D] rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#0D1117] text-[#7D8590] border-b border-[#30363D] text-[11px] uppercase font-mono">
                      <th className="py-2.5 px-3">테스트ID</th>
                      <th className="py-2.5 px-3">구분</th>
                      <th className="py-2.5 px-3">태스크ID</th>
                      <th className="py-2.5 px-3">테스트대상</th>
                      <th className="py-2.5 px-3">테스트내용 & 세부결과</th>
                      <th className="py-2.5 px-3 text-center">결과</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#21262D]">
                    {harnessTests
                      .filter((tc) => testCategoryFilter === 'ALL' || tc.category.includes(testCategoryFilter))
                      .map((tc) => (
                        <tr key={tc.testId} className="hover:bg-[#1C2128] transition">
                          <td className="py-2.5 px-3 font-mono font-bold text-blue-400">{tc.testId}</td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                tc.category.includes('정상')
                                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                                  : tc.category.includes('오류')
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                              }`}
                            >
                              {tc.category}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 text-[11px]">{tc.taskId}</td>
                          <td className="py-2.5 px-3 font-mono text-cyan-300 text-[11px]">{tc.target}</td>
                          <td className="py-2.5 px-3 max-w-xs">
                            <div className="font-medium text-[#E6EDF3] leading-snug">{tc.description}</div>
                            <div className="text-[10px] text-[#7D8590] mt-0.5 font-mono">{tc.details}</div>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              <Check className="w-3 h-3" /> PASS
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
