import React, { useState, useEffect } from 'react';
import {
  HarnessSessionRecord,
  TaskGraphNode,
  UserAccount,
  ModelMeta,
  TeamMember,
  AIAccount,
  DatabaseTableMeta,
  DocumentationSection,
  ExecutionMetric,
  MemberRole,
  AuditTrailRecord
} from './types';
import {
  INITIAL_MODELS,
  INITIAL_MEMBERS,
  INITIAL_AI_ACCOUNTS,
  INITIAL_DB_TABLES,
  INITIAL_DOCUMENTATION_SECTIONS,
  INITIAL_METRICS_CHART_DATA,
  INITIAL_TASK_GRAPH,
  INITIAL_ARCHITECTURAL_PROPOSALS,
  initialAuditTrailRecords
} from './data/initialData';
import { api } from './services/api';
import { isSandboxOrLocalEnvironment } from './services/envService';

// 새 M3 레이아웃 컴포넌트
import { Sidebar, MainNavCategory } from './components/Sidebar';
import { Header, TabType } from './components/Header';
import { MainDashboardView } from './components/MainDashboardView';
import { ServiceDevWorkspace, ServiceDevSubTab } from './components/ServiceDevWorkspace';
import { AdminConfigWorkspace, AdminConfigSubTab } from './components/AdminConfigWorkspace';
import { ClassicConsoleView } from './components/ClassicConsoleView';
import { PublicLandingView } from './components/PublicLandingView';
import { AuthModal } from './components/AuthModal';
import { ApiKeyVaultModal } from './components/ApiKeyVaultModal';
import { GlobalAuditTrailView } from './components/GlobalAuditTrailView';

// AS-IS 뷰 컴포넌트들 (Classic Console 및 세부 탭용)
import { ProposalView } from './components/ProposalView';
import { LifecycleOrchestratorView } from './components/LifecycleOrchestratorView';
import { SessionGovernanceView } from './components/SessionGovernanceView';
import { VibeRunnerSandbox } from './components/VibeRunnerSandbox';
import { DashboardView } from './components/DashboardView';
import { ModelMetaRegistryView } from './components/ModelMetaRegistryView';
import { TeamAccountManagerView } from './components/TeamAccountManagerView';
import { DevDatabaseExplorerView } from './components/DevDatabaseExplorerView';
import { DocumentationView } from './components/DocumentationView';
import { TokenQuotaTelemetryDashboard } from './components/TokenQuotaTelemetryDashboard';

