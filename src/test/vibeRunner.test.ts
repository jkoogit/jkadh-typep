import { AstValidator } from '../services/AstValidator';
import { VibeRunnerEngine } from '../services/VibeRunnerEngine';
import { INITIAL_TASK_GRAPH, INITIAL_MODELS } from '../data/initialData';

export function runVibeRunnerUnitTests() {
  const results: { name: string; passed: boolean; details: string }[] = [];

  // 1. Happy Path Test
  try {
    const validCode = `
      export interface SampleModel {
        id: string;
        created_at: string;
        updated_at: string;
        created_by: string;
        updated_by: string;
        is_deleted: boolean;
        version: number;
      }
      export class ValidService {
        public run(): boolean { return true; }
      }
    `;
    const report = AstValidator.validate(validCode, { isDbSchema: true });
    const passed = report.isValid && report.hasAuditColumns;
    results.push({
      name: 'Happy Path: Valid TypeScript AST & 6 Audit Columns Check',
      passed,
      details: passed ? '정상 구문 및 6대 감사 컬럼 검증 100% 통과' : '검증 실패: ' + JSON.stringify(report.syntaxErrors),
    });
  } catch (e: any) {
    results.push({ name: 'Happy Path Test', passed: false, details: e.message });
  }

  // 2. Error Recovery Test (Detect `any` violation)
  try {
    const invalidCode = `
      export class BrokenService {
        public data: any;
        public parse(val: any) {
          return val as any;
        }
      }
    `;
    const report = AstValidator.validate(invalidCode);
    const passed = !report.isValid && report.typeErrors.length >= 2;
    results.push({
      name: 'Error Recovery: Strict Type Violation (Ban `any`) Detection',
      passed,
      details: passed ? `any 타입 위반 ${report.typeErrors.length}건 정상 탐지 및 자동 거절` : 'any 타입 탐지 실패',
    });
  } catch (e: any) {
    results.push({ name: 'Error Recovery Test', passed: false, details: e.message });
  }

  // 3. Edge Bounds Test (Empty / Broken brackets)
  try {
    const brokenCode = `export class Unclosed { private x = 10; `;
    const report = AstValidator.validate(brokenCode);
    const passed = !report.isValid && report.syntaxErrors.length > 0;
    results.push({
      name: 'Edge Bounds: Unmatched Braces Heuristic Detection',
      passed,
      details: passed ? `구문 괄호 누락 정상 탐지: ${report.syntaxErrors[0]}` : '괄호 누락 탐지 실패',
    });
  } catch (e: any) {
    results.push({ name: 'Edge Bounds Test', passed: false, details: e.message });
  }

  return results;
}
