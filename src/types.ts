export type MemberRole = 'SUPER_ADMIN' | 'ADMIN' | 'ARCHITECT' | 'ENGINEER' | 'REVIEWER' | 'AUDITOR';

export interface AuditMetadata {
  reg_sys_cd: string;
  reg_user_id: string;
  reg_dt: string;
  mod_sys_cd: string;
  mod_user_id: string;
  mod_dt: string;
}

export interface UserAccount extends AuditMetadata {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  department: string;
  dailyTokenLimit: number;
  tokensUsedToday: number;
  monthlyBudgetUSD: number;
  costUsedUSD: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'RATE_LIMITED';
  isSuperAdmin: boolean;
  avatar: string;
  allowedModels: string[];
}

export interface UserApiVaultItem extends AuditMetadata {
  id: string;
  userId: string;
  provider: 'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'MANUS' | 'CUSTOM';
  keyAlias: string;
  maskedKey: string;
  encryptedValue?: string;
  isTeamShared: boolean;
  dailyQuotaLimit: number;
  usedTokens: number;
  status: 'ACTIVE' | 'EXHAUSTED' | 'REVOKED';
}

export type LoopActionType =
  | 'LOOP_ANALYZE'
  | 'LOOP_EXECUTE'
  | 'LOOP_REFINE'
  | 'LOOP_ABORT'
  | 'LOOP_APPROVE'
  | 'LOOP_DISCARD'
  | 'LOOP_RESTORE'
  | 'LOOP_ROLLBACK';

export interface TaskExecutionLoop extends AuditMetadata {
  id: string;
  taskId: string;
  phaseNumber: number;
  loopNumber: number;
  loopAction: LoopActionType;
  modelId: string;
  savepointId?: string;
  astValidationPassed: boolean;
  errorSummary?: string;
  tokensConsumed: number;
  latencyMs: number;
  diffSummary?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: MemberRole;
  allowedModels: string[];
  dailyTokenLimit: number;
  tokensUsedToday: number;
  monthlyBudgetUSD: number;
  costUsedUSD: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'RATE_LIMITED';
  department: string;
  lastActive: string;
  isSuperAdmin?: boolean;
}

export interface AIAccount {
  id: string;
  provider: 'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'MANUS';
  accountName: string;
  apiKeyMasked: string;
  totalTokenQuota: number;
  usedTokens: number;
  remainingTokens: number;
  costMonthlyLimitUSD: number;
  currentCostUSD: number;
  status: 'HEALTHY' | 'WARNING' | 'EXHAUSTED' | 'RATE_LIMITED' | 'ERROR';
  errorCount24h: number;
  cooldownUntil?: string;
  primaryFallbackModelId?: string;
  tier: 'Enterprise' | 'PayAsYouGo' | 'Tier-4' | 'Developer';
}

export interface ModelMeta {
  id: string;
  name: string;
  provider: 'OPENAI' | 'ANTHROPIC' | 'GOOGLE' | 'MANUS';
  version: string;
  contextWindow: number;
  inputPricePerMillion: number;
  outputPricePerMillion: number;
  reasoningTier: 'LOW' | 'MEDIUM' | 'HIGH' | 'MAX';
  codeScore: number; // 0-100
  avgLatencyMs: number;
  recommendedPhases: number[]; // 1 to 7
  primaryCapabilities: string[];
  fallbackOrder: string[]; // fallback model IDs in sequence
  tokenEstimationDifficulty: 'EXACT' | 'APPROXIMATE' | 'HEURISTIC';
  description: string;
  isAvailable: boolean;
}

export type PhaseStatus = 'NOT_STARTED' | 'IN_PROGRESS' | 'SPEC_VERIFIED' | 'COMPLETED' | 'FAILED' | 'BLOCKED';

export interface ScenarioDefinition {
  type: 'NORMAL' | 'ERROR' | 'EXCEPTION';
  title: string;
  condition: string;
  inputState: string;
  expectedBehavior: string;
  fallbackOrRecovery: string;
  verified: boolean;
}

export interface PhaseCompletionCriterion {
  id: string;
  description: string;
  requiredRule: string;
  isAutomated: boolean;
  status: 'PENDING' | 'PASSED' | 'FAILED';
  verificationLog?: string;
}

export interface LifecyclePhase {
  phaseNumber: number; // 1 to 7 (1: Review, 2: Select, 3: Plan, 4: Design, 5: Test, 6: Code, 7: Docs & Sync)
  code: string;
  nameKr: string;
  nameEn: string;
  description: string;
  assignedModelId: string;
  fallbackModelId: string;
  status: PhaseStatus;
  completionCriteria: PhaseCompletionCriterion[];
  inputArtifacts: string[];
  outputArtifacts: string[];
  scenarios?: ScenarioDefinition[];
  specJsonSchema?: string;
  generatedOutput?: string;
  executionLogs: {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';
    message: string;
    modelUsed: string;
    tokensConsumed: number;
  }[];
  loops?: TaskExecutionLoop[];
  lastExecutedAt?: string;
}

export interface TaskGraphNode {
  id: string;
  code: string;
  title: string;
  module: 'OCR' | 'CONVERT' | 'SECURITY' | 'TABLE_EXTRACT' | 'WATERMARK' | 'MERGE_SPLIT';
  complexity: 'LOW' | 'MEDIUM' | 'HIGH';
  estimatedTokens: number;
  status: 'BACKLOG' | 'ANALYSIS' | 'PLANNED' | 'DEVELOPING' | 'TESTED' | 'DONE';
  dependencies: string[]; // node IDs
  assignedTo?: string; // Member ID
  currentPhase: number; // 1 to 7
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  phases: LifecyclePhase[];
  gitBranch?: string;
  specValidationScore: number; // 0-100
  derivedFromTaskId?: string; // e.g. 'node-ocr-engine'
  derivedFromTaskCode?: string; // e.g. 'PDF-OCR-04'
  addedAt?: string; // 추가 시점 (e.g. '2026-08-15 11:45 (Phase 7 검토 중 발굴)')
  addedReason?: string; // 추가 배경 및 사유
  targetMilestone?: string; // 목표 릴리즈 마일스톤
}

export interface DocumentationSection {
  id: string;
  category: 'METHODOLOGY' | 'LIFECYCLE' | 'TASK_GRAPH' | 'HARNESS' | 'REFACTORING' | 'MODELS' | 'DATABASE' | 'RBAC' | 'RUNBOOK';
  titleKr: string;
  titleEn: string;
  summary: string;
  contentMarkdown: string;
  tags: string[];
  lastUpdated: string;
}

export interface ExecutionMetric {
  timestamp: string;
  tokens: number;
  costUSD: number;
  latencyMs: number;
  model: string;
  status: 'SUCCESS' | 'FALLBACK' | 'ERROR';
  taskCode: string;
  userId: string;
}

export interface DatabaseTableMeta {
  tableName: string;
  description: string;
  rowCount: number;
  sizeKb: number;
  columns: {
    name: string;
    type: string;
    isPrimary?: boolean;
    isNullable?: boolean;
    description: string;
  }[];
  sampleRecords: Record<string, any>[];
}

export interface ArchitecturalProposalCase {
  id: string;
  category: string;
  title: string;
  problemStatement: string;
  empiricalCase: string;
  recommendedSolution: string;
  benefit: string;
  riskMitigation: string;
  specRuleLogic: string;
}
