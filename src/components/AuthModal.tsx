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
  X
} from 'lucide-react';
import { MemberRole, UserAccount } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onRegister: (newUser: UserAccount) => void;
  onLogout: () => void;
  onOpenVault: () => void;
}

const DEFAULT_MASTER_USER: UserAccount = {
  id: 'usr_jkoogi_01',
  email: 'jkoogit@gmail.com',
  name: '조정국 (Jeongkook Koo)',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
  role: 'SUPER_ADMIN',
  isSuperAdmin: true,
  department: 'Platform Architecture Lab',
  dailyTokenLimit: 5000000,
  tokensUsedToday: 485000,
  monthlyBudgetUSD: 500,
  status: 'ACTIVE',
  reg_sys_cd: 'JKADH_CORE',
  reg_user_id: 'SYSTEM',
  reg_dt: '2026-08-16 00:00:00',
  mod_sys_cd: 'JKADH_CORE',
  mod_user_id: 'SYSTEM',
  mod_dt: '2026-08-16 00:00:00',
};

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
  const [emailOrId, setEmailOrId] = useState('jkoogit@gmail.com');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('Platform Architecture Lab');
  const [requestedRole, setRequestedRole] = useState<MemberRole>('ENGINEER');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrId.trim()) return;

    if (emailOrId.trim() === 'jkoogi' || emailOrId.trim() === 'jkoogit@gmail.com' || emailOrId.trim() === 'mem-jkoo') {
      onLogin(DEFAULT_MASTER_USER);
    } else {
      onLogin({
        ...DEFAULT_MASTER_USER,
        id: `usr_${Date.now()}`,
        name: emailOrId.split('@')[0],
        email: emailOrId.includes('@') ? emailOrId : `${emailOrId}@team.io`,
        role: 'ENGINEER',
        isSuperAdmin: false
      });
    }
    onClose();
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      email: email.trim(),
      name: name.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: requestedRole,
      isSuperAdmin: false,
      department: department.trim() || 'Engineering Lab',
      dailyTokenLimit: 1000000,
      tokensUsedToday: 0,
      monthlyBudgetUSD: 100,
      status: 'ACTIVE',
      reg_sys_cd: 'JKADH_CORE',
      reg_user_id: 'SYSTEM',
      reg_dt: new Date().toISOString(),
      mod_sys_cd: 'JKADH_CORE',
      mod_user_id: 'SYSTEM',
      mod_dt: new Date().toISOString(),
    };

    onRegister(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 text-slate-900 dark:text-slate-100 shadow-2xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 text-blue-600 dark:text-blue-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {currentUser ? '회원 계정 및 RBAC 권한 정보' : '엔터프라이즈 통합 인증'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                책임자: 조정국 (SUPER_ADMIN 화이트리스트 시스템)
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

        {/* Current User State View */}
        {currentUser ? (
          <div className="space-y-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {currentUser.name}
                      </span>
                      {currentUser.isSuperAdmin && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 text-[10px] font-bold">
                          <Crown className="w-3 h-3 inline" /> SUPER_ADMIN
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {currentUser.email}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-1 items-end">
                  {((currentUser.role || '').toString())
                    .split(/[,/|\n\r]+/)
                    .map((r) => r.trim())
                    .filter(Boolean)
                    .map((roleName, index) => {
                      const normalized = roleName.toUpperCase();
                      let badgeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                      if (normalized.includes('SUPER_ADMIN') || normalized.includes('SUPER ADMIN')) {
                        badgeClass = 'bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
                      } else if (normalized.includes('ADMIN')) {
                        badgeClass = 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
                      } else if (normalized.includes('ARCHITECT')) {
                        badgeClass = 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
                      } else if (normalized.includes('ENGINEER') || normalized.includes('DEVELOPER') || normalized.includes('DEV')) {
                        badgeClass = 'bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
                      } else if (normalized.includes('REVIEWER')) {
                        badgeClass = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
                      } else if (normalized.includes('AUDITOR') || normalized.includes('SECOPS')) {
                        badgeClass = 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
                      }
                      return (
                        <span
                          key={index}
                          className={`px-2 py-0.5 rounded-md border text-[11px] font-mono font-semibold ${badgeClass}`}
                        >
                          {roleName}
                        </span>
                      );
                    })}
                </div>
              </div>

              <div className="pt-2.5 border-t border-slate-200 dark:border-slate-700/60 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div>
                  소속: <span className="font-semibold text-slate-800 dark:text-slate-200">{currentUser.department}</span>
                </div>
                <div>
                  일일 한도: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{(currentUser.dailyTokenLimit / 1000).toFixed(0)}k</span>
                </div>
                <div>
                  오늘 사용량: <span className="font-mono text-blue-600 dark:text-blue-400 font-bold">{(currentUser.tokensUsedToday / 1000).toFixed(0)}k</span>
                </div>
                <div>
                  월간 예산: <span className="font-mono text-slate-800 dark:text-slate-200 font-bold">${currentUser.monthlyBudgetUSD}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenVault();
                }}
                className="flex-1 py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5"
              >
                <Key className="w-3.5 h-3.5" />
                <span>개인 API Key Vault 열기</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  onClose();
                }}
                className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950/40 text-slate-600 hover:text-red-600 dark:text-slate-300 dark:hover:text-red-400 font-medium text-xs border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>로그아웃</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tab switch between Login and Register */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs">
              <button
                type="button"
                onClick={() => setMode('LOGIN')}
                className={`py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'LOGIN' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> 로그인
              </button>
              <button
                type="button"
                onClick={() => setMode('REGISTER')}
                className={`py-1.5 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
                  mode === 'REGISTER' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 font-bold shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> 신규 가입
              </button>
            </div>

            {mode === 'LOGIN' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                    아이디 또는 이메일
                  </label>
                  <input
                    type="text"
                    value={emailOrId}
                    onChange={(e) => setEmailOrId(e.target.value)}
                    placeholder="jkoogi 또는 jkoogit@gmail.com"
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-1">
                    💡 `jkoogi`, `jkoogit@gmail.com` 입력 시 `SUPER_ADMIN`으로 즉시 인증됩니다.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>로그인 및 권한 활성화</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@team.io"
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">소속 부서</label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">신청 권한 (Role)</label>
                  <select
                    value={requestedRole}
                    onChange={(e) => setRequestedRole(e.target.value as MemberRole)}
                    className="w-full bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ENGINEER">ENGINEER (코드 작성 및 단위 루프 실행)</option>
                    <option value="ARCHITECT">ARCHITECT (설계 및 파생 작업 승인)</option>
                    <option value="REVIEWER">REVIEWER (시나리오/DoD 검증)</option>
                    <option value="AUDITOR">AUDITOR (보안 및 감사 로그 열람)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 mt-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>회원 가입 및 권한 신청</span>
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
