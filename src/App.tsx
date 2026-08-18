import React, { useEffect, useState } from 'react';
import { Header, TabType } from './components/Header';
import { SessionGovernanceView } from './components/SessionGovernanceView';
import { ProposalView } from './components/ProposalView';
import { LifecycleOrchestratorView } from './components/LifecycleOrchestratorView';
import { DocumentationView } from './components/DocumentationView';
import { DashboardView } from './components/DashboardView';
import { ModelMetaRegistryView } from './components/ModelMetaRegistryView';
import { TeamAccountManagerView } from './components/TeamAccountManagerView';
import { DevDatabaseExplorerView } from './components/DevDatabaseExplorerView';
import { LiveVibeRunnerModal } from './components/LiveVibeRunnerModal';
import { AuthModal } from './components/AuthModal';
import { ApiKeyVaultModal } from './components/ApiKeyVaultModal';
import { api } from './services/api';
import {
  AIAccount,
  ArchitecturalProposalCase,
  DatabaseTableMeta,
  DocumentationSection,
  ExecutionMetric,
  MemberRole,
  ModelMeta,
  TaskGraphNode,
  TeamMember,
  UserAccount,
  UserApiVaultItem,
} from './types';
import {
  INITIAL_AI_ACCOUNTS,
  INITIAL_ARCHITECTURAL_PROPOSALS,
  INITIAL_DB_TABLES,
  INITIAL_DOCUMENTATION_SECTIONS,
  INITIAL_METRICS_CHART_DATA,
  INITIAL_MODELS,
  INITIAL_TASK_GRAPH,
  INITIAL_MEMBERS,
} from './data/initialData';

