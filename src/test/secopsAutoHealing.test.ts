import { SecOpsEngine } from '../services/SecOpsEngine';
import { AstValidator } from '../services/AstValidator';

export interface SecOpsTestScenarioResult {
  testId: string;
  scenario: 'Happy Path' | 'Error Recovery (Auto-Healing)' | 'Edge Bounds (Attack Block)';
  category: string;
  targetRule: string;
  description: string;
  initialScore: number;
  finalScore: number;
  autoHealingTriggered: boolean;
  isBlocked: boolean;
  passed: boolean;
  details: string;
}

export function runSecOpsAutoHealingUnitTests(): SecOpsTestScenarioResult[] {
  const results: SecOpsTestScenarioResult[] = [];

  // ============================================================================
  // 1. Happy Path Scenarios (FIPS-140-3 Compliant Clean Source)
  // ============================================================================
  const cleanCode = `
import { db } from '../db';

export interface UserAccount {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  is_deleted: boolean;
  version: number;
}

export async function getUserById(userId: string): Promise<UserAccount | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0] || null;
}
  `.trim();

  const cleanReport = SecOpsEngine.audit(cleanCode, { isDbSchema: true });
  results.push({
    testId: 'TC-SECOPS-01',
    scenario: 'Happy Path',
    category: 'FIPS-140-3 3단계 보안 감사 정상 통과',
    targetRule: 'FIPS-L1/L2/L3 ALL CLEAN',
    description: '환경변수 사용, $1 파라미터화 쿼리, 6대 감사 컬럼 완비 코드 100점 통과',
    initialScore: cleanReport.fipsScore,
    finalScore: cleanReport.fipsScore,
    autoHealingTriggered: false,
    isBlocked: cleanReport.isBlocked,
    passed: cleanReport.isCompliant && cleanReport.fipsScore === 100 && cleanReport.findings.length === 0,
    details: `FIPS 점수 ${cleanReport.fipsScore}/100, SHA-256 서명: ${cleanReport.sha256Signature}`,
  });

  // ============================================================================
  // 2. Error Recovery Scenarios (Auto-Healing 1-Turn Self-Refinement)
  // ============================================================================
  const vulnerableCode = `
export interface CustomerProfile {
  id: string;
  name: string;
}

export async function fetchCustomerData(customerId: string) {
  const clientKey = "sk-ant-api03-abcdef1234567890abcdef1234567890";
  const query = "SELECT * FROM users WHERE id = '" + customerId + "'";
  return query;
}
  `.trim();

  const initialVulnReport = SecOpsEngine.audit(vulnerableCode, { isDbSchema: true });
  const healOutcome = SecOpsEngine.autoHeal(vulnerableCode, initialVulnReport, { isDbSchema: true });

  results.push({
    testId: 'TC-SECOPS-02',
    scenario: 'Error Recovery (Auto-Healing)',
    category: '1턴 자율 치유 (Auto-Healing) 루프',
    targetRule: 'FIPS-L1-SECRET & FIPS-L2-SQLI & FIPS-L3-AUDIT',
    description: '하드코딩된 API Key, 원시 SQL 결합, 6대 감사 컬럼 누락 ➔ 1턴 자율 치유 후 100점 복구',
    initialScore: initialVulnReport.fipsScore,
    finalScore: healOutcome.report.fipsScore,
    autoHealingTriggered: healOutcome.report.autoHealingApplied,
    isBlocked: healOutcome.report.isBlocked,
    passed:
      initialVulnReport.fipsScore < 60 &&
      healOutcome.report.fipsScore === 100 &&
      healOutcome.report.autoHealingApplied &&
      healOutcome.report.autoHealingDetails?.fixedFindingsCount === 3,
    details: `초기 ${initialVulnReport.fipsScore}점 ➔ 1턴 자율 치유 후 ${healOutcome.report.fipsScore}점 (치유 항목 ${healOutcome.report.autoHealingDetails?.fixedFindingsCount}건)`,
  });

  // ============================================================================
  // 3. Edge Bounds Scenarios (Destructive DDL Attack Defense)
  // ============================================================================
  const maliciousCode = `
export async function wipeDatabase() {
  const sql = "DROP TABLE users CASCADE;";
  return sql;
}
  `.trim();

  const attackReport = SecOpsEngine.audit(maliciousCode, { isTestFile: false });

  results.push({
    testId: 'TC-SECOPS-03',
    scenario: 'Edge Bounds (Attack Block)',
    category: '파괴적 DDL 쿼리 차단 및 롤백 방어',
    targetRule: 'FIPS-L3-DESTRUCTIVE-DDL',
    description: 'DROP TABLE CASCADE 쿼리 유입 시 Auto-Healing 거부 및 즉시 실행 차단(Block)',
    initialScore: attackReport.fipsScore,
    finalScore: attackReport.fipsScore,
    autoHealingTriggered: false,
    isBlocked: attackReport.isBlocked,
    passed: attackReport.isBlocked && attackReport.findings.some((f) => f.category === 'DESTRUCTIVE_DDL'),
    details: `차단 사유: ${attackReport.blockReason}`,
  });

  return results;
}
