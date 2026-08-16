import React from 'react';
import {
  Layers,
  Cpu,
  Users,
  Database,
  BarChart3,
  Lightbulb,
  PlayCircle,
  ShieldCheck,
  Zap,
  Terminal,
  BookOpen,
  Code2,
} from 'lucide-react';

export type TabType =
  | 'LIFECYCLE'
  | 'DOCUMENTATION'
  | 'PROPOSALS'
  | 'DASHBOARD'
  | 'MODELS'
  | 'TEAM'
  | 'DATABASE';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onOpenLiveRunner: () => void;
  totalTokensRemaining: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenLiveRunner,
  totalTokensRemaining,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#161B22] border-b border-[#30363D] text-[#E6EDF3]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Project Scope */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm border border-blue-500/40 font-bold text-white italic">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight text-[#E6EDF3]">
                  JKADH AI DevPlatform
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30">
                  Prototype
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#7D8590]">
                <span className="flex items-center gap-1 font-mono text-[11px] text-emerald-400">
                  <Database className="w-3 h-3 text-emerald-400 inline" />
                  jkadhp_dev (PostgreSQL)
                </span>
                <span>•</span>
                <span className="text-[#7D8590] font-mono text-[11px]">
                  Target: <strong className="text-[#E6EDF3]">PDFowers</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badge & Action Button */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-md bg-[#0D1117] border border-[#30363D] text-xs">
              <span className="text-[#7D8590]">AI Pool:</span>
              <span className="font-mono font-semibold text-emerald-400">
                {(totalTokensRemaining / 1000000).toFixed(1)}M Tokens
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <button
              onClick={onOpenLiveRunner}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-sm transition border border-blue-500/40 cursor-pointer active:scale-95"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>실시간 Vibe 파이프라인 실행</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 overflow-x-auto no-scrollbar border-t border-[#30363D] py-1">
          <button
            onClick={() => setActiveTab('LIFECYCLE')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'LIFECYCLE'
                ? 'bg-[#21262D] text-[#E6EDF3] border border-[#30363D]'
                : 'text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#21262D]/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-400" />
            <span>7단계 작업 라이프사이클 (PDFowers)</span>
          </button>

          <button
            onClick={() => setActiveTab('DOCUMENTATION')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'DOCUMENTATION'
                ? 'bg-[#21262D] text-[#E6EDF3] border border-[#30363D]'
                : 'text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#21262D]/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>jkadh 아키텍처 문서 (/docs)</span>
          </button>

          <button
            onClick={() => setActiveTab('PROPOSALS')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'PROPOSALS'
                ? 'bg-[#21262D] text-[#E6EDF3] border border-[#30363D]'
                : 'text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#21262D]/60'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>작업 분석 &amp; 의사결정 제안 (사례 기반)</span>
          </button>

          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'DASHBOARD'
                ? 'bg-[#21262D] text-[#E6EDF3] border border-[#30363D]'
                : 'text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#21262D]/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>토큰 & 사용량 모니터링</span>
          </button>

          <button
            onClick={() => setActiveTab('MODELS')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'MODELS'
                ? 'bg-[#21262D] text-[#E6EDF3] border border-[#30363D]'
                : 'text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#21262D]/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>AI 모델 메타 & Fallback 라우팅</span>
          </button>

          <button
            onClick={() => setActiveTab('TEAM')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'TEAM'
                ? 'bg-[#21262D] text-[#E6EDF3] border border-[#30363D]'
                : 'text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#21262D]/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>팀 계정 & RBAC 권한 관리</span>
          </button>

          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'DATABASE'
                ? 'bg-[#21262D] text-[#E6EDF3] border border-[#30363D]'
                : 'text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#21262D]/60'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-indigo-400" />
            <span>PostgreSQL jkadhp_dev 탐색기</span>
          </button>
        </div>
      </div>
    </header>
  );
};
