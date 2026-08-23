import React, { useState } from 'react';
import {
  FileText,
  ScanLine,
  Table,
  Stamp,
  ShieldCheck,
  Split,
  GitBranch,
  CheckCircle2,
  Clock,
  AlertCircle,
  LayoutGrid,
  GitCommit,
  ArrowUp,
  ArrowDownRight,
  GitPullRequest,
  Calendar,
  Sparkles,
  Milestone,
  HelpCircle,
  TrendingUp,
  Cpu,
  Database,
  Lock,
  Workflow,
  PlayCircle,
  Archive,
  Layers,
  ExternalLink,
} from 'lucide-react';
import { TaskGraphNode } from '../types';

interface TaskGraphViewerProps {
  tasks: TaskGraphNode[];
  selectedTaskId: string;
  onSelectTask: (taskId: string) => void;
}

export const TaskGraphViewer: React.FC<TaskGraphViewerProps> = ({
  tasks,
  selectedTaskId,
  onSelectTask,
}) => {
  const [viewMode, setViewMode] = useState<'BRANCH' | 'GRID'>('BRANCH');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PLATFORM' | 'ON_HOLD'>('ALL');

  const getModuleIcon = (module: TaskGraphNode['module']) => {
    switch (module) {
      case 'GOVERNANCE':
        return <Workflow className="w-3.5 h-3.5 text-indigo-400" />;
      case 'MODEL_ROUTER':
        return <Cpu className="w-3.5 h-3.5 text-cyan-400" />;
      case 'SECURITY_VAULT':
        return <Lock className="w-3.5 h-3.5 text-emerald-400" />;
      case 'DB_MIGRATION':
        return <Database className="w-3.5 h-3.5 text-amber-400" />;
      case 'ORCHESTRATOR':
        return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'VIBE_RUNNER':
        return <PlayCircle className="w-3.5 h-3.5 text-pink-400" />;
      case 'OCR':
        return <ScanLine className="w-3.5 h-3.5 text-amber-400" />;
      case 'TABLE_EXTRACT':
        return <Table className="w-3.5 h-3.5 text-blue-400" />;
      case 'WATERMARK':
        return <Stamp className="w-3.5 h-3.5 text-purple-400" />;
      case 'SECURITY':
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'MERGE_SPLIT':
        return <Split className="w-3.5 h-3.5 text-cyan-400" />;
      case 'CONVERT':
      default:
        return <FileText className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getStatusBadge = (status: TaskGraphNode['status']) => {
    switch (status) {
      case 'DONE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> 완료 (DONE)
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
            <Archive className="w-3 h-3" /> 보류·이관대기
          </span>
        );
      case 'DEVELOPING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-semibold border border-indigo-500/30">
            <Clock className="w-3 h-3 animate-spin" /> 개발·동기화중 (Phase 6~7)
          </span>
        );
      case 'TESTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-semibold border border-cyan-500/30">
            <CheckCircle2 className="w-3 h-3" /> 검증완료 (Phase 5)
          </span>
        );
      case 'PLANNED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
            <Clock className="w-3 h-3" /> 기획완료·대기 (Phase 3)
          </span>
        );
      case 'ANALYSIS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
            <AlertCircle className="w-3 h-3" /> 영향분석중 (Phase 2)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-300 text-[10px] font-semibold border border-slate-600/40">
            백로그 대기 (Phase 1)
          </span>
        );
    }
  };

  // Filter tasks based on Platform Core vs Target Service Migration
  const platformTasks = tasks.filter((t) => t.targetRepo !== 'pdfowers-service' && t.status !== 'ON_HOLD');
  const onHoldTasks = tasks.filter((t) => t.targetRepo === 'pdfowers-service' || t.status === 'ON_HOLD');

  const activeTasks = activeTab === 'PLATFORM' ? platformTasks : activeTab === 'ON_HOLD' ? onHoldTasks : tasks;

  // 1. Pending / Unstarted tasks in active selection
  const pendingTasks = activeTasks
    .filter((t) => t.status === 'PLANNED' || t.status === 'ANALYSIS' || t.status === 'BACKLOG')
    .sort((a, b) => {
      const priority: Record<string, number> = { PLANNED: 3, ANALYSIS: 2, BACKLOG: 1 };
      return (priority[b.status] || 0) - (priority[a.status] || 0);
    });

  // 2. Completed / In-progress tasks in active selection
  const historyTasks = activeTasks
    .filter((t) => t.status === 'DONE' || t.status === 'TESTED' || t.status === 'DEVELOPING')
    .sort((a, b) => {
      if (a.dependencies.includes(b.id)) return -1;
      if (b.dependencies.includes(a.id)) return 1;
      const statusWeight: Record<string, number> = { DEVELOPING: 3, TESTED: 2, DONE: 1 };
      return (statusWeight[b.status] || 0) - (statusWeight[a.status] || 0);
    });

  return (
    <div className="space-y-4">
      {/* Top Header with Switcher and Repo Filter (상하 열거 레이아웃) */}
      <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3 shadow-xs">
        <div>
          <h3 className="text-xs font-bold text-[#E6EDF3] flex items-center gap-1.5">
            <GitBranch className="w-3.5 h-3.5 text-blue-400" />
            2계층 듀얼 작업그래프(DAG) & 원격 레포 분리 거버넌스
          </h3>
          <p className="text-[11px] text-[#7D8590] mt-0.5">
            AI 개발 플랫폼 인프라 활성 DAG 및 타겟 서비스(PDF 뷰어) 분리 이관 대기 체계
          </p>
        </div>

        <div className="pt-2 border-t border-[#30363D]/70 flex items-center justify-between gap-2 flex-wrap">
          {/* Repository Scope Selector */}
          <div className="flex items-center bg-[#0D1117] p-0.5 rounded-lg border border-[#30363D]">
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-2 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                activeTab === 'ALL'
                  ? 'bg-slate-700/60 text-[#E6EDF3] shadow-sm font-bold'
                  : 'text-[#7D8590] hover:text-[#E6EDF3]'
              }`}
            >
              전체 ({tasks.length})
            </button>
            <button
              onClick={() => setActiveTab('PLATFORM')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                activeTab === 'PLATFORM'
                  ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 shadow-sm font-bold'
                  : 'text-[#7D8590] hover:text-[#E6EDF3]'
              }`}
            >
              <Cpu className="w-3 h-3 text-indigo-400" /> 플랫폼 활성 DAG ({platformTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('ON_HOLD')}
              className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-all cursor-pointer ${
                activeTab === 'ON_HOLD'
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 shadow-sm font-bold'
                  : 'text-[#7D8590] hover:text-[#E6EDF3]'
              }`}
            >
              <Archive className="w-3 h-3 text-amber-400" /> 타겟 보류 목록 ({onHoldTasks.length})
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#0D1117] p-0.5 rounded-lg border border-[#30363D]">
            <button
              onClick={() => setViewMode('BRANCH')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                viewMode === 'BRANCH'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-[#7D8590] hover:text-[#E6EDF3]'
              }`}
            >
              <GitCommit className="w-3 h-3" /> 파생 브랜치 뷰
            </button>
            <button
              onClick={() => setViewMode('GRID')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-all cursor-pointer ${
                viewMode === 'GRID'
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm'
                  : 'text-[#7D8590] hover:text-[#E6EDF3]'
              }`}
            >
              <LayoutGrid className="w-3 h-3" /> 전체 그리드
            </button>
          </div>
        </div>
      </div>

      {/* Target Repository Migration Info Banner */}
      {(activeTab === 'ON_HOLD' || activeTab === 'ALL') && onHoldTasks.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5 flex items-start gap-2 text-xs">
          <Archive className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-amber-300">타겟 서비스(PDF 뷰어) 기능 분리 보류 안내: </span>
            <span className="text-[#C9D1D9] text-[11px]">
              PDF 관련 기능은 타겟 서비스 전용 원격 레포(<code className="text-amber-400 font-mono">pdfowers-service</code>) 개설 시 이관 예정이며, 현재 AI 개발 플랫폼(<code className="text-indigo-400 font-mono">jkadh-typep</code>)에서는 동결·보류 상태로 관리됩니다. (/docs/pending_target_service_migration/ 참조)
            </span>
          </div>
        </div>
      )}

      {viewMode === 'BRANCH' ? (
        <div className="space-y-4">
          {/* ========================================================================= */}
          {/* 1. 미진행된 작업영역 (Pending & Derived Backlog Graph) - 상단 배치          */}
          {/* ========================================================================= */}
          <div className="bg-[#0D1117] border border-amber-500/30 rounded-xl p-4 space-y-3 relative overflow-hidden">
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />

            {/* Header of Unstarted Section */}
            <div className="flex items-center justify-between pb-2.5 border-b border-amber-500/20 text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <GitPullRequest className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h4 className="font-bold text-[#E6EDF3] flex items-center gap-1.5">
                    미진행 작업 및 파생 백로그 그래프 (Pending & Derived Backlog)
                  </h4>
                  <span className="text-[10px] text-[#7D8590]">
                    선행 작업 진행 중 도출된 파생 요구사항 및 추가 시점/관계 추적
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  대기 {pendingTasks.length}건
                </span>
              </div>
            </div>

            {/* Pending Tasks List with Derivation Relationship */}
            <div className="grid grid-cols-1 gap-2.5">
              {pendingTasks.map((task) => {
                const isSelected = task.id === selectedTaskId;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1C2128] border-amber-500 shadow-md ring-1 ring-amber-500/40'
                        : 'bg-[#161B22]/90 border-[#30363D] hover:bg-[#21262D] hover:border-amber-500/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Task Code + Git Branch + Derived Badge */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                            {getModuleIcon(task.module)}
                            {task.code}
                          </span>

                          {/* Derivation Source Relationship */}
                          {task.derivedFromTaskCode && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                              <ArrowDownRight className="w-3 h-3 text-purple-400" />
                              파생 원천: <strong className="font-mono font-bold text-purple-200">{task.derivedFromTaskCode}</strong>
                            </span>
                          )}

                          {/* Target Milestone */}
                          {task.targetMilestone && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-[#7D8590] bg-[#0D1117] px-1.5 py-0.5 rounded border border-[#30363D]">
                              <Milestone className="w-2.5 h-2.5 text-blue-400" />
                              {task.targetMilestone}
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h5 className="text-xs font-semibold text-[#E6EDF3] group-hover:text-amber-300 transition-colors">
                          {task.title}
                        </h5>
                        <p className="text-[11px] text-[#7D8590] mt-0.5 line-clamp-1 leading-relaxed">
                          {task.description}
                        </p>

                        {/* Added Timestamp & Context Details */}
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-1.5 text-[10px] bg-[#0D1117]/70 p-2 rounded border border-[#21262D]">
                          <div className="flex items-center gap-1.5 text-[#7D8590]">
                            <Calendar className="w-3 h-3 text-amber-400/80 shrink-0" />
                            <span className="truncate">
                              <strong className="text-[#C9D1D9]">추가시점:</strong> {task.addedAt || '프로젝트 킥오프 시점'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[#7D8590]">
                            <Sparkles className="w-3 h-3 text-purple-400/80 shrink-0" />
                            <span className="truncate">
                              <strong className="text-[#C9D1D9]">추가사유:</strong> {task.addedReason || '후속 기능 확장 요구'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Status & Action hint */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {getStatusBadge(task.status)}
                        <span className="text-[10px] font-mono text-[#7D8590]">
                          선행: <strong className="text-[#C9D1D9]">{task.dependencies.join(', ') || 'None'}</strong>
                        </span>
                        <span className="text-[9px] text-amber-400/80 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-mono">
                          선행 완료 시 자동 승급
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. 진행 및 완료 작업 이력 그래프 (Bottom-Up Work History DAG) - 하단 배치     */}
          {/* ========================================================================= */}
          <div className="bg-[#0D1117] border border-[#30363D] rounded-xl p-4 space-y-3">
            {/* Header of History Section */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[#21262D] text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <TrendingUp className="w-3.5 h-3.5" />
                </span>
                <div>
                  <h4 className="font-bold text-[#E6EDF3] flex items-center gap-1.5">
                    진행 및 완료 작업 이력 그래프 (Active & Completed History DAG)
                  </h4>
                  <span className="text-[10px] text-[#7D8590]">
                    하단 기반 작업(Foundation)에서 상단 최신 진행 작업으로 상향 누적(Bottom-Up)
                  </span>
                </div>
              </div>
              <span className="flex items-center gap-1 font-mono text-[10px] text-blue-400">
                <ArrowUp className="w-3 h-3" /> 상향 누적 브랜치
              </span>
            </div>

            {/* Timeline Branch Stack */}
            <div className="relative pl-6 space-y-3 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-t before:from-emerald-500 before:via-blue-500 before:to-indigo-500">
              {historyTasks.map((task) => {
                const isSelected = task.id === selectedTaskId;
                const isRoot = task.dependencies.length === 0;

                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task.id)}
                    className={`group relative p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1C2128] border-blue-500 shadow-md ring-1 ring-blue-500/40'
                        : 'bg-[#161B22] border-[#30363D] hover:bg-[#21262D] hover:border-[#484F58]'
                    }`}
                  >
                    {/* Branch Node Bullet Indicator on timeline */}
                    <div
                      className={`absolute -left-[1.85rem] top-4 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-blue-500 border-[#0D1117] ring-2 ring-blue-400 shadow-sm'
                          : task.status === 'DONE'
                          ? 'bg-emerald-500 border-[#0D1117]'
                          : task.status === 'DEVELOPING'
                          ? 'bg-indigo-400 border-[#0D1117] animate-pulse'
                          : 'bg-cyan-400 border-[#0D1117]'
                      }`}
                    >
                      <div className="w-1 h-1 rounded-full bg-[#0D1117]" />
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {/* Task Code + Git Branch name */}
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-xs font-bold text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                            {getModuleIcon(task.module)}
                            {task.code}
                          </span>
                          <span className="font-mono text-[11px] text-[#7D8590] flex items-center gap-1">
                            <GitBranch className="w-3 h-3 text-[#58A6FF]" />
                            {task.gitBranch || `feature/${task.code.toLowerCase()}`}
                          </span>
                          {isRoot && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              초기 기반작업 (Foundation Base)
                            </span>
                          )}
                        </div>

                        {/* Title & Description */}
                        <h5 className="text-xs font-semibold text-[#E6EDF3] group-hover:text-blue-300 transition-colors">
                          {task.title}
                        </h5>
                        <p className="text-[11px] text-[#7D8590] mt-0.5 line-clamp-1 leading-relaxed">
                          {task.description}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {getStatusBadge(task.status)}
                        <span className="text-[10px] font-mono text-[#7D8590]">
                          Phase <strong className="text-[#E6EDF3]">{task.currentPhase}/7</strong> ({task.specValidationScore}점)
                        </span>
                      </div>
                    </div>

                    {/* Node Bottom Bar: Dependencies, Added info & Token estimates */}
                    <div className="mt-2.5 pt-2 border-t border-[#21262D] flex items-center justify-between text-[10px] text-[#7D8590]">
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {task.dependencies.length > 0
                            ? `선행의존: ${task.dependencies.join(', ')}`
                            : '선행의존 없음 (Root Node)'}
                        </span>
                        {task.addedAt && (
                          <>
                            <span className="text-[#30363D]">•</span>
                            <span className="text-[#7D8590] truncate max-w-[200px]">{task.addedAt}</span>
                          </>
                        )}
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span>예상: ~{(task.estimatedTokens / 1000).toFixed(0)}k Tokens</span>
                        <span className="text-[#30363D]">|</span>
                        <span className="text-emerald-400">검증완료</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Foundation Indicator */}
            <div className="flex items-center justify-between pt-2 border-t border-[#21262D] text-[11px]">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                ▼ [하단: 프로젝트 초기 기반작업 (Foundation Base)]
              </span>
              <span className="text-[#7D8590] text-[10px]">
                단일 개발 DB (<code className="text-emerald-400">jkadhp_dev</code>) 상태 1:1 영속화
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Classic Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {tasks.map((task) => {
            const isSelected = task.id === selectedTaskId;
            const isPending = task.status === 'PLANNED' || task.status === 'ANALYSIS' || task.status === 'BACKLOG';

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`p-3.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? isPending
                      ? 'bg-[#1C2128] border-amber-500 shadow-sm ring-1 ring-amber-500/40'
                      : 'bg-[#21262D] border-blue-500 shadow-sm ring-1 ring-blue-500/40'
                    : 'bg-[#161B22] border-[#30363D] hover:bg-[#21262D]/60 hover:border-[#484F58]'
                }`}
              >
                {/* Top Row: Code & Status */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="p-1 rounded bg-[#0D1117] border border-[#30363D]">
                      {getModuleIcon(task.module)}
                    </div>
                    <span className="font-mono text-xs font-bold text-blue-300">{task.code}</span>
                  </div>
                  {getStatusBadge(task.status)}
                </div>

                {/* Title & Description */}
                <h5 className="font-semibold text-xs text-[#E6EDF3] line-clamp-1 mb-1">{task.title}</h5>
                <p className="text-[11px] text-[#7D8590] line-clamp-2 leading-relaxed mb-2.5">{task.description}</p>

                {/* Derivation or Added info */}
                {task.derivedFromTaskCode && (
                  <div className="mb-2 text-[10px] text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20 font-mono">
                    파생원천: {task.derivedFromTaskCode}
                  </div>
                )}

                {/* Phase Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#7D8590]">
                      단계: <strong className="text-[#E6EDF3]">Phase {task.currentPhase}/7</strong>
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">{task.specValidationScore}점</span>
                  </div>
                  <div className="w-full h-1 bg-[#0D1117] rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isPending
                          ? 'bg-gradient-to-r from-amber-500 to-purple-400'
                          : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                      }`}
                      style={{ width: `${(task.currentPhase / 7) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-2.5 pt-2 border-t border-[#30363D] flex items-center justify-between text-[10px] text-[#7D8590] font-mono">
                  <span className="truncate max-w-[140px]">
                    {task.dependencies.length > 0
                      ? `의존: ${task.dependencies.join(', ')}`
                      : '루트 모듈 (Root)'}
                  </span>
                  <span>~{(task.estimatedTokens / 1000).toFixed(0)}k Tokens</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
