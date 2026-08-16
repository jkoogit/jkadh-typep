import React, { useState } from 'react';
import {
  Cpu,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Sliders,
  DollarSign,
  Zap,
  Layers,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { ModelMeta } from '../types';

interface ModelMetaRegistryViewProps {
  models: ModelMeta[];
  onUpdateFallback: (id: string, fallbackOrder: string[]) => Promise<void>;
  onToggleAvailability: (id: string, isAvailable: boolean) => Promise<void>;
}

export const ModelMetaRegistryView: React.FC<ModelMetaRegistryViewProps> = ({
  models,
  onUpdateFallback,
  onToggleAvailability,
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || 'claude-3-7-sonnet');
  const [isSaving, setIsSaving] = useState(false);

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold uppercase tracking-wide">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Model Meta-Information & Fallback Router</span>
          </div>
          <h2 className="text-base font-bold text-[#E6EDF3] mt-0.5">
            AI 모델 메타정보 관리 및 버전별 작업 용도 통제 매트릭스
          </h2>
          <p className="text-[11px] text-[#7D8590] mt-0.5">
            ChatGPT Codex, Claude 3.7, Gemini 3.7 Flash, Manus Operator의 강점 영역 및 오류/토큰 초과 시 대체 Fallback 체인 설정
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-[#0D1117] border border-[#30363D] text-[#8B949E] font-mono text-[11px]">
            등록 모델: {models.length}개
          </span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {models.map((m) => {
          const isSelected = m.id === selectedModelId;
          return (
            <div
              key={m.id}
              onClick={() => setSelectedModelId(m.id)}
              className={`p-3 rounded-lg border transition-all cursor-pointer relative ${
                isSelected
                  ? 'bg-[#21262D] border-blue-500 shadow-sm ring-1 ring-blue-500/40'
                  : 'bg-[#161B22] border-[#30363D] hover:bg-[#21262D]/60 hover:border-[#484F58]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#0D1117] text-blue-400 border border-[#30363D]">
                  {m.provider}
                </span>
                <span
                  className={`w-2 h-2 rounded-full ${
                    m.isAvailable ? 'bg-emerald-400' : 'bg-rose-500'
                  }`}
                />
              </div>

              <h4 className="font-bold text-xs text-[#E6EDF3] line-clamp-1 mb-0.5">{m.name}</h4>
              <p className="text-[10px] text-[#7D8590] line-clamp-2 mb-2">{m.description}</p>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono pt-1.5 border-t border-[#30363D] text-[#8B949E]">
                <div>
                  <span className="text-[#7D8590] block">코딩 점수</span>
                  <span className="font-bold text-emerald-400">{m.codeScore}/100</span>
                </div>
                <div>
                  <span className="text-[#7D8590] block">평균 지연</span>
                  <span className="text-[#E6EDF3]">{m.avgLatencyMs}ms</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Selected Model Meta & Fallback Chain Builder */}
      {selectedModel && (
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#30363D] pb-3">
            <div>
              <span className="text-[10px] font-semibold text-blue-400 uppercase">
                {selectedModel.provider} • Version {selectedModel.version}
              </span>
              <h3 className="text-base font-bold text-[#E6EDF3] mt-0.5">{selectedModel.name}</h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleAvailability(selectedModel.id, !selectedModel.isAvailable)}
                className={`px-2.5 py-1 rounded text-xs font-semibold border transition cursor-pointer ${
                  selectedModel.isAvailable
                    ? 'bg-emerald-950/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/40'
                    : 'bg-rose-950/20 text-rose-300 border-rose-500/40 hover:bg-rose-900/40'
                }`}
              >
                {selectedModel.isAvailable ? '운영 중 (AVAILABLE)' : '일시 중단 (OFFLINE)'}
              </button>
            </div>
          </div>

          {/* Model Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-0.5">
              <span className="text-[#7D8590] block text-[10px]">컨텍스트 윈도우</span>
              <span className="text-base font-bold font-mono text-[#E6EDF3]">
                {(selectedModel.contextWindow / 1000).toFixed(0)}k Tokens
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-0.5">
              <span className="text-[#7D8590] block text-[10px]">가격 (1M In/Out)</span>
              <span className="text-base font-bold font-mono text-emerald-400">
                ${selectedModel.inputPricePerMillion} / ${selectedModel.outputPricePerMillion}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-0.5">
              <span className="text-[#7D8590] block text-[10px]">사고 수준 (Reasoning)</span>
              <span className="text-base font-bold font-mono text-blue-400">
                {selectedModel.reasoningTier}
              </span>
            </div>
            <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-0.5">
              <span className="text-[#7D8590] block text-[10px]">토큰 계산 난이도</span>
              <span className="text-base font-bold font-mono text-amber-400">
                {selectedModel.tokenEstimationDifficulty}
              </span>
            </div>
          </div>

          {/* Recommended Lifecycle Phases */}
          <div className="space-y-1.5">
            <h4 className="text-[10px] font-bold text-[#7D8590] uppercase tracking-wide flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              권장 Vibe Coding 라이프사이클 단계
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {selectedModel.recommendedPhases.map((phaseNum) => (
                <span
                  key={phaseNum}
                  className="px-2.5 py-1 rounded bg-[#0D1117] border border-blue-500/30 text-blue-300 text-xs font-semibold font-mono"
                >
                  Phase 0{phaseNum}
                </span>
              ))}
            </div>
          </div>

          {/* Fallback Chain Router Configuration */}
          <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                  동적 장애 복구 Fallback 체인 라우팅 (Hot-Swap Chain)
                </h4>
                <p className="text-[11px] text-[#7D8590]">
                  토큰 쿼터 부족(429), 컨텍스트 초과 또는 HTTP 503 오류 발생 시 자동으로 전환되는 대체 모델 순위
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-1.5">
              <div className="w-full sm:w-auto px-3 py-1.5 rounded-md bg-blue-600/20 border border-blue-500/40 text-blue-200 text-xs font-semibold text-center">
                Primary: {selectedModel.name}
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-[#7D8590] hidden sm:block" />
              {selectedModel.fallbackOrder.map((fId, index) => {
                const fModel = models.find((m) => m.id === fId);
                return (
                  <React.Fragment key={fId}>
                    <div className="w-full sm:w-auto px-3 py-1.5 rounded-md bg-[#161B22] border border-[#30363D] text-[#8B949E] text-xs font-medium text-center">
                      Fallback #{index + 1}: {fModel?.name || fId}
                    </div>
                    {index < selectedModel.fallbackOrder.length - 1 && (
                      <ArrowRight className="w-3.5 h-3.5 text-[#7D8590] hidden sm:block" />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
