import React, { useState } from 'react';
import {
  Shield,
  Layers,
  Database,
  Users,
  GitBranch,
  Terminal,
  Workflow,
  Sparkles,
  Lock,
  History
} from 'lucide-react';
import {
  HarnessSessionRecord,
  TaskGraphNode,
  AIAccount,
  TeamMember,
  DatabaseTableMeta,
  MemberRole,
  ModelMeta,
  UserAccount,
  AuditTrailRecord
} from '../types';

import { SessionGovernanceView } from './SessionGovernanceView';
import { StageGateControlPanel } from './StageGateControlPanel';
import { TaskGraphViewer } from './TaskGraphViewer';
import { DevDatabaseExplorerView } from './DevDatabaseExplorerView';
import { TeamAccountManagerView } from './TeamAccountManagerView';
import { GlobalAuditTrailView } from './GlobalAuditTrailView';
import { ScrollableTabNav, TabItem } from './common/ScrollableTabNav';

export type AdminConfigSubTab =
  | 'SESSION_GOV'
  | 'STAGE_GATE'
  | 'TASK_DAG'
  | 'DB_EXPLORER'
  | 'TEAM_ROLES'
  | 'AUDIT_TRAIL';

interface AdminConfigWorkspaceProps {
  currentUser?: UserAccount | null;
  currentSubTab: AdminConfigSubTab;
  onSelectSubTab: (subTab: AdminConfigSubTab) => void;
  tasks: TaskGraphNode[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
  accounts: AIAccount[];
  members: TeamMember[];
  models?: ModelMeta[];
  tables: DatabaseTableMeta[];
  databaseName: string;
  auditRecords?: AuditTrailRecord[];
  onAddAuditRecord?: (record: AuditTrailRecord) => void;
  onRunQuery: (query: string, database?: string) => Promise<any>;
  onAdvanceTaskPhase: (taskId: string, phaseNum: number) => Promise<void>;
  onResetAccountTokens: (id: string) => Promise<void>;
  onUpdateMemberRole: (id: string, role: MemberRole) => Promise<void>;
  onUpdateMemberRoles?: (id: string, roles: MemberRole[]) => Promise<void>;
  onUpdateMemberProjectRoles?: (memberId: string, projectId: string, roles: MemberRole[]) => Promise<void>;
  onUpdateMemberLimit: (id: string, limit: number, isAutoSynced?: boolean) => Promise<void>;
  onUpdateMemberAvatar?: (id: string, avatar: string) => Promise<void>;
  onUpdateMemberAllowedModels?: (id: string, models: string[]) => Promise<void>;
  onUpdateModelColor?: (modelId: string, color: string) => Promise<void>;
  onRefreshDb?: () => Promise<void>;
  onOpenApiKeyVault: () => void;
}

export const AdminConfigWorkspace: React.FC<AdminConfigWorkspaceProps> = ({
  currentUser,
  currentSubTab,
  onSelectSubTab,
  tasks,
  selectedTaskId,
  onSelectTask,
  accounts,
  members,
  models,
  tables,
  databaseName,
  auditRecords = [],
  onAddAuditRecord,
  onRunQuery,
  onAdvanceTaskPhase,
  onResetAccountTokens,
  onUpdateMemberRole,
  onUpdateMemberRoles,
  onUpdateMemberProjectRoles,
  onUpdateMemberLimit,
  onUpdateMemberAvatar,
  onUpdateMemberAllowedModels,
  onUpdateModelColor,
  onRefreshDb,
  onOpenApiKeyVault
}) => {
  const subTabs: TabItem<AdminConfigSubTab>[] = [
    { id: 'SESSION_GOV', label: '하네스 세션 거버넌스', icon: Shield, badge: 'Gov' },
    { id: 'STAGE_GATE', label: '7-Phase 품질 게이트 판정', icon: Layers },
    { id: 'TASK_DAG', label: '2계층 WBS 작업그래프 (DAG)', icon: GitBranch },
    { id: 'DB_EXPLORER', label: 'PostgreSQL DB & 스키마 관리', icon: Database },
    { id: 'TEAM_ROLES', label: '팀 RBAC 권한 & 예산 통제', icon: Users },
    { id: 'AUDIT_TRAIL', label: '정보 변경이력 조회 (JSON Diff)', icon: History, badge: 'v2.4' },
  ];

  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];
  const currentPhase = selectedTask ? selectedTask.phases.find(p => p.phaseNumber === selectedTask.currentPhase) || selectedTask.phases[0] : null;

  return (
    <div className="space-y-4 pb-12">
      
      {/* 서브 탭 네비게이션 바 (좌우 스크롤 & 탭 간격 이동 지원) */}
      <ScrollableTabNav<AdminConfigSubTab>
        tabs={subTabs}
        activeTab={currentSubTab}
        onSelectTab={onSelectSubTab}
        idPrefix="admin-subtab"
      />

      {/* 서브 탭 컨텐츠 영역 */}
      <div>
        {currentSubTab === 'SESSION_GOV' && (
          <SessionGovernanceView
            tasks={tasks}
            onSelectTask={onSelectTask}
            selectedTaskId={selectedTaskId}
          />
        )}

        {currentSubTab === 'STAGE_GATE' && selectedTask && currentPhase && (
          <StageGateControlPanel
            taskId={selectedTask.id}
            taskCode={selectedTask.code}
            phaseNumber={currentPhase.phaseNumber}
            phaseCode={currentPhase.code}
            phaseNameKr={currentPhase.nameKr}
            assignedModelId={currentPhase.assignedModelId}
            fallbackModelId={currentPhase.fallbackModelId}
            onAdvancePhase={async () => {
              await onAdvanceTaskPhase(selectedTask.id, selectedTask.currentPhase);
            }}
          />
        )}

        {currentSubTab === 'TASK_DAG' && (
          <TaskGraphViewer
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={onSelectTask}
          />
        )}

        {currentSubTab === 'DB_EXPLORER' && (
          <DevDatabaseExplorerView
            tables={tables}
            databaseName={databaseName}
            onRunQuery={onRunQuery}
            onNavigateToAuditTrail={(tableName) => {
              setAuditSearchQuery(tableName || '');
              onSelectSubTab('AUDIT_TRAIL');
            }}
          />
        )}

        {currentSubTab === 'TEAM_ROLES' && (
          <TeamAccountManagerView
            currentUser={currentUser}
            accounts={accounts}
            members={members}
            models={models}
            onResetAccountTokens={onResetAccountTokens}
            onUpdateMemberRole={onUpdateMemberRole}
            onUpdateMemberRoles={onUpdateMemberRoles}
            onUpdateMemberProjectRoles={onUpdateMemberProjectRoles}
            onUpdateMemberLimit={onUpdateMemberLimit}
            onUpdateMemberAvatar={onUpdateMemberAvatar}
            onUpdateMemberAllowedModels={onUpdateMemberAllowedModels}
            onUpdateModelColor={onUpdateModelColor}
            onRefreshDb={onRefreshDb}
          />
        )}

        {currentSubTab === 'AUDIT_TRAIL' && (
          <GlobalAuditTrailView
            auditRecords={auditRecords}
            onAddAuditRecord={onAddAuditRecord}
            initialSearchQuery={auditSearchQuery}
          />
        )}
      </div>

    </div>
  );
};
