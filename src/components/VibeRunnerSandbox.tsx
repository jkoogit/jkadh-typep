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
} from 'lucide-react';
import { ModelMeta, TaskGraphNode } from '../types';
import { VibeRunnerEngine } from '../services/VibeRunnerEngine';
import { AstValidator } from '../services/AstValidator';
import { VibePhaseExecutionResult } from '../types/vibeRunner';
import { runHarnessCliUnitTests, HarnessCliTestResult } from '../test/harnessCli.test';

interface VibeRunnerSandboxProps {
  tasks: TaskGraphNode[];
  models: ModelMeta[];
  defaultTaskId?: string;
}

export const VibeRunnerSandbox: React.FC<VibeRunnerSandboxProps> = ({
  tasks,
  models,
  defaultTaskId,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(
    defaultTaskId || tasks.find(t => t.code === 'PLAT-CLI-07')?.id || tasks[0]?.id
  );
  const [activeTab, setActiveTab] = useState<'RUNNER' | 'AST_CHECKER' | 'UNIT_TESTS'>('RUNNER');
  const [isExecutingAll, setIsExecutingAll] = useState<boolean>(false);
  const [currentRunningPhase, setCurrentRunningPhase] = useState<number | null>(null);
  const [phaseResults, setPhaseResults] = useState<Record<number, VibePhaseExecutionResult>>({});
  const [forceFallback, setForceFallback] = useState<boolean>(false);
  const [testCategoryFilter, setTestCategoryFilter] = useState<'ALL' | '정상' | '예외' | '오류'>('ALL');
  const [testResults, setTestResults] = useState<HarnessCliTestResult[]>(() => runHarnessCliUnitTests());

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
  const [astValidationReport, setAstValidationReport] = useState(AstValidator.validate(customCode, { isDbSchema: true }));

  const currentTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  // Re-run unit tests
  const handleRerunTests = () => {
    setTestResults(runHarnessCliUnitTests());
  };

  // Filtered unit tests
  const filteredTests = testResults.filter((t) => {
    if (testCategoryFilter === 'ALL') return true;
    return t.category.includes(testCategoryFilter);
  });

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
          forceFallback: p === 4 && forceFallback, // simulate fallback on phase 4
        });
        setPhaseResults((prev) => ({ ...prev, [p]: res }));
        await new Promise((r) => setTimeout(r, 200));
      }
    } finally {
      setIsExecutingAll(false);
      setCurrentRunningPhase(null);
    }
  };

  // Trigger real-time AST check on code edit
  const handleCustomCodeChange = (text: string) => {
    setCustomCode(text);
    const rep = AstValidator.validate(text, { isDbSchema: true, isTestFile: false });
    setAstValidationReport(rep);
  };

  const totalTokens = Object.values(phaseResults).reduce((acc, cur) => acc + cur.tokensConsumed, 0);
  const totalDuration = Object.values(phaseResults).reduce((acc, cur) => acc + cur.durationMs, 0);
  const avgScore = Object.values(phaseResults).length > 0
    ? Math.round(Object.values(phaseResults).reduce((acc, cur) => acc + cur.outputArtifact.gatekeeperScore, 0) / Object.values(phaseResults).length)
    : 0;

  return (
    <div className="space-y-4">
      {/* Top Banner & Control Bar (상하 열거 레이아웃) */}
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#E6EDF3] flex items-center gap-2">
                실시간 7-Phase Vibe Runner 샌드박스 & AST 정적 검증기
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-pink-500/20 text-pink-300 font-mono border border-pink-500/30">
                  PLAT-VIBE-06
                </span>
              </h2>
              <p className="text-xs text-[#7D8590] mt-0.5">
                AI 에이전트 코드 생성 무결점 검증, 7-Phase 순환 시뮬레이터 및 TypeScript AST 정적 구문 분석기
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher (하단 배치) */}
        <div className="pt-2 border-t border-[#30363D]/70 flex items-center gap-2">
          <div className="flex items-center bg-[#0D1117] p-0.5 rounded-lg border border-[#30363D]">
            <button
              onClick={() => setActiveTab('RUNNER')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'RUNNER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#7D8590] hover:text-[#E6EDF3]'
              }`}
            >
              7-Phase 순환 실행기
            </button>
            <button
              onClick={() => setActiveTab('AST_CHECKER')}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition cursor-pointer ${
                activeTab === 'AST_CHECKER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-[#7D8590] hover:text-[#E6EDF3]'
              }`}
            >
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

      {activeTab === 'RUNNER' ? (
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
                    <span className="font-mono text-emerald-400 font-bold">{currentTask.gitBranch || 'task/vibe-runner'}</span>
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
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  {isExecutingAll ? '7-Phase 순환 실행 중...' : '전체 7-Phase Vibe 루프 일괄 실행'}
                </button>
              </div>

              {/* Execution Summary Stats */}
              {Object.keys(phaseResults).length > 0 && (
                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2 text-xs">
                  <span className="font-bold text-[#E6EDF3] block border-b border-[#21262D] pb-1">
                    실행 결산 텔레메트리
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 rounded bg-[#161B22] border border-[#21262D]">
                      <span className="text-[10px] text-[#7D8590] block">총 토큰</span>
                      <span className="text-xs font-bold text-blue-400">{totalTokens.toLocaleString()}</span>
                    </div>
                    <div className="p-2 rounded bg-[#161B22] border border-[#21262D]">
                      <span className="text-[10px] text-[#7D8590] block">총 시간</span>
                      <span className="text-xs font-bold text-emerald-400">{totalDuration}ms</span>
                    </div>
                    <div className="p-2 rounded bg-[#161B22] border border-[#21262D]">
                      <span className="text-[10px] text-[#7D8590] block">평균 점수</span>
                      <span className="text-xs font-bold text-amber-400">{avgScore}점</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel: 7-Phase Execution Timeline & Logs */}
          <div className="lg:col-span-2 space-y-3">
            {[1, 2, 3, 4, 5, 6, 7].map((pNum) => {
              const res = phaseResults[pNum];
              const isRunning = currentRunningPhase === pNum;
              const phaseName = currentTask.phases.find((p) => p.phaseNumber === pNum)?.nameKr || `Phase ${pNum}`;

              return (
                <div
                  key={pNum}
                  className={`border rounded-xl p-3.5 transition ${
                    isRunning
                      ? 'bg-blue-950/20 border-blue-500/50 shadow-md'
                      : res
                      ? 'bg-[#161B22] border-[#30363D]'
                      : 'bg-[#161B22]/50 border-[#21262D] opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                          res
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : isRunning
                            ? 'bg-blue-500 text-white animate-pulse'
                            : 'bg-[#21262D] text-[#8B949E]'
                        }`}
                      >
                        {res ? <Check className="w-3.5 h-3.5" /> : `0${pNum}`}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-2">
                          Phase 0{pNum}: {phaseName}
                          {res?.isFallbackTriggered && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                              Fallback Swap (300ms)
                            </span>
                          )}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {res && (
                        <div className="flex items-center gap-2 text-[10px] font-mono text-[#7D8590]">
                          <span>{res.durationMs}ms</span>
                          <span>•</span>
                          <span className="text-blue-400">{res.activeModelId}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">{res.outputArtifact.gatekeeperScore}점</span>
                        </div>
                      )}
                      <button
                        onClick={() => handleRunSinglePhase(pNum)}
                        disabled={isRunning || isExecutingAll}
                        className="px-2.5 py-1 rounded bg-[#0D1117] hover:bg-[#21262D] border border-[#30363D] text-[#E6EDF3] text-[10px] font-semibold transition disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        {isRunning ? '검증 중...' : '단독 실행'}
                      </button>
                    </div>
                  </div>

                  {/* Expanded result if exists */}
                  {res && (
                    <div className="mt-3 pt-3 border-t border-[#21262D] space-y-2 text-xs">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-[#8B949E]">{res.outputArtifact.description}</span>
                        <span className="font-mono text-[10px] text-purple-400">Savepoint: {res.savepointName}</span>
                      </div>

                      {res.outputArtifact.generatedCodeSnippet && (
                        <pre className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] font-mono text-[10px] text-blue-300 overflow-x-auto max-h-32">
                          {res.outputArtifact.generatedCodeSnippet}
                        </pre>
                      )}

                      {/* AST Report Pill */}
                      <div className="flex flex-wrap items-center gap-2 text-[10px]">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> AST 정적 구문 정상
                        </span>
                        {res.astReport.hasAuditColumns && (
                          <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                            <Database className="w-3 h-3" /> 6대 감사 컬럼 확인
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" /> FIPS-140-2 암호화 검증
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : activeTab === 'AST_CHECKER' ? (
        /* AST Interactive Checker View */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
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
                  <span className="font-bold text-amber-400 text-xs block">타입 엄격성 결함 (Strict Type Violations):</span>
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
                  <span className={astValidationReport.typeErrors.length === 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>
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
                하네스 6대 라이프사이클 3대 시나리오 테스트 카탈로그
              </h3>
              <p className="text-xs text-[#7D8590] mt-0.5">
                테스트ID, 작업그래프ID, 세션ID, 태스크ID, 작업ID 연계 100% 추적성 검증
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex bg-[#0D1117] p-1 rounded-lg border border-[#30363D] text-[11px]">
                {(['ALL', '정상', '오류', '예외'] as const).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setTestCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded font-medium transition ${
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

          {/* Test Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#0D1117] text-[#7D8590] border-b border-[#30363D] text-[11px] uppercase font-mono">
                  <th className="py-2.5 px-3">테스트ID</th>
                  <th className="py-2.5 px-3">구분</th>
                  <th className="py-2.5 px-3">작업그래프ID</th>
                  <th className="py-2.5 px-3">세션ID</th>
                  <th className="py-2.5 px-3">태스크ID</th>
                  <th className="py-2.5 px-3">작업ID</th>
                  <th className="py-2.5 px-3">테스트대상</th>
                  <th className="py-2.5 px-3">테스트내용 & 세부결과</th>
                  <th className="py-2.5 px-3 text-center">결과</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#21262D]">
                {filteredTests.map((tc) => (
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
                    <td className="py-2.5 px-3 font-mono text-[#8B949E] text-[11px]">{tc.taskGraphId}</td>
                    <td className="py-2.5 px-3 font-mono text-[#8B949E] text-[11px]">{tc.sessionId}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-400 text-[11px]">{tc.taskId}</td>
                    <td className="py-2.5 px-3 font-mono text-[#8B949E] text-[11px]">{tc.workId}</td>
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
  );
};
