import React, { useEffect, useState } from 'react';
import { Header, TabType } from './components/Header';
import { ProposalView } from './components/ProposalView';
import { LifecycleOrchestratorView } from './components/LifecycleOrchestratorView';
import { DocumentationView } from './components/DocumentationView';
import { DashboardView } from './components/DashboardView';
import { ModelMetaRegistryView } from './components/ModelMetaRegistryView';
import { TeamAccountManagerView } from './components/TeamAccountManagerView';
import { DevDatabaseExplorerView } from './components/DevDatabaseExplorerView';
import { LiveVibeRunnerModal } from './components/LiveVibeRunnerModal';
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
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
            onRunQuery={(q) => api.runDbQuery(q)}
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
    </div>
  );
}