export const App: React.FC = () => {
  // 1. 환경 및 인증 상태 (Local/Sandbox vs Deployed)
  const isSandbox = isSandboxOrLocalEnvironment();
  
  // 기본 마스터 사용자: 조정국 SUPER_ADMIN
  const masterUser: UserAccount = {
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

  // 로컬/샌드박스에서는 자동 로그인, 배포 환경에서는 초기 비로그인
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    return isSandbox ? masterUser : null;
  });

  // 2. 테마 상태 (M3 System / Dark / Light)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('dark');

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  // 3. 네비게이션 상태 (M3 대시보드 / 서비스개발 / 개발관리 / 문서 / 클래식콘솔)
  const [mainCategory, setMainCategory] = useState<MainNavCategory>('dashboard');
  const [serviceDevSubTab, setServiceDevSubTab] = useState<ServiceDevSubTab>('VIBE_RUNNER');
  const [adminConfigSubTab, setAdminConfigSubTab] = useState<AdminConfigSubTab>('SESSION_GOV');
  const [classicTab, setClassicTab] = useState<TabType>('PROPOSALS');
  const [auditSearchQuery, setAuditSearchQuery] = useState<string>('');

  // 사이드바 UI 상태
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // 4. 모달 상태
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isApiKeyVaultOpen, setIsApiKeyVaultOpen] = useState<boolean>(false);

  // 5. 핵심 데이터 상태 (PostgreSQL / In-Memory Mock Fallback)
  const [tasks, setTasks] = useState<TaskGraphNode[]>(INITIAL_TASK_GRAPH || []);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(INITIAL_TASK_GRAPH[0]?.id || 'node-pdf-ocr');
  const [models, setModels] = useState<ModelMeta[]>(INITIAL_MODELS);
  const [accounts, setAccounts] = useState<AIAccount[]>(INITIAL_AI_ACCOUNTS);
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [tables, setTables] = useState<DatabaseTableMeta[]>(INITIAL_DB_TABLES);
  const [docs, setDocs] = useState<DocumentationSection[]>(INITIAL_DOCUMENTATION_SECTIONS);
  const [metrics, setMetrics] = useState<ExecutionMetric[]>(INITIAL_METRICS_CHART_DATA);
  const [auditRecords, setAuditRecords] = useState<AuditTrailRecord[]>(initialAuditTrailRecords);

  const [activeSession, setActiveSession] = useState<HarnessSessionRecord>({
    id: 'ses_20260820_01',
    session_code: 'SES-20260820-UI-REVAMP-10',
    user_id: 'mem-jkoo',
    user_email: 'jkoogit@gmail.com',
    user_role: 'SUPER_ADMIN',
    target_database: 'jkadh_dev',
    active_task_id: 'PLAT-AUTH-UI-09',
    active_task_code: 'PLAT-AUTH-UI-09',
    active_phase_num: 3,
    session_goal: '환경별 로그인 분기 처리 및 Google M3 기반 네비게이션 화면 구조 개편',
    status: 'ACTIVE',
    started_at: '2026-08-20 09:00:00',
    last_heartbeat_at: '2026-08-20 09:15:00',
    tokens_consumed: 342000,
    cost_usd: 12.8,
    execution_count: 14,
    reg_sys_cd: 'JKADH_CORE',
    reg_user_id: 'SYSTEM',
    reg_dt: '2026-08-20 09:00:00',
    mod_sys_cd: 'JKADH_CORE',
    mod_user_id: 'SYSTEM',
    mod_dt: '2026-08-20 09:15:00',
  });

  // 데이터 로딩
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [tasksRes, modelsRes, accountsRes, membersRes, tablesRes, docsRes] = await Promise.allSettled([
          api.getTasks(),
          api.getModels(),
          api.getAccounts(),
          api.getMembers(),
          api.getDbTables(),
          api.getDocumentation(),
        ]);

        if (tasksRes.status === 'fulfilled' && tasksRes.value.data) setTasks(tasksRes.value.data);
        if (modelsRes.status === 'fulfilled' && modelsRes.value.data) setModels(modelsRes.value.data);
        if (accountsRes.status === 'fulfilled' && accountsRes.value.data) setAccounts(accountsRes.value.data);
        if (membersRes.status === 'fulfilled' && membersRes.value.data) setMembers(membersRes.value.data);
        if (tablesRes.status === 'fulfilled' && tablesRes.value.data) setTables(tablesRes.value.data);
        if (docsRes.status === 'fulfilled' && docsRes.value.data) setDocs(docsRes.value.data);
      } catch (err) {
        console.warn('Initial data load warning, using memory state:', err);
      }
    };

    loadInitialData();
  }, []);

  // 핸들러 함수들
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleRunQuery = async (query: string, database?: string) => {
    return await api.runDbQuery(query, database);
  };

  const handleAdvanceTaskPhase = async (taskId: string, phaseNum: number) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const nextPhase = Math.min(7, phaseNum + 1);
        return {
          ...t,
          currentPhase: nextPhase,
          status: nextPhase === 7 ? 'DONE' : 'IN_PROGRESS'
        };
      }
      return t;
    }));
  };

  const handleRunAIVibe = (taskId: string, phaseNum: number) => {
    setMainCategory('service-dev');
    setServiceDevSubTab('VIBE_RUNNER');
    setSelectedTaskId(taskId);
  };

  const handleResetAccountTokens = async (id: string) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, usedTokens: 0, status: 'HEALTHY' } : a));
  };

  const handleUpdateMemberRole = async (id: string, role: MemberRole) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, role, roles: [role] } : m));
    try {
      await api.updateMemberPermissions(id, { role, roles: [role] });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMemberRoles = async (id: string, roles: MemberRole[]) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, roles, role: roles[0] || m.role } : m));
    try {
      await api.updateMemberPermissions(id, { roles, role: roles[0] });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMemberLimit = async (id: string, limit: number, isAutoSynced?: boolean) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, dailyTokenLimit: limit, isTokenAutoSynced: isAutoSynced } : m));
    try {
      await api.updateMemberPermissions(id, { dailyTokenLimit: limit, isTokenAutoSynced: isAutoSynced });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMemberAvatar = async (id: string, avatar: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, avatar } : m));
    try {
      await api.updateMemberPermissions(id, { avatar });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMemberAllowedModels = async (id: string, allowedModels: string[]) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, allowedModels } : m));
    try {
      await api.updateMemberPermissions(id, { allowedModels });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateMemberProjectRoles = async (memberId: string, projectId: string, roles: MemberRole[]) => {
    setMembers(prev => prev.map(m => {
      if (m.id === memberId) {
        const nextProjectRoles = { ...(m.projectRoles || {}), [projectId]: roles };
        return {
          ...m,
          projectRoles: nextProjectRoles,
          roles: projectId === 'proj-all' ? roles : (m.roles || [m.role]),
          role: projectId === 'proj-all' && roles.length > 0 ? roles[0] : m.role,
        };
      }
      return m;
    }));
    try {
      const member = members.find(m => m.id === memberId);
      const nextProjectRoles = { ...(member?.projectRoles || {}), [projectId]: roles };
      await api.updateMemberPermissions(memberId, {
        projectRoles: nextProjectRoles,
        roles: projectId === 'proj-all' ? roles : member?.roles,
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateModelColor = async (modelId: string, color: string) => {
    setModels(prev => prev.map(m => m.id === modelId ? { ...m, badgeColor: color } : m));
    try {
      await api.updateModelFallback(modelId, { badgeColor: color });
    } catch (e) {
      console.error(e);
    }
  };

  const handleRefreshDb = async () => {
    try {
      const [memRes, accRes] = await Promise.all([api.getMembers(), api.getAccounts()]);
      if (memRes && memRes.data) setMembers(memRes.data);
      if (accRes && accRes.data) setAccounts(accRes.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateModelFallback = async (id: string, fallbackOrder: string[]) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, fallbackOrder } : m));
  };

  const handleToggleModelAvailability = async (id: string, isAvailable: boolean) => {
    setModels(prev => prev.map(m => m.id === id ? { ...m, isAvailable } : m));
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId) || tasks[0];

  // AS-IS 클래식 콘솔 탭 렌더러
  const renderClassicTabContent = () => {
    switch (classicTab) {
      case 'PROPOSALS':
        return (
          <ProposalView
            proposals={INITIAL_ARCHITECTURAL_PROPOSALS}
            onSelectTaskTab={() => {
              setClassicTab('LIFECYCLE');
            }}
          />
        );
      case 'LIFECYCLE':
        return (
          <LifecycleOrchestratorView
            tasks={tasks}
            selectedTask={selectedTask}
            onSelectTask={(id) => setSelectedTaskId(id)}
            onVerifyAndAdvance={handleAdvanceTaskPhase}
            onRunAIVibe={handleRunAIVibe}
            isProcessing={false}
          />
        );
      case 'SESSION':
        return (
          <SessionGovernanceView
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={(id) => setSelectedTaskId(id)}
          />
        );
      case 'VIBE_SANDBOX':
        return (
          <VibeRunnerSandbox
            tasks={tasks}
            models={models}
            defaultTaskId={selectedTaskId}
          />
        );
      case 'DASHBOARD':
        return (
          <DashboardView
            accounts={accounts}
            chartData={metrics}
            summary={{
              totalTokensConsumed: 4230000,
              totalRemainingTokens: 19590000,
              monthlyBudgetUSD: 1450,
              currentCostUSD: 637.2,
              activeMembersCount: members.length,
              avgSpecValidationScore: 94
            }}
          />
        );
      case 'MODELS':
        return (
          <ModelMetaRegistryView
            models={models}
            onUpdateFallback={handleUpdateModelFallback}
            onToggleAvailability={handleToggleModelAvailability}
          />
        );
      case 'TEAM':
        return (
          <TeamAccountManagerView
            accounts={accounts}
            members={members}
            onResetAccountTokens={handleResetAccountTokens}
            onUpdateMemberRole={handleUpdateMemberRole}
            onUpdateMemberRoles={handleUpdateMemberRoles}
            onUpdateMemberLimit={handleUpdateMemberLimit}
            onUpdateMemberAvatar={handleUpdateMemberAvatar}
            onUpdateMemberAllowedModels={handleUpdateMemberAllowedModels}
            onRefreshDb={handleRefreshDb}
          />
        );
      case 'DATABASE':
        return (
          <DevDatabaseExplorerView
            tables={tables}
            databaseName="jkadh_dev"
            onRunQuery={handleRunQuery}
            onNavigateToAuditTrail={(tableName) => {
              setAuditSearchQuery(tableName || '');
              setClassicTab('AUDIT_TRAIL');
            }}
          />
        );
      case 'DOCUMENTATION':
        return <DocumentationView sections={docs} />;
      case 'TELEMETRY':
        return (
          <TokenQuotaTelemetryDashboard
            accounts={accounts}
            models={models}
            onRefreshAccounts={async () => {
              const res = await api.getAccounts();
              if (res.data) setAccounts(res.data);
            }}
          />
        );
      case 'AUDIT_TRAIL':
        return (
          <GlobalAuditTrailView
            auditRecords={auditRecords}
            onAddAuditRecord={(record) => setAuditRecords(prev => [record, ...prev])}
            initialSearchQuery={auditSearchQuery}
          />
        );
      default:
        return null;
    }
  };

  // 6. 비로그인 상태일 때 비로그인 랜딩 화면 렌더링 (로그아웃 시 전환됨)
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <PublicLandingView
          onLogin={handleLogin}
          onOpenRegisterModal={() => setIsAuthModalOpen(true)}
          isSandboxMode={isSandbox}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          onLogin={handleLogin}
          onRegister={handleLogin}
          onLogout={handleLogout}
          onOpenVault={() => setIsApiKeyVaultOpen(true)}
        />
      </div>
    );
  }

  // 7. 로그인 상태: 새로운 구글 Material 3 네비게이션 레이아웃
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-row font-sans antialiased overflow-x-hidden">
      
      {/* 좌측 사이드바 네비게이션 */}
      <Sidebar
        currentCategory={mainCategory}
        onSelectCategory={(cat) => setMainCategory(cat)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeSessionId={activeSession.session_code}
      />

      {/* 우측 메인 컨텐츠 영역 */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* 상단 글로벌 헤더 */}
        <Header
          user={currentUser}
          currentTheme={theme}
          onThemeChange={setTheme}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          onOpenApiKeyVault={() => setIsApiKeyVaultOpen(true)}
          onLogout={handleLogout}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
          activeSession={activeSession}
          isSandboxMode={isSandbox}
        />

        {/* 뷰 라우팅 컨텐츠 컨테이너 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          
          {/* 1. 메인 대시보드 */}
          {mainCategory === 'dashboard' && (
            <MainDashboardView
              activeSession={activeSession}
              tasks={tasks}
              metrics={metrics}
              currentUser={currentUser}
              onNavigateToServiceDev={() => setMainCategory('service-dev')}
              onNavigateToAdminConfig={() => setMainCategory('admin-config')}
              onSelectTask={(id) => {
                setSelectedTaskId(id);
                setMainCategory('service-dev');
                setServiceDevSubTab('VIBE_RUNNER');
              }}
            />
          )}

          {/* 2. 서비스 개발 (Vibe 러너 / 모델 / 토큰) */}
          {mainCategory === 'service-dev' && (
            <ServiceDevWorkspace
              currentSubTab={serviceDevSubTab}
              onSelectSubTab={(subTab) => setServiceDevSubTab(subTab)}
              tasks={tasks}
              models={models}
              accounts={accounts}
              selectedTaskId={selectedTaskId}
              onAdvanceTaskPhase={handleAdvanceTaskPhase}
              onRunAIVibe={handleRunAIVibe}
              onRefreshAccounts={async () => {
                const res = await api.getAccounts();
                if (res.data) setAccounts(res.data);
              }}
              onUpdateModelFallback={handleUpdateModelFallback}
              onToggleModelAvailability={handleToggleModelAvailability}
              onOpenApiKeyVault={() => setIsApiKeyVaultOpen(true)}
            />
          )}

          {/* 3. 개발기능 관리 (거버넌스 / DB / DAG / 권한) */}
          {mainCategory === 'admin-config' && (
            <AdminConfigWorkspace
              currentUser={currentUser}
              currentSubTab={adminConfigSubTab}
              onSelectSubTab={(subTab) => setAdminConfigSubTab(subTab)}
              tasks={tasks}
              onUpdateTasks={(updated) => setTasks(updated)}
              selectedTaskId={selectedTaskId}
              onSelectTask={(id) => setSelectedTaskId(id)}
              accounts={accounts}
              members={members}
              models={models}
              tables={tables}
              databaseName="jkadh_dev"
              auditRecords={auditRecords}
              onAddAuditRecord={(record) => setAuditRecords(prev => [record, ...prev])}
              onRunQuery={handleRunQuery}
              onAdvanceTaskPhase={handleAdvanceTaskPhase}
              onResetAccountTokens={handleResetAccountTokens}
              onUpdateMemberRole={handleUpdateMemberRole}
              onUpdateMemberRoles={handleUpdateMemberRoles}
              onUpdateMemberProjectRoles={handleUpdateMemberProjectRoles}
              onUpdateMemberLimit={handleUpdateMemberLimit}
              onUpdateMemberAvatar={handleUpdateMemberAvatar}
              onUpdateMemberAllowedModels={handleUpdateMemberAllowedModels}
              onUpdateModelColor={handleUpdateModelColor}
              onRefreshDb={handleRefreshDb}
              onOpenApiKeyVault={() => setIsApiKeyVaultOpen(true)}
            />
          )}

          {/* 4. 정보 변경이력 조회 (JSON Diff & 6대 감사 컬럼) */}
          {mainCategory === 'audit-trail' && (
            <GlobalAuditTrailView
              auditRecords={auditRecords}
              onAddAuditRecord={(record) => setAuditRecords(prev => [record, ...prev])}
              initialSearchQuery={auditSearchQuery}
            />
          )}

          {/* 5. 표준 문서 & 회고 보고서 */}
          {mainCategory === 'docs' && (
            <DocumentationView sections={docs} />
          )}

          {/* 6. AS-IS 클래식 올인원 콘솔 (Legacy Dual-Track) */}
          {mainCategory === 'classic-console' && (
            <ClassicConsoleView
              currentTab={classicTab}
              onSelectTab={(tab) => setClassicTab(tab)}
              renderedTabContent={renderClassicTabContent()}
            />
          )}

        </main>
      </div>

      {/* 글로벌 인증/계정 모달 */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onRegister={handleLogin}
        onLogout={handleLogout}
        onOpenVault={() => {
          setIsAuthModalOpen(false);
          setIsApiKeyVaultOpen(true);
        }}
      />

      {/* 사용자 개인 API Key Vault 모달 */}
      {currentUser && (
        <ApiKeyVaultModal
          isOpen={isApiKeyVaultOpen}
          onClose={() => setIsApiKeyVaultOpen(false)}
          userId={currentUser.id}
          userName={currentUser.name}
          userRole={currentUser.role}
        />
      )}

    </div>
  );
};

export default App;
