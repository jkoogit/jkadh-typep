/**
 * 환경 감지 및 런타임 인증 분기 유틸리티 (M3 GenAI Guideline 준수)
 * - 로컬/AI Studio 샌드박스: 개발 편의를 위한 자동 로그인 지원
 * - 배포 환경(Cloud Run 등): 정갈한 비로그인 화면 진입
 */

export interface EnvAuthConfig {
  isLocalSandbox: boolean;
  hostname: string;
  autoLoginAllowed: boolean;
}

export function detectEnvironment(): EnvAuthConfig {
  if (typeof window === 'undefined') {
    return { isLocalSandbox: true, hostname: 'server', autoLoginAllowed: true };
  }

  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0';
  
  // AI Studio 웹 컨테이너 또는 로컬 프록시 여부 감지
  const isSandbox = isLocalhost || 
                    hostname.includes('webcontainer') || 
                    hostname.includes('stackblitz') || 
                    hostname.includes('csb.app') ||
                    hostname.includes('cloudrun') === false;

  return {
    isLocalSandbox: isSandbox,
    hostname,
    autoLoginAllowed: isSandbox
  };
}

export function isSandboxOrLocalEnvironment(): boolean {
  return detectEnvironment().isLocalSandbox;
}

export function getStoredTheme(): 'light' | 'dark' | 'system' {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('jkadh_theme');
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'dark';
}

export function setStoredTheme(theme: 'light' | 'dark' | 'system'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('jkadh_theme', theme);
  applyThemeToDocument(theme);
}

export function applyThemeToDocument(theme: 'light' | 'dark' | 'system'): void {
  if (typeof window === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'system') {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  } else if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}
