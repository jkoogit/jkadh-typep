import React, { useState } from 'react';
import {
  Key,
  Plus,
  Shield,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Check,
  Zap,
  Lock,
  X,
  AlertCircle
} from 'lucide-react';
import { MemberRole, UserApiVaultItem } from '../types';

interface ApiKeyVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  userName?: string;
  userRole?: MemberRole;
}

export const ApiKeyVaultModal: React.FC<ApiKeyVaultModalProps> = ({
  isOpen,
  onClose,
  userId = 'usr_jkoogi_01',
  userName = '조정국 (SUPER_ADMIN)',
  userRole = 'SUPER_ADMIN',
}) => {
  const [keys, setKeys] = useState<UserApiVaultItem[]>([
    {
      id: 'vlt_01',
      userId: userId,
      provider: 'OPENAI',
      keyAlias: '개인 개발용 GPT-4o Key',
      maskedKey: 'sk-proj-**********************98Ac',
      isTeamShared: false,
      dailyQuotaLimit: 1000000,
      usedTokens: 145000,
      status: 'ACTIVE',
      reg_sys_cd: 'JKADH_CORE',
      reg_user_id: 'usr_jkoogi_01',
      reg_dt: '2026-08-18 10:00:00',
      mod_sys_cd: 'JKADH_CORE',
      mod_user_id: 'usr_jkoogi_01',
      mod_dt: '2026-08-18 10:00:00',
    },
    {
      id: 'vlt_02',
      userId: userId,
      provider: 'ANTHROPIC',
      keyAlias: 'Claude 3.7 Thinking 전용 Key',
      maskedKey: 'sk-ant-api03-******************B391',
      isTeamShared: true,
      dailyQuotaLimit: 2000000,
      usedTokens: 620000,
      status: 'ACTIVE',
      reg_sys_cd: 'JKADH_CORE',
      reg_user_id: 'usr_jkoogi_01',
      reg_dt: '2026-08-19 14:30:00',
      mod_sys_cd: 'JKADH_CORE',
      mod_user_id: 'usr_jkoogi_01',
      mod_dt: '2026-08-19 14:30:00',
    }
  ]);

  const [provider, setProvider] = useState<'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'MANUS' | 'CUSTOM'>('GOOGLE');
  const [alias, setAlias] = useState('');
  const [rawKey, setRawKey] = useState('');
  const [isShared, setIsShared] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawKey.trim() || !alias.trim()) return;

    const masked = rawKey.length > 8 ? `${rawKey.slice(0, 7)}****************${rawKey.slice(-4)}` : '********';

    const newKeyItem: UserApiVaultItem = {
      id: `vlt_${Date.now()}`,
      userId,
      provider,
      keyAlias: alias.trim(),
      maskedKey: masked,
      isTeamShared: isShared,
      dailyQuotaLimit: 1000000,
      usedTokens: 0,
      status: 'ACTIVE',
      reg_sys_cd: 'JKADH_CORE',
      reg_user_id: userId,
      reg_dt: new Date().toISOString(),
      mod_sys_cd: 'JKADH_CORE',
      mod_user_id: userId,
      mod_dt: new Date().toISOString(),
    };

    setKeys([...keys, newKeyItem]);
    setAlias('');
    setRawKey('');
  };

  const handleDeleteKey = (id: string) => {
    setKeys(keys.filter(k => k.id !== id));
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-100 dark:border-purple-800 text-purple-600 dark:text-purple-400">
              <Key className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                개인 API Key Vault & 암호화 저장소
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                작업자: {userName} ({userRole}) • 클라이언트 사이드 암호화 보관
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of Registered API Keys */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300">
            등록된 API Key 목록 ({keys.length}개)
          </h3>

          <div className="space-y-2">
            {keys.map((k) => (
              <div
                key={k.id}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100">{k.keyAlias}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[10px]">
                      {k.provider}
                    </span>
                    {k.isTeamShared && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-[10px]">
                        팀 공유됨
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-slate-500 dark:text-slate-400 text-[11px]">
                    {k.maskedKey}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    type="button"
                    onClick={() => handleCopy(k.id, k.maskedKey)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    title="Key 복사"
                  >
                    {copiedId === k.id ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteKey(k.id)}
                    className="p-1.5 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Key 삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add New Key Form */}
        <form onSubmit={handleAddKey} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
          <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-blue-500" />
            신규 API Key 안전 등록
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">AI 공급자</label>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as any)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
              >
                <option value="GOOGLE">Google Gemini (Gemini 3.7 Flash)</option>
                <option value="OPENAI">OpenAI (ChatGPT Codex / o3-mini)</option>
                <option value="ANTHROPIC">Anthropic (Claude 3.7 Sonnet)</option>
                <option value="MANUS">Manus Operator Cluster</option>
                <option value="CUSTOM">Custom Provider</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">키 별칭 / 용도</label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="예: Gemini 3.7 Flash 개인 키"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">API Key 값 (Secret)</label>
            <input
              type="password"
              value={rawKey}
              onChange={(e) => setRawKey(e.target.value)}
              placeholder="sk-... 또는 AIzaSy..."
              className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-mono"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={isShared}
                onChange={(e) => setIsShared(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>팀원 공용 풀에 공유 (Team Shared Pool)</span>
            </label>

            <button
              type="submit"
              className="py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>보관소에 안전 저장</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
