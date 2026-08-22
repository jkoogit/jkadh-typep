import { AstValidator } from './AstValidator';
import {
  VibeLoopAction,
  VibePhaseExecutionResult,
  VibeSessionRunState,
} from '../types/vibeRunner';
import { ModelMeta, TaskGraphNode } from '../types';

export class VibeRunnerEngine {
  /**
   * 단일 Phase 루프 실행 시뮬레이터 (AST 정적 검증, API Key Vault 인증 주입 및 Multi-Model Fallback 핫스왑 포함)
   */
  public static async executePhase(params: {
    task: TaskGraphNode;
    phaseNumber: number;
    models: ModelMeta[];
    forceFallback?: boolean;
    simulateAutoHealing?: boolean;
  }): Promise<VibePhaseExecutionResult> {
    const { task, phaseNumber, models, forceFallback, simulateAutoHealing } = params;

    const phase = task.phases.find((p) => p.phaseNumber === phaseNumber) || task.phases[0];
    const assignedModelId = phase.assignedModelId || 'claude-3-7-sonnet';
    const fallbackModelId = phase.fallbackModelId || 'gemini-3-7-flash';

    const isFallbackTriggered = !!forceFallback;
    const activeModelId = isFallbackTriggered ? fallbackModelId : assignedModelId;

    // Retrieve model metadata and auth binding status
    const targetModelMeta = models.find((m) => m.id === activeModelId);
    const authBindingStatus = targetModelMeta?.authBindingStatus || 'SYSTEM_ENV';
    const vaultKeyAlias = targetModelMeta?.vaultKeyAlias || undefined;
    const vaultKeyMasked = targetModelMeta?.vaultKeyMasked || undefined;

    const startTime = Date.now();

    // Loop Action Mapping
    const loopActions: Record<number, VibeLoopAction> = {
      1: 'LOOP_ANALYZE',
      2: 'LOOP_DESIGN',
      3: 'LOOP_EXECUTE',
      4: 'LOOP_TEST',
      5: 'LOOP_REFINE',
      6: 'LOOP_SECOPS',
      7: 'LOOP_GATEKEEPER',
    };
    const loopAction = loopActions[phaseNumber] || 'LOOP_EXECUTE';

    // Mock realistic generated code based on Phase
    let codeSnippet = '';
    if (phaseNumber === 3 || phaseNumber === 5 || phaseNumber === 6) {
      codeSnippet = `
import { VibeSessionState } from '../types/vibeRunner';

export interface GeneratedVibeModule {
  id: string;
  task_code: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_deleted: boolean;
  version: number;
}

export class RuntimeSandboxController {
  private state: GeneratedVibeModule;

  constructor(initialData: GeneratedVibeModule) {
    this.state = { ...initialData };
  }

  public async executeHappyPath(): Promise<boolean> {
    return true;
  }

  public async handleCircuitBreakerFallback(): Promise<void> {
    // 300ms fallback swap
  }
}
      `.trim();
    } else if (phaseNumber === 4) {
      codeSnippet = `
describe('VibeRunner 3-Scenario Tests', () => {
  it('Happy Path: 7-Phase sequentially advances with 100% pass', async () => {
    expect(true).toBe(true);
  });
  it('Error Recovery: 429 RateLimit swaps to fallback within 300ms', async () => {
    expect(true).toBe(true);
  });
  it('Edge Bounds: Invalid spec prompts return defensive bounds check', async () => {
    expect(true).toBe(true);
  });
});
      `.trim();
    }

    // Run AST Validation
    const astReport = AstValidator.validate(codeSnippet, {
      isTestFile: phaseNumber === 4,
      isDbSchema: phaseNumber === 3,
    });

    const durationMs = Math.round(180 + Math.random() * 240);
    const tokensConsumed = Math.round(12000 + Math.random() * 8000);
    const costUSD = Number(((tokensConsumed / 1000000) * 3.0).toFixed(4));

    const gatekeeperScore = astReport.isValid ? 98 : 75;

    return {
      phaseNumber,
      phaseNameKr: phase.nameKr,
      loopAction,
      status: 'COMPLETED',
      durationMs,
      tokensConsumed,
      costUSD,
      assignedModelId,
      activeModelId,
      isFallbackTriggered,
      authBindingStatus,
      vaultKeyAlias,
      vaultKeyMasked,
      astReport,
      outputArtifact: {
        title: `[${task.code}] Phase ${phaseNumber} 산출물 (${loopAction})`,
        description: `모델 [${activeModelId}] (${authBindingStatus === 'BOUND' ? '🔒 Vault ' + (vaultKeyAlias || vaultKeyMasked) : '⚙️ System Env'})에 의해 ${durationMs}ms 동안 생성 및 AST 검증 완료`,
        generatedCodeSnippet: codeSnippet,
        testSummary: {
          happyPathPassed: true,
          errorRecoveryPassed: true,
          edgeBoundsPassed: true,
          totalPassRate: 100,
        },
        secopsReport: {
          fipsCompliance: true,
          sqlInjectionDefended: true,
          rbacSanitized: true,
        },
        gatekeeperScore,
      },
      errorSummary: null,
      savepointName: `sp_${task.code.toLowerCase().replace(/-/g, '_')}_p${phaseNumber}`,
      executedAt: new Date().toISOString(),
    };
  }
}
