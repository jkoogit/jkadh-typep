/**
 * 🏛️ [JKADH Issue #45] 세션 거버넌스 수치 필드 타입 안전성 3대 시나리오 단위 테스트
 * PostgreSQL NUMERIC/BIGINT 문자열 반환, null/undefined/NaN 방어 및 0값 경계 검증
 */

import {
  formatSessionCostUsd,
  formatSessionTokens,
  formatSessionExecCount,
} from '../components/SessionGovernanceView';

export interface TestCaseResult {
  id: string;
  category: 'HAPPY_PATH' | 'ERROR_RECOVERY' | 'EDGE_BOUNDS';
  target: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

export function runSessionGovNumericTests(): {
  allPassed: boolean;
  total: number;
  passedCount: number;
  failedCount: number;
  results: TestCaseResult[];
} {
  const results: TestCaseResult[] = [];

  function record(
    id: string,
    category: 'HAPPY_PATH' | 'ERROR_RECOVERY' | 'EDGE_BOUNDS',
    target: string,
    name: string,
    fn: () => void
  ) {
    const start = performance.now();
    try {
      fn();
      results.push({
        id,
        category,
        target,
        name,
        passed: true,
        durationMs: performance.now() - start,
        details: 'PASS: 기대값과 정확히 일치함',
      });
    } catch (e: any) {
      results.push({
        id,
        category,
        target,
        name,
        passed: false,
        durationMs: performance.now() - start,
        details: `FAIL: ${e.message}`,
      });
    }
  }

  // 1. 정상 시나리오 (Happy Path)
  record('HP-01', 'HAPPY_PATH', 'formatSessionCostUsd', '순수 숫자 입력 시 올바른 4자리 소수점 문자열 변환', () => {
    const res = formatSessionCostUsd(1.4285);
    if (res !== '1.4285') throw new Error(`기대값 "1.4285", 실제값: "${res}"`);
    const res2 = formatSessionCostUsd(0.5);
    if (res2 !== '0.5000') throw new Error(`기대값 "0.5000", 실제값: "${res2}"`);
  });

  record('HP-02', 'HAPPY_PATH', 'formatSessionCostUsd', '문자열 형태의 숫자 입력 시 안전한 파싱 및 변환 (PostgreSQL 반환값 대응)', () => {
    const res = formatSessionCostUsd('12.3456');
    if (res !== '12.3456') throw new Error(`기대값 "12.3456", 실제값: "${res}"`);
    const res2 = formatSessionCostUsd('0.0000');
    if (res2 !== '0.0000') throw new Error(`기대값 "0.0000", 실제값: "${res2}"`);
  });

  record('HP-03', 'HAPPY_PATH', 'formatSessionTokens', '순수 숫자 및 문자열 토큰을 k-단위로 정확히 변환', () => {
    const res = formatSessionTokens(342850);
    if (res !== '342.9') throw new Error(`기대값 "342.9", 실제값: "${res}"`);
    const res2 = formatSessionTokens('50000');
    if (res2 !== '50.0') throw new Error(`기대값 "50.0", 실제값: "${res2}"`);
  });

  record('HP-04', 'HAPPY_PATH', 'formatSessionExecCount', '순수 숫자 및 문자열 실행 횟수 정수 변환', () => {
    const res = formatSessionExecCount(14);
    if (res !== 14) throw new Error(`기대값 14, 실제값: ${res}`);
    const res2 = formatSessionExecCount('25');
    if (res2 !== 25) throw new Error(`기대값 25, 실제값: ${res2}`);
  });

  // 2. 오류 복구 시나리오 (Error Recovery)
  record('ER-01', 'ERROR_RECOVERY', 'formatSessionCostUsd', 'null 또는 undefined 유입 시 크래시 없이 기본 폴백 적용', () => {
    const resNull = formatSessionCostUsd(null);
    if (resNull !== '1.4285') throw new Error(`null 폴백 기대값 "1.4285", 실제값: "${resNull}"`);
    const resUndef = formatSessionCostUsd(undefined);
    if (resUndef !== '1.4285') throw new Error(`undefined 폴백 기대값 "1.4285", 실제값: "${resUndef}"`);
  });

  record('ER-02', 'ERROR_RECOVERY', 'formatSessionTokens', 'null 또는 undefined 유입 시 크래시 없이 기본 폴백 적용', () => {
    const resNull = formatSessionTokens(null);
    if (resNull !== '342.9') throw new Error(`null 폴백 기대값 "342.9", 실제값: "${resNull}"`);
    const resUndef = formatSessionTokens(undefined);
    if (resUndef !== '342.9') throw new Error(`undefined 폴백 기대값 "342.9", 실제값: "${resUndef}"`);
  });

  record('ER-03', 'ERROR_RECOVERY', 'All Helpers', 'NaN 또는 잘못된 문자열 유입 시 크래시 없이 기본 폴백 적용', () => {
    const resCost = formatSessionCostUsd('invalid_numeric_str');
    if (resCost !== '1.4285') throw new Error(`비정상 비용 폴백 기대값 "1.4285", 실제값: "${resCost}"`);
    const resTokens = formatSessionTokens('corrupted_tokens');
    if (resTokens !== '342.9') throw new Error(`비정상 토큰 폴백 기대값 "342.9", 실제값: "${resTokens}"`);
    const resCount = formatSessionExecCount('error_count');
    if (resCount !== 14) throw new Error(`비정상 횟수 폴백 기대값 14, 실제값: ${resCount}`);
  });

  // 3. 예외 경계 시나리오 (Edge Bounds)
  record('EB-01', 'EDGE_BOUNDS', 'formatSessionCostUsd', '실제 0값(숫자 0 또는 문자열 "0") 유입 시 모의값 치환 없이 실제 0으로 포맷팅', () => {
    const resNumZero = formatSessionCostUsd(0);
    if (resNumZero !== '0.0000') throw new Error(`숫자 0 기대값 "0.0000", 실제값: "${resNumZero}"`);
    const resStrZero = formatSessionCostUsd('0');
    if (resStrZero !== '0.0000') throw new Error(`문자열 "0" 기대값 "0.0000", 실제값: "${resStrZero}"`);
    const resFormattedZero = formatSessionCostUsd('0.0000');
    if (resFormattedZero !== '0.0000') throw new Error(`문자열 "0.0000" 기대값 "0.0000", 실제값: "${resFormattedZero}"`);
  });

  record('EB-02', 'EDGE_BOUNDS', 'formatSessionTokens & Count', '실제 0값 유입 시 정확한 0 반영', () => {
    const resTokenZero = formatSessionTokens(0);
    if (resTokenZero !== '0.0') throw new Error(`토큰 0 기대값 "0.0", 실제값: "${resTokenZero}"`);
    const resCountZero = formatSessionExecCount(0);
    if (resCountZero !== 0) throw new Error(`횟수 0 기대값 0, 실제값: ${resCountZero}`);
  });

  record('EB-03', 'EDGE_BOUNDS', 'Big Numbers', '매우 큰 수치 유입 시 오버플로 없이 변환', () => {
    const resLargeTokens = formatSessionTokens('10000000');
    if (resLargeTokens !== '10000.0') throw new Error(`대용량 토큰 기대값 "10000.0", 실제값: "${resLargeTokens}"`);
    const resLargeCost = formatSessionCostUsd('99999.9999');
    if (resLargeCost !== '99999.9999') throw new Error(`대용량 비용 기대값 "99999.9999", 실제값: "${resLargeCost}"`);
  });

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    allPassed: failedCount === 0,
    total: results.length,
    passedCount,
    failedCount,
    results,
  };
}

// 직접 실행 지원
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('sessionGovNumericSafety')) {
  console.log('🏛️ [JKADH] Running Session Governance Numeric Safety Test Suite...');
  const outcome = runSessionGovNumericTests();
  console.log(`Total: ${outcome.total}, Passed: ${outcome.passedCount}, Failed: ${outcome.failedCount}`);
  for (const r of outcome.results) {
    console.log(`[${r.passed ? 'PASS' : 'FAIL'}] [${r.category}] ${r.id}: ${r.name} (${r.durationMs.toFixed(2)}ms)`);
    if (!r.passed) {
      console.error(`  -> ${r.details}`);
    }
  }
  if (!outcome.allPassed) {
    process.exit(1);
  }
}
