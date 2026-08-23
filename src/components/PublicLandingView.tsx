import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  LogIn, 
  CheckCircle2, 
  User, 
  Sparkles, 
  Layers, 
  Terminal,
  ArrowRight,
  Lock
} from 'lucide-react';
import { UserAccount } from '../types';

interface PublicLandingViewProps {
  onLogin: (user: UserAccount) => void;
  onOpenRegisterModal?: () => void;
  isSandboxMode?: boolean;
}

export const PublicLandingView: React.FC<PublicLandingViewProps> = ({
  onLogin,
  onOpenRegisterModal,
  isSandboxMode = false
}) => {
  const [email, setEmail] = useState('jkoogit@gmail.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fallbackSuperUser: UserAccount = {
    id: 'usr_jkoogi_01',
    email: 'jkoogit@gmail.com',
    name: '조정국 (Jeongkook Koo)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    role: 'SUPER_ADMIN',
    isSuperAdmin: true,
    department: 'JKADH Platform Engineering',
    dailyTokenLimit: 5000000,
    tokensUsedToday: 412000,
    monthlyBudgetUSD: 500,
    status: 'ACTIVE',
    reg_sys_cd: 'JKADH_CORE',
    reg_user_id: 'SYSTEM',
    reg_dt: '2026-08-16 00:00:00',
    mod_sys_cd: 'JKADH_CORE',
    mod_user_id: 'SYSTEM',
    mod_dt: '2026-08-16 00:00:00',
  };

  const handleMasterDirectLogin = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onLogin(fallbackSuperUser);
      setIsSubmitting(false);
    }, 250);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('이메일을 입력해 주세요.');
      return;
    }
    setIsSubmitting(true);
    setErrorMessage(null);
    
    setTimeout(() => {
      if (email.trim() === 'jkoogit@gmail.com' || email.trim() === 'mem-jkoo') {
        onLogin(fallbackSuperUser);
      } else {
        onLogin({
          ...fallbackSuperUser,
          id: `usr_${Date.now()}`,
          email: email.trim(),
          name: email.split('@')[0],
          isSuperAdmin: false,
          role: 'ENGINEER'
        });
      }
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between p-4 sm:p-6 lg:p-8 font-sans antialiased transition-colors duration-200">
      
      {/* 상단 간결한 헤더 */}
      <header className="w-full max-w-5xl mx-auto flex items-center justify-between py-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            JK
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">
                JKADH AI Platform
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                v2.2.0
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              엔터프라이즈 AI 플랫폼 거버넌스 & Vibe 코딩 하네스
            </p>
          </div>
        </div>

        {isSandboxMode && (
          <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-medium">Sandbox Mode (Previewing Public View)</span>
          </div>
        )}
      </header>

      {/* 중앙 심플 M3 인증 카드 (구글 Material 3 GenAI 가이드라인 기준) */}
      <main className="w-full max-w-md mx-auto my-auto py-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
          
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-3 border border-blue-100 dark:border-blue-800/50">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              플랫폼 인증 및 시스템 진입
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              승인된 작업자 계정으로 로그인하여 세션 워크스페이스에 접속합니다.
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* 1-Click 마스터 접속 버튼 (Google M3 Filled Primary Button) */}
          <button
            id="btn-master-fast-login"
            type="button"
            onClick={handleMasterDirectLogin}
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium py-3 px-4 rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 mb-4"
          >
            <Shield className="w-4 h-4 text-blue-200" />
            <span className="text-sm">조정국 (SUPER_ADMIN) 1-Click 인증</span>
            <ArrowRight className="w-4 h-4 ml-auto text-blue-200" />
          </button>

          <div className="relative flex py-2 items-center mb-4">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
            <span className="flex-shrink mx-3 text-xs font-medium text-slate-400 dark:text-slate-500">또는 이메일 로그인</span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* 표준 이메일 로그인 폼 */}
          <form onSubmit={handleFormSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                계정 식별자 / 이메일
              </label>
              <input
                id="input-login-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jkoogit@gmail.com 또는 mem-jkoo"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                비밀번호
              </label>
              <input
                id="input-login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Outlined Action Button */}
            <button
              id="btn-submit-email-login"
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-200 font-medium py-2.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>로그인</span>
            </button>
          </form>

          {/* 하단 안내 텍스트 & 링크 */}
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              계정이 없으신가요?{' '}
              <button
                type="button"
                onClick={onOpenRegisterModal}
                className="text-blue-600 dark:text-blue-400 font-medium hover:underline focus:outline-none"
              >
                신규 권한 신청 / 등록
              </button>
            </p>
          </div>
        </div>

        {/* M3 간결한 시스템 상태 뱃지 요약 */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>6대 하네스 거버넌스 가동중</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>7-Phase Vibe 루프 준비완료</span>
          </span>
        </div>
      </main>

      {/* 하단 단정한 푸터 */}
      <footer className="w-full max-w-5xl mx-auto py-3 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div>
          <span>© 2026 JKADH AI Platform. 책임자: </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">조정국 (SUPER_ADMIN)</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
          <span>PostgreSQL 6-Audit Active</span>
          <span>•</span>
          <span>Circuit Breaker Active</span>
        </div>
      </footer>

    </div>
  );
};
