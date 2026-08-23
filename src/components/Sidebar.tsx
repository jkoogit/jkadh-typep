import React from 'react';
import {
  LayoutDashboard,
  Code2,
  Settings2,
  FileText,
  TerminalSquare,
  Sparkles,
  ChevronRight,
  Shield,
  Layers,
  Cpu,
  Database,
  CheckCircle,
  Clock,
  ExternalLink,
  ChevronLeft,
  X,
  History
} from 'lucide-react';

export type MainNavCategory = 'dashboard' | 'service-dev' | 'admin-config' | 'audit-trail' | 'docs' | 'classic-console';

export interface MainNavItem {
  id: MainNavCategory;
  label: string;
  subLabel?: string;
  icon: React.ElementType;
  badge?: string;
}

interface SidebarProps {
  currentCategory: MainNavCategory;
  onSelectCategory: (category: MainNavCategory) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  activeSessionId?: string;
}

export const MAIN_NAV_ITEMS: MainNavItem[] = [
  {
    id: 'dashboard',
    label: '메인 대시보드',
    subLabel: '플랫폼 KPI & 세션 관제',
    icon: LayoutDashboard
  },
  {
    id: 'service-dev',
    label: '서비스 개발',
    subLabel: 'Vibe 러너 / PDF 엔진 / 모델',
    icon: Code2,
    badge: 'Core'
  },
  {
    id: 'admin-config',
    label: '개발기능 관리',
    subLabel: '거버넌스 / DB / DAG / 권한',
    icon: Settings2
  },
  {
    id: 'audit-trail',
    label: '정보 변경이력 조회',
    subLabel: '스키마·관리정보 JSON Diff',
    icon: History,
    badge: 'v2.4'
  },
  {
    id: 'docs',
    label: '표준 문서 & 회고',
    subLabel: '16대 표준 및 이슈/PR',
    icon: FileText
  },
  {
    id: 'classic-console',
    label: 'AS-IS 클래식 콘솔',
    subLabel: '기존 상단 10대 탭 올인원',
    icon: TerminalSquare,
    badge: 'Legacy'
  }
];

export const Sidebar: React.FC<SidebarProps> = ({
  currentCategory,
  onSelectCategory,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  activeSessionId = 'SES-20260820-UI-REVAMP-10'
}) => {
  const content = (
    <div className="h-full flex flex-col justify-between bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 transition-all duration-200 select-text">
      {/* 사이드바 상단 로고 & 브랜딩 */}
      <div>
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                JK
              </div>
              <div className="truncate">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100 block truncate">
                  JKADH Platform
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                  v2.2.0 Stable
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto">
              <div className="w-8 h-8 rounded-lg bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                JK
              </div>
            </div>
          )}

          {/* 모바일 닫기 버튼 */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 메인 메뉴 네비게이션 목록 (Material 3 Navigation Drawer Specs) */}
        <nav className="p-2 space-y-1.5">
          {MAIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentCategory === item.id;

            return (
              <button
                id={`sidebar-nav-${item.id}`}
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectCategory(item.id);
                  onCloseMobile();
                }}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 relative ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200/80 dark:border-blue-800/60 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                />

                {!isCollapsed && (
                  <div className="flex-1 text-left truncate">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono uppercase tracking-wider ${
                            item.badge === 'Legacy'
                              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                              : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    {item.subLabel && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-normal block truncate mt-0.5">
                        {item.subLabel}
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 사이드바 하단 정보 & 접기 토글 */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        {!isCollapsed && (
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              <span className="font-semibold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                활성 세션
              </span>
              <span className="font-mono text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                [0006]
              </span>
            </div>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate" title={activeSessionId}>
              {activeSessionId}
            </p>
          </div>
        )}

        {/* 데스크톱 접기/펼치기 버튼 */}
        <button
          id="btn-toggle-sidebar-collapse"
          type="button"
          onClick={onToggleCollapse}
          className="hidden md:flex w-full items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>사이드바 축소</span>
            </>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* 데스크톱 사이드바 (고정) */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-200 h-screen sticky top-0 ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {content}
      </aside>

      {/* 모바일 오버레이 드로어 (M3 Modal Navigation Drawer) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
