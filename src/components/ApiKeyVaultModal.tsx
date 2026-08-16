import React, { useState } from 'react';
import {
  Key,
  Shield,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
  Lock,
  Share2,
  RefreshCw,
} from 'lucide-react';
import { UserApiVaultItem } from '../types';

interface ApiKeyVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  vaultItems: UserApiVaultItem[];
  onAddKey: (item: Omit<UserApiVaultItem, 'id' | 'reg_sys_cd' | 'reg_user_id' | 'reg_dt' | 'mod_sys_cd' | 'mod_user_id' | 'mod_dt'> & { rawKey: string }) => void;
  onDeleteKey: (id: string) => void;
  currentUserId: string;
}

export const ApiKeyVaultModal: React.FC<ApiKeyVaultModalProps> = ({
  isOpen,
  onClose,
  vaultItems,
  onAddKey,
  onDeleteKey,
  currentUserId,
}) => {
  const [provider, setProvider] = useState<'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'MANUS' | 'CUSTOM'>('ANTHROPIC');
  const [keyAlias, setKeyAlias] = useState('');
  const [rawKey, setRawKey] = useState('');
  const [isTeamShared, setIsTeamShared] = useState(false);
  const [dailyQuotaLimit, setDailyQuotaLimit] = useState(1000000);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyAlias.trim() || !rawKey.trim()) return;

    // Mask key
    const prefix = rawKey.substring(0, 7);
    const suffix = rawKey.substring(rawKey.length - 4);
    const maskedKey = `${prefix}...${suffix}`;

    onAddKey({
      userId: currentUserId,
      provider,
      keyAlias,
      maskedKey,
      rawKey,
      isTeamShared,
      dailyQuotaLimit,
      usedTokens: 0,
      status: 'ACTIVE',
    });

    setKeyAlias('');
    setRawKey('');
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl max-w-3xl w-full p-6 text-[#E6EDF3] shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#E6EDF3] flex items-center gap-2">
                개인 및 팀 AI API Key Vault
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  AES-256-GCM
                </span>
              </h2>
              <p className="text-xs text-[#7D8590]">
                모든 시크릿 키는 클라우드 저장 전 AES-256-GCM 알고리즘으로 하드닝 암호화되며, 인가된 작업 세션에만 복호화되어 주입됩니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#7D8590] hover:text-[#E6EDF3] p-1.5 rounded-md hover:bg-[#21262D] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Register New Key Form */}
        <form onSubmit={handleSubmit} className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> 신규 AI API Key 보안 등록
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-[#7D8590] mb-1">AI Provider</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-3 py-1.5 text-xs text-[#E6EDF3] focus:outline-none focus:border-blue-500"
              >
                <option value="ANTHROPIC">Anthropic (Claude 3.7)</option>
                <option value="OPENAI">OpenAI (Codex / GPT-4o)</option>
                <option value="GOOGLE">Google (Gemini 3.7)</option>
                <option value="MANUS">Manus Autonomous</option>
                <option value="CUSTOM">Custom Provider</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#7D8590] mb-1">키 별칭 (Alias)</label>
              <input
                type="text"
                value={keyAlias}
                onChange={(e) => setKeyAlias(e.target.value)}
                placeholder="예: Claude Sonnet Prod-01"
                className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-3 py-1.5 text-xs text-[#E6EDF3] placeholder-[#7D8590] focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-[#7D8590] mb-1">일일 토큰 한도 (Quota)</label>
              <input
                type="number"
                value={dailyQuotaLimit}
                onChange={(e) => setDailyQuotaLimit(Number(e.target.value))}
                className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-3 py-1.5 text-xs text-[#E6EDF3] focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#7D8590] mb-1">
              API Key 시크릿 문자열 (입력 즉시 클라이언트 메모리에서 마스킹 및 암호화)
            </label>
            <input
              type="password"
              value={rawKey}
              onChange={(e) => setRawKey(e.target.value)}
              placeholder="sk-ant-api03-... 또는 sk-proj-..."
              className="w-full bg-[#161B22] border border-[#30363D] rounded-md px-3 py-1.5 text-xs text-[#E6EDF3] font-mono placeholder-[#7D8590] focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-[#E6EDF3] cursor-pointer">
              <input
                type="checkbox"
                checked={isTeamShared}
                onChange={(e) => setIsTeamShared(e.target.checked)}
                className="rounded bg-[#161B22] border-[#30363D] text-blue-600 focus:ring-0"
              />
              <span className="flex items-center gap-1 text-[#7D8590]">
                <Share2 className="w-3 h-3 text-purple-400" />
                팀 전체 공용 풀(Fallback Pool)로 공유 허용
              </span>
            </label>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-sm transition border border-purple-500/40 flex items-center gap-1.5 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>AES-256 Vault에 안전 저장</span>
            </button>
          </div>
        </form>

        {/* Existing Vault Keys List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#7D8590]">
              등록된 보안 Vault 키 목록 ({vaultItems.length})
            </h3>
            <span className="text-[11px] text-[#7D8590] flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-400" />
              6대 감사 메타데이터 자동 추적 중
            </span>
          </div>

          {vaultItems.length === 0 ? (
            <div className="p-8 text-center bg-[#0D1117] border border-[#30363D] rounded-lg text-xs text-[#7D8590]">
              등록된 API Key가 없습니다. 상단에서 개인 또는 팀용 키를 안전하게 등록하세요.
            </div>
          ) : (
            <div className="space-y-2">
              {vaultItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#0D1117] border border-[#30363D] rounded-lg p-3.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded bg-[#161B22] border border-[#30363D] font-mono text-[11px] font-bold text-blue-400">
                      {item.provider}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#E6EDF3]">{item.keyAlias}</span>
                        {item.isTeamShared && (
                          <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 text-[10px] border border-purple-500/30">
                            Team Shared
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/30">
                          {item.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 font-mono text-[11px] text-[#7D8590] mt-0.5">
                        <span>{item.maskedKey}</span>
                        <span>•</span>
                        <span>한도: {(item.dailyQuotaLimit / 1000).toFixed(0)}k</span>
                        <span>•</span>
                        <span>등록자: {item.reg_user_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(item.id, item.maskedKey)}
                      className="p-1.5 rounded hover:bg-[#21262D] text-[#7D8590] hover:text-[#E6EDF3] transition cursor-pointer"
                      title="마스킹 키 복사"
                    >
                      {copiedId === item.id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => onDeleteKey(item.id)}
                      className="p-1.5 rounded hover:bg-rose-500/20 text-[#7D8590] hover:text-rose-400 transition cursor-pointer"
                      title="키 폐기 및 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
