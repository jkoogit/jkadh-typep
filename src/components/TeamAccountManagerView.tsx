import React, { useState } from 'react';
import {
  Users,
  Key,
  Shield,
  Zap,
  RotateCcw,
  Edit2,
  Check,
  X,
  Plus,
  Lock,
} from 'lucide-react';
import { AIAccount, MemberRole, TeamMember } from '../types';

interface TeamAccountManagerViewProps {
  accounts: AIAccount[];
  members: TeamMember[];
  onResetAccountTokens: (id: string) => Promise<void>;
  onUpdateMemberRole: (id: string, role: MemberRole) => Promise<void>;
  onUpdateMemberLimit: (id: string, limit: number) => Promise<void>;
}

export const TeamAccountManagerView: React.FC<TeamAccountManagerViewProps> = ({
  accounts,
  members,
  onResetAccountTokens,
  onUpdateMemberRole,
  onUpdateMemberLimit,
}) => {
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editLimitVal, setEditLimitVal] = useState<number>(1000000);

  const ROLES: MemberRole[] = ['ADMIN', 'ARCHITECT', 'ENGINEER', 'REVIEWER', 'AUDITOR'];

  return (
    <div className="space-y-4">
      {/* 1. AI Accounts & API Key Pool */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D] pb-3">
          <div>
            <h3 className="font-bold text-xs text-[#E6EDF3] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              팀 공용 AI 제공업체 계정 및 토큰 쿼터 관리
            </h3>
            <p className="text-[11px] text-[#7D8590] mt-0.5">
              OpenAI, Anthropic, Google, Manus API 키 및 월간 예산 상한선
            </p>
          </div>
          <span className="text-[10px] text-[#7D8590] font-mono">jkadhp_dev • ai_accounts</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-blue-400 uppercase px-1.5 py-0.2 rounded bg-[#161B22] border border-[#30363D]">
                    {acc.provider}
                  </span>
                  <span className="text-xs font-semibold text-[#E6EDF3]">{acc.accountName}</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#161B22] text-[#8B949E]">
                  {acc.tier}
                </span>
              </div>

              {/* Masked Key */}
              <div className="p-1.5 rounded bg-[#161B22] border border-[#30363D] flex items-center justify-between text-[11px] font-mono text-[#8B949E]">
                <div className="flex items-center gap-1.5">
                  <Lock className="w-3 h-3 text-[#7D8590]" />
                  <span>{acc.apiKeyMasked}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-sans">Active Key</span>
              </div>

              {/* Progress & Quota */}
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[10px] text-[#7D8590]">
                  <span>
                    사용량: <strong className="text-[#E6EDF3]">{(acc.usedTokens / 1000000).toFixed(2)}M</strong> /{' '}
                    {(acc.totalTokenQuota / 1000000).toFixed(0)}M
                  </span>
                  <span className="font-mono text-emerald-400">
                    잔여: {(acc.remainingTokens / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#161B22] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full"
                    style={{ width: `${(acc.usedTokens / acc.totalTokenQuota) * 100}%` }}
                  />
                </div>
              </div>

              {/* Footer Actions */}
              <div className="pt-1.5 border-t border-[#30363D] flex items-center justify-between text-xs">
                <span className="text-[#7D8590] text-[10px]">
                  비용: <strong className="text-[#E6EDF3]">${acc.currentCostUSD}</strong> / ${acc.costMonthlyLimitUSD}
                </span>
                <button
                  onClick={() => onResetAccountTokens(acc.id)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#161B22] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] text-[10px] border border-[#30363D] transition cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3 text-[#7D8590]" />
                  <span>토큰 리셋</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Team Members RBAC Matrix */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#30363D] pb-3">
          <div>
            <h3 className="font-bold text-xs text-[#E6EDF3] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              멤버별 RBAC 권한 제어 및 일일 토큰 한도
            </h3>
            <p className="text-[11px] text-[#7D8590] mt-0.5">
              역할 등급(Role), 허용 AI 모델 화이트리스트, 일일 토큰 캡 설정
            </p>
          </div>
          <span className="text-[10px] text-[#7D8590] font-mono">jkadhp_dev • team_members</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117] text-[#7D8590] font-semibold text-[11px]">
                <th className="py-2 px-3">팀원 (Name / Email)</th>
                <th className="py-2 px-3">역할 (RBAC Role)</th>
                <th className="py-2 px-3">허용 AI 모델</th>
                <th className="py-2 px-3">일일 토큰 한도</th>
                <th className="py-2 px-3">금일 사용량</th>
                <th className="py-2 px-3 text-right">상태 / 관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D] text-[#8B949E]">
              {members.map((mem) => {
                const isEditing = editingMemberId === mem.id;
                return (
                  <tr key={mem.id} className="hover:bg-[#21262D]/40">
                    {/* Name & Avatar */}
                    <td className="py-2.5 px-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={mem.avatar}
                          alt={mem.name}
                          className="w-6 h-6 rounded-full object-cover border border-[#30363D]"
                        />
                        <div>
                          <div className="font-semibold text-xs text-[#E6EDF3]">{mem.name}</div>
                          <div className="text-[10px] text-[#7D8590]">{mem.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role Selector */}
                    <td className="py-2.5 px-3">
                      <select
                        value={mem.role}
                        onChange={(e) => onUpdateMemberRole(mem.id, e.target.value as MemberRole)}
                        className="bg-[#0D1117] border border-[#30363D] text-blue-400 font-semibold rounded px-1.5 py-0.5 text-[11px] focus:ring-1 focus:ring-blue-500 cursor-pointer"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Allowed Models */}
                    <td className="py-2.5 px-3">
                      <div className="flex flex-wrap gap-1">
                        {mem.allowedModels.map((m) => (
                          <span
                            key={m}
                            className="px-1.5 py-0.2 rounded bg-[#0D1117] text-[#8B949E] text-[10px] font-mono border border-[#30363D]"
                          >
                            {m.split('-')[0]}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Daily Token Limit */}
                    <td className="py-2.5 px-3 font-mono">
                      {isEditing ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            value={editLimitVal}
                            onChange={(e) => setEditLimitVal(Number(e.target.value))}
                            className="w-20 px-1.5 py-0.5 bg-[#0D1117] border border-blue-500 rounded text-xs text-[#E6EDF3]"
                          />
                          <button
                            onClick={async () => {
                              await onUpdateMemberLimit(mem.id, editLimitVal);
                              setEditingMemberId(null);
                            }}
                            className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                          >
                            <Check className="w-2.5 h-2.5" />
                          </button>
                          <button
                            onClick={() => setEditingMemberId(null)}
                            className="p-1 rounded bg-[#21262D] text-[#8B949E] cursor-pointer"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-[#E6EDF3]">{(mem.dailyTokenLimit / 1000).toFixed(0)}k</span>
                          <button
                            onClick={() => {
                              setEditingMemberId(mem.id);
                              setEditLimitVal(mem.dailyTokenLimit);
                            }}
                            className="p-0.5 text-[#7D8590] hover:text-[#E6EDF3] cursor-pointer"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Today Usage */}
                    <td className="py-2.5 px-3 font-mono text-emerald-400 text-xs">
                      {(mem.tokensUsedToday / 1000).toFixed(0)}k
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-3 text-right">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                        {mem.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
