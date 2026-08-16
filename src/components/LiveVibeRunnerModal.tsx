import React, { useState } from 'react';
import {
  X,
  Play,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ShieldCheck,
  Zap,
  Code2,
} from 'lucide-react';
import { ModelMeta, TaskGraphNode } from '../types';

interface LiveVibeRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: TaskGraphNode[];
  models: ModelMeta[];
  defaultTaskId?: string;
  defaultPhaseNumber?: number;
  onExecute: (params: {
    taskId: string;
    phaseNumber: number;
    prompt: string;
    forceFallback: boolean;
    simulateModel: string;
  }) => Promise<any>;
}

export const LiveVibeRunnerModal: React.FC<LiveVibeRunnerModalProps> = ({
  isOpen,
  onClose,
  tasks,
  models,
  defaultTaskId,
  defaultPhaseNumber,
  onExecute,
}) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>(defaultTaskId || tasks[1]?.id || tasks[0]?.id);
  const [selectedPhase, setSelectedPhase] = useState<number>(defaultPhaseNumber || 3);
  const [selectedModel, setSelectedModel] = useState<string>('claude-3-7-sonnet');
  const [forceFallback, setForceFallback] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>('PDFowers 고해상도 OCR 다단계 Fallback 방어 파이프라인 명세 및 코드 생성');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);
    try {
      const res = await onExecute({
        taskId: selectedTaskId,
        phaseNumber: selectedPhase,
        prompt,
        forceFallback,
        simulateModel: selectedModel,
      });
      setResult(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-4xl max-h-[90vh] bg-[#161B22] border border-[#30363D] rounded-xl shadow-2xl flex flex-col overflow-hidden text-[#E6EDF3]">
        {/* Modal Header */}
        <div className="p-3.5 border-b border-[#30363D] flex items-center justify-between bg-[#161B22]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-[#E6EDF3]">실시간 Vibe Coding 파이프라인 러너</h3>
              <p className="text-[10px] text-[#7D8590]">
                PDFowers 대상 7단계 명세 생성, 실시간 Fallback 라우팅 및 Gatekeeper 검증
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#21262D] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
          {/* Config Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {/* Task Select */}
            <div className="space-y-1">
              <label className="font-bold text-[10px] uppercase text-[#7D8590] flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-400" />
                대상 작업 (Task)
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] font-medium text-xs cursor-pointer focus:ring-1 focus:ring-blue-500"
              >
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.code}] {t.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Phase Select */}
            <div className="space-y-1">
              <label className="font-bold text-[10px] uppercase text-[#7D8590] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                실행 라이프사이클 단계
              </label>
              <select
                value={selectedPhase}
                onChange={(e) => setSelectedPhase(Number(e.target.value))}
                className="w-full p-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] font-medium text-xs cursor-pointer focus:ring-1 focus:ring-blue-500"
              >
                <option value={1}>01. 작업대상 검토 (Work Target Review)</option>
                <option value={2}>02. 작업 선정 (Selection & ROI)</option>
                <option value={3}>03. 작업 기획 (3-Scenario Matrix)</option>
                <option value={4}>04. 작업 설계 (Interface & Schema)</option>
                <option value={5}>05. 테스트 설계 (Failure Injection)</option>
                <option value={6}>06. 코드 작성 (TS Safe Code Gen)</option>
                <option value={7}>07. 문서 작성 및 작업그래프 현행화 (Work Review & Graph Sync)</option>
              </select>
            </div>

            {/* Model Select */}
            <div className="space-y-1">
              <label className="font-bold text-[10px] uppercase text-[#7D8590] flex items-center gap-1">
                <Cpu className="w-3 h-3 text-amber-400" />
                기본 실행 AI 모델
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full p-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] font-medium text-xs cursor-pointer focus:ring-1 focus:ring-blue-500"
              >
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prompt Box */}
          <div className="space-y-1">
            <label className="font-bold text-[10px] uppercase text-[#7D8590]">작업 세부 요구사항 / 프롬프트</label>
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-blue-300 font-mono text-xs focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Fallback Simulation Toggle */}
          <div className="p-2.5 rounded-lg bg-amber-950/10 border border-amber-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-xs text-[#E6EDF3] block">
                  강제 Fallback 주입 (Simulate 429 Quota Exhaustion)
                </span>
                <span className="text-[10px] text-[#7D8590]">
                  Primary 모델 토큰 부족/오류 시 Gemini 3.7 Flash로 즉각 핫스왑 전환되는 과정을 시뮬레이션
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={forceFallback}
              onChange={(e) => setForceFallback(e.target.checked)}
              className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
            />
          </div>

          {/* Execute Button */}
          <div className="flex justify-end">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs shadow-sm transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? 'AI Vibe 실행 중...' : '파이프라인 실행 (Run)'}</span>
            </button>
          </div>

          {/* Execution Result Area */}
          {result && (
            <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 border-b border-[#30363D] pb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-bold text-[#E6EDF3] text-xs">
                    Phase 0{result.phaseNumber} 생성 및 Gatekeeper 검증 완료
                  </span>
                </div>
                <div className="flex items-center gap-2.5 text-[10px] font-mono">
                  <span className="text-[#7D8590]">
                    처리 모델: <strong className="text-emerald-400">{result.modelUsed}</strong>
                  </span>
                  <span className="text-[#7D8590]">
                    소비 토큰: <strong className="text-[#E6EDF3]">{result.tokensUsed.toLocaleString()}</strong>
                  </span>
                </div>
              </div>

              {/* Fallback Trace Log if occurred */}
              {result.fallbackOccurred && (
                <div className="p-2.5 rounded bg-amber-950/20 border border-amber-800/40 space-y-1 font-mono text-[10px]">
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-400" />
                    동적 Fallback 라우터 전환 추적 (Trace Log):
                  </span>
                  {result.fallbackLog?.map((log: string, i: number) => (
                    <div key={i} className="text-amber-200/90 pl-4">
                      {log}
                    </div>
                  ))}
                </div>
              )}

              {/* Output text */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#7D8590] uppercase">AI 산출물 명세:</span>
                <pre className="p-3 rounded-lg bg-[#161B22] border border-[#30363D] text-[11px] font-mono text-[#E6EDF3] overflow-x-auto whitespace-pre-wrap max-h-64">
                  {result.generatedContent}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
