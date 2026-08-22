export type VibeLoopAction =
  | 'LOOP_ANALYZE'
  | 'LOOP_DESIGN'
  | 'LOOP_EXECUTE'
  | 'LOOP_TEST'
  | 'LOOP_REFINE'
  | 'LOOP_SECOPS'
  | 'LOOP_GATEKEEPER';

export type VibePhaseStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'HEALING';

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
