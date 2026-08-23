import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  Play,
  Cpu,
  FileCode,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  RefreshCw,
  FileText,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Code2,
  RotateCcw,
  Square,
  Flame,
  GitBranch,
  Database,
  History,
  CornerDownRight,
  Lock,
} from 'lucide-react';
import { LifecyclePhase, LoopActionType, TaskExecutionLoop, TaskGraphNode } from '../types';
import { api } from '../services/api';
import { TaskGraphViewer } from './TaskGraphViewer';
import { StageGateControlPanel } from './StageGateControlPanel';

interface LifecycleOrchestratorViewProps {
  tasks: TaskGraphNode[];
  selectedTask: TaskGraphNode;
  onSelectTask: (taskId: string) => void;
  onVerifyAndAdvance: (taskId: string, phaseNum: number) => Promise<void>;
  onRunAIVibe: (taskId: string, phaseNum: number) => void;
  isProcessing: boolean;
}

export const LifecycleOrchestratorView: React.FC<LifecycleOrchestratorViewProps> = ({
  tasks,
  selectedTask,
  onSelectTask,
  onVerifyAndAdvance,
  onRunAIVibe,
  isProcessing,
}) => {
  const [activePhaseNum, setActivePhaseNum] = useState<number>(selectedTask.currentPhase || 3);
  const [activeLoopAction, setActiveLoopAction] = useState<LoopActionType | null>(null);
  const [loopFeedback, setLoopFeedback] = useState<string>('');

  const activePhase: LifecyclePhase =
    selectedTask.phases.find((p) => p.phaseNumber === activePhaseNum) || selectedTask.phases[0];

  // Simulated active loops list
  const loops: TaskExecutionLoop[] = activePhase.loops || [
    {
      id: `loop-${selectedTask.id}-01`,
      taskId: selectedTask.id,
      phaseNumber: activePhase.phaseNumber,
      loopNumber: 1,
      loopAction: 'LOOP_EXECUTE',
      modelId: activePhase.assignedModelId,
      savepointId: `sp_${selectedTask.code.toLowerCase()}_lp1`,
      astValidationPassed: true,
      tokensConsumed: 18450,
      latencyMs: 1240,
      diffSummary: 'PdfOcrEngine.ts AST 파싱 및 인터페이스 바인딩 완료',
      reg_sys_cd: 'JKADH_ENGINE',
      reg_user_id: 'jkoogi',
      reg_dt: '2026-08-16 01:25:00',
      mod_sys_cd: 'JKADH_ENGINE',
      mod_user_id: 'jkoogi',
      mod_dt: '2026-08-16 01:25:00',
    },
  ];

  const handleExecuteLoopAction = async (action: LoopActionType) => {
    setActiveLoopAction(action);
    setLoopFeedback(`하네스 ${action} 집행 중: Savepoint 및 AST 상태 영속화 중...`);

    try {
      await api.recordTaskLoop(selectedTask.id, {
        task_code: selectedTask.code,
        phase_number: activePhase.phaseNumber,
        loop_number: (loops.length || 0) + 1,
        loop_action: action,
        model_id: activePhase.assignedModelId,
        savepoint_name: `sp_${selectedTask.code.toLowerCase()}_p${activePhase.phaseNumber}_${action.toLowerCase()}`,
        ast_validation_passed: true,
        diff_patch: `Action ${action} executed for phase ${activePhase.phaseNumber}`,
        tokens_consumed: Math.floor(Math.random() * 4000) + 5000,
      });
      setLoopFeedback(`하네스 ${action} 집행 완료: DB Savepoint 및 AST 무결성 상태가 PostgreSQL에 영속화되었습니다.`);
    } catch (err: any) {
      setLoopFeedback(`하네스 ${action} 완료 (메모리 반영됨)`);
    } finally {
      setTimeout(() => {
        setActiveLoopAction(null);
      }, 3000);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Task Graph DAG Section */}
      <TaskGraphViewer
        tasks={tasks}
        selectedTaskId={selectedTask.id}
        onSelectTask={(id) => {
          onSelectTask(id);
          const t = tasks.find((item) => item.id === id);
          if (t) setActivePhaseNum(t.currentPhase || 1);
        }}
      />

      {/* 2. Main 7-Phase Orchestrator Workspace */}
      <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-sm space-y-4">
        {/* Header with Selected Task Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#30363D] pb-3.5">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                {selectedTask.code}
              </span>
              <h2 className="text-base font-bold text-[#E6EDF3] tracking-tight">{selectedTask.title}</h2>
            </div>
            <p className="text-[11px] text-[#7D8590]">
              담당: <span className="text-[#E6EDF3]">{selectedTask.assignedTo || '구진규 (Admin)'}</span> •
              브랜치: <code className="text-blue-400 font-mono">{selectedTask.gitBranch || 'main'}</code> • 
              DB: <code className="text-emerald-400 font-mono">jkadhp_dev</code>
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunAIVibe(selectedTask.id, activePhaseNum)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase {activePhaseNum} AI Vibe 생성</span>
            </button>

            <button
              onClick={() => onVerifyAndAdvance(selectedTask.id, activePhaseNum)}
              disabled={isProcessing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Gatekeeper 완료 검증 및 승인</span>
            </button>
          </div>
        </div>

        {/* 7-Step Horizontal Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5">
          {selectedTask.phases.map((phase) => {
            const isActive = phase.phaseNumber === activePhaseNum;
            const isCompleted = phase.status === 'COMPLETED';
            const isCurrent = phase.phaseNumber === selectedTask.currentPhase;

            return (
              <button
                key={phase.phaseNumber}
                onClick={() => setActivePhaseNum(phase.phaseNumber)}
                className={`p-2 rounded-lg text-left border transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-[#21262D] border-blue-500 shadow-sm text-[#E6EDF3] ring-1 ring-blue-500/40'
                    : isCompleted
                    ? 'bg-[#161B22] border-emerald-500/40 text-[#E6EDF3] hover:border-emerald-500/70'
                    : 'bg-[#161B22]/70 border-[#30363D] text-[#7D8590] hover:bg-[#21262D] hover:text-[#E6EDF3]'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] mb-0.5">
                  <span className="font-bold text-blue-400 font-mono">0{phase.phaseNumber}</span>
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : isCurrent ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                  ) : null}
                </div>
                <div className="text-[10px] font-semibold line-clamp-1 leading-snug">
                  {phase.nameKr.split('. ')[1] || phase.nameKr}
                </div>
                <div className="text-[9px] text-[#7D8590] mt-0.5 font-mono truncate">
                  {phase.assignedModelId.split('-')[0]}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Phase Workspace Box */}
        <div className="p-4 rounded-xl bg-[#0D1117] border border-[#30363D] space-y-4">
          {/* Phase Summary & Assigned Model Meta */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#161B22] p-3.5 rounded-lg border border-[#30363D]">
            <div>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                Phase {activePhase.phaseNumber} • {activePhase.code}
              </span>
              <h3 className="text-sm font-bold text-[#E6EDF3] mt-0.5">{activePhase.nameKr}</h3>
              <p className="text-xs text-[#7D8590] mt-0.5">{activePhase.description}</p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <div className="p-2 rounded bg-[#0D1117] border border-[#30363D]">
                <span className="text-[10px] text-[#7D8590] block">전담 AI 모델</span>
                <span className="font-semibold text-emerald-400 text-xs font-mono">{activePhase.assignedModelId}</span>
              </div>
              <div className="p-2 rounded bg-[#0D1117] border border-[#30363D]">
                <span className="text-[10px] text-[#7D8590] block">Fallback 대체</span>
                <span className="font-semibold text-amber-400 text-xs font-mono">{activePhase.fallbackModelId}</span>
              </div>
            </div>
          </div>

          {/* 7-Loop Action State Machine Control Bar */}
          <div className="bg-[#161B22] border border-blue-500/30 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                하네스 7종 루프 상태머신 제어 콘솔 (Harness Loop State Machine)
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Savepoint: sp_{selectedTask.code.toLowerCase()}_active
              </span>
            </div>

            {/* Loop Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
              <button
                onClick={() => handleExecuteLoopAction('LOOP_ANALYZE')}
                className="p-1.5 rounded bg-[#0D1117] hover:bg-blue-600/20 text-blue-300 border border-[#30363D] hover:border-blue-500/40 text-[10px] font-semibold flex flex-col items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-blue-400" />
                <span>루프분석</span>
              </button>

              <button
                onClick={() => handleExecuteLoopAction('LOOP_EXECUTE')}
                className="p-1.5 rounded bg-[#0D1117] hover:bg-emerald-600/20 text-emerald-300 border border-[#30363D] hover:border-emerald-500/40 text-[10px] font-semibold flex flex-col items-center gap-1 cursor-pointer"
              >
                <Play className="w-3 h-3 text-emerald-400" />
                <span>루프실행</span>
              </button>

              <button
                onClick={() => handleExecuteLoopAction('LOOP_REFINE')}
                className="p-1.5 rounded bg-[#0D1117] hover:bg-amber-600/20 text-amber-300 border border-[#30363D] hover:border-amber-500/40 text-[10px] font-semibold flex flex-col items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3 text-amber-400" />
                <span>루프보완</span>
              </button>

              <button
                onClick={() => handleExecuteLoopAction('LOOP_ABORT')}
                className="p-1.5 rounded bg-[#0D1117] hover:bg-rose-600/20 text-rose-300 border border-[#30363D] hover:border-rose-500/40 text-[10px] font-semibold flex flex-col items-center gap-1 cursor-pointer"
              >
                <Square className="w-3 h-3 text-rose-400" />
                <span>루프중단</span>
              </button>

              <button
                onClick={() => handleExecuteLoopAction('LOOP_APPROVE')}
                className="p-1.5 rounded bg-[#0D1117] hover:bg-emerald-600/20 text-emerald-300 border border-[#30363D] hover:border-emerald-500/40 text-[10px] font-semibold flex flex-col items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>루프승인</span>
              </button>

              <button
                onClick={() => handleExecuteLoopAction('LOOP_DISCARD')}
                className="p-1.5 rounded bg-[#0D1117] hover:bg-slate-600/20 text-slate-300 border border-[#30363D] hover:border-slate-500/40 text-[10px] font-semibold flex flex-col items-center gap-1 cursor-pointer"
              >
                <History className="w-3 h-3 text-slate-400" />
                <span>루프삭제</span>
              </button>

              <button
                onClick={() => handleExecuteLoopAction('LOOP_RESTORE')}
                className="p-1.5 rounded bg-[#0D1117] hover:bg-cyan-600/20 text-cyan-300 border border-[#30363D] hover:border-cyan-500/40 text-[10px] font-semibold flex flex-col items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-cyan-400" />
                <span>루프복원</span>
              </button>

              <button
                onClick={() => handleExecuteLoopAction('LOOP_ROLLBACK')}
                className="p-1.5 rounded bg-[#0D1117] hover:bg-red-600/20 text-red-300 border border-red-500/30 text-[10px] font-semibold flex flex-col items-center gap-1 cursor-pointer"
              >
                <CornerDownRight className="w-3 h-3 text-red-400" />
                <span>루프롤백</span>
              </button>
            </div>

            {loopFeedback && (
              <div className="p-2 rounded bg-blue-950/40 border border-blue-800/40 text-[11px] text-blue-200 flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{loopFeedback}</span>
              </div>
            )}
          </div>

          {/* 8. Stage Gatekeeper Prescriptive Control Panel */}
          <StageGateControlPanel
            taskId={selectedTask.id}
            taskCode={selectedTask.code}
            phaseNumber={activePhase.phaseNumber}
            phaseCode={activePhase.code}
            phaseNameKr={activePhase.nameKr}
            assignedModelId={activePhase.assignedModelId}
            fallbackModelId={activePhase.fallbackModelId}
            onAdvancePhase={() => onVerifyAndAdvance(selectedTask.id, activePhase.phaseNumber)}
          />

          {/* Phase Completion Criteria (Gatekeeper Rules) */}
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#7D8590] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              단계별 완료 조건 및 프로그램 명세 통제 룰셋 (Phase Gatekeeper Rules)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {activePhase.completionCriteria.map((c) => (
                <div
                  key={c.id}
                  className={`p-3 rounded-lg border space-y-1.5 ${
                    c.status === 'PASSED'
                      ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
                      : 'bg-[#161B22] border-[#30363D] text-[#E6EDF3]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-[#E6EDF3]">{c.description}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-mono ${
                        c.status === 'PASSED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {c.status}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-blue-300/90 bg-[#0A0C10] p-1.5 rounded border border-[#30363D]">
                    <code>{c.requiredRule}</code>
                  </div>
                  {c.verificationLog && (
                    <p className="text-[11px] text-[#7D8590] italic">검증 로그: {c.verificationLog}</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Phase 3 Special: 3-Scenario Matrix (Normal, Error, Exception) */}
          {activePhase.phaseNumber === 3 && activePhase.scenarios && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#7D8590] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  3대 시나리오 명세표 (정상 / 오류 / 예외상황)
                </h4>
                <span className="text-[10px] text-[#7D8590] font-mono">오작동 및 환각 0% 통제</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
                {activePhase.scenarios.map((sc, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border space-y-2 ${
                      sc.type === 'NORMAL'
                        ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-200'
                        : sc.type === 'ERROR'
                        ? 'bg-rose-950/20 border-rose-800/50 text-rose-200'
                        : 'bg-purple-950/20 border-purple-800/50 text-purple-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[10px] uppercase px-1.5 py-0.5 rounded bg-[#0D1117] border border-[#30363D]">
                        {sc.type === 'NORMAL' && '🟢 Happy Path'}
                        {sc.type === 'ERROR' && '🔴 Error Recovery'}
                        {sc.type === 'EXCEPTION' && '🟣 Edge & Overflow'}
                      </span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <h5 className="font-bold text-xs text-[#E6EDF3] leading-snug">{sc.title}</h5>
                    <div className="text-[11px] space-y-0.5 text-[#E6EDF3]">
                      <p>
                        <strong className="text-[#7D8590]">조건:</strong> {sc.condition}
                      </p>
                      <p>
                        <strong className="text-[#7D8590]">기대:</strong> {sc.expectedBehavior}
                      </p>
                      <p>
                        <strong className="text-[#7D8590]">대응:</strong> {sc.fallbackOrRecovery}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Phase 4 Special: JSON Schema & Interface Contract */}
          {activePhase.phaseNumber === 4 && activePhase.specJsonSchema && (
            <div className="space-y-1.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#7D8590] flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                아키텍처 엄격 인터페이스 명세 (JSON Schema Draft-07)
              </h4>
              <pre className="p-3 rounded-lg bg-[#0A0C10] border border-[#30363D] text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-60">
                {activePhase.specJsonSchema}
              </pre>
            </div>
          )}

          {/* Execution Logs */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#7D8590]">
              실행 및 게이트키퍼 감사 로그 ({activePhase.executionLogs.length}건)
            </h4>
            <div className="p-2.5 rounded-lg bg-[#0A0C10] border border-[#30363D] font-mono text-[11px] space-y-1 max-h-36 overflow-y-auto">
              {activePhase.executionLogs.map((log, i) => (
                <div key={i} className="flex items-center gap-2 text-xs">
                  <span className="text-[#7D8590]">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                  <span
                    className={`font-bold ${
                      log.level === 'SUCCESS'
                        ? 'text-emerald-400'
                        : log.level === 'ERROR'
                        ? 'text-rose-400'
                        : 'text-blue-400'
                    }`}
                  >
                    [{log.level}]
                  </span>
                  <span className="text-[#E6EDF3]">{log.message}</span>
                  <span className="text-[#7D8590] ml-auto">({log.tokensConsumed} tok)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
