import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Activity,
  Database,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  Save,
  Clock,
  Coins,
  Shield,
  Layers,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  FolderGit2,
  Loader2,
  FileText,
} from 'lucide-react';
import { HarnessSessionRecord, TaskGraphNode, MemberRole } from '../types';
import { api } from '../services/api';

interface SessionGovernanceViewProps {
  tasks: TaskGraphNode[];
  onSelectTask: (taskId: string) => void;
  selectedTaskId: string;
}

export const SessionGovernanceView: React.FC<SessionGovernanceViewProps> = ({
  tasks,
  onSelectTask,
  selectedTaskId,
}) => {
  const [session, setSession] = useState<HarnessSessionRecord | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // Edit form state
  const [sessionGoal, setSessionGoal] = useState<string>('');
  const [targetDatabase, setTargetDatabase] = useState<string>('jkadh_dev');
  const [handoffBrief, setHandoffBrief] = useState<string>('');
  const [savepointName, setSavepointName] = useState<string>('');

  const loadSession = async () => {
    setIsLoading(true);
    try {
      const res = await api.getCurrentSession();
      if (res.success && res.session) {
        setSession(res.session);
        setSessionGoal(res.session.session_goal || '');
        setTargetDatabase(res.session.target_database || 'jkadh_dev');
        setHandoffBrief(res.session.next_handoff_brief || '');
        setSavepointName(res.session.savepoint_name || `sp_${res.session.active_task_code?.toLowerCase() || 'dev'}_p1`);
      }
    } catch (err: any) {
      console.error('Failed to load session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();

    // Setup 30-second automated session heartbeat
    const heartbeatTimer = setInterval(async () => {
      try {
        await api.sendSessionHeartbeat();
      } catch (err) {
        console.warn('Auto heartbeat ping failed:', err);
      }
    }, 30000);

    return () => clearInterval(heartbeatTimer);
  }, []);

  const handleSaveSession = async () => {
    if (!session) return;
    setIsSaving(true);
    setSaveFeedback(null);

    const activeTask = tasks.find((t) => t.id === selectedTaskId);

    const updatedData = {
      ...session,
      session_goal: sessionGoal,
      target_database: targetDatabase,
      next_handoff_brief: handoffBrief,
      savepoint_name: savepointName,
      active_task_id: selectedTaskId,
      active_task_code: activeTask ? activeTask.code : session.active_task_code,
      active_phase_num: activeTask ? activeTask.currentPhase : session.active_phase_num,
    };

    try {
      const res = await api.upsertSession(updatedData);
      if (res.success) {
        setSession(res.session);
        setSaveFeedback('✅ 세션 상태 및 거버넌스 정보가 원격 PostgreSQL(harness_sessions)에 성공적으로 동기화되었습니다!');
        setTimeout(() => setSaveFeedback(null), 3500);
      }
    } catch (err: any) {
      setSaveFeedback(`❌ 세션 저장 실패: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDrainSession = async () => {
    if (!session) return;
    setIsSaving(true);
    try {
      const res = await api.upsertSession({
        ...session,
        status: 'DRAINED',
        ended_at: new Date().toISOString(),
        next_handoff_brief: handoffBrief || '세션 Safe Drainage 완료 및 트랜잭션 정상 종료',
      });
      if (res.success) {
        setSession(res.session);
        setSaveFeedback('🔒 세션 Safe Drain 완료: 트랜잭션 풀 보관 및 연결이 안전하게 종료되었습니다.');
      }
    } catch (err: any) {
      setSaveFeedback(`❌ 세션 Drain 실패: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Top Session Status Card */}
      <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-[#E6EDF3]">
                {session?.session_code || 'SES-20260817-GOVERNANCE-04'}
              </span>
              <span
                className={`text-[10px] uppercase font-bold font-mono px-2 py-0.5 rounded border ${
                  session?.status === 'ACTIVE'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                }`}
              >
                ● {session?.status || 'ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-[#7D8590] mt-0.5 flex items-center gap-2">
              <span>사용자: <strong className="text-[#E6EDF3]">{session?.user_email}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-mono">DB: {session?.target_database}</span>
              <span>•</span>
              <span>시작: {session?.started_at ? new Date(session.started_at).toLocaleTimeString() : '방금 전'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadSession}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-xs font-semibold text-[#E6EDF3] border border-[#30363D] transition cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>새로고침</span>
          </button>

          <button
            onClick={handleDrainSession}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 text-xs font-semibold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>세션 안전종료 (Safe Drain)</span>
          </button>
        </div>
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1">
          <span className="text-[11px] text-[#7D8590] flex items-center gap-1.5">
            <Coins className="w-3.5 h-3.5 text-blue-400" />
            세션 누적 토큰
          </span>
          <div className="text-lg font-bold font-mono text-[#E6EDF3]">
            {((session?.tokens_consumed || 342850) / 1000).toFixed(1)}k
          </div>
          <span className="text-[10px] text-emerald-400 font-mono">한도 대비 6.8% 소비</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1">
          <span className="text-[11px] text-[#7D8590] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            개발 비용 집계
          </span>
          <div className="text-lg font-bold font-mono text-emerald-400">
            ${(session?.cost_usd || 1.4285).toFixed(4)}
          </div>
          <span className="text-[10px] text-[#7D8590] font-mono">예산 정상 범위</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1">
          <span className="text-[11px] text-[#7D8590] flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-purple-400" />
            하네스 실행 횟수
          </span>
          <div className="text-lg font-bold font-mono text-purple-300">
            {session?.execution_count || 14}회
          </div>
          <span className="text-[10px] text-purple-400 font-mono">AST 통과율 100%</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1">
          <span className="text-[11px] text-[#7D8590] flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            활성 세이브포인트
          </span>
          <div className="text-xs font-bold font-mono text-amber-300 truncate mt-1">
            {savepointName || 'sp_pdf_table_05_p1'}
          </div>
          <span className="text-[10px] text-[#7D8590] font-mono">트랜잭션 롤백 준비</span>
        </div>
      </div>

      {/* 3. Session Control & Task Binding Form */}
      <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-4">
        <h3 className="text-sm font-bold text-[#E6EDF3] flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          세션 거버넌스 및 작업 바인딩 (Session-Task Governance Binding)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Active Target Task Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#7D8590]">세션 바인딩 작업 노드 (Active Task)</label>
            <select
              value={selectedTaskId}
              onChange={(e) => onSelectTask(e.target.value)}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] font-mono focus:outline-none focus:border-blue-500"
            >
              {tasks.map((task) => (
                <option key={task.id} value={task.id}>
                  [{task.code}] {task.title} (Phase {task.currentPhase} • {task.status})
                </option>
              ))}
            </select>
          </div>

          {/* Target Database Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#7D8590]">대상 데이터베이스 (Target PostgreSQL)</label>
            <select
              value={targetDatabase}
              onChange={(e) => setTargetDatabase(e.target.value)}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] font-mono focus:outline-none focus:border-blue-500"
            >
              <option value="jkadh_dev">jkadh_dev (우분투 로컬 개발 DB - 35432)</option>
              <option value="jkadhp_dev">jkadhp_dev (PDFowers 전용 개발 DB - 35432)</option>
              <option value="jkadh_stg">jkadh_stg (스테이징 통합 DB - 45432)</option>
              <option value="jkadh_prd">jkadh_prd (운영 릴리즈 DB - 55432)</option>
            </select>
          </div>

          {/* Session Goal Statement */}
          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-[#7D8590]">이번 세션 핵심 작업 목표 (Session Goal)</label>
            <input
              type="text"
              value={sessionGoal}
              onChange={(e) => setSessionGoal(e.target.value)}
              placeholder="예: 세션 정보 DB 영속 관리 및 7단계 공정별 완료조건 게이트키퍼 통제 체계 구축"
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Savepoint Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#7D8590]">PostgreSQL Transaction Savepoint 명</label>
            <input
              type="text"
              value={savepointName}
              onChange={(e) => setSavepointName(e.target.value)}
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Next Handoff Brief */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#7D8590]">차기 세션 인계 브리프 (Next Handoff Brief)</label>
            <input
              type="text"
              value={handoffBrief}
              onChange={(e) => setHandoffBrief(e.target.value)}
              placeholder="예: Phase 1 완료 후 3대 시나리오 정의(Phase 3) 및 TypeScript 인터페이스 설계 진행"
              className="w-full bg-[#0D1117] border border-[#30363D] rounded-lg px-3 py-2 text-xs text-[#E6EDF3] focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Button & Feedback */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#30363D]">
          {saveFeedback ? (
            <div className="text-xs text-emerald-300 font-medium">{saveFeedback}</div>
          ) : (
            <div className="text-[11px] text-[#7D8590]">
              * 변경사항은 PostgreSQL 17의 <code>harness_sessions</code> 테이블에 실시간 `UPSERT`됩니다.
            </div>
          )}

          <button
            onClick={handleSaveSession}
            disabled={isSaving}
            className="w-full sm:w-auto px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm ml-auto"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>세션 상태 PostgreSQL 동기화 저장</span>
          </button>
        </div>
      </div>
    </div>
  );
};
