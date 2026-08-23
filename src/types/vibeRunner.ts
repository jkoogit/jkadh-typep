export type VibeLoopAction =
  | 'LOOP_ANALYZE'
  | 'LOOP_DESIGN'
  | 'LOOP_EXECUTE'
  | 'LOOP_TEST'
  | 'LOOP_REFINE'
  | 'LOOP_SECOPS'
  | 'LOOP_GATEKEEPER';

export type VibePhaseStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'HEALING';

export type SecOpsRuleCategory =
  | 'SECRET_LEAK'
  | 'SQL_INJECTION'
  | 'AUDIT_COLUMNS_MISSING'
  | 'DESTRUCTIVE_DDL'
  | 'UNPROTECTED_ENDPOINT'
  | 'DANGEROUS_EVAL';

export interface SecOpsFinding {
  id: string;
  level: 1 | 2 | 3;
  category: SecOpsRuleCategory;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  ruleId: string;
  description: string;
  lineMatch?: string;
  autoHealable: boolean;
  healingStrategy?: string;
}

export interface FipsSecOpsReport {
  isCompliant: boolean;
  fipsScore: number;
  level1SecretScanPassed: boolean;
  level2InjectionScanPassed: boolean;
  level3GovernancePassed: boolean;
  findings: SecOpsFinding[];
  sha256Signature: string;
  evaluatedAt: string;
  autoHealingApplied: boolean;
  autoHealingDetails?: {
    attemptCount: number;
    fixedFindingsCount: number;
    originalScore: number;
    healedScore: number;
    diffSummary: string[];
    healedCodeSnippet: string;
    originalCodeSnippet: string;
  };
  isBlocked: boolean;
  blockReason?: string;
}

export interface AstValidationReport {
  isValid: boolean;
  syntaxErrors: string[];
  typeErrors: string[];
  missingImports: string[];
  exportedSymbols: string[];
  governanceAuditPassed: boolean;
  hasAuditColumns: boolean;
  hasScenarioTests: boolean;
  complexityScore: number;
  warnings: string[];
  secOpsReport?: FipsSecOpsReport;
}

export interface VibePhaseExecutionResult {
  phaseNumber: number;
  phaseNameKr: string;
  loopAction: VibeLoopAction;
  status: VibePhaseStatus;
  durationMs: number;
  tokensConsumed: number;
  costUSD: number;
  assignedModelId: string;
  activeModelId: string;
  isFallbackTriggered: boolean;
  authBindingStatus?: 'BOUND' | 'UNBOUND' | 'SYSTEM_ENV';
  vaultKeyAlias?: string;
  vaultKeyMasked?: string;
  astReport: AstValidationReport;
  outputArtifact: {
    title: string;
    description: string;
    generatedCodeSnippet?: string;
    testSummary?: {
      happyPathPassed: boolean;
      errorRecoveryPassed: boolean;
      edgeBoundsPassed: boolean;
      totalPassRate: number;
    };
    secopsReport?: {
      fipsCompliance: boolean;
      sqlInjectionDefended: boolean;
      rbacSanitized: boolean;
    };
    gatekeeperScore: number;
  };
  errorSummary?: string | null;
  savepointName: string;
  executedAt: string;
}

export interface VibeSessionRunState {
  sessionId: string;
  taskId: string;
  taskCode: string;
  currentLoopAction: VibeLoopAction;
  currentPhaseNumber: number;
  phaseResults: Record<number, VibePhaseExecutionResult>;
  totalTokensConsumed: number;
  totalCostUSD: number;
  totalDurationMs: number;
  overallScore: number;
  isCompleted: boolean;
  isRunning: boolean;
  autoHealingActive: boolean;
  healingAttempts: number;
  activeSavepoint: string;
}
