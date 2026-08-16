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
} from 'lucide-react';
import { LifecyclePhase, TaskGraphNode } from '../types';
import { TaskGraphViewer } from './TaskGraphViewer';

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

  const activePhase: LifecyclePhase =
    selectedTask.phases.find((p) => p.phaseNumber === activePhaseNum) || selectedTask.phases[0];

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
                <FileCode className="w-3.5 h-3.5 text-blue-400" />
                계약 인터페이스 & JSON Schema Draft-07 명세
              </h4>
              <pre className="p-3.5 rounded-lg bg-[#0A0C10] border border-[#30363D] text-xs font-mono text-blue-300 overflow-x-auto">
                {activePhase.specJsonSchema}
              </pre>
            </div>
          )}

          {/* Phase 5 Special: Test Suite & Failure Injection */}
          {activePhase.phaseNumber === 5 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#7D8590] flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-amber-400" />
                테스트 스위트 설계 & 가상 장애 주입(Failure Injection) 계획
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1.5">
                  <span className="font-semibold text-[#E6EDF3] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    14개 테스트 벡터 설계 (100% Coverage Target)
                  </span>
                  <ul className="text-[11px] text-[#7D8590] space-y-0.5 font-mono">
                    <li>• test_pdf_magic_bytes_validation() [Normal]</li>
                    <li>• test_corrupted_stream_error_recovery() [Error]</li>
                    <li>• test_circuit_breaker_hot_swap_failover() [Chaos]</li>
                  </ul>
                </div>
                <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1.5">
                  <span className="font-semibold text-[#E6EDF3] flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    429 Quota 고갈 / 타임아웃 주입 조건
                  </span>
                  <div className="text-[11px] text-blue-300 font-mono bg-[#0A0C10] p-2 rounded border border-[#30363D]">
                    ASSERT: failover_latency &lt; 300ms &amp;&amp; payload_retained == true
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Phase 6 Special: Generated Code with Fallback Engine */}
          {activePhase.phaseNumber === 6 && activePhase.generatedOutput && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#7D8590] flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-emerald-400" />
                  생성된 1차 실행 코드 (PdfOcrEngine.ts) - 컴파일 및 다단계 Fallback 방어 탑재
                </h4>
                <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                  TSC Compile: 0 Errors
                </span>
              </div>
              <pre className="p-3.5 rounded-lg bg-[#0A0C10] border border-[#30363D] text-xs font-mono text-[#E6EDF3] overflow-x-auto max-h-72">
                {activePhase.generatedOutput}
              </pre>
            </div>
          )}

          {/* Phase 7 Special: Work Review & Backlog Synchronization */}
          {activePhase.phaseNumber === 7 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#7D8590] flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-purple-400" />
                Phase 7 작업 리뷰 요약 &amp; 미처리 작업(Backlog) 식별
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1">
                  <span className="text-[10px] text-[#7D8590] block">작업 결과 보고서</span>
                  <p className="text-xs font-semibold text-[#E6EDF3]">
                    PDF 스트림 파서 &amp; 하이브리드 OCR 엔진 구현 완료
                  </p>
                  <p className="text-[11px] text-[#7D8590]">
                    설계 대비 구현 드리프트 0%, TypeScript 안전 가드 100% 검증
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1">
                  <span className="text-[10px] text-[#7D8590] block">자동 생성된 후속 백로그</span>
                  <div className="text-[11px] text-emerald-400 font-mono space-y-0.5">
                    <div>• [PDF-TABLE-05] 비구조화 표 감지 엔진 (연계 완료)</div>
                    <div>• [PDF-CRYPTO-02] DRM 워터마크 엔진 (연계 완료)</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Artifacts & Audit Stream */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#30363D] text-xs">
            <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1">
              <span className="text-[10px] font-bold text-[#7D8590] uppercase">입력 산출물 (Input Artifacts)</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {activePhase.inputArtifacts.map((art, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[#8B949E] text-[10px] font-mono">
                    {art}
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] space-y-1">
              <span className="text-[10px] font-bold text-[#7D8590] uppercase">출력 산출물 (Output Artifacts)</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {activePhase.outputArtifacts.map((art, i) => (
                  <span key={i} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/30 font-mono">
                    {art}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
