import {
  AIAccount,
  ArchitecturalProposalCase,
  DatabaseTableMeta,
  DocumentationSection,
  ExecutionMetric,
  ModelMeta,
  TaskGraphNode,
  TeamMember,
} from '../types';

export const api = {
  async getHealth() {
    const res = await fetch('/api/health');
    return res.json();
  },

  async getDocumentation(): Promise<{ success: boolean; data: DocumentationSection[] }> {
    const res = await fetch('/api/documentation');
    return res.json();
  },

  async getAccounts(): Promise<{ success: boolean; data: AIAccount[] }> {
    const res = await fetch('/api/accounts');
    return res.json();
  },

  async updateAccountQuota(id: string, payload: Partial<AIAccount>) {
    const res = await fetch(`/api/accounts/${id}/update-quota`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async resetAccountTokens(id: string) {
    const res = await fetch(`/api/accounts/${id}/reset-tokens`, {
      method: 'POST',
    });
    return res.json();
  },

  async getMembers(): Promise<{ success: boolean; data: TeamMember[] }> {
    const res = await fetch('/api/members');
    return res.json();
  },

  async updateMemberPermissions(id: string, payload: Partial<TeamMember>) {
    const res = await fetch(`/api/members/${id}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getModels(): Promise<{ success: boolean; data: ModelMeta[] }> {
    const res = await fetch('/api/models');
    return res.json();
  },

  async updateModelFallback(id: string, payload: { fallbackOrder?: string[]; isAvailable?: boolean }) {
    const res = await fetch(`/api/models/${id}/fallback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getTasks(): Promise<{ success: boolean; data: TaskGraphNode[] }> {
    const res = await fetch('/api/tasks');
    return res.json();
  },

  async getTask(id: string): Promise<{ success: boolean; data: TaskGraphNode }> {
    const res = await fetch(`/api/tasks/${id}`);
    return res.json();
  },

  async verifyAndAdvancePhase(taskId: string, phaseNumber: number): Promise<{ success: boolean; data: TaskGraphNode }> {
    const res = await fetch(`/api/tasks/${taskId}/phase/${phaseNumber}/verify-and-advance`, {
      method: 'POST',
    });
    return res.json();
  },

  async getCurrentSession() {
    const res = await fetch('/api/session/current');
    return res.json();
  },

  async sendSessionHeartbeat() {
    const res = await fetch('/api/session/heartbeat', {
      method: 'POST',
    });
    return res.json();
  },

  async upsertSession(sessionData: any) {
    const res = await fetch('/api/session/upsert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData),
    });
    return res.json();
  },

  async getTaskLoops(taskId: string) {
    const res = await fetch(`/api/tasks/${taskId}/loops`);
    return res.json();
  },

  async recordTaskLoop(taskId: string, loopPayload: any) {
    const res = await fetch(`/api/tasks/${taskId}/loops`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loopPayload),
    });
    return res.json();
  },

  async reportGateActionFeedback(feedbackPayload: {
    taskId: string;
    phaseNumber: number;
    actionId: string;
    category: string;
    result?: string;
    targetModelId?: string;
  }) {
    const res = await fetch('/api/gate/action-feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackPayload),
    });
    return res.json();
  },

  async evaluatePhaseGate(taskId: string, phaseNumber: number) {
    const res = await fetch(`/api/tasks/${taskId}/phase/${phaseNumber}/evaluate-gate`, {
      method: 'POST',
    });
    return res.json();
  },

  async vibeOrchestrate(params: {
    taskId?: string;
    phaseNumber: number;
    prompt?: string;
    forceFallback?: boolean;
    simulateModel?: string;
  }) {
    const res = await fetch('/api/gemini/vibe-orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async getProposals(): Promise<{ success: boolean; data: ArchitecturalProposalCase[] }> {
    const res = await fetch('/api/proposals');
    return res.json();
  },

  async getDbTables(database?: string): Promise<{ success: boolean; data: DatabaseTableMeta[]; database: string; isRemote?: boolean }> {
    const url = database ? `/api/db/tables?db=${encodeURIComponent(database)}` : '/api/db/tables';
    const res = await fetch(url);
    return res.json();
  },

  async runDbQuery(query: string, database?: string) {
    const res = await fetch('/api/db/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, database }),
    });
    return res.json();
  },

  async getRemoteDbConfig(): Promise<{
    success: boolean;
    config: {
      url: string;
      hasSecret: boolean;
      targetDatabase: string;
      lastStatus: 'CONNECTED' | 'ERROR' | 'UNCONFIGURED';
      lastCheckedAt: string | null;
      lastError: string | null;
      lastLatencyMs: number;
      pgVersion: string | null;
      actualDatabase: string | null;
    };
  }> {
    const res = await fetch('/api/remote-db/config');
    return res.json();
  },

  async updateRemoteDbConfig(payload: { url?: string; secret?: string; targetDatabase?: string }) {
    const res = await fetch('/api/remote-db/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async testRemoteDbConnection(payload?: { url?: string; secret?: string; targetDatabase?: string }) {
    const res = await fetch('/api/remote-db/test-connection', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload || {}),
    });
    return res.json();
  },

  async initRemoteDbSchema(options?: {
    database?: string;
    scope?: 'ALL' | 'GROUP' | 'TABLE';
    targetTable?: string;
    targetGroup?: 'HARNESS_GOV' | 'CORE_OPS' | 'META_INFRA';
    targetVersion?: string;
  } | string) {
    const payload = typeof options === 'string' ? { database: options } : options || {};
    const res = await fetch('/api/remote-db/init-schema', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async checkRemoteDbSchema(database?: string): Promise<{
    success: boolean;
    isRemote: boolean;
    targetDatabase: string;
    targetVersion: string;
    currentDbVersion: string | null;
    isUpToDate: boolean;
    appliedMigrations: any[];
    pendingMigrations: string[];
    lastCheckedAt?: string;
  }> {
    const url = database ? `/api/remote-db/schema-check?db=${encodeURIComponent(database)}` : '/api/remote-db/schema-check';
    const res = await fetch(url);
    return res.json();
  },


  async getMetrics(): Promise<{
    success: boolean;
    chartData: ExecutionMetric[];
    summary: {
      totalTokensConsumed: number;
      totalRemainingTokens: number;
      monthlyBudgetUSD: number;
      currentCostUSD: number;
      activeMembersCount: number;
      avgSpecValidationScore: number;
    };
  }> {
    const res = await fetch('/api/metrics');
    return res.json();
  },
};
