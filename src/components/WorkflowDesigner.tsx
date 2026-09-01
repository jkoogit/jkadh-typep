import React, { useState, useRef, useEffect } from 'react';
import {
  GitBranch,
  Workflow,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Cpu,
  Lock,
  Database,
  PlayCircle,
  ScanLine,
  Table,
  Stamp,
  ShieldCheck,
  Split,
  FileText,
  Clock,
  Archive,
  Move,
  Link,
  Unlink,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Info,
  Filter,
  Sliders,
  Grid,
  Maximize
} from 'lucide-react';
import { TaskGraphNode } from '../types';

interface WorkflowDesignerProps {
  tasks: TaskGraphNode[];
  onUpdateTasks?: (updatedTasks: TaskGraphNode[]) => void;
  onSelectTask?: (taskId: string) => void;
  selectedTaskId?: string;
}

export type SpacingPreset = 'COMPACT' | 'STANDARD' | 'SPACIOUS';

export const WorkflowDesigner: React.FC<WorkflowDesignerProps> = ({
  tasks,
  onUpdateTasks,
  onSelectTask,
  selectedTaskId,
}) => {
  // 로컬 편집 상태 복사본
  const [localTasks, setLocalTasks] = useState<TaskGraphNode[]>(() => JSON.parse(JSON.stringify(tasks)));
  const [activeLayer, setActiveLayer] = useState<'ALL' | 'PLATFORM' | 'ON_HOLD'>('ALL');
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [connectingSourceId, setConnectingSourceId] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [validationAlert, setValidationAlert] = useState<{ type: 'ERROR' | 'SUCCESS' | 'INFO'; message: string } | null>(null);
  
  // ⭐️ 상하·좌우 간격 설정 상태 (Row Gap & Col Gap)
  const [colGap, setColGap] = useState<number>(360); // 수평 간격 (220 ~ 520px, 기본 360px)
  const [rowGap, setRowGap] = useState<number>(160); // 수직 간격 (80 ~ 300px, 기본 160px)
  const [activePreset, setActivePreset] = useState<SpacingPreset>('STANDARD');

  // 캔버스 내 노드 위치 관리 (자동 레이아웃 + 드래그 위치)
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});
  const canvasRef = useRef<HTMLDivElement>(null);

  // ⭐️ 계층형 위상 정렬 기반 자동 레이아웃 계산 함수 (Sugiyama Leveling with Spacing)
  const computeAutoLayout = (
    taskList: TaskGraphNode[],
    cGap: number,
    rGap: number
  ): Record<string, { x: number; y: number }> => {
    const positions: Record<string, { x: number; y: number }> = {};
    
    // 1. 플랫폼 활성 DAG 노드 (Layer 1 - 상단)
    const platformTasks = taskList.filter(t => t.targetRepo !== 'pdfowers-service' && t.status !== 'ON_HOLD');
    // 2. 타겟 서비스 보류 노드 (Layer 2 - 하단)
    const onHoldTasks = taskList.filter(t => t.targetRepo === 'pdfowers-service' || t.status === 'ON_HOLD');

    const calculateLevels = (nodes: TaskGraphNode[]) => {
      const levels: Record<string, number> = {};
      const visited = new Set<string>();

      const getLevel = (nodeId: string): number => {
        if (levels[nodeId] !== undefined) return levels[nodeId];
        const task = nodes.find(t => t.id === nodeId);
        if (!task || task.dependencies.length === 0) {
          levels[nodeId] = 0;
          return 0;
        }
        if (visited.has(nodeId)) return 0;
        visited.add(nodeId);
        const maxParentLevel = Math.max(...task.dependencies.map(depId => getLevel(depId)), -1);
        levels[nodeId] = maxParentLevel + 1;
        return levels[nodeId];
      };

      nodes.forEach(t => getLevel(t.id));
      return levels;
    };

    const platLevels = calculateLevels(platformTasks);
    const onHoldLevels = calculateLevels(onHoldTasks);

    // 플랫폼 노드 배치 (Layer 1)
    const platLevelGroups: Record<number, TaskGraphNode[]> = {};
    platformTasks.forEach(t => {
      const lvl = platLevels[t.id] || 0;
      if (!platLevelGroups[lvl]) platLevelGroups[lvl] = [];
      platLevelGroups[lvl].push(t);
    });

    let maxPlatY = 0;
    Object.entries(platLevelGroups).forEach(([lvlStr, group]) => {
      const lvl = parseInt(lvlStr, 10);
      const colX = 60 + lvl * cGap;
      group.forEach((task, idx) => {
        const rowY = 50 + idx * rGap;
        positions[task.id] = { x: colX, y: rowY };
        if (rowY > maxPlatY) maxPlatY = rowY;
      });
    });

    // 보류/이관 노드 배치 (Layer 2 - 플랫폼 하단 영역 + 여유 버퍼)
    const onHoldBaseY = Math.max(520, maxPlatY + rGap + 120);
    const onHoldLevelGroups: Record<number, TaskGraphNode[]> = {};
    onHoldTasks.forEach(t => {
      const lvl = onHoldLevels[t.id] || 0;
      if (!onHoldLevelGroups[lvl]) onHoldLevelGroups[lvl] = [];
      onHoldLevelGroups[lvl].push(t);
    });

    Object.entries(onHoldLevelGroups).forEach(([lvlStr, group]) => {
      const lvl = parseInt(lvlStr, 10);
      const colX = 60 + lvl * cGap;
      group.forEach((task, idx) => {
        const rowY = onHoldBaseY + idx * rGap;
        positions[task.id] = { x: colX, y: rowY };
      });
    });

    return positions;
  };

  // 초기 로드 시 자동 정렬 적용
  useEffect(() => {
    const pos = computeAutoLayout(localTasks, colGap, rowGap);
    setNodePositions(pos);
  }, [tasks.length]);

  // 프리셋 선택 핸들러
  const handleApplyPreset = (preset: SpacingPreset) => {
    setActivePreset(preset);
    let newCol = 360;
    let newRow = 160;
    if (preset === 'COMPACT') {
      newCol = 270;
      newRow = 105;
    } else if (preset === 'SPACIOUS') {
      newCol = 460;
      newRow = 220;
    }
    setColGap(newCol);
    setRowGap(newRow);
    const pos = computeAutoLayout(localTasks, newCol, newRow);
    setNodePositions(pos);
    setValidationAlert({
      type: 'INFO',
      message: `간격 프리셋 [${preset === 'COMPACT' ? '조밀 (Compact)' : preset === 'STANDARD' ? '표준 (Standard)' : '여유 (Spacious)'}]이 적용되었습니다. (수평: ${newCol}px, 수직: ${newRow}px)`
    });
  };

  // 슬라이더 변경 핸들러
  const handleColGapChange = (val: number) => {
    setColGap(val);
    setActivePreset('STANDARD');
    const pos = computeAutoLayout(localTasks, val, rowGap);
    setNodePositions(pos);
  };

  const handleRowGapChange = (val: number) => {
    setRowGap(val);
    setActivePreset('STANDARD');
    const pos = computeAutoLayout(localTasks, colGap, val);
    setNodePositions(pos);
  };

  // 수동 자동 정렬 재정렬
  const handleTriggerAutoLayout = () => {
    const pos = computeAutoLayout(localTasks, colGap, rowGap);
    setNodePositions(pos);
    setValidationAlert({
      type: 'SUCCESS',
      message: '✨ DAG 위상 정렬(Topological Auto-Layout)이 재계산되어 카드가 최적 여백으로 정렬되었습니다.'
    });
  };

  // 마우스 이동 추적 (노드 드래그 및 연결선 가이드)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / zoomLevel;
    const y = (e.clientY - rect.top) / zoomLevel;
    setMousePos({ x, y });

    if (draggingNodeId) {
      setNodePositions(prev => ({
        ...prev,
        [draggingNodeId]: {
          x: Math.max(20, Math.min(1800, x - 120)),
          y: Math.max(20, Math.min(1200, y - 45))
        }
      }));
    }
  };

  const handleMouseUp = () => {
    if (draggingNodeId) {
      setDraggingNodeId(null);
    }
  };

  // 모듈 아이콘 헬퍼
  const getModuleIcon = (module: TaskGraphNode['module']) => {
    switch (module) {
      case 'GOVERNANCE': return <Workflow className="w-3.5 h-3.5 text-indigo-400" />;
      case 'MODEL_ROUTER': return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      case 'SECURITY_VAULT': return <Lock className="w-3.5 h-3.5 text-emerald-400" />;
      case 'DB_MIGRATION': return <Database className="w-3.5 h-3.5 text-amber-400" />;
      case 'ORCHESTRATOR': return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'VIBE_RUNNER': return <PlayCircle className="w-3.5 h-3.5 text-pink-400" />;
      case 'OCR': return <ScanLine className="w-3.5 h-3.5 text-amber-400" />;
      case 'TABLE_EXTRACT': return <Table className="w-3.5 h-3.5 text-blue-400" />;
      case 'WATERMARK': return <Stamp className="w-3.5 h-3.5 text-purple-400" />;
      case 'SECURITY': return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'MERGE_SPLIT': return <Split className="w-3.5 h-3.5 text-cyan-400" />;
      default: return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  // 상태 배지
  const getStatusBadge = (status: TaskGraphNode['status']) => {
    switch (status) {
      case 'DONE':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">완료 (DONE)</span>;
      case 'ON_HOLD':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">보류·이관대기</span>;
      case 'DEVELOPING':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">개발중</span>;
      case 'TESTED':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">검증완료</span>;
      case 'PLANNED':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">기획완료</span>;
      case 'ANALYSIS':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">분석중</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-slate-700/50 text-slate-300 border border-slate-600/40">백로그</span>;
    }
  };

  // 의존성 연결 추가/삭제 핸들러
  const handleToggleDependency = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    // 순환 참조 검사 (DFS)
    const checkCycle = (currTargetId: string, visited = new Set<string>()): boolean => {
      if (currTargetId === sourceId) return true;
      if (visited.has(currTargetId)) return false;
      visited.add(currTargetId);
      
      const targetNode = localTasks.find(t => t.id === currTargetId);
      if (!targetNode) return false;
      
      for (const depId of targetNode.dependencies) {
        if (checkCycle(depId, visited)) return true;
      }
      return false;
    };

    setLocalTasks(prev => {
      const targetTask = prev.find(t => t.id === targetId);
      if (!targetTask) return prev;

      const alreadyConnected = targetTask.dependencies.includes(sourceId);

      if (alreadyConnected) {
        // 연결 해제
        setValidationAlert({
          type: 'INFO',
          message: `[의존성 해제] ${sourceId} ➔ ${targetId} 연결이 정상적으로 제거되었습니다.`
        });
        setHasUnsavedChanges(true);
        return prev.map(t => t.id === targetId ? {
          ...t,
          dependencies: t.dependencies.filter(d => d !== sourceId)
        } : t);
      } else {
        // 순환 참조 여부 검증
        if (checkCycle(sourceId)) {
          setValidationAlert({
            type: 'ERROR',
            message: `🚨 [순환 종속성 차단] ${sourceId} ➔ ${targetId} 연결 시 DAG 순환(Cycle)이 발생하여 거버넌스 규칙에 의해 거부되었습니다.`
          });
          return prev;
        }

        // 신규 연결 생성
        setValidationAlert({
          type: 'SUCCESS',
          message: `✨ [신규 의존성 체결] ${sourceId} ➔ ${targetId} 종속 관계가 확정되었습니다.`
        });
        setHasUnsavedChanges(true);
        return prev.map(t => t.id === targetId ? {
          ...t,
          dependencies: [...t.dependencies, sourceId]
        } : t);
      }
    });

    setConnectingSourceId(null);
  };

  // 노드 신규 추가 모달/액션
  const handleAddNewNode = () => {
    const newId = `node-custom-${Date.now().toString().slice(-4)}`;
    const newCode = `PLAT-CUSTOM-${localTasks.length + 1}`;
    const isPlatform = activeLayer !== 'ON_HOLD';

    const newNode: TaskGraphNode = {
      id: newId,
      code: newCode,
      title: '신규 워크플로우 태스크 노드',
      module: isPlatform ? 'GOVERNANCE' : 'MERGE_SPLIT',
      complexity: 'MEDIUM',
      estimatedTokens: 250000,
      status: 'PLANNED',
      dependencies: [],
      currentPhase: 1,
      riskLevel: 'LOW',
      description: 'Workflow Designer에서 추가된 2계층 DAG 작업 노드입니다.',
      phases: [],
      specValidationScore: 90,
      targetRepo: isPlatform ? 'jkadh-typep' : 'pdfowers-service',
      migrationStatus: isPlatform ? 'NOT_APPLICABLE' : 'PENDING_MIGRATION',
      addedAt: new Date().toISOString().replace('T', ' ').slice(0, 16) + ' (Designer 추가)'
    };

    setLocalTasks(prev => [...prev, newNode]);
    setNodePositions(prev => ({
      ...prev,
      [newId]: { x: 300, y: isPlatform ? 120 : 540 }
    }));
    setHasUnsavedChanges(true);
    setValidationAlert({
      type: 'SUCCESS',
      message: `신규 태스크 노드 [${newCode}]가 생성되었습니다. 드래그하여 다른 노드와 의존성을 연결하세요.`
    });
  };

  // 변경사항 저장
  const handleSaveChanges = () => {
    if (onUpdateTasks) {
      onUpdateTasks(localTasks);
    }
    setHasUnsavedChanges(false);
    setValidationAlert({
      type: 'SUCCESS',
      message: '✅ 2계층 작업그래프(DAG) 토폴로지 변경사항이 메모리 및 하네스 DB에 성공적으로 동기화되었습니다.'
    });
  };

  // 초기화
  const handleReset = () => {
    setLocalTasks(JSON.parse(JSON.stringify(tasks)));
    setHasUnsavedChanges(false);
    setConnectingSourceId(null);
    setValidationAlert({
      type: 'INFO',
      message: '작업그래프가 이전 저장 상태로 초기화되었습니다.'
    });
  };

  // 필터링된 태스크 목록
  const visibleTasks = localTasks.filter(t => {
    if (activeLayer === 'PLATFORM') return t.targetRepo !== 'pdfowers-service' && t.status !== 'ON_HOLD';
    if (activeLayer === 'ON_HOLD') return t.targetRepo === 'pdfowers-service' || t.status === 'ON_HOLD';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 1. 상단 컨트롤 툴바 & 간격 조절 바 */}
      <div className="space-y-2.5">
        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] flex items-center justify-between gap-3 flex-wrap shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
              <Workflow className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-bold text-[#E6EDF3]">
                  2계층 작업그래프(DAG) 인터랙티브 워크플로우 디자이너 (Workflow Designer)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-semibold border border-blue-500/30">
                  Drag & Drop
                </span>
              </div>
              <p className="text-[11px] text-[#7D8590] mt-0.5">
                노드를 드래그하여 자유롭게 배치하고, 노드 우측 핸들(●)을 클릭 후 대상 노드를 클릭하여 의존성을 실시간 연결·재구성합니다.
              </p>
            </div>
          </div>

          {/* 툴바 액션 버튼들 */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* 레이어 필터 */}
            <div className="flex items-center bg-[#0D1117] p-0.5 rounded-lg border border-[#30363D]">
              <button
                id="btn-layer-all"
                onClick={() => setActiveLayer('ALL')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  activeLayer === 'ALL'
                    ? 'bg-slate-700/60 text-[#E6EDF3] font-bold shadow-xs'
                    : 'text-[#7D8590] hover:text-[#E6EDF3]'
                }`}
              >
                전체 2계층 ({localTasks.length})
              </button>
              <button
                id="btn-layer-platform"
                onClick={() => setActiveLayer('PLATFORM')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  activeLayer === 'PLATFORM'
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 font-bold shadow-xs'
                    : 'text-[#7D8590] hover:text-[#E6EDF3]'
                }`}
              >
                <Cpu className="w-3 h-3 text-indigo-400" /> 플랫폼 활성 DAG
              </button>
              <button
                id="btn-layer-onhold"
                onClick={() => setActiveLayer('ON_HOLD')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                  activeLayer === 'ON_HOLD'
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold shadow-xs'
                    : 'text-[#7D8590] hover:text-[#E6EDF3]'
                }`}
              >
                <Archive className="w-3 h-3 text-amber-400" /> 타겟 보류 목록
              </button>
            </div>

            {/* 줌 컨트롤 */}
            <div className="flex items-center bg-[#0D1117] p-0.5 rounded-lg border border-[#30363D]">
              <button
                id="btn-zoom-out"
                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.1))}
                className="p-1 rounded text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#21262D] cursor-pointer"
                title="축소"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 text-[10px] font-mono text-[#C9D1D9]">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                id="btn-zoom-in"
                onClick={() => setZoomLevel(prev => Math.min(1.4, prev + 0.1))}
                className="p-1 rounded text-[#7D8590] hover:text-[#E6EDF3] hover:bg-[#21262D] cursor-pointer"
                title="확대"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* 신규 노드 추가 */}
            <button
              id="btn-add-workflow-node"
              onClick={handleAddNewNode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] border border-[#30363D] text-xs font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              노드 추가
            </button>

            {/* 리셋 */}
            <button
              id="btn-reset-workflow"
              onClick={handleReset}
              disabled={!hasUnsavedChanges}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                hasUnsavedChanges
                  ? 'bg-[#21262D] border-[#30363D] text-[#C9D1D9] hover:bg-[#30363D]'
                  : 'opacity-40 cursor-not-allowed border-transparent text-[#7D8590]'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              되돌리기
            </button>

            {/* 저장 */}
            <button
              id="btn-save-workflow"
              onClick={handleSaveChanges}
              disabled={!hasUnsavedChanges}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                hasUnsavedChanges
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-400/50 ring-2 ring-emerald-500/30 animate-pulse'
                  : 'bg-emerald-600/30 text-emerald-400/50 border border-emerald-500/20 cursor-not-allowed'
              }`}
            >
              <Save className="w-3.5 h-3.5" />
              변경사항 저장 {hasUnsavedChanges && '●'}
            </button>
          </div>
        </div>

        {/* ⭐️ 2. 상하·좌우 간격 및 자동 정렬 제어 툴바 (Spacing & Auto-Layout Bar) */}
        <div className="p-3 rounded-xl bg-[#0D1117] border border-[#30363D] flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            {/* 프리셋 버튼 */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-[#8B949E] flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" /> 간격 프리셋:
              </span>
              <div className="flex items-center bg-[#161B22] p-0.5 rounded-lg border border-[#30363D]">
                <button
                  id="btn-preset-compact"
                  onClick={() => handleApplyPreset('COMPACT')}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    activePreset === 'COMPACT'
                      ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-bold'
                      : 'text-[#7D8590] hover:text-[#E6EDF3]'
                  }`}
                >
                  조밀 (270×105)
                </button>
                <button
                  id="btn-preset-standard"
                  onClick={() => handleApplyPreset('STANDARD')}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    activePreset === 'STANDARD'
                      ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-bold'
                      : 'text-[#7D8590] hover:text-[#E6EDF3]'
                  }`}
                >
                  표준 (360×160)
                </button>
                <button
                  id="btn-preset-spacious"
                  onClick={() => handleApplyPreset('SPACIOUS')}
                  className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                    activePreset === 'SPACIOUS'
                      ? 'bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 font-bold'
                      : 'text-[#7D8590] hover:text-[#E6EDF3]'
                  }`}
                >
                  여유 (460×220)
                </button>
              </div>
            </div>

            {/* 수평 좌우 간격 슬라이더 */}
            <div className="flex items-center gap-2 bg-[#161B22] px-3 py-1 rounded-lg border border-[#30363D]">
              <span className="text-[11px] text-[#8B949E] flex items-center gap-1 font-mono">
                ↔ 좌우 간격:
              </span>
              <input
                id="slider-col-gap"
                type="range"
                min="240"
                max="520"
                step="10"
                value={colGap}
                onChange={(e) => handleColGapChange(Number(e.target.value))}
                className="w-24 h-1.5 bg-[#30363D] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[11px] font-mono font-bold text-indigo-300 min-w-[40px]">
                {colGap}px
              </span>
            </div>

            {/* 수직 상하 간격 슬라이더 */}
            <div className="flex items-center gap-2 bg-[#161B22] px-3 py-1 rounded-lg border border-[#30363D]">
              <span className="text-[11px] text-[#8B949E] flex items-center gap-1 font-mono">
                ↕ 상하 간격:
              </span>
              <input
                id="slider-row-gap"
                type="range"
                min="90"
                max="300"
                step="10"
                value={rowGap}
                onChange={(e) => handleRowGapChange(Number(e.target.value))}
                className="w-24 h-1.5 bg-[#30363D] rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-[11px] font-mono font-bold text-indigo-300 min-w-[40px]">
                {rowGap}px
              </span>
            </div>
          </div>

          {/* 자동 정렬 실행 버튼 */}
          <button
            id="btn-trigger-autolayout"
            onClick={handleTriggerAutoLayout}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold transition-all cursor-pointer shadow-xs"
            title="위상 정렬 기반으로 모든 노드를 균등 간격으로 재배치합니다"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            자동 정렬 (Auto-Layout)
          </button>
        </div>
      </div>

      {/* 2. 상태 안내 알림 배너 */}
      {validationAlert && (
        <div
          className={`p-3 rounded-lg border flex items-center justify-between gap-2 text-xs transition-all ${
            validationAlert.type === 'ERROR'
              ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              : validationAlert.type === 'SUCCESS'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {validationAlert.type === 'ERROR' ? (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            ) : validationAlert.type === 'SUCCESS' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
            )}
            <span>{validationAlert.message}</span>
          </div>
          <button
            onClick={() => setValidationAlert(null)}
            className="text-[11px] underline opacity-70 hover:opacity-100 cursor-pointer"
          >
            닫기
          </button>
        </div>
      )}

      {/* 3. 메인 SVG 캔버스 & 인터랙티브 노드 영역 */}
      <div className="relative rounded-xl border border-[#30363D] bg-[#090D13] overflow-hidden shadow-inner select-none">
        
        {/* 2계층 분리 레이어 배경 안내 가이드 */}
        {activeLayer === 'ALL' && (
          <>
            <div className="absolute top-2 left-4 z-0 pointer-events-none flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold">
                ▲ LAYER 1: 플랫폼 인프라 코어 활성 DAG (Platform Active DAG)
              </span>
            </div>
            
            {/* 계층 구분 경계선 */}
            <div className="absolute top-[430px] left-0 right-0 border-b border-dashed border-amber-500/30 z-0 pointer-events-none" />
            
            <div className="absolute top-[438px] left-4 z-0 pointer-events-none flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                ▼ LAYER 2: 타겟 서비스(PDF 뷰어) 이관 대기 목록 (Target Service Migration Hold)
              </span>
            </div>
          </>
        )}

        {/* 연결 모드 활성화 시 안내 툴팁 */}
        {connectingSourceId && (
          <div className="absolute top-3 right-4 z-30 bg-indigo-950/90 border border-indigo-400/50 rounded-lg px-3 py-1.5 text-xs text-indigo-200 shadow-xl flex items-center gap-2 animate-bounce">
            <Link className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              <strong>[{connectingSourceId}]</strong>의 종속 대상이 될 후속 노드를 클릭하세요. (취소: 빈 캔버스 클릭)
            </span>
            <button
              onClick={() => setConnectingSourceId(null)}
              className="ml-2 text-[10px] underline text-indigo-400 hover:text-white cursor-pointer"
            >
              연결 취소
            </button>
          </div>
        )}

        {/* 드래그 및 줌이 적용되는 캔버스 */}
        <div
          ref={canvasRef}
          id="workflow-designer-canvas"
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={(e) => {
            if (e.target === canvasRef.current || (e.target as HTMLElement).tagName === 'svg') {
              setConnectingSourceId(null);
            }
          }}
          className="w-full h-[760px] overflow-auto relative cursor-crosshair bg-grid-pattern"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            transform: `scale(${zoomLevel})`,
            transformOrigin: 'top left',
            width: `${100 / zoomLevel}%`,
            height: `${760 / zoomLevel}px`
          }}
        >
          {/* SVG 의존성 연결 화살표 (Bezier Curves) */}
          <svg className="absolute inset-0 w-[2000px] h-[1400px] pointer-events-none z-10">
            <defs>
              <marker
                id="arrowhead-active"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#6366F1" />
              </marker>
              <marker
                id="arrowhead-onhold"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#F59E0B" />
              </marker>
              <marker
                id="arrowhead-connecting"
                markerWidth="8"
                markerHeight="6"
                refX="7"
                refY="3"
                orient="auto"
              >
                <polygon points="0 0, 8 3, 0 6" fill="#38BDF8" />
              </marker>
            </defs>

            {/* 기존 노드 간 의존성 곡선 렌더링 */}
            {visibleTasks.map(targetTask => {
              const targetPos = nodePositions[targetTask.id];
              if (!targetPos) return null;

              return targetTask.dependencies.map(sourceId => {
                const sourceTask = localTasks.find(t => t.id === sourceId);
                const sourcePos = nodePositions[sourceId];
                if (!sourcePos) return null;

                const isPlatform = targetTask.targetRepo !== 'pdfowers-service';
                // 카드 크기(width: 240px, height: ~105px) 기준 중심점 및 도킹 핀 좌표
                const startX = sourcePos.x + 240; // 노드 우측 도킹 핀 (Source Pin)
                const startY = sourcePos.y + 45;
                const endX = targetPos.x;         // 노드 좌측 도킹 핀 (Target Pin)
                const endY = targetPos.y + 45;

                // ⭐️ 다중 연결선 간 겹침 방지 및 꺾임 완화를 위한 지능형 큐빅 베지어 제어점(Control Points) 계산
                const dx = endX - startX;
                const dy = endY - startY;

                let pathD = '';
                if (dx > 0) {
                  // 일반적인 정방향 연결 (Left -> Right)
                  // 거리에 비례한 제어점 오프셋 적용으로 급격한 곡선 꺾임 방지
                  const curveOffset = Math.max(40, Math.min(dx * 0.45, 180));
                  pathD = `M ${startX} ${startY} C ${startX + curveOffset} ${startY}, ${endX - curveOffset} ${endY}, ${endX} ${endY}`;
                } else {
                  // 역방향 또는 동일 열 연결 시 루프형 베지어 라우팅 (노드 횡단 방지)
                  const loopOffset = Math.max(60, Math.abs(dy) * 0.4);
                  pathD = `M ${startX} ${startY} C ${startX + loopOffset} ${startY + (dy > 0 ? 30 : -30)}, ${endX - loopOffset} ${endY + (dy > 0 ? -30 : 30)}, ${endX} ${endY}`;
                }

                return (
                  <g key={`${sourceId}-${targetTask.id}`} className="group">
                    {/* 호버 영역 */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="transparent"
                      strokeWidth="16"
                      className="cursor-pointer pointer-events-auto"
                      onClick={() => handleToggleDependency(sourceId, targetTask.id)}
                    />
                    {/* 메인 곡선 */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isPlatform ? '#6366F1' : '#F59E0B'}
                      strokeWidth="2.2"
                      strokeDasharray={isPlatform ? 'none' : '4 3'}
                      markerEnd={`url(#${isPlatform ? 'arrowhead-active' : 'arrowhead-onhold'})`}
                      className="transition-all opacity-80 group-hover:opacity-100 group-hover:stroke-cyan-400 group-hover:stroke-[3]"
                    />
                  </g>
                );
              });
            })}

            {/* 신규 의존성 연결 중 임시 가이드선 */}
            {connectingSourceId && nodePositions[connectingSourceId] && (
              <path
                d={`M ${nodePositions[connectingSourceId].x + 240} ${nodePositions[connectingSourceId].y + 45} C ${nodePositions[connectingSourceId].x + 240 + 60} ${nodePositions[connectingSourceId].y + 45}, ${mousePos.x - 60} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
                fill="none"
                stroke="#38BDF8"
                strokeWidth="2.5"
                strokeDasharray="5 4"
                markerEnd="url(#arrowhead-connecting)"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* 개별 작업그래프 노드 카드 (DOM) */}
          {visibleTasks.map(task => {
            const pos = nodePositions[task.id] || { x: 60, y: 60 };
            const isSelected = task.id === selectedTaskId;
            const isConnecting = connectingSourceId === task.id;
            const isPlatform = task.targetRepo !== 'pdfowers-service' && task.status !== 'ON_HOLD';

            return (
              <div
                key={task.id}
                id={`workflow-node-${task.id}`}
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  width: '240px'
                }}
                className={`absolute z-20 rounded-xl border transition-shadow cursor-grab active:cursor-grabbing select-none ${
                  isSelected
                    ? 'ring-2 ring-blue-500 shadow-xl bg-[#1C2128] border-blue-400'
                    : isConnecting
                    ? 'ring-2 ring-cyan-400 shadow-xl bg-[#161B22] border-cyan-400'
                    : isPlatform
                    ? 'bg-[#161B22] border-[#30363D] hover:border-indigo-400 hover:shadow-md'
                    : 'bg-[#13161C] border-amber-500/30 hover:border-amber-400 hover:shadow-md'
                }`}
                onMouseDown={(e) => {
                  // 버튼 클릭이 아닌 카드 영역 클릭 시 드래그 시작
                  if ((e.target as HTMLElement).closest('button')) return;
                  setDraggingNodeId(task.id);
                  if (onSelectTask) onSelectTask(task.id);
                }}
                onClick={() => {
                  if (connectingSourceId && connectingSourceId !== task.id) {
                    handleToggleDependency(connectingSourceId, task.id);
                  }
                }}
              >
                {/* 노드 상단: 모듈 아이콘, 코드, 액션 */}
                <div className="p-2.5 pb-2 border-b border-[#30363D]/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="p-1 rounded bg-[#0D1117] border border-[#30363D]/80">
                      {getModuleIcon(task.module)}
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-300 truncate">
                      {task.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusBadge(task.status)}
                  </div>
                </div>

                {/* 노드 바디: 타이틀 & 의존성 요약 */}
                <div className="p-2.5 space-y-1.5">
                  <h5 className="font-semibold text-xs text-[#E6EDF3] line-clamp-1 leading-snug">
                    {task.title}
                  </h5>
                  
                  <div className="flex items-center justify-between text-[10px] text-[#7D8590] font-mono pt-1">
                    <span>Phase {task.currentPhase}/7</span>
                    <span>~{(task.estimatedTokens / 1000).toFixed(0)}k Tok</span>
                  </div>

                  {/* 종속 부모 태그 */}
                  <div className="pt-1 flex items-center gap-1 text-[10px] text-[#8B949E] truncate">
                    <ArrowRight className="w-3 h-3 text-indigo-400 shrink-0" />
                    <span className="truncate">
                      {task.dependencies.length > 0
                        ? `부모: ${task.dependencies.join(', ')}`
                        : '루트(Root)'}
                    </span>
                  </div>
                </div>

                {/* 좌측 입력 도킹 포인트 (Target Pin) */}
                <div
                  className="absolute -left-2 top-[38px] w-4 h-4 rounded-full bg-[#0D1117] border-2 border-indigo-400 flex items-center justify-center cursor-pointer hover:scale-125 transition-transform"
                  title="의존성 입력 지점"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (connectingSourceId) {
                      handleToggleDependency(connectingSourceId, task.id);
                    }
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                </div>

                {/* 우측 출력 도킹 핸들 (Source Pin - 연결선 시작) */}
                <button
                  id={`btn-connect-pin-${task.id}`}
                  className={`absolute -right-2 top-[38px] w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                    isConnecting
                      ? 'bg-cyan-400 border-white scale-125 shadow-md'
                      : 'bg-[#0D1117] border-cyan-400 hover:scale-125'
                  }`}
                  title="클릭하여 후속 노드와 연결선 작성"
                  onClick={(e) => {
                    e.stopPropagation();
                    setConnectingSourceId(prev => prev === task.id ? null : task.id);
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. 하단 도움말 & 사용 가이드 */}
      <div className="p-3 rounded-lg bg-[#161B22]/70 border border-[#30363D] flex items-center justify-between text-xs text-[#7D8590]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[#C9D1D9]">
            <Move className="w-3.5 h-3.5 text-blue-400" /> 노드 드래그: 캔버스 내 자유 배치
          </span>
          <span className="flex items-center gap-1.5 text-[#C9D1D9]">
            <Link className="w-3.5 h-3.5 text-cyan-400" /> 우측 핀(●) 클릭 ➔ 타겟 노드 클릭: 의존성 체결
          </span>
          <span className="flex items-center gap-1.5 text-[#C9D1D9]">
            <Unlink className="w-3.5 h-3.5 text-rose-400" /> 연결선 클릭: 의존성 해제
          </span>
        </div>
        <span className="text-[11px] font-mono text-indigo-300">
          * 순환 참조(Cycle) 발생 시 거버넌스 가드에 의해 자동 차단됩니다.
        </span>
      </div>
    </div>
  );
};
