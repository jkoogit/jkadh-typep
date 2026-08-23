import React from 'react';
import {
  LayoutDashboard,
  FileText,
  Database,
  GitBranch,
  Shield,
  Layers,
  Cpu,
  Terminal,
  Activity,
  Code2,
  Lock,
  ExternalLink,
  History
} from 'lucide-react';
import { TabType } from './Header';
import { ScrollableTabNav, TabItem } from './common/ScrollableTabNav';

interface ClassicConsoleViewProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  renderedTabContent: React.ReactNode;
}

export const ClassicConsoleView: React.FC<ClassicConsoleViewProps> = ({
  currentTab,
  onSelectTab,
  renderedTabContent
}) => {
  const tabs: TabItem<TabType>[] = [
    { id: 'PROPOSALS', label: '아키텍처 기획', icon: FileText },
    { id: 'LIFECYCLE', label: '7-Phase 라이프사이클', icon: Layers },
    { id: 'SESSION', label: '세션 거버넌스', icon: Shield },
    { id: 'VIBE_SANDBOX', label: 'Vibe 코딩 샌드박스', icon: Code2 },
    { id: 'DASHBOARD', label: '메트릭스 대시보드', icon: LayoutDashboard },
    { id: 'MODELS', label: 'AI 모델 레지스트리', icon: Cpu },
    { id: 'TEAM', label: '팀/계정 관리', icon: Lock },
    { id: 'DATABASE', label: 'DB 탐색기', icon: Database },
    { id: 'DOCUMENTATION', label: '표준 문서', icon: FileText },
    { id: 'TELEMETRY', label: '토큰 텔레메트리', icon: Activity },
    { id: 'AUDIT_TRAIL', label: '정보 변경이력 조회 (JSON Diff)', icon: History, badge: 'v2.4' },
  ];

  return (
    <div className="space-y-4 pb-12">
      {/* AS-IS 상단 탭 헤더 배너 (상하 열거 레이아웃) */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 space-y-2.5 text-xs shadow-xs">
        <div>
          <span className="font-bold text-amber-900 dark:text-amber-200 block text-sm">
            🗂️ AS-IS 클래식 올인원 콘솔 (Legacy Control Center)
          </span>
          <p className="text-amber-700 dark:text-amber-300 mt-0.5">
            기존 상단 10대 메뉴 탭이 100% 동일하게 보존되어 있습니다. 자유롭게 탭을 전환하여 작업하세요.
          </p>
        </div>
        <div className="pt-2 border-t border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2">
          <span className="font-mono text-[11px] px-2.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700">
            Dual-Track Mode Active
          </span>
          <span className="text-[11px] text-amber-700 dark:text-amber-400">
            총 {tabs.length}개 클래식 메뉴 지원
          </span>
        </div>
      </div>

      {/* 기존 10대 상단 탭 스크롤 네비게이션 바 (좌우 스크롤 & 탭 간격 이동 지원) */}
      <ScrollableTabNav<TabType>
        tabs={tabs}
        activeTab={currentTab}
        onSelectTab={onSelectTab}
        idPrefix="classic-tab"
      />

      {/* 탭 렌더링 컨텐츠 영역 */}
      <div className="pt-2">
        {renderedTabContent}
      </div>
    </div>
  );
};
