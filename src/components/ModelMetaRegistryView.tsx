import React, { useState } from 'react';
import {
  Cpu,
  ShieldAlert,
  ArrowRight,
  Key,
  Lock,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ModelMeta, UserApiVaultItem } from '../types';

interface ModelMetaRegistryViewProps {
  models: ModelMeta[];
  vaultKeys?: UserApiVaultItem[];
  onUpdateFallback: (id: string, fallbackOrder: string[]) => Promise<void>;
  onToggleAvailability: (id: string, isAvailable: boolean) => Promise<void>;
  onBindVaultKey?: (modelId: string, vaultKey: UserApiVaultItem | null) => Promise<void>;
}

export const ModelMetaRegistryView: React.FC<ModelMetaRegistryViewProps> = ({
  models,
  vaultKeys = [],
  onUpdateFallback,
  onToggleAvailability,
  onBindVaultKey
}) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || 'claude-3-7-sonnet');
  const [isBinding, setIsBinding] = useState(false);

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];

  const handleKeySelect = async (keyId: string) => {
    if (!onBindVaultKey) return;
    setIsBinding(true);
    try {
      if (keyId === 'SYSTEM_ENV' || !keyId) {
        await onBindVaultKey(selectedModel.id, null);
      } else {
        const found = vaultKeys.find((k) => k.id === keyId);
        if (found) {
          await onBindVaultKey(selectedModel.id, found);
        }
      }
    } finally {
      setIsBinding(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Info */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3 shadow-xs">
        <div>
          <div className="flex items-center gap-1.5 text-blue-400 text-xs font-semibold uppercase tracking-wide">
            <Cpu className="w-3.5 h-3.5" />
            <span>AI Model Meta-Information & API Key Vault Binding Matrix</span>
          </div>
          <h2 className="text-base font-bold text-[#E6EDF3] mt-0.5">
            AI 모델 메타정보 관리 및 보안금고 API Key 1-Click 인증 바인딩
          </h2>
          <p className="text-[11px] text-[#7D8590] mt-0.5">
            사용자가 등록한 AES-256-GCM 보안금고 키를 모델별로 1-Click 바인딩하고, Vibe Runner 각 공정(기획/아키텍트/개발/보안)이 자율 인증 주입 및 핫스왑을 수행합니다.
          </p>
        </div>
        <div className="pt-2 border-t border-[#30363D]/70 flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-[#0D1117] border border-[#30363D] text-[#8B949E] font-mono text-[11px]">
            등록 모델: <strong className="text-blue-400 font-bold">{models.length}</strong>개
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
            보안금고 실시간 연동 활성
          </span>
          <span className="px-2.5 py-1 rounded bg-purple-950/40 border border-purple-500/30 text-purple-400 font-mono text-[11px]">
            서킷 브레이커 Fallback 활성
          </span>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {models.map((m) => {
          const isSelected = m.id === selectedModelId;
          const isBound = m.authBindingStatus === 'BOUND' && m.vaultKeyMasked;
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
                <div className="flex items-center gap-1.5">
                  {isBound ? (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-emerald-400 bg-emerald-950/50 px-1.5 py-0.5 rounded border border-emerald-500/30" title="API Key Vault 연동됨">
                      <Lock className="w-2.5 h-2.5" /> Vault
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-[9px] font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700" title="시스템 환경변수 사용">
                      Env
                    </span>
                  )}
                  <span
                    className={`w-2 h-2 rounded-full ${
                      m.isAvailable ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                  />
                </div>
              </div>

              <h4 className="font-bold text-xs text-[#E6EDF3] line-clamp-1 mb-0.5">{m.name}</h4>
              <p className="text-[10px] text-[#7D8590] line-clamp-2 mb-2">{m.description}</p>

              <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono pt-1.5 border-t border-[#30363D] text-[#8B949E]">
                <div>
                  <span className="text-[#7D8590] block">인증 자격</span>
                  <span className={`font-bold ${isBound ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {isBound ? m.vaultKeyMasked : 'SYSTEM_ENV'}
                  </span>
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
              <h3 className="text-base font-bold text-[#E6EDF3] mt-0.5 flex items-center gap-2">
                {selectedModel.name}
                {selectedModel.authBindingStatus === 'BOUND' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-mono font-normal">
                    🔒 보안금고 연동 ({selectedModel.vaultKeyAlias || selectedModel.vaultKeyMasked})
                  </span>
                )}
              </h3>
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

          {/* 1-Click Vault Key Binding Control */}
          <div className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-[#E6EDF3]">
                <Key className="w-4 h-4 text-amber-400" />
                <span>보안금고 API Key 1-Click 인증 바인딩</span>
              </div>
              <span className="text-[10px] text-[#7D8590] font-mono">
                현재: {selectedModel.authBindingStatus === 'BOUND' ? `연동됨 (${selectedModel.vaultKeyMasked})` : '시스템 환경변수 (SYSTEM_ENV)'}
              </span>
            </div>
            <p className="text-[11px] text-[#7D8590]">
              사용자가 등록한 개인/팀 보안금고 키를 선택하면, Vibe Runner 엔진이 에이전트 실행 시 해당 키로 실시간 인증을 위임합니다.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <select
                aria-label="보안금고 API Key 바인딩 선택"
                value={selectedModel.vaultKeyId || 'SYSTEM_ENV'}
                onChange={(e) => handleKeySelect(e.target.value)}
                disabled={isBinding}
                className="bg-[#161B22] border border-[#30363D] text-[#E6EDF3] text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-500 font-mono cursor-pointer"
              >
                <option value="SYSTEM_ENV">⚙️ 시스템 기본 환경변수 (SYSTEM_ENV)</option>
                {vaultKeys.map((vk) => (
                  <option key={vk.id} value={vk.id}>
                    🔒 {vk.keyAlias} ({vk.provider} • {vk.maskedKey})
                  </option>
                ))}
              </select>
              {selectedModel.vaultKeyMasked && (
                <span className="text-xs font-mono px-2 py-1 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                  FIPS 마스킹: {selectedModel.vaultKeyMasked}
                </span>
              )}
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
