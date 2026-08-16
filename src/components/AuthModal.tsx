import React, { useState } from 'react';
import {
  User,
  Shield,
  Lock,
  LogOut,
  UserPlus,
  LogIn,
  Crown,
  CheckCircle2,
  AlertCircle,
  Building,
  Key,
} from 'lucide-react';
import { MemberRole, UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogin: (emailOrId: string, role?: MemberRole) => void;
  onRegister: (data: { name: string; email: string; department: string; requestedRole: MemberRole }) => void;
  onLogout: () => void;
  onOpenVault: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onRegister,
  onLogout,
  onOpenVault,
}) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [emailOrId, setEmailOrId] = useState('jkoogi');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Platform Architecture Lab');
  const [requestedRole, setRequestedRole] = useState<MemberRole>('ENGINEER');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId.trim()) return;
    onLogin(emailOrId);
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onRegister({
      name,
      email,
      department,
      requestedRole,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl max-w-md w-full p-6 text-[#E6EDF3] shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#30363D] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#E6EDF3]">
                {currentUser ? '회원 계정 및 RBAC 권한 정보' : '엔터프라이즈 통합 인증'}
              </h2>
              <p className="text-xs text-[#7D8590]">SUPER_ADMIN 화이트리스트 자동 승격 시스템</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#7D8590] hover:text-[#E6EDF3] p-1.5 rounded-md hover:bg-[#21262D] cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Current User State View */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="bg-[#0D1117] border border-[#30363D] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full border border-[#30363D]"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-sm text-[#E6EDF3]">{currentUser.name}</span>
                      {currentUser.isSuperAdmin && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-bold">
                          <Crown className="w-3 h-3 inline" /> SUPER_ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#7D8590] font-mono">{currentUser.email}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-xs font-semibold">
                  {currentUser.role}
                </span>
              </div>

              <div className="pt-2 border-t border-[#21262D] grid grid-cols-2 gap-2 text-xs text-[#7D8590]">
                <div>
                  소속: <span className="text-[#E6EDF3]">{currentUser.department}</span>
                </div>
                <div>
                  일일 토큰 한도: <span className="text-emerald-400 font-mono">{(currentUser.dailyTokenLimit / 1000).toFixed(0)}k</span>
                </div>
                <div>
                  오늘 사용량: <span className="text-blue-400 font-mono">{(currentUser.tokensUsedToday / 1000).toFixed(0)}k</span>
                </div>
                <div>
                  월간 예산: <span className="text-[#E6EDF3] font-mono">${currentUser.monthlyBudgetUSD}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  onClose();
                  onOpenVault();
                }}
                className="flex-1 py-2 px-3 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-sm transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Key className="w-3.5 h-3.5" />
                <span>개인 API Key Vault 열기</span>
              </button>
              <button
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="py-2 px-3 rounded-md bg-[#21262D] hover:bg-rose-500/20 hover:text-rose-400 text-[#7D8590] font-medium text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tab switch between Login and Register */}
            <div className="grid grid-cols-2 p-1 bg-[#0D1117] border border-[#30363D] rounded-lg text-xs">
              <button
                onClick={() => setMode('LOGIN')}
                className={`py-1.5 rounded-md font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'LOGIN' ? 'bg-[#21262D] text-[#E6EDF3]' : 'text-[#7D8590] hover:text-[#E6EDF3]'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> 로그인
              </button>
              <button
                onClick={() => setMode('REGISTER')}
                className={`py-1.5 rounded-md font-medium transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  mode === 'REGISTER' ? 'bg-[#21262D] text-[#E6EDF3]' : 'text-[#7D8590] hover:text-[#E6EDF3]'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> 신규 가입
              </button>
            </div>

            {mode === 'LOGIN' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#7D8590] mb-1">
                    아이디 또는 이메일
                  </label>
                  <input
                    type="text"
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    placeholder="예: jkoogi 또는 jkoogit@gmail.com"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2 text-xs text-[#E6EDF3] placeholder-[#7D8590] focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                  <p className="text-[11px] text-emerald-400 mt-1">
                    💡 `jkoogi`, `jkoogit@gmail.com` 입력 시 `SUPER_ADMIN`으로 자동 승격됩니다.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition border border-blue-500/40 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>로그인 및 권한 활성화</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-[#7D8590] mb-1">이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2 text-xs text-[#E6EDF3] placeholder-[#7D8590] focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7D8590] mb-1">이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@team.io"
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2 text-xs text-[#E6EDF3] placeholder-[#7D8590] focus:outline-none focus:border-blue-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7D8590] mb-1">소속 부서</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2 text-xs text-[#E6EDF3] placeholder-[#7D8590] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#7D8590] mb-1">신청 권한 (Role)</label>
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value as MemberRole)}
                    className="w-full bg-[#0D1117] border border-[#30363D] rounded-md px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-blue-500"
                  >
                    <option value="ENGINEER">ENGINEER (코드 작성 및 단위 루프 실행)</option>
                    <option value="ARCHITECT">ARCHITECT (설계 및 파생 작업 승인)</option>
                    <option value="REVIEWER">REVIEWER (시나리오/DoD 검증)</option>
                    <option value="AUDITOR">AUDITOR (보안 및 감사 로그 열람)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs shadow-sm transition border border-emerald-500/40 flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>회원 가입 및 감사 메타 등록</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
