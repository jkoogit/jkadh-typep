import React, { useState } from 'react';
import {
  Activity,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Zap,
  Terminal,
  Shield,
  Coins,
  AlertTriangle,
  GitBranch,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { HarnessSessionRecord, TaskGraphNode, ExecutionMetric, UserAccount } from '../types';

interface MainDashboardViewProps {
  activeSession: HarnessSessionRecord;
  tasks: TaskGraphNode[];
  metrics: ExecutionMetric[];
  currentUser: UserAccount;
  onNavigateToServiceDev: () => void;
  onNavigateToAdminConfig: () => void;
  onSelectTask: (taskId: string) => void;
}

export const MainDashboardView: React.FC<MainDashboardViewProps> = ({
  activeSession,
  tasks,
  metrics,
  currentUser,
  onNavigateToServiceDev,
  onNavigateToAdminConfig,
  onSelectTask
}) => {
  const completedTasks = tasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS' || t.status === 'DEVELOPING').length;
  const plannedTasks = tasks.filter(t => t.status === 'PLANNED' || t.status === 'BACKLOG').length;

  const totalTokens = metrics.reduce((sum, m) => sum + m.tokens, 0);
  const totalCost = metrics.reduce((sum, m) => sum + m.costUSD, 0);
  const avgLatency = metrics.length ? Math.round(metrics.reduce((sum, m) => sum + m.latencyMs, 0) / metrics.length) : 840;

  return (
    <div className="space-y-6 pb-12">
      
      {/* 1. 상단 환영 및 실시간 세션 현황 카드 (상하 열거 레이아웃) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs relative overflow-hidden space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
              활성 세션 #0006
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              {activeSession.session_code || 'SES-20260820-UI-REVAMP-10'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {currentUser.name} 님, 환영합니다
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl">
            현재 목표: <strong className="text-slate-800 dark:text-slate-200">{activeSession.session_goal}</strong>
          </p>
        </div>

        {/* 기능 바로가기 버튼 영역 (하단 배치) */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2.5">
          <button
            id="btn-dash-go-service-dev"
            type="button"
            onClick={onNavigateToServiceDev}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-medium text-xs shadow-xs transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>서비스 개발 샌드박스</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            id="btn-dash-go-admin-config"
            type="button"
            onClick={onNavigateToAdminConfig}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium text-xs border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
          >
            <Shield className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>개발기능 관리 콘솔</span>
          </button>
        </div>

        {/* 6대 하네스 라이프사이클 진행 바 */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              6대 하네스 거버넌스 단계: <span className="text-blue-600 dark:text-blue-400">#3. #태스크처리 (Task Execution)</span>
            </span>
            <span className="font-mono text-slate-500 dark:text-slate-400">50% 완료 (3 / 6)</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-300 w-1/2" />
          </div>
          <div className="grid grid-cols-6 gap-1 mt-2 text-[10px] text-center font-medium text-slate-500 dark:text-slate-400">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">1. 세션시작 ✓</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">2. 태스크시작 ✓</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">3. 태스크처리 (진행)</span>
            <span>4. 태스크정리</span>
            <span>5. 태스크승급</span>
            <span>6. 세션정리</span>
          </div>
        </div>
      </div>

      {/* 2. 핵심 KPI 메트릭 카드 4종 (M3 Stat Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>완료 작업 현황</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {completedTasks} / {tasks.length}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              {Math.round((completedTasks / (tasks.length || 1)) * 100)}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            진행중 {inProgressTasks}건, 대기 {plannedTasks}건
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>총 소모 토큰 (24h)</span>
            <Coins className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {(totalTokens / 1000).toFixed(0)}k
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              tokens
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            토큰 쿼터 서킷브레이커: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">정상 (CLOSED)</span>
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>평균 추론 지연시간</span>
            <Zap className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              {avgLatency}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ms
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            최적 가속: Gemini 3.7 Flash (420ms)
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs mb-2">
            <span>DB 물리 정합성</span>
            <Shield className="w-4 h-4 text-purple-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-mono">
              v2.2.0
            </span>
            <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
              Synced
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            6대 감사 컬럼 + Flyway 마이그레이션 적용
          </p>
        </div>
      </div>

      {/* 3. WBS 2계층 작업 노드 현황 & 빠른 이동 */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              핵심 작업 노드(DAG) 진행 상태
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              클릭하여 해당 작업의 7-Phase Vibe 루프 및 세부 명세를 확인합니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToAdminConfig}
            className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
          >
            <span>전체 DAG 그래프 보기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tasks.slice(0, 6).map((task) => {
            const isDone = task.status === 'DONE';
            const isProgress = task.status === 'IN_PROGRESS' || task.status === 'DEVELOPING';

            return (
              <div
                key={task.id}
                onClick={() => onSelectTask(task.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer hover:shadow-xs ${
                  isProgress
                    ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                    : isDone
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {task.code}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      isDone
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : isProgress
                        ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 line-clamp-2 font-medium">
                  {task.title}
                </p>
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Phase {task.currentPhase}/7</span>
                  <span className="font-mono text-[10px]">{task.complexity} Complexity</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
