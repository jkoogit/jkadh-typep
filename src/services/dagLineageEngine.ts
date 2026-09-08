import { TaskGraphNode } from '../types';

export interface DagLineageResult {
  selectedId: string | null;
  upstreamIds: Set<string>;   // Ancestors / Dependencies (선행 의존 조상)
  downstreamIds: Set<string>; // Descendants / Dependents (후속 파생 자손)
  allRelatedIds: Set<string>; // selectedId + upstreamIds + downstreamIds
  isHighlightActive: boolean;
  upstreamCount: number;
  downstreamCount: number;
  unrelatedCount: number;
}

export type NodeHighlightRole = 'SELF' | 'UPSTREAM' | 'DOWNSTREAM' | 'UNRELATED' | 'NORMAL';
export type EdgeHighlightRole = 'UPSTREAM' | 'DOWNSTREAM' | 'UNRELATED' | 'NORMAL';

/**
 * 2계층 작업그래프(DAG) 선택 노드 기준 연관 계통(선행 조상 & 후속 자손) 재귀 탐색 엔진
 * - BFS 기반 탐색
 * - Set 기반 순환 참조(Cycle) 방어 및 중복 방지
 * - 고립/루트/리프 노드 및 미존재 ID 참조에 대한 안전 폴백 보장
 */
export function computeDagLineage(
  selectedId: string | null | undefined,
  tasks: TaskGraphNode[]
): DagLineageResult {
  if (!selectedId) {
    return {
      selectedId: null,
      upstreamIds: new Set<string>(),
      downstreamIds: new Set<string>(),
      allRelatedIds: new Set<string>(),
      isHighlightActive: false,
      upstreamCount: 0,
      downstreamCount: 0,
      unrelatedCount: 0,
    };
  }

  const taskMap = new Map<string, TaskGraphNode>();
  const childrenMap = new Map<string, string[]>();

  for (const t of tasks) {
    taskMap.set(t.id, t);
    for (const depId of t.dependencies) {
      if (!childrenMap.has(depId)) {
        childrenMap.set(depId, []);
      }
      childrenMap.get(depId)!.push(t.id);
    }
  }

  // 1. Upstream BFS (선행 의존 조상 노드 추적)
  const upstreamIds = new Set<string>();
  const upstreamQueue: string[] = [...(taskMap.get(selectedId)?.dependencies || [])];
  const upstreamVisited = new Set<string>([selectedId]);

  while (upstreamQueue.length > 0) {
    const currentId = upstreamQueue.shift()!;
    if (!upstreamVisited.has(currentId)) {
      upstreamVisited.add(currentId);
      upstreamIds.add(currentId);
      const node = taskMap.get(currentId);
      if (node && Array.isArray(node.dependencies)) {
        for (const parentId of node.dependencies) {
          if (!upstreamVisited.has(parentId)) {
            upstreamQueue.push(parentId);
          }
        }
      }
    }
  }

  // 2. Downstream BFS (후속 파생 자손 노드 추적)
  const downstreamIds = new Set<string>();
  const downstreamQueue: string[] = [...(childrenMap.get(selectedId) || [])];
  const downstreamVisited = new Set<string>([selectedId]);

  while (downstreamQueue.length > 0) {
    const currentId = downstreamQueue.shift()!;
    if (!downstreamVisited.has(currentId)) {
      downstreamVisited.add(currentId);
      downstreamIds.add(currentId);
      const childList = childrenMap.get(currentId) || [];
      for (const childId of childList) {
        if (!downstreamVisited.has(childId)) {
          downstreamQueue.push(childId);
        }
      }
    }
  }

  const allRelatedIds = new Set<string>([selectedId, ...upstreamIds, ...downstreamIds]);
  const totalTasksCount = tasks.length;
  const unrelatedCount = Math.max(0, totalTasksCount - allRelatedIds.size);

  return {
    selectedId,
    upstreamIds,
    downstreamIds,
    allRelatedIds,
    isHighlightActive: true,
    upstreamCount: upstreamIds.size,
    downstreamCount: downstreamIds.size,
    unrelatedCount,
  };
}

/**
 * 노드의 하이라이트 역할(Role) 결정
 */
export function getNodeHighlightRole(
  taskId: string,
  lineage: DagLineageResult
): NodeHighlightRole {
  if (!lineage.isHighlightActive) return 'NORMAL';
  if (taskId === lineage.selectedId) return 'SELF';
  if (lineage.upstreamIds.has(taskId)) return 'UPSTREAM';
  if (lineage.downstreamIds.has(taskId)) return 'DOWNSTREAM';
  return 'UNRELATED';
}

/**
 * 베지어 연결선(Edge)의 하이라이트 역할(Role) 결정
 */
export function getEdgeHighlightRole(
  sourceId: string,
  targetId: string,
  lineage: DagLineageResult
): EdgeHighlightRole {
  if (!lineage.isHighlightActive) return 'NORMAL';

  // Upstream edge:
  // (source is in upstream, target is selected) OR (both source and target are in upstream)
  const isSourceUpstream = lineage.upstreamIds.has(sourceId);
  const isTargetUpstream = lineage.upstreamIds.has(targetId);
  const isTargetSelf = targetId === lineage.selectedId;
  if ((isSourceUpstream && isTargetSelf) || (isSourceUpstream && isTargetUpstream)) {
    return 'UPSTREAM';
  }

  // Downstream edge:
  // (source is selected, target is in downstream) OR (both source and target are in downstream)
  const isSourceSelf = sourceId === lineage.selectedId;
  const isSourceDownstream = lineage.downstreamIds.has(sourceId);
  const isTargetDownstream = lineage.downstreamIds.has(targetId);
  if ((isSourceSelf && isTargetDownstream) || (isSourceDownstream && isTargetDownstream)) {
    return 'DOWNSTREAM';
  }

  return 'UNRELATED';
}
