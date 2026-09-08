/**
 * 🏛️ [JKADH PLAT-DAG-19] 3-Scenario Unit Tests for DAG Lineage Traversal & Dynamic Highlight
 * Testing BFS/DFS Lineage, Upstream/Downstream Resolution, Edge Classification, and Cycle Resilience
 */

import { TaskGraphNode } from '../types';
import {
  computeDagLineage,
  getNodeHighlightRole,
  getEdgeHighlightRole,
  DagLineageResult,
} from '../services/dagLineageEngine';

export interface TestCaseResult {
  id: string;
  category: 'HAPPY_PATH' | 'ERROR_RECOVERY' | 'EDGE_BOUNDS';
  target: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

export function createMockDagTasks(): TaskGraphNode[] {
  // Topology:
  // node-root-1 (Root)
  //   └─► node-mid-1
  //         └─► node-target (Target)
  //               ├─► node-child-1
  //               │     └─► node-leaf-1
  //               └─► node-child-2
  // node-unrelated-1
  //   └─► node-unrelated-2
  // node-isolated
  return [
    {
      id: 'node-root-1',
      code: 'PLAT-ROOT-01',
      title: 'Root Infrastructure Foundation',
      module: 'GOVERNANCE',
      complexity: 'LOW',
      estimatedTokens: 10000,
      status: 'DONE',
      dependencies: [],
      currentPhase: 7,
      riskLevel: 'LOW',
      description: 'Root Node',
      phases: [],
      specValidationScore: 100,
    },
    {
      id: 'node-mid-1',
      code: 'PLAT-MID-01',
      title: 'Intermediate Service Engine',
      module: 'ORCHESTRATOR',
      complexity: 'MEDIUM',
      estimatedTokens: 20000,
      status: 'DONE',
      dependencies: ['node-root-1'],
      currentPhase: 7,
      riskLevel: 'LOW',
      description: 'Mid Node',
      phases: [],
      specValidationScore: 100,
    },
    {
      id: 'node-target',
      code: 'PLAT-TARGET-01',
      title: 'Target Focus Node',
      module: 'ORCHESTRATOR',
      complexity: 'MEDIUM',
      estimatedTokens: 25000,
      status: 'IN_PROGRESS',
      dependencies: ['node-mid-1'],
      currentPhase: 6,
      riskLevel: 'LOW',
      description: 'Target Node',
      phases: [],
      specValidationScore: 95,
    },
    {
      id: 'node-child-1',
      code: 'PLAT-CHILD-01',
      title: 'Child Downstream Worker A',
      module: 'VIBE_RUNNER',
      complexity: 'LOW',
      estimatedTokens: 15000,
      status: 'PLANNED',
      dependencies: ['node-target'],
      currentPhase: 1,
      riskLevel: 'LOW',
      description: 'Child Node 1',
      phases: [],
      specValidationScore: 90,
    },
    {
      id: 'node-child-2',
      code: 'PLAT-CHILD-02',
      title: 'Child Downstream Worker B',
      module: 'SECURITY_VAULT',
      complexity: 'LOW',
      estimatedTokens: 12000,
      status: 'PLANNED',
      dependencies: ['node-target'],
      currentPhase: 1,
      riskLevel: 'LOW',
      description: 'Child Node 2',
      phases: [],
      specValidationScore: 90,
    },
    {
      id: 'node-leaf-1',
      code: 'PLAT-LEAF-01',
      title: 'Grandchild Leaf Node',
      module: 'MODEL_ROUTER',
      complexity: 'LOW',
      estimatedTokens: 10000,
      status: 'PLANNED',
      dependencies: ['node-child-1'],
      currentPhase: 1,
      riskLevel: 'LOW',
      description: 'Leaf Node',
      phases: [],
      specValidationScore: 85,
    },
    {
      id: 'node-unrelated-1',
      code: 'PLAT-UNRELATED-01',
      title: 'Unrelated Independent Task A',
      module: 'DB_MIGRATION',
      complexity: 'LOW',
      estimatedTokens: 14000,
      status: 'DONE',
      dependencies: [],
      currentPhase: 7,
      riskLevel: 'LOW',
      description: 'Unrelated Node 1',
      phases: [],
      specValidationScore: 100,
    },
    {
      id: 'node-unrelated-2',
      code: 'PLAT-UNRELATED-02',
      title: 'Unrelated Independent Task B',
      module: 'DB_MIGRATION',
      complexity: 'LOW',
      estimatedTokens: 14000,
      status: 'DONE',
      dependencies: ['node-unrelated-1'],
      currentPhase: 7,
      riskLevel: 'LOW',
      description: 'Unrelated Node 2',
      phases: [],
      specValidationScore: 100,
    },
    {
      id: 'node-isolated',
      code: 'PLAT-ISOLATED-01',
      title: 'Completely Isolated Standalone Node',
      module: 'GOVERNANCE',
      complexity: 'LOW',
      estimatedTokens: 8000,
      status: 'PLANNED',
      dependencies: [],
      currentPhase: 1,
      riskLevel: 'LOW',
      description: 'Isolated Node',
      phases: [],
      specValidationScore: 90,
    }
  ];
}

export async function runDagHighlightEngineTests(): Promise<{
  passedCount: number;
  totalCount: number;
  results: TestCaseResult[];
}> {
  const results: TestCaseResult[] = [];
  const tasks = createMockDagTasks();

  // =========================================================================
  // SCENARIO 1: HAPPY PATH (정상 시나리오)
  // =========================================================================
  {
    const start = performance.now();
    const lineage = computeDagLineage('node-target', tasks);
    const pass =
      lineage.isHighlightActive === true &&
      lineage.selectedId === 'node-target' &&
      lineage.upstreamIds.has('node-mid-1') &&
      lineage.upstreamIds.has('node-root-1') &&
      lineage.upstreamCount === 2 &&
      lineage.downstreamIds.has('node-child-1') &&
      lineage.downstreamIds.has('node-child-2') &&
      lineage.downstreamIds.has('node-leaf-1') &&
      lineage.downstreamCount === 3 &&
      lineage.unrelatedCount === 3; // node-unrelated-1, node-unrelated-2, node-isolated

    results.push({
      id: 'TC-DAG-01',
      category: 'HAPPY_PATH',
      target: 'computeDagLineage',
      name: '중간 노드 선택 시 선행 조상 2건 및 후속 자손 3건 정확한 계통 분리',
      passed: pass,
      durationMs: Number((performance.now() - start).toFixed(2)),
      details: `선행(${lineage.upstreamCount}건: root-1, mid-1), 후속(${lineage.downstreamCount}건: child-1, child-2, leaf-1), 무관(${lineage.unrelatedCount}건)`,
    });
  }

  {
    const start = performance.now();
    const lineage = computeDagLineage('node-target', tasks);
    const selfRole = getNodeHighlightRole('node-target', lineage);
    const upRole1 = getNodeHighlightRole('node-mid-1', lineage);
    const upRole2 = getNodeHighlightRole('node-root-1', lineage);
    const downRole1 = getNodeHighlightRole('node-child-1', lineage);
    const downRole2 = getNodeHighlightRole('node-leaf-1', lineage);
    const unrelRole1 = getNodeHighlightRole('node-unrelated-1', lineage);
    const unrelRole2 = getNodeHighlightRole('node-isolated', lineage);

    const pass =
      selfRole === 'SELF' &&
      upRole1 === 'UPSTREAM' &&
      upRole2 === 'UPSTREAM' &&
      downRole1 === 'DOWNSTREAM' &&
      downRole2 === 'DOWNSTREAM' &&
      unrelRole1 === 'UNRELATED' &&
      unrelRole2 === 'UNRELATED';

    results.push({
      id: 'TC-DAG-02',
      category: 'HAPPY_PATH',
      target: 'getNodeHighlightRole',
      name: '노드별 하이라이트 역할(SELF, UPSTREAM, DOWNSTREAM, UNRELATED) 판정',
      passed: pass,
      durationMs: Number((performance.now() - start).toFixed(2)),
      details: `Self=${selfRole}, Upstream=[${upRole1}, ${upRole2}], Downstream=[${downRole1}, ${downRole2}], Unrelated=[${unrelRole1}, ${unrelRole2}]`,
    });
  }

  {
    const start = performance.now();
    const lineage = computeDagLineage('node-target', tasks);
    const edgeUp1 = getEdgeHighlightRole('node-root-1', 'node-mid-1', lineage);
    const edgeUp2 = getEdgeHighlightRole('node-mid-1', 'node-target', lineage);
    const edgeDown1 = getEdgeHighlightRole('node-target', 'node-child-1', lineage);
    const edgeDown2 = getEdgeHighlightRole('node-child-1', 'node-leaf-1', lineage);
    const edgeUnrelated = getEdgeHighlightRole('node-unrelated-1', 'node-unrelated-2', lineage);

    const pass =
      edgeUp1 === 'UPSTREAM' &&
      edgeUp2 === 'UPSTREAM' &&
      edgeDown1 === 'DOWNSTREAM' &&
      edgeDown2 === 'DOWNSTREAM' &&
      edgeUnrelated === 'UNRELATED';

    results.push({
      id: 'TC-DAG-03',
      category: 'HAPPY_PATH',
      target: 'getEdgeHighlightRole',
      name: '베지어 연결선(Edge) 계통 판정 (선행 UPSTREAM, 후속 DOWNSTREAM, 무관 UNRELATED)',
      passed: pass,
      durationMs: Number((performance.now() - start).toFixed(2)),
      details: `EdgeUp=[${edgeUp1}, ${edgeUp2}], EdgeDown=[${edgeDown1}, ${edgeDown2}], EdgeUnrelated=${edgeUnrelated}`,
    });
  }

  // =========================================================================
  // SCENARIO 2: ERROR RECOVERY (오류 복구 및 순환 방어 시나리오)
  // =========================================================================
  {
    const start = performance.now();
    // Circular graph: cycle-a -> cycle-b -> cycle-c -> cycle-a
    const cycleTasks: TaskGraphNode[] = [
      {
        id: 'cycle-a',
        code: 'CYCLE-A',
        title: 'Cycle Node A',
        module: 'GOVERNANCE',
        complexity: 'LOW',
        estimatedTokens: 1000,
        status: 'PLANNED',
        dependencies: ['cycle-c'],
        currentPhase: 1,
        riskLevel: 'LOW',
        description: '',
        phases: [],
        specValidationScore: 0,
      },
      {
        id: 'cycle-b',
        code: 'CYCLE-B',
        title: 'Cycle Node B',
        module: 'GOVERNANCE',
        complexity: 'LOW',
        estimatedTokens: 1000,
        status: 'PLANNED',
        dependencies: ['cycle-a'],
        currentPhase: 1,
        riskLevel: 'LOW',
        description: '',
        phases: [],
        specValidationScore: 0,
      },
      {
        id: 'cycle-c',
        code: 'CYCLE-C',
        title: 'Cycle Node C',
        module: 'GOVERNANCE',
        complexity: 'LOW',
        estimatedTokens: 1000,
        status: 'PLANNED',
        dependencies: ['cycle-b'],
        currentPhase: 1,
        riskLevel: 'LOW',
        description: '',
        phases: [],
        specValidationScore: 0,
      },
    ];

    const lineage = computeDagLineage('cycle-a', cycleTasks);
    // Should terminate gracefully without infinite recursion
    const pass =
      lineage.isHighlightActive === true &&
      lineage.upstreamIds.has('cycle-c') &&
      lineage.upstreamIds.has('cycle-b') &&
      lineage.downstreamIds.has('cycle-b') &&
      lineage.downstreamIds.has('cycle-c');

    results.push({
      id: 'TC-DAG-04',
      category: 'ERROR_RECOVERY',
      target: 'computeDagLineage (Cycle Resilience)',
      name: '순환 참조(Cycle) 데이터 인입 시 visited Set 방어로 스택오버플로 차단 및 안전 탐색',
      passed: pass,
      durationMs: Number((performance.now() - start).toFixed(2)),
      details: `순환 그래프 정상 탈출 완료 (소요시간: ${(performance.now() - start).toFixed(2)}ms)`,
    });
  }

  {
    const start = performance.now();
    // Non-existent dependency ID
    const brokenTask: TaskGraphNode[] = [
      {
        id: 'broken-node',
        code: 'BROKEN-01',
        title: 'Broken Dependency Node',
        module: 'GOVERNANCE',
        complexity: 'LOW',
        estimatedTokens: 1000,
        status: 'PLANNED',
        dependencies: ['ghost-id-404', 'invalid-id-999'],
        currentPhase: 1,
        riskLevel: 'LOW',
        description: '',
        phases: [],
        specValidationScore: 0,
      }
    ];

    const lineage = computeDagLineage('broken-node', brokenTask);
    const pass =
      lineage.isHighlightActive === true &&
      lineage.upstreamCount === 2 && // registered in upstreamIds
      lineage.downstreamCount === 0;

    results.push({
      id: 'TC-DAG-05',
      category: 'ERROR_RECOVERY',
      target: 'computeDagLineage (Missing Dependency Fallback)',
      name: '미존재 노드 ID(Ghost ID) 참조 시 널 포인터 예외 없이 안전 방어',
      passed: pass,
      durationMs: Number((performance.now() - start).toFixed(2)),
      details: '비존재 의존성 ID 안전 격리 처리 완료',
    });
  }

  {
    const start = performance.now();
    const lineageNull = computeDagLineage(null, tasks);
    const lineageUndefined = computeDagLineage(undefined, tasks);
    const lineageEmpty = computeDagLineage('', tasks);

    const pass =
      lineageNull.isHighlightActive === false &&
      lineageNull.upstreamCount === 0 &&
      lineageUndefined.isHighlightActive === false &&
      lineageEmpty.isHighlightActive === false &&
      getNodeHighlightRole('node-target', lineageNull) === 'NORMAL' &&
      getEdgeHighlightRole('node-root-1', 'node-mid-1', lineageNull) === 'NORMAL';

    results.push({
      id: 'TC-DAG-06',
      category: 'ERROR_RECOVERY',
      target: 'computeDagLineage (Null/Empty Selection Fallback)',
      name: '선택 노드 해제(Null/Empty) 시 100% 원본 가시성(NORMAL) 안전 복귀',
      passed: pass,
      durationMs: Number((performance.now() - start).toFixed(2)),
      details: '선택 해제 시 모든 노드 및 연결선이 NORMAL 역할로 정상 복원됨',
    });
  }

  // =========================================================================
  // SCENARIO 3: EDGE BOUNDS (예외 및 경계 시나리오)
  // =========================================================================
  {
    const start = performance.now();
    // Root Node (0 upstream)
    const rootLineage = computeDagLineage('node-root-1', tasks);
    const passRoot =
      rootLineage.upstreamCount === 0 &&
      rootLineage.downstreamCount === 5; // mid-1, target, child-1, child-2, leaf-1

    results.push({
      id: 'TC-DAG-07',
      category: 'EDGE_BOUNDS',
      target: 'computeDagLineage (Root Boundary)',
      name: '루트 노드(Root: 선행 의존 0개) 선택 시 선행 조상 0건 및 하류 계통만 정상 추출',
      passed: passRoot,
      durationMs: Number((performance.now() - start).toFixed(2)),
      details: `선행=${rootLineage.upstreamCount}건, 후속=${rootLineage.downstreamCount}건`,
    });
  }

  {
    const start = performance.now();
    // Leaf Node (0 downstream)
    const leafLineage = computeDagLineage('node-leaf-1', tasks);
    const passLeaf =
      leafLineage.downstreamCount === 0 &&
      leafLineage.upstreamCount === 4; // child-1, target, mid-1, root-1

    results.push({
      id: 'TC-DAG-08',
      category: 'EDGE_BOUNDS',
      target: 'computeDagLineage (Leaf Boundary)',
      name: '리프 노드(Leaf: 후속 파생 0개) 선택 시 후속 자손 0건 및 상류 계통만 정상 추출',
      passed: passLeaf,
      durationMs: Number((performance.now() - start).toFixed(2)),
      details: `선행=${leafLineage.upstreamCount}건, 후속=${leafLineage.downstreamCount}건`,
    });
  }

  {
    const start = performance.now();
    // Isolated Node (0 upstream, 0 downstream)
    const isolatedLineage = computeDagLineage('node-isolated', tasks);
    const passIsolated =
      isolatedLineage.upstreamCount === 0 &&
      isolatedLineage.downstreamCount === 0 &&
      isolatedLineage.allRelatedIds.size === 1 &&
      isolatedLineage.allRelatedIds.has('node-isolated') &&
      isolatedLineage.unrelatedCount === tasks.length - 1;

    results.push({
      id: 'TC-DAG-09',
      category: 'EDGE_BOUNDS',
      target: 'computeDagLineage (Isolated Boundary)',
      name: '완전 고립 노드(선행 0, 후속 0) 선택 시 자기 자신 외 모든 노드 딤(Dimmed) 판정',
      passed: passIsolated,
      durationMs: Number((performance.now() - start).toFixed(2)),
      details: `단독 노드 선택 시 비연관 노드 ${isolatedLineage.unrelatedCount}건 정상 딤 처리`,
    });
  }

  const passedCount = results.filter((r) => r.passed).length;
  return {
    passedCount,
    totalCount: results.length,
    results,
  };
}

if (typeof require !== 'undefined' && require.main === module) {
  runDagHighlightEngineTests().then((res) => {
    console.log(`\n================================================================`);
    console.log(`🎯 [PLAT-DAG-19] DAG Lineage & Highlight Engine 3-Scenario Tests`);
    console.log(`================================================================`);
    res.results.forEach((r) => {
      console.log(`${r.passed ? '✅' : '❌'} [${r.category}] ${r.id}: ${r.name} (${r.durationMs}ms)`);
      console.log(`   └─ ${r.details}`);
    });
    console.log(`----------------------------------------------------------------`);
    console.log(`결과: ${res.passedCount}/${res.totalCount} 통과 (${((res.passedCount / res.totalCount) * 100).toFixed(1)}%)`);
    console.log(`================================================================\n`);
  });
}