const INITIAL_USER: UserAccount = {
  id: 'usr_jkoogi_01',
  email: 'jkoogit@gmail.com',
  name: '구진규 (Jinkyu Koo)',
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

const INITIAL_VAULT_ITEMS: UserApiVaultItem[] = [
  {
    id: 'vault_ant_01',
    userId: 'usr_jkoogi_01',
    provider: 'ANTHROPIC',
    keyAlias: 'Claude 3.7 Sonnet Master Key',
    maskedKey: 'sk-ant-api03-...89aF',
    isTeamShared: true,
    dailyQuotaLimit: 3000000,
    usedTokens: 184500,
    status: 'ACTIVE',
    reg_sys_cd: 'JKADH_VAULT',
    reg_user_id: 'jkoogi',
    reg_dt: '2026-08-16 01:00:00',
    mod_sys_cd: 'JKADH_VAULT',
    mod_user_id: 'jkoogi',
    mod_dt: '2026-08-16 01:00:00',
  },
  {
    id: 'vault_oai_02',
    userId: 'usr_jkoogi_01',
    provider: 'OPENAI',
    keyAlias: 'OpenAI GPT-4o Dedicated Key',
    maskedKey: 'sk-proj-...X92p',
    isTeamShared: false,
    dailyQuotaLimit: 1000000,
    usedTokens: 42000,
    status: 'ACTIVE',
    reg_sys_cd: 'JKADH_VAULT',
    reg_user_id: 'jkoogi',
    reg_dt: '2026-08-16 01:05:00',
    mod_sys_cd: 'JKADH_VAULT',
    mod_user_id: 'jkoogi',
    mod_dt: '2026-08-16 01:05:00',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('PROPOSALS');
  const [accounts, setAccounts] = useState<AIAccount[]>(INITIAL_AI_ACCOUNTS);
  const [members, setMembers] = useState<TeamMember[]>(INITIAL_MEMBERS);
  const [models, setModels] = useState<ModelMeta[]>(INITIAL_MODELS);
  const [tasks, setTasks] = useState<TaskGraphNode[]>(INITIAL_TASK_GRAPH);
  const [proposals, setProposals] = useState<ArchitecturalProposalCase[]>(INITIAL_ARCHITECTURAL_PROPOSALS);
  const [docSections, setDocSections] = useState<DocumentationSection[]>(INITIAL_DOCUMENTATION_SECTIONS);
  const [dbTables, setDbTables] = useState<DatabaseTableMeta[]>(INITIAL_DB_TABLES);
  const [chartMetrics, setChartMetrics] = useState<ExecutionMetric[]>(INITIAL_METRICS_CHART_DATA);
  const [selectedTaskId, setSelectedTaskId] = useState<string>(INITIAL_TASK_GRAPH[1]?.id || 'node-ocr-engine');
  
  // Auth & Vault State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(INITIAL_USER);
  const [vaultItems, setVaultItems] = useState<UserApiVaultItem[]>(INITIAL_VAULT_ITEMS);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState<boolean>(false);
  
  const [isLiveRunnerOpen, setIsLiveRunnerOpen] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Load initial backend state
  useEffect(() => {
    async function loadData() {
      try {
        const [accRes, memRes, modRes, taskRes, propRes, docRes, dbRes, metricRes] = await Promise.all([
          api.getAccounts(),
          api.getMembers(),
          api.getModels(),
          api.getTasks(),
          api.getProposals(),
          api.getDocumentation(),
          api.getDbTables(),
          api.getMetrics(),
        ]);

        if (accRes?.success) setAccounts(accRes.data);
        if (memRes?.success) setMembers(memRes.data);
        if (modRes?.success) setModels(modRes.data);
        if (taskRes?.success) setTasks(taskRes.data);
        if (propRes?.success) setProposals(propRes.data);
        if (docRes?.success) setDocSections(docRes.data);
        if (dbRes?.success) setDbTables(dbRes.data);
        if (metricRes?.success) setChartMetrics(metricRes.chartData);
      } catch (err) {
        console.warn('Using client-side initial baseline dataset:', err);
      }
    }
    loadData();
  }, []);

  const totalTokensRemaining = accounts.reduce((acc, a) => acc + a.remainingTokens, 0);

  const selectedTask = tasks.find((t) => t.id === selectedTaskId) || tasks[0];

  // Handler: Advance phase with automated gatekeeper check
  const handleVerifyAndAdvance = async (taskId: string, phaseNum: number) => {
    setIsProcessing(true);
    try {
      const res = await api.verifyAndAdvancePhase(taskId, phaseNum);
      if (res?.success && res.data) {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? res.data : t)));
        // Refresh metrics
        const metRes = await api.getMetrics();
        if (metRes?.success) setChartMetrics(metRes.chartData);
      }
    } catch (e) {
      console.error('Verify error:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handler: Open Live Vibe Runner for specific phase
  const handleRunAIVibe = (taskId: string, phaseNum: number) => {
    setSelectedTaskId(taskId);
    setIsLiveRunnerOpen(true);
  };

  // Auth Handlers
  const handleLogin = (emailOrId: string) => {
    const isSuper = emailOrId.includes('jkoogi') || emailOrId.includes('jkoogit@gmail.com');
    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      email: emailOrId.includes('@') ? emailOrId : `${emailOrId}@jkadh.io`,
      name: isSuper ? '구진규 (Jinkyu Koo)' : emailOrId,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      role: isSuper ? 'SUPER_ADMIN' : 'ENGINEER',
      isSuperAdmin: isSuper,
      department: 'JKADH Platform Engineering',
      dailyTokenLimit: isSuper ? 5000000 : 1000000,
      tokensUsedToday: 0,
      monthlyBudgetUSD: isSuper ? 500 : 100,
      status: 'ACTIVE',
      reg_sys_cd: 'JKADH_AUTH',
      reg_user_id: emailOrId,
      reg_dt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      mod_sys_cd: 'JKADH_AUTH',
      mod_user_id: emailOrId,
      mod_dt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setCurrentUser(newUser);
  };

  const handleRegister = (data: { name: string; email: string; department: string; requestedRole: MemberRole }) => {
    const isSuper = data.email.includes('jkoogi') || data.email.includes('jkoogit@gmail.com');
    const newUser: UserAccount = {
      id: `usr_${Date.now()}`,
      email: data.email,
      name: data.name,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      role: isSuper ? 'SUPER_ADMIN' : data.requestedRole,
      isSuperAdmin: isSuper,
      department: data.department || 'JKADH Engineering',
      dailyTokenLimit: isSuper ? 5000000 : 1000000,
      tokensUsedToday: 0,
      monthlyBudgetUSD: 150,
      status: 'ACTIVE',
      reg_sys_cd: 'JKADH_AUTH',
      reg_user_id: data.email,
      reg_dt: new Date().toISOString().replace('T', ' ').substring(0, 19),
      mod_sys_cd: 'JKADH_AUTH',
      mod_user_id: data.email,
      mod_dt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setCurrentUser(newUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Vault Handlers
  const handleAddVaultKey = (item: Omit<UserApiVaultItem, 'id' | 'reg_sys_cd' | 'reg_user_id' | 'reg_dt' | 'mod_sys_cd' | 'mod_user_id' | 'mod_dt'> & { rawKey: string }) => {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newVaultItem: UserApiVaultItem = {
      id: `vault_${Date.now()}`,
      userId: item.userId,
      provider: item.provider,
      keyAlias: item.keyAlias,
      maskedKey: item.maskedKey,
      isTeamShared: item.isTeamShared,
      dailyQuotaLimit: item.dailyQuotaLimit,
      usedTokens: 0,
      status: 'ACTIVE',
      reg_sys_cd: 'JKADH_VAULT',
      reg_user_id: currentUser?.id || 'SYSTEM',
      reg_dt: now,
      mod_sys_cd: 'JKADH_VAULT',
      mod_user_id: currentUser?.id || 'SYSTEM',
      mod_dt: now,
    };
    setVaultItems((prev) => [newVaultItem, ...prev]);
  };

  const handleDeleteVaultKey = (id: string) => {
    setVaultItems((prev) => prev.filter((k) => k.id !== id));
  };

  // Handler: Reset account tokens
  const handleResetAccountTokens = async (id: string) => {
    try {
      const res = await api.resetAccountTokens(id);
      if (res?.success) {
        setAccounts((prev) => prev.map((a) => (a.id === id ? res.data : a)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Update member role
  const handleUpdateMemberRole = async (id: string, role: MemberRole) => {
    try {
      const res = await api.updateMemberPermissions(id, { role });
      if (res?.success) {
        setMembers((prev) => prev.map((m) => (m.id === id ? res.data : m)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Update member limit
  const handleUpdateMemberLimit = async (id: string, dailyTokenLimit: number) => {
    try {
      const res = await api.updateMemberPermissions(id, { dailyTokenLimit });
      if (res?.success) {
        setMembers((prev) => prev.map((m) => (m.id === id ? res.data : m)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Model availability toggle
  const handleToggleModelAvailability = async (id: string, isAvailable: boolean) => {
    try {
      const res = await api.updateModelFallback(id, { isAvailable });
      if (res?.success) {
        setModels((prev) => prev.map((m) => (m.id === id ? res.data : m)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handler: Model fallback update
  const handleUpdateModelFallback = async (id: string, fallbackOrder: string[]) => {
    try {
      const res = await api.updateModelFallback(id, { fallbackOrder });
      if (res?.success) {
        setModels((prev) => prev.map((m) => (m.id === id ? res.data : m)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Dashboard summary data
  const dashboardSummary = {
    totalTokensConsumed: accounts.reduce((acc, a) => acc + a.usedTokens, 0),
    totalRemainingTokens: accounts.reduce((acc, a) => acc + a.remainingTokens, 0),
    monthlyBudgetUSD: accounts.reduce((acc, a) => acc + a.costMonthlyLimitUSD, 0),
    currentCostUSD: accounts.reduce((acc, a) => acc + a.currentCostUSD, 0),
    activeMembersCount: members.filter((m) => m.status === 'ACTIVE').length,
    avgSpecValidationScore: Math.round(
      tasks.reduce((acc, t) => acc + t.specValidationScore, 0) / (tasks.length || 1)
    ),
  };

  return (
    <div className="min-h-screen bg-[#0A0C10] text-[#E6EDF3] flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLiveRunner={() => setIsLiveRunnerOpen(true)}
        totalTokensRemaining={totalTokensRemaining}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenVaultModal={() => setIsVaultModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'SESSION' && (
          <SessionGovernanceView
            tasks={tasks}
            selectedTaskId={selectedTaskId}
            onSelectTask={(id) => setSelectedTaskId(id)}
          />
        )}

        {activeTab === 'PROPOSALS' && (
          <ProposalView
            proposals={proposals}
            onSelectTaskTab={() => setActiveTab('LIFECYCLE')}
          />
        )}

        {activeTab === 'DOCUMENTATION' && (
          <DocumentationView
            sections={docSections}
            onTriggerRefactor={() => {
              setSelectedTaskId('node-ocr-engine');
              setActiveTab('LIFECYCLE');
            }}
          />
        )}

        {activeTab === 'LIFECYCLE' && (
          <LifecycleOrchestratorView
            tasks={tasks}
            selectedTask={selectedTask}
            onSelectTask={(id) => setSelectedTaskId(id)}
            onVerifyAndAdvance={handleVerifyAndAdvance}
            onRunAIVibe={handleRunAIVibe}
            isProcessing={isProcessing}
          />
        )}

        {activeTab === 'DASHBOARD' && (
          <DashboardView
            accounts={accounts}
            chartData={chartMetrics}
            summary={dashboardSummary}
          />
        )}

        {activeTab === 'MODELS' && (
          <ModelMetaRegistryView
            models={models}
            onUpdateFallback={handleUpdateModelFallback}
            onToggleAvailability={handleToggleModelAvailability}
          />
        )}

        {activeTab === 'TEAM' && (
          <TeamAccountManagerView
            accounts={accounts}
            members={members}
            onResetAccountTokens={handleResetAccountTokens}
            onUpdateMemberRole={handleUpdateMemberRole}
            onUpdateMemberLimit={handleUpdateMemberLimit}
          />
        )}

        {activeTab === 'DATABASE' && (
          <DevDatabaseExplorerView
            tables={dbTables}
            databaseName="jkadhp_dev"
            onRunQuery={(q, db) => api.runDbQuery(q, db)}
          />
        )}
      </main>

      {/* Live Vibe Runner Modal */}
      <LiveVibeRunnerModal
        isOpen={isLiveRunnerOpen}
        onClose={() => setIsLiveRunnerOpen(false)}
        tasks={tasks}
        models={models}
        defaultTaskId={selectedTaskId}
        onExecute={(params) => api.vibeOrchestrate(params)}
      />

      {/* Auth & RBAC Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onLogout={handleLogout}
        onOpenVault={() => setIsVaultModalOpen(true)}
      />

      {/* API Key Vault Modal */}
      <ApiKeyVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        vaultItems={vaultItems}
        onAddKey={handleAddVaultKey}
        onDeleteKey={handleDeleteVaultKey}
        currentUserId={currentUser?.id || 'usr_guest'}
      />
    </div>
  );
}
