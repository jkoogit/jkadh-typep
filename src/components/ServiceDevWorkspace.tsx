import React from 'react';
import {
  Code2,
  Cpu,
  Layers,
  FileCheck2,
  FileText,
  Workflow,
  Sparkles,
  Activity
} from 'lucide-react';
import { ModelMeta, TaskGraphNode, AIAccount } from '../types';
import { VibeRunnerSandbox } from './VibeRunnerSandbox';
import { TokenQuotaTelemetryDashboard } from './TokenQuotaTelemetryDashboard';
import { ModelMetaRegistryView } from './ModelMetaRegistryView';
import { ScrollableTabNav, TabItem } from './common/ScrollableTabNav';

export type ServiceDevSubTab =
  | 'VIBE_RUNNER'
  | 'TOKEN_TELEMETRY'
  | 'MODEL_REGISTRY';

interface ServiceDevWorkspaceProps {
  currentSubTab: ServiceDevSubTab;
  onSelectSubTab: (subTab: ServiceDevSubTab) => void;
  tasks: TaskGraphNode[];
  models: ModelMeta[];
  accounts: AIAccount[];
  selectedTaskId: string;
  onAdvanceTaskPhase: (taskId: string, phaseNum: number) => Promise<void>;
  onRunAIVibe: (taskId: string, phaseNum: number) => void;
  onRefreshAccounts: () => Promise<void>;
  onUpdateModelFallback: (id: string, fallbackOrder: string[]) => Promise<void>;
  onToggleModelAvailability: (id: string, isAvailable: boolean) => Promise<void>;
  onOpenApiKeyVault: () => void;
}

export const ServiceDevWorkspace: React.FC<ServiceDevWorkspaceProps> = ({
  currentSubTab,
  onSelectSubTab,
  tasks,
  models,
  accounts,
  selectedTaskId,
  onAdvanceTaskPhase,
  onRunAIVibe,
  onRefreshAccounts,
  onUpdateModelFallback,
  onToggleModelAvailability,
  onOpenApiKeyVault
}) => {
  const subTabs: TabItem<ServiceDevSubTab>[] = [
    { id: 'VIBE_RUNNER', label: '7-Phase Vibe 코딩 러너 & AST 검증', icon: Code2, badge: 'Core' },
    { id: 'TOKEN_TELEMETRY', label: 'AI 토큰 텔레메트리 & 서킷 브레이커', icon: Activity },
    { id: 'MODEL_REGISTRY', label: 'AI 모델 메타정보 & Fallback 라우터', icon: Cpu },
  ];

  return (
    <div className="space-y-4 pb-12">
      
      {/* 서브 탭 네비게이션 바 (좌우 스크롤 & 탭 간격 이동 지원) */}
      <ScrollableTabNav<ServiceDevSubTab>
        tabs={subTabs}
        activeTab={currentSubTab}
        onSelectTab={onSelectSubTab}
        idPrefix="service-subtab"
      />

      {/* 서브 탭 컨텐츠 영역 */}
      <div>
        {currentSubTab === 'VIBE_RUNNER' && (
          <VibeRunnerSandbox
            tasks={tasks}
            models={models}
            defaultTaskId={selectedTaskId}
          />
        )}

        {currentSubTab === 'TOKEN_TELEMETRY' && (
          <TokenQuotaTelemetryDashboard
            accounts={accounts}
            models={models}
            onRefreshAccounts={onRefreshAccounts}
          />
        )}

        {currentSubTab === 'MODEL_REGISTRY' && (
          <ModelMetaRegistryView
            models={models}
            onUpdateFallback={onUpdateModelFallback}
            onToggleAvailability={onToggleModelAvailability}
          />
        )}
      </div>

    </div>
  );
};
