import React, { useState } from 'react';
import {
  Menu,
  Sun,
  Moon,
  Monitor,
  Shield,
  Key,
  LogOut,
  Sparkles,
  Layers,
  ChevronDown,
  Activity,
  CheckCircle2,
  ExternalLink,
  Lock,
  Crown
} from 'lucide-react';
import { UserAccount, HarnessSessionRecord } from '../types';

export type TabType =
  | 'PROPOSALS'
  | 'LIFECYCLE'
  | 'SESSION'
  | 'VIBE_SANDBOX'
  | 'DASHBOARD'
  | 'MODELS'
  | 'TEAM'
  | 'DATABASE'
  | 'DOCUMENTATION'
  | 'TELEMETRY'
  | 'AUDIT_TRAIL';

interface HeaderProps {
  user: UserAccount | null;
  currentTheme: 'light' | 'dark' | 'system';
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  onOpenAuthModal: () => void;
  onOpenApiKeyVault: () => void;
  onLogout: () => void;
  onToggleMobileSidebar: () => void;
  activeSession?: HarnessSessionRecord;
  isSandboxMode?: boolean;
  totalTokensRemaining?: number;
}

const getRoleBadgeConfig = (roleStr: string) => {
  const role = roleStr.trim();
  const normalized = role.toUpperCase();

  if (normalized.includes('SUPER_ADMIN') || normalized.includes('SUPER ADMIN')) {
    return {
      label: role,
      className: 'bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      icon: Crown,
    };
  }
  if (normalized.includes('ADMIN')) {
    return {
      label: role,
      className: 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      icon: Shield,
    };
  }
  if (normalized.includes('ARCHITECT')) {
    return {
      label: role,
      className: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      icon: Sparkles,
    };
  }
  if (normalized.includes('ENGINEER') || normalized.includes('DEVELOPER') || normalized.includes('DEV')) {
    return {
      label: role,
      className: 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      icon: Layers,
    };
  }
  if (normalized.includes('REVIEWER')) {
    return {
      label: role,
      className: 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      icon: CheckCircle2,
    };
  }
  if (normalized.includes('AUDITOR') || normalized.includes('SECOPS')) {
    return {
      label: role,
      className: 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      icon: Activity,
    };
  }
  return {
    label: role,
    className: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: Shield,
  };
};

export const Header: React.FC<HeaderProps> = ({
  user,
  currentTheme,
  onThemeChange,
  onOpenAuthModal,
  onOpenApiKeyVault,
  onLogout,
  onToggleMobileSidebar,
  activeSession,
  isSandboxMode = false,
  totalTokensRemaining
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="min-h-16 h-auto py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-text transition-colors">
      
      {/* 좌측: 모바일 햄버거 & 세션 현황 배지 */}
      <div className="flex items-center gap-3 overflow-hidden">
        <button
          id="btn-mobile-sidebar-toggle"
          type="button"
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* 상단 실시간 세션 현황 요약 (M3 Status Pill) */}
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 max-w-[200px] sm:max-w-md truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="font-semibold text-slate-900 dark:text-slate-100 shrink-0 hidden sm:inline">
              [세션 #0006]
            </span>
            <span className="font-mono text-slate-600 dark:text-slate-400 truncate">
              {activeSession ? activeSession.session_goal : '환경별 로그인 분기 & 네비게이션 개편'}
            </span>
          </div>
        </div>
      </div>

      {/* 우측: 액션 및 사용자 컨트롤 영역 */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">

        {/* 사용자 프로필 및 인증 컨트롤 (단일 사용자 원칙: 조정국 SUPER_ADMIN) */}
        {user ? (
          <div className="relative shrink-0">
            <button
              id="btn-header-user-profile"
              type="button"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2.5 pl-2.5 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-all shrink-0 w-auto min-w-max"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                {user.name.charAt(0)}
              </div>
              <div className="text-left hidden sm:flex flex-col justify-center shrink-0 min-w-max">
                <span
                  className="text-xs font-semibold text-slate-900 dark:text-slate-100 block leading-tight whitespace-nowrap"
                  style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all' }}
                >
                  {user.name}
                </span>
                <div className="flex flex-col gap-1 mt-1 min-w-max">
                  {((user.role || '').toString())
                    .split(/[,/|\n\r]+/)
                    .map((r) => r.trim())
                    .filter(Boolean)
                    .map((roleName, index) => {
                      const cfg = getRoleBadgeConfig(roleName);
                      const Icon = cfg.icon;
                      return (
                        <span
                          key={index}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border font-semibold inline-flex items-center gap-1 leading-none shadow-2xs whitespace-nowrap ${cfg.className}`}
                          style={{ whiteSpace: 'nowrap', wordBreak: 'keep-all' }}
                        >
                          <Icon className="w-2.5 h-2.5 shrink-0" />
                          <span>{cfg.label}</span>
                        </span>
                      );
                    })}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-0.5" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60 space-y-1.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
                  <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate">{user.email}</p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {((user.role || '').toString())
                      .split(/[,/|\n\r]+/)
                      .map((r) => r.trim())
                      .filter(Boolean)
                      .map((roleName, index) => {
                        const cfg = getRoleBadgeConfig(roleName);
                        const Icon = cfg.icon;
                        return (
                          <span
                            key={index}
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md border font-semibold inline-flex items-center gap-1 ${cfg.className}`}
                          >
                            <Icon className="w-2.5 h-2.5 shrink-0" />
                            <span>{cfg.label}</span>
                          </span>
                        );
                      })}
                  </div>
                </div>

                {/* 테마 변경 옵션 (수납 레이어: 상시 노출 배제 원칙) */}
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1.5 flex items-center justify-between">
                    <span>화면 테마 설정</span>
                    <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-semibold">
                      {currentTheme === 'dark' ? '다크' : currentTheme === 'light' ? '라이트' : '시스템'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-lg">
                    <button
                      type="button"
                      onClick={() => onThemeChange('light')}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                        currentTheme === 'light'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Sun className="w-3 h-3 text-amber-500" />
                      <span>라이트</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onThemeChange('dark')}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                        currentTheme === 'dark'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Moon className="w-3 h-3 text-blue-400" />
                      <span>다크</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onThemeChange('system')}
                      className={`flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-all ${
                        currentTheme === 'system'
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Monitor className="w-3 h-3 text-slate-400" />
                      <span>시스템</span>
                    </button>
                  </div>
                </div>

                <div className="py-1 space-y-0.5">
                  <button
                    id="btn-header-apikey-vault"
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenApiKeyVault();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-500" />
                    <span>API Key Vault (보안 금고)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onOpenAuthModal();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    <span>사용자/권한 관리 정보</span>
                  </button>
                </div>
                <div className="pt-1 border-t border-slate-100 dark:border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>로그아웃 (세션 분리)</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            id="btn-header-login-trigger"
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs transition-colors shadow-sm"
          >
            <span>로그인</span>
          </button>
        )}

      </div>
    </header>
  );
};
