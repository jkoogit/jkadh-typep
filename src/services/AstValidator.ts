import { AstValidationReport } from '../types/vibeRunner';
import { SecOpsEngine } from './SecOpsEngine';

export class AstValidator {
  /**
   * TypeScript 코드에 대한 AST 정적 구문 및 JKADH 아키텍처 거버넌스, FIPS-140-3 3단계 보안 규칙 검증
   */
  public static validate(
    code: string,
    context?: { isTestFile?: boolean; isDbSchema?: boolean; enableAutoHealing?: boolean }
  ): AstValidationReport {
    const syntaxErrors: string[] = [];
    const typeErrors: string[] = [];
    const missingImports: string[] = [];
    const exportedSymbols: string[] = [];
    const warnings: string[] = [];

    if (!code || code.trim().length === 0) {
      return {
        isValid: false,
        syntaxErrors: ['코드 내용이 비어 있습니다 (VIBE_EMPTY_CODE_ERROR)'],
        typeErrors: [],
        missingImports: [],
        exportedSymbols: [],
        governanceAuditPassed: false,
        hasAuditColumns: false,
        hasScenarioTests: false,
        complexityScore: 0,
        warnings: [],
        secOpsReport: SecOpsEngine.audit(code, context),
      };
    }

    // 1. Bracket & Block Matching (Syntax Heuristic)
    const openBraces = (code.match(/{/g) || []).length;
    const closeBraces = (code.match(/}/g) || []).length;
    if (openBraces !== closeBraces) {
      syntaxErrors.push(`중괄호 블록 불일치: 열림({) ${openBraces}개 vs 닫힘(}) ${closeBraces}개`);
    }

    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens !== closeParens) {
      syntaxErrors.push(`소괄호 불일치: 열림(() ${openParens}개 vs 닫힘()) ${closeParens}개`);
    }

    // 2. Type Strictness (Ban `any` & `as any`)
    const anyMatches = code.match(/:\s*any\b/g);
    if (anyMatches && anyMatches.length > 0) {
      typeErrors.push(`엄격 타입 위반: 'any' 타입 선언 (${anyMatches.length}건 발견) ➔ 엄격한 인터페이스로 대체 필요`);
    }

    const asAnyMatches = code.match(/as\s+any\b/g);
    if (asAnyMatches && asAnyMatches.length > 0) {
      typeErrors.push(`타입 안전성 결함: 'as any' 강제 캐스팅 (${asAnyMatches.length}건 발견)`);
    }

    // 3. Exported Symbols Scanning
    const exportMatches = code.match(/export\s+(?:class|interface|type|const|function|enum)\s+([A-Za-z0-9_]+)/g);
    if (exportMatches) {
      exportMatches.forEach((m) => {
        const parts = m.split(/\s+/);
        if (parts.length >= 3) {
          exportedSymbols.push(parts[2]);
        }
      });
    }

    // 4. Missing Imports Detection
    if (code.includes('React.') && !code.includes("import React") && !code.includes("from 'react'")) {
      missingImports.push("React 네임스페이스 사용 중 'react' import 누락");
    }
    if (code.includes('GoogleGenAI') && !code.includes('@google/genai')) {
      missingImports.push("@google/genai SDK import 누락");
    }

    // 5. JKADH Governance Check: 6 Core Audit Columns (for DB / Data models)
    const auditCols = ['created_at', 'updated_at', 'created_by', 'updated_by', 'is_deleted', 'version'];
    const auditFound = auditCols.filter(col => code.toLowerCase().includes(col.toLowerCase()));
    const hasAuditColumns = auditFound.length >= 4; // 최소 4개 이상 충족 시 통과
    if (!hasAuditColumns && (code.includes('Table') || code.includes('Schema') || context?.isDbSchema)) {
      warnings.push(`JKADH 6대 공통 감사 컬럼 누락 (${auditCols.length - auditFound.length}개 누락)`);
    }

    // 6. JKADH Governance Check: 3-Scenario Tests (Happy Path, Error Recovery, Edge Bounds)
    const hasHappy = code.includes('Happy Path') || code.includes('정상') || code.includes('정상 경로') || code.includes('valid');
    const hasError = code.includes('Error') || code.includes('Recovery') || code.includes('오류') || code.includes('장애');
    const hasEdge = code.includes('Edge') || code.includes('Bounds') || code.includes('예외') || code.includes('경계');
    const hasScenarioTests = hasHappy && hasError && hasEdge;

    if (context?.isTestFile && !hasScenarioTests) {
      warnings.push(`3대 시나리오 테스트 불완전 (HappyPath: ${hasHappy}, ErrorRecovery: ${hasError}, EdgeBounds: ${hasEdge})`);
    }

    // 7. Complexity & Validation Outcome
    const linesCount = code.split('\n').length;
    const complexityScore = Math.min(100, Math.round(linesCount * 0.8 + (openBraces * 2)));

    const isValid = syntaxErrors.length === 0 && typeErrors.length === 0;
    const governanceAuditPassed = isValid && (context?.isDbSchema ? hasAuditColumns : true);

    // 8. FIPS-140-3 3-Level SecOps Audit
    let secOpsReport = SecOpsEngine.audit(code, context);
    if (context?.enableAutoHealing && !secOpsReport.isCompliant && !secOpsReport.isBlocked) {
      const healResult = SecOpsEngine.autoHeal(code, secOpsReport, context);
      secOpsReport = healResult.report;
    }

    return {
      isValid: isValid && !secOpsReport.isBlocked,
      syntaxErrors,
      typeErrors,
      missingImports,
      exportedSymbols,
      governanceAuditPassed,
      hasAuditColumns,
      hasScenarioTests,
      complexityScore,
      warnings,
      secOpsReport,
    };
  }
}
