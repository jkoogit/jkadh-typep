import React, { useState } from 'react';
import {
  Users,
  Key,
  Shield,
  Zap,
  RotateCcw,
  Edit2,
  Check,
  X,
  Plus,
  Lock,
  Camera,
  Upload,
  Image as ImageIcon,
  Database,
  Sliders,
  RefreshCw,
  FileJson,
  CheckSquare,
  Square,
  Info,
  ExternalLink,
  Layers,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  FolderGit2,
  Palette,
  UserCheck,
  User,
  Mail,
  Building,
  Clock,
  Sparkles
} from 'lucide-react';
import { AIAccount, MemberRole, ModelMeta, ProjectScope, TeamMember, UserAccount } from '../types';
import { INITIAL_PROJECT_SCOPES } from '../data/initialData';

interface TeamAccountManagerViewProps {
  currentUser?: UserAccount | null;
  accounts: AIAccount[];
  members: TeamMember[];
  models?: ModelMeta[];
  projects?: ProjectScope[];
  onResetAccountTokens: (id: string) => Promise<void>;
  onUpdateMemberRole?: (id: string, role: MemberRole) => Promise<void>;
  onUpdateMemberRoles?: (id: string, roles: MemberRole[]) => Promise<void>;
  onUpdateMemberProjectRoles?: (memberId: string, projectId: string, roles: MemberRole[]) => Promise<void>;
  onUpdateMemberLimit: (id: string, limit: number, isAutoSynced?: boolean) => Promise<void>;
  onUpdateMemberAvatar?: (id: string, avatar: string) => Promise<void>;
  onUpdateMemberAllowedModels?: (id: string, models: string[]) => Promise<void>;
  onUpdateModelColor?: (modelId: string, color: string) => Promise<void>;
  onRefreshDb?: () => Promise<void>;
}

const ALL_ROLES: { role: MemberRole; label: string; desc: string; color: string; badgeCls: string }[] = [
  {
    role: 'SUPER_ADMIN',
    label: '슈퍼관리자',
    desc: '시스템 전권, API Vault 키 및 DB 전역 제어',
    color: 'purple',
    badgeCls: 'bg-purple-500/15 text-purple-300 border-purple-500/40 hover:bg-purple-500/25'
  },
  {
    role: 'ADMIN',
    label: '운영관리자',
    desc: '세션 관리 및 WBS 태스크 승급/배포 승인',
    color: 'rose',
    badgeCls: 'bg-rose-500/15 text-rose-300 border-rose-500/40 hover:bg-rose-500/25'
  },
  {
    role: 'ARCHITECT',
    label: '아키텍트',
    desc: '7-Phase 라이프사이클 설계 및 모델 라우팅',
    color: 'blue',
    badgeCls: 'bg-blue-500/15 text-blue-300 border-blue-500/40 hover:bg-blue-500/25'
  },
  {
    role: 'ENGINEER',
    label: '엔지니어',
    desc: 'Vibe 코딩 실행, 단위/통합 테스트 개발',
    color: 'emerald',
    badgeCls: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/25'
  },
  {
    role: 'REVIEWER',
    label: 'QA 리뷰어',
    desc: 'JSON 명세 스키마 검증 및 코드리뷰',
    color: 'amber',
    badgeCls: 'bg-amber-500/15 text-amber-300 border-amber-500/40 hover:bg-amber-500/25'
  },
  {
    role: 'AUDITOR',
    label: '보안감사관',
    desc: '감사로그 열람, 취약점 점검, 거버넌스 감사',
    color: 'cyan',
    badgeCls: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/25'
  }
];

// Color palette options for model distinction
const COLOR_PRESETS = [
  { id: 'amber', label: 'Amber (황금/앰버)', hex: '#f59e0b', bgClass: 'bg-amber-500/15 text-amber-300 border-amber-500/40' },
  { id: 'emerald', label: 'Emerald (에메랄드/그린)', hex: '#10b981', bgClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40' },
  { id: 'sky', label: 'Sky (스카이/블루)', hex: '#0284c7', bgClass: 'bg-sky-500/15 text-sky-300 border-sky-500/40' },
  { id: 'purple', label: 'Violet (바이올렛/퍼플)', hex: '#8b5cf6', bgClass: 'bg-purple-500/15 text-purple-300 border-purple-500/40' },
  { id: 'rose', label: 'Rose (로즈/레드)', hex: '#f43f5e', bgClass: 'bg-rose-500/15 text-rose-300 border-rose-500/40' },
  { id: 'indigo', label: 'Indigo (인디고)', hex: '#6366f1', bgClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/40' },
  { id: 'teal', label: 'Teal (청록/틸)', hex: '#14b8a6', bgClass: 'bg-teal-500/15 text-teal-300 border-teal-500/40' },
  { id: 'orange', label: 'Orange (오렌지)', hex: '#ea580c', bgClass: 'bg-orange-500/15 text-orange-300 border-orange-500/40' },
  { id: 'slate', label: 'Slate (슬레이트/모노)', hex: '#64748b', bgClass: 'bg-slate-500/15 text-slate-300 border-slate-500/40' },
];

export const TeamAccountManagerView: React.FC<TeamAccountManagerViewProps> = ({
  currentUser,
  accounts,
  members,
  models,
  projects = INITIAL_PROJECT_SCOPES,
  onResetAccountTokens,
  onUpdateMemberRole,
  onUpdateMemberRoles,
  onUpdateMemberProjectRoles,
  onUpdateMemberLimit,
  onUpdateMemberAvatar,
  onUpdateMemberAllowedModels,
  onUpdateModelColor,
  onRefreshDb,
}) => {
  // Check admin privilege for role editing
  const isAdmin = Boolean(
    currentUser?.isSuperAdmin ||
    currentUser?.role === 'SUPER_ADMIN' ||
    currentUser?.role === 'ADMIN'
  );

  // Target Project Scope Filter (Global vs Specific Project)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj-all');

  // Editing states for token quota
  const [editingLimitMemberId, setEditingLimitMemberId] = useState<string | null>(null);
  const [editLimitVal, setEditLimitVal] = useState<number>(1000000);
  const [isAutoSyncSetting, setIsAutoSyncSetting] = useState<boolean>(false);

  // Role Multi-Select Modal State (Project-Dependent)
  const [roleSelectMember, setRoleSelectMember] = useState<TeamMember | null>(null);
  const [roleModalTargetProjectId, setRoleModalTargetProjectId] = useState<string>('proj-all');
  const [projectRolesBuffer, setProjectRolesBuffer] = useState<Record<string, MemberRole[]>>({});
  const [applyToAllProjects, setApplyToAllProjects] = useState<boolean>(false);

  // Model Whitelist Modal State
  const [modelSelectMember, setModelSelectMember] = useState<TeamMember | null>(null);
  const [selectedModelsBuffer, setSelectedModelsBuffer] = useState<string[]>([]);

  // DB Query Result Viewer Modal
  const [showDbRawModal, setShowDbRawModal] = useState<boolean>(false);
  const [isDbRefreshing, setIsDbRefreshing] = useState<boolean>(false);
  const [lastFetchedAt, setLastFetchedAt] = useState<string>(new Date().toLocaleTimeString());

  // User Detail Info Popover Modal State
  const [detailModalMember, setDetailModalMember] = useState<TeamMember | null>(null);

  // Model Registry & Mapping Criteria Modal
  const [showModelMappingModal, setShowModelMappingModal] = useState<boolean>(false);

  // Get effective roles for a member in a specific project scope
  const getMemberRolesForProject = (mem: TeamMember, projId: string): MemberRole[] => {
    if (mem.projectRoles && mem.projectRoles[projId] && mem.projectRoles[projId].length > 0) {
      return mem.projectRoles[projId];
    }
    if (mem.roles && mem.roles.length > 0) return mem.roles;
    if (mem.role) return [mem.role];
    return ['ENGINEER'];
  };

  // Get effective global roles
  const getMemberRoles = (mem: TeamMember): MemberRole[] => {
    return getMemberRolesForProject(mem, 'proj-all');
  };

  // Helper for model info
  const getModelLabel = (modelId: string) => {
    const modelMeta = models?.find((m) => m.id === modelId);
    let label = modelMeta?.name || modelId;
    let colorHex = modelMeta?.badgeColor;

    if (modelId.includes('claude') || modelId.includes('anthropic')) {
      label = modelMeta?.name || 'Claude 3.7 Sonnet';
      if (!colorHex) colorHex = '#f59e0b';
    } else if (modelId.includes('gpt') || modelId.includes('openai')) {
      label = modelMeta?.name || 'GPT-4o Codex';
      if (!colorHex) colorHex = '#10b981';
    } else if (modelId.includes('gemini') || modelId.includes('google')) {
      label = modelMeta?.name || 'Gemini 3.7 Flash';
      if (!colorHex) colorHex = '#0284c7';
    } else if (modelId.includes('manus')) {
      label = modelMeta?.name || 'Manus Operator';
      if (!colorHex) colorHex = '#8b5cf6';
    }

    return { label, colorHex: colorHex || '#94a3b8' };
  };

  // Helper for rendering clean, color-coded AI model badge (NO icons, official distinction colors)
  const renderModelBadge = (modelId: string) => {
    const { label, colorHex } = getModelLabel(modelId);
    const matchedPreset = COLOR_PRESETS.find((p) => p.hex.toLowerCase() === colorHex.toLowerCase());
    const badgeClass = matchedPreset
      ? matchedPreset.bgClass
      : 'bg-slate-800/80 text-slate-200 border-slate-600';

    return (
      <span
        key={modelId}
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono border font-medium transition ${badgeClass}`}
        title={`AI 모델 식별자: ${modelId}`}
      >
        <span
          className="w-1.5 h-1.5 rounded-full inline-block"
          style={{ backgroundColor: colorHex }}
        />
        <span>{label}</span>
      </span>
    );
  };

  // Refresh DB handler
  const handleDbRefresh = async () => {
    setIsDbRefreshing(true);
    try {
      if (onRefreshDb) {
        await onRefreshDb();
      }
      setLastFetchedAt(new Date().toLocaleTimeString());
    } finally {
      setTimeout(() => setIsDbRefreshing(false), 400);
    }
  };

  // Auto-calculate recommended limit based on roles
  const calculateAutoQuota = (roles: MemberRole[]): number => {
    if (roles.includes('SUPER_ADMIN')) return 5000000;
    if (roles.includes('ARCHITECT')) return 3000000;
    if (roles.includes('ENGINEER')) return 1000000;
    if (roles.includes('REVIEWER')) return 800000;
    if (roles.includes('AUDITOR')) return 500000;
    return 1000000;
  };

  // Open role editor for a member with current project roles loaded
  const handleOpenRoleModal = (mem: TeamMember) => {
    setRoleSelectMember(mem);
    setRoleModalTargetProjectId(selectedProjectId);
    const initialMap: Record<string, MemberRole[]> = { ...(mem.projectRoles || {}) };
    projects.forEach((p) => {
      if (!initialMap[p.id]) {
        initialMap[p.id] = getMemberRolesForProject(mem, p.id);
      }
    });
    setProjectRolesBuffer(initialMap);
    setApplyToAllProjects(false);
  };

  // Save selected project-scoped roles
  const handleSaveRoles = async () => {
    if (!roleSelectMember) return;
    const updatedMap = { ...projectRolesBuffer };

    if (applyToAllProjects) {
      const currentRoles = projectRolesBuffer[roleModalTargetProjectId] || ['ENGINEER'];
      projects.forEach((p) => {
        updatedMap[p.id] = currentRoles;
      });
    }

    const currentProjectRoles = updatedMap[roleModalTargetProjectId] || ['ENGINEER'];

    if (onUpdateMemberProjectRoles) {
      for (const p of projects) {
        if (updatedMap[p.id]) {
          await onUpdateMemberProjectRoles(roleSelectMember.id, p.id, updatedMap[p.id]);
        }
      }
    } else if (onUpdateMemberRoles) {
      await onUpdateMemberRoles(roleSelectMember.id, currentProjectRoles);
    } else if (onUpdateMemberRole) {
      await onUpdateMemberRole(roleSelectMember.id, currentProjectRoles[0]);
    }

    setRoleSelectMember(null);
  };

  // Toggle role in buffer for active project in modal
  const handleToggleRoleInBuffer = (role: MemberRole) => {
    const currentList = projectRolesBuffer[roleModalTargetProjectId] || [];
    let nextList: MemberRole[];
    if (currentList.includes(role)) {
      nextList = currentList.filter((r) => r !== role);
      if (nextList.length === 0) nextList = ['ENGINEER']; // At least 1 role
    } else {
      nextList = [...currentList, role];
    }
    setProjectRolesBuffer((prev) => ({
      ...prev,
      [roleModalTargetProjectId]: nextList,
    }));
  };

  // Save selected models
  const handleSaveModels = async () => {
    if (!modelSelectMember) return;
    const finalModels = selectedModelsBuffer.length > 0 ? selectedModelsBuffer : ['gemini-3-7-flash'];
    if (onUpdateMemberAllowedModels) {
      await onUpdateMemberAllowedModels(modelSelectMember.id, finalModels);
    }
    setModelSelectMember(null);
  };

  return (
    <div className="space-y-4">
      {/* 0. DB 조회 결과 상태 및 실시간 거버넌스 바 */}
      <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Database className="w-3.5 h-3.5 animate-pulse" />
            <span>PostgreSQL (jkadhp_dev) 실시간 조회 완료</span>
          </div>
          <span className="text-[11px] text-[#7D8590] font-mono">
            team_members ({members.length}건 동기화) • ai_accounts ({accounts.length}건)
          </span>
          <span className="text-[10px] text-[#8B949E] px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D]">
            최근 동기화: {lastFetchedAt}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowModelMappingModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-indigo-300 text-xs font-medium border border-indigo-500/30 transition cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI 모델 관리 & 구분색 지정</span>
          </button>

          <button
            onClick={() => setShowDbRawModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] text-xs font-medium border border-[#30363D] transition cursor-pointer"
          >
            <FileJson className="w-3.5 h-3.5 text-blue-400" />
            <span>SQL 원본 결과 ({members.length}건)</span>
          </button>

          <button
            onClick={handleDbRefresh}
            disabled={isDbRefreshing}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs font-semibold border border-blue-500/40 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDbRefreshing ? 'animate-spin' : ''}`} />
            <span>{isDbRefreshing ? '조회 중...' : 'DB 새로고침'}</span>
          </button>
        </div>
      </div>

      {/* 1. AI Accounts & API Key Pool */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
        <div className="border-b border-[#30363D] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-xs text-[#E6EDF3] flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-blue-400" />
              팀 공용 AI 제공업체 계정 및 토큰 쿼터 관리
            </h3>
            <p className="text-[11px] text-[#7D8590] mt-0.5">
              OpenAI, Anthropic, Google, Manus 4대 프로바이더의 풀링 쿼터 및 실시간 소진율
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#7D8590] font-mono px-2 py-0.5 rounded bg-[#0D1117] border border-[#30363D]">
              ai_accounts table
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {accounts.map((acc) => {
            const usagePercent = Math.round((acc.usedTokens / acc.totalTokenQuota) * 100);
            return (
              <div
                key={acc.id}
                className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2.5 text-xs hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#E6EDF3] truncate" title={acc.accountName}>
                    {acc.accountName}
                  </span>
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                      acc.status === 'HEALTHY'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {acc.status}
                  </span>
                </div>

                <div className="space-y-1 font-mono text-[11px]">
                  <div className="flex justify-between text-[#8B949E]">
                    <span>토큰 사용량:</span>
                    <span className="text-[#E6EDF3] font-semibold">
                      {(acc.usedTokens / 1000).toFixed(0)}k / {(acc.totalTokenQuota / 1000).toFixed(0)}k
                    </span>
                  </div>
                  <div className="w-full bg-[#161B22] rounded-full h-1.5 overflow-hidden border border-[#30363D]">
                    <div
                      className={`h-full rounded-full transition-all ${
                        usagePercent > 80 ? 'bg-rose-500' : usagePercent > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, usagePercent)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-[#7D8590]">
                    <span>소진율: {usagePercent}%</span>
                    <span>잔여: {((acc.totalTokenQuota - acc.usedTokens) / 1000).toFixed(0)}k</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[#30363D]">
                  <span className="text-[10px] text-[#7D8590] font-mono">{acc.apiKeyMasked}</span>
                  <button
                    onClick={() => onResetAccountTokens(acc.id)}
                    className="flex items-center gap-1 text-[10px] text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>초기화</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Team Members RBAC Matrix & Target Project-Scoped Governance */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3.5">
        <div className="border-b border-[#30363D] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-xs text-[#E6EDF3] flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-emerald-400" />
              팀 멤버 RBAC 다중 역할 및 프로젝트별 권한/토큰 쿼터 관리
            </h3>
            <p className="text-[11px] text-[#7D8590] mt-0.5">
              이름 클릭 시 사용자 부가정보 팝업 • 관리자 전용 롤 편집 • 타겟 프로젝트 종속 RBAC • 공식 색상 라벨 AI 모델
            </p>
          </div>

          {/* Target Project Scope Selector as a Compact Dropdown */}
          <div className="flex items-center gap-2 bg-[#0D1117] px-2.5 py-1.5 rounded-lg border border-[#30363D]">
            <label htmlFor="target-project-select" className="text-[11px] text-[#7D8590] flex items-center gap-1.5 font-medium shrink-0">
              <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
              <span>타겟 프로젝트:</span>
            </label>
            <select
              id="target-project-select"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-[#161B22] text-[#E6EDF3] text-xs font-semibold px-2.5 py-1 rounded border border-[#30363D] hover:border-blue-500 focus:border-blue-500 transition cursor-pointer outline-hidden"
              title="타겟 프로젝트 선택"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id} className="bg-[#161B22] text-[#E6EDF3]">
                  {proj.name} ({proj.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selected Project Scope Banner */}
        <div className="px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between text-xs text-[#8B949E]">
          <div className="flex items-center gap-2">
            <span className="text-blue-400 font-semibold">
              🎯 현재 조회/적용 권한 프로젝트:
            </span>
            <span className="text-[#E6EDF3] font-bold">
              {projects.find((p) => p.id === selectedProjectId)?.name || '전체 (글로벌 기본)'}
            </span>
            <span className="text-[11px] text-[#7D8590]">
              ({projects.find((p) => p.id === selectedProjectId)?.description})
            </span>
          </div>
          <div className="text-[11px] text-[#7D8590] flex items-center gap-2">
            {isAdmin ? (
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <UserCheck className="w-3 h-3" /> 관리자 권한 활성 (롤 편집 가능)
              </span>
            ) : (
              <span className="text-amber-400 flex items-center gap-1">
                <Lock className="w-3 h-3" /> 롤 편집 권한 제한 (일반 사용자)
              </span>
            )}
          </div>
        </div>

        {/* Members Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117] text-[#7D8590] font-semibold text-[11px]">
                <th className="py-2.5 px-3">팀원 (이름 / 소속)</th>
                <th className="py-2.5 px-3">
                  역할 ({projects.find((p) => p.id === selectedProjectId)?.code || 'GLOBAL'} 기준)
                </th>
                <th className="py-2.5 px-3">허용 AI 모델 (구분색 라벨)</th>
                <th className="py-2.5 px-3">일일 토큰 한도 (자동/수동)</th>
                <th className="py-2.5 px-3">금일 사용량</th>
                <th className="py-2.5 px-3 text-right">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D] text-[#8B949E]">
              {members.map((mem) => {
                const isEditingLimit = editingLimitMemberId === mem.id;
                const projectScopedRoles = getMemberRolesForProject(mem, selectedProjectId);

                return (
                  <tr key={mem.id} className="hover:bg-[#21262D]/40 transition">
                    {/* 1. Name & Department (Click to open detailed popup layer) */}
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setDetailModalMember(mem)}
                        className="text-left group flex flex-col gap-0.5 hover:opacity-90 transition cursor-pointer"
                        title={`${mem.name} 사용자 부가정보 및 권한 상세 보기 (클릭)`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-[#E6EDF3] group-hover:text-blue-400 underline-offset-2 group-hover:underline">
                            {mem.name}
                          </span>
                          <Info className="w-3 h-3 text-[#7D8590] group-hover:text-blue-400 opacity-60 group-hover:opacity-100 transition" />
                        </div>
                        <div className="text-[10px] text-[#8B949E] font-medium flex items-center gap-1">
                          <span className="text-slate-400">{mem.department || '플랫폼 소속'}</span>
                        </div>
                      </button>
                    </td>

                    {/* 2. Project-Scoped Role Badges (Restored) + Icon-Only Edit Button */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1 items-center">
                          {projectScopedRoles.map((r) => {
                            const meta = ALL_ROLES.find((item) => item.role === r);
                            return (
                              <span
                                key={r}
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                  meta ? meta.badgeCls : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                <Shield className="w-2.5 h-2.5" />
                                <span>{meta ? meta.label : r}</span>
                              </span>
                            );
                          })}

                          {/* Role edit button with ICON ONLY (Admin Only) */}
                          {isAdmin && (
                            <button
                              onClick={() => handleOpenRoleModal(mem)}
                              className="p-1 rounded bg-[#0D1117] hover:bg-[#21262D] text-purple-400 hover:text-purple-300 border border-[#30363D] transition cursor-pointer"
                              title="타겟 프로젝트별 다중 역할 상세 편집 (관리자 전용)"
                            >
                              <Shield className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div className="text-[9px] text-[#7D8590]">
                          {selectedProjectId !== 'proj-all' ? (
                            <span className="text-blue-400/90 font-mono">
                              [{projects.find((p) => p.id === selectedProjectId)?.code}] 종속 권한
                            </span>
                          ) : (
                            <span>플랫폼 전역 기본 권한</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 3. Allowed Models as Color-Coded Labels (Restored) + Icon-Only Edit Button */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          {mem.allowedModels.map((m) => renderModelBadge(m))}

                          {/* Model edit button with ICON ONLY */}
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setModelSelectMember(mem);
                                setSelectedModelsBuffer(mem.allowedModels);
                              }}
                              className="p-1 rounded bg-[#0D1117] hover:bg-[#21262D] text-indigo-400 hover:text-indigo-300 border border-[#30363D] transition cursor-pointer"
                              title="개인 등록 AI 모델 화이트리스트 변경"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        <div className="text-[9px] text-[#7D8590]">
                          총 {mem.allowedModels.length}개 모델 허용
                        </div>
                      </div>
                    </td>

                    {/* 4. Daily Token Limit: Auto-Sync vs Manual Configuration */}
                    <td className="py-3 px-3">
                      {isEditingLimit ? (
                        <div className="p-2 rounded-lg bg-[#0D1117] border border-blue-500/50 space-y-2 min-w-[200px]">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#8B949E] font-semibold">토큰 한도 설정</span>
                            <span className="text-[10px] text-blue-400 font-mono">
                              {(editLimitVal / 1000).toFixed(0)}k 토큰
                            </span>
                          </div>

                          {/* Quick Presets */}
                          <div className="grid grid-cols-4 gap-1">
                            {[100000, 500000, 1000000, 3000000, 5000000].map((preset) => (
                              <button
                                key={preset}
                                onClick={() => {
                                  setEditLimitVal(preset);
                                  setIsAutoSyncSetting(false);
                                }}
                                className={`px-1 py-0.5 rounded text-[9px] font-mono border transition ${
                                  editLimitVal === preset && !isAutoSyncSetting
                                    ? 'bg-blue-600 text-white border-blue-500 font-bold'
                                    : 'bg-[#161B22] text-[#8B949E] border-[#30363D] hover:text-[#E6EDF3]'
                                }`}
                              >
                                {(preset / 1000).toFixed(0)}k
                              </button>
                            ))}
                          </div>

                          {/* Auto-calculate button */}
                          <button
                            onClick={() => {
                              const autoLimit = calculateAutoQuota(projectScopedRoles);
                              setEditLimitVal(autoLimit);
                              setIsAutoSyncSetting(true);
                            }}
                            className="w-full flex items-center justify-center gap-1 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[10px] font-semibold border border-indigo-500/40 transition cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-indigo-400" />
                            <span>권한 기반 자동 쿼터 계산 ({(calculateAutoQuota(projectScopedRoles) / 1000).toFixed(0)}k)</span>
                          </button>

                          {/* Manual Input */}
                          <div className="flex items-center gap-1 pt-1">
                            <input
                              type="number"
                              value={editLimitVal}
                              onChange={(e) => {
                                setEditLimitVal(Number(e.target.value));
                                setIsAutoSyncSetting(false);
                              }}
                              className="w-full px-2 py-1 bg-[#161B22] border border-[#30363D] rounded text-xs text-[#E6EDF3] font-mono focus:border-blue-500"
                              placeholder="직접 입력 (토큰 수)"
                            />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center justify-end gap-1.5 pt-1 border-t border-[#30363D]">
                            <button
                              onClick={() => setEditingLimitMemberId(null)}
                              className="px-2 py-0.5 rounded bg-[#21262D] text-[#8B949E] text-[10px] hover:text-[#E6EDF3] cursor-pointer"
                            >
                              취소
                            </button>
                            <button
                              onClick={async () => {
                                await onUpdateMemberLimit(mem.id, editLimitVal, isAutoSyncSetting);
                                setEditingLimitMemberId(null);
                              }}
                              className="px-2.5 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-semibold flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-2.5 h-2.5" />
                              <span>적용 저장</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-1 font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold text-[#E6EDF3]">
                              {(mem.dailyTokenLimit / 1000).toFixed(0)}k
                            </span>
                            {mem.isTokenAutoSynced && (
                              <span className="px-1 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-sans">
                                ⚡ 자동연동
                              </span>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => {
                                  setEditingLimitMemberId(mem.id);
                                  setEditLimitVal(mem.dailyTokenLimit);
                                  setIsAutoSyncSetting(Boolean(mem.isTokenAutoSynced));
                                }}
                                className="p-1 text-[#7D8590] hover:text-[#E6EDF3] rounded hover:bg-[#21262D] cursor-pointer"
                                title="일일 한도 변경 (자동/수동)"
                              >
                                <Edit2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                          <div className="text-[10px] text-[#7D8590] font-sans">
                            월간 환산: 약 ${(mem.dailyTokenLimit * 30 * 0.000003).toFixed(1)} / 월
                          </div>
                        </div>
                      )}
                    </td>

                    {/* 5. Today Usage */}
                    <td className="py-3 px-3 font-mono">
                      <div className="space-y-1">
                        <div className="text-xs text-emerald-400 font-semibold">
                          {(mem.tokensUsedToday / 1000).toFixed(0)}k
                        </div>
                        <div className="w-16 h-1 bg-[#0D1117] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full"
                            style={{
                              width: `${Math.min(100, (mem.tokensUsedToday / mem.dailyTokenLimit) * 100)}%`
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* 6. Status */}
                    <td className="py-3 px-3 text-right">
                      <div className="space-y-1 inline-flex flex-col items-end">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{mem.status}</span>
                        </span>
                        <span className="text-[9px] text-[#7D8590]">{mem.lastActive}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 2: Project-Scoped Multi-Role Editor (Admin Only) */}
      {/* ========================================================================= */}
      {roleSelectMember && isAdmin && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl max-w-xl w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#E6EDF3]">타겟 프로젝트별 RBAC 역할 지정</h3>
                  <p className="text-xs text-[#7D8590]">{roleSelectMember.name} ({roleSelectMember.email})</p>
                </div>
              </div>
              <button
                onClick={() => setRoleSelectMember(null)}
                className="p-1 text-[#7D8590] hover:text-[#E6EDF3] rounded-lg hover:bg-[#21262D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Target Project Selection Tabs inside Modal */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#E6EDF3] flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-blue-400" />
                <span>역할을 부여할 대상 프로젝트 선택:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {projects.map((proj) => {
                  const isTabActive = roleModalTargetProjectId === proj.id;
                  const assignedCount = (projectRolesBuffer[proj.id] || []).length;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => setRoleModalTargetProjectId(proj.id)}
                      className={`p-2 rounded-lg border text-left transition cursor-pointer ${
                        isTabActive
                          ? 'border-blue-500 bg-blue-500/15 text-[#E6EDF3]'
                          : 'border-[#30363D] bg-[#0D1117] text-[#8B949E] hover:border-slate-500'
                      }`}
                    >
                      <div className="font-semibold text-xs truncate">{proj.name}</div>
                      <div className="text-[10px] text-[#7D8590]">{assignedCount}개 역할 설정됨</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Roles Checklist for the Active Project */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#E6EDF3]">
                  [{projects.find((p) => p.id === roleModalTargetProjectId)?.name}] 프로젝트 내 허용 역할 선택 (다중 체크)
                </label>
                <span className="text-[11px] text-blue-400 font-mono">
                  {(projectRolesBuffer[roleModalTargetProjectId] || []).length}개 선택됨
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ALL_ROLES.map((item) => {
                  const isChecked = (projectRolesBuffer[roleModalTargetProjectId] || []).includes(item.role);
                  return (
                    <div
                      key={item.role}
                      onClick={() => handleToggleRoleInBuffer(item.role)}
                      className={`p-2.5 rounded-lg border flex items-start gap-2.5 cursor-pointer transition ${
                        isChecked
                          ? 'bg-[#0D1117] border-blue-500/60 shadow-xs'
                          : 'bg-[#0D1117] border-[#30363D] opacity-60 hover:opacity-100 hover:border-slate-500'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isChecked ? (
                          <CheckSquare className="w-4 h-4 text-blue-400" />
                        ) : (
                          <Square className="w-4 h-4 text-[#7D8590]" />
                        )}
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-xs text-[#E6EDF3]">{item.label}</span>
                          <span className="text-[10px] font-mono text-[#7D8590]">({item.role})</span>
                        </div>
                        <p className="text-[10px] text-[#8B949E] leading-tight">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Global sync option */}
            <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#E6EDF3]">
                <input
                  type="checkbox"
                  checked={applyToAllProjects}
                  onChange={(e) => setApplyToAllProjects(e.target.checked)}
                  className="rounded border-[#30363D] text-blue-600 focus:ring-0 cursor-pointer"
                />
                <span>이 설정을 모든 프로젝트({projects.length}개)에 동일하게 공통 복사 적용</span>
              </label>
              <span className="text-[10px] text-[#7D8590]">일괄 동기화</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30363D]">
              <button
                onClick={() => setRoleSelectMember(null)}
                className="px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] text-xs transition cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSaveRoles}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>프로젝트별 권한 저장</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: Model Whitelist Selector */}
      {/* ========================================================================= */}
      {modelSelectMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#E6EDF3]">허용 AI 모델 화이트리스트 설정</h3>
                  <p className="text-xs text-[#7D8590]">{modelSelectMember.name} 계정의 모델 호출 권한</p>
                </div>
              </div>
              <button
                onClick={() => setModelSelectMember(null)}
                className="p-1 text-[#7D8590] hover:text-[#E6EDF3] rounded-lg hover:bg-[#21262D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              {(models || []).map((mod) => {
                const isSelected = selectedModelsBuffer.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedModelsBuffer((prev) => prev.filter((id) => id !== mod.id));
                      } else {
                        setSelectedModelsBuffer((prev) => [...prev, mod.id]);
                      }
                    }}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#0D1117] border-blue-500/60 shadow-xs'
                        : 'bg-[#0D1117] border-[#30363D] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-400" />
                      ) : (
                        <Square className="w-4 h-4 text-[#7D8590]" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full inline-block"
                            style={{ backgroundColor: mod.badgeColor || '#94a3b8' }}
                          />
                          <span className="font-semibold text-xs text-[#E6EDF3]">{mod.name}</span>
                        </div>
                        <p className="text-[11px] text-[#7D8590] mt-0.5">{mod.description}</p>
                      </div>
                    </div>
                    {renderModelBadge(mod.id)}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#30363D]">
              <button
                onClick={() => setModelSelectMember(null)}
                className="px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] text-xs transition cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSaveModels}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>허용 모델 적용</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: AI Model Registry & Distinction Color Customizer */}
      {/* ========================================================================= */}
      {showModelMappingModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <Palette className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#E6EDF3]">시스템 운영 AI 모델 관리 및 구분색 지정</h3>
                  <p className="text-xs text-[#7D8590]">AI 모델별 공식 식별 구분색 팔레트 지정 및 4대 매핑 기준</p>
                </div>
              </div>
              <button
                onClick={() => setShowModelMappingModal(false)}
                className="p-1 text-[#7D8590] hover:text-[#E6EDF3] rounded-lg hover:bg-[#21262D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Mapping Criteria Overview */}
            <div className="p-3.5 rounded-lg bg-[#0D1117] border border-indigo-500/30 space-y-2">
              <div className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                <span>등록한 모델을 실제 모델로 인식하기 위한 4대 매핑 기준 (Mapping Criteria)</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-[#161B22] border border-[#30363D] space-y-1">
                  <div className="font-semibold text-[#E6EDF3] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-[10px] font-bold">1</span>
                    <span>Provider Endpoint ID 매핑</span>
                  </div>
                  <p className="text-[11px] text-[#7D8590]">
                    공식 모델 식별자 (<code className="text-amber-300">claude-3-7-sonnet-20250219</code>, <code className="text-emerald-300">gpt-4o-2024-11-20</code>, <code className="text-sky-300">gemini-3.7-flash</code>)와 1:1 바인딩.
                  </p>
                </div>
                <div className="p-2 rounded bg-[#161B22] border border-[#30363D] space-y-1">
                  <div className="font-semibold text-[#E6EDF3] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-[10px] font-bold">2</span>
                    <span>Capability Matrix (지원 역량)</span>
                  </div>
                  <p className="text-[11px] text-[#7D8590]">
                    AST 코드생성, 1M 컨텍스트 윈도우, 자율 샌드박스 실행, JSON Schema 검증 등 공정별 지원 역량 태깅.
                  </p>
                </div>
                <div className="p-2 rounded bg-[#161B22] border border-[#30363D] space-y-1">
                  <div className="font-semibold text-[#E6EDF3] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px] font-bold">3</span>
                    <span>Fallback Chain & 서킷 브레이커</span>
                  </div>
                  <p className="text-[11px] text-[#7D8590]">
                    1차 호출 429/500 장애 시 핫스왑될 2순위 대체 모델 체인 규정 및 자동 절체.
                  </p>
                </div>
                <div className="p-2 rounded bg-[#161B22] border border-[#30363D] space-y-1">
                  <div className="font-semibold text-[#E6EDF3] flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">4</span>
                    <span>토큰 단가 및 컨텍스트 윈도우</span>
                  </div>
                  <p className="text-[11px] text-[#7D8590]">
                    1M 토큰당 입력/출력 과금 계수 및 최대 컨텍스트 윈도우를 연동하여 일일 캡 자동 계산.
                  </p>
                </div>
              </div>
            </div>

            {/* Registered AI Models with Color Customizer */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#E6EDF3] flex items-center justify-between">
                <span>등록된 모델 인벤토리 및 구분색 팔레트 설정</span>
                <span className="text-[11px] text-[#7D8590]">원하는 색상을 클릭하면 즉시 배지 색상이 변경됩니다.</span>
              </h4>

              <div className="space-y-2.5">
                {(models || []).map((mod) => {
                  const currentColor = mod.badgeColor || '#94a3b8';
                  return (
                    <div
                      key={mod.id}
                      className="p-3.5 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          {renderModelBadge(mod.id)}
                          <span className="font-bold text-[#E6EDF3]">{mod.name}</span>
                          <span className="text-[10px] text-[#7D8590] font-mono">({mod.provider})</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B22] text-indigo-300 border border-[#30363D]">
                          {mod.reasoningTier} Reasoning • 코드점수: {mod.codeScore}점
                        </span>
                      </div>

                      {/* Color Palette Picker for this Model */}
                      <div className="p-2 rounded bg-[#161B22] border border-[#30363D] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-[11px] text-[#8B949E] flex items-center gap-1 font-medium">
                          <Palette className="w-3 h-3 text-indigo-400" />
                          <span>모델 구분색 지정:</span>
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {COLOR_PRESETS.map((preset) => {
                            const isSelected = currentColor.toLowerCase() === preset.hex.toLowerCase();
                            return (
                              <button
                                key={preset.id}
                                onClick={async () => {
                                  if (onUpdateModelColor) {
                                    await onUpdateModelColor(mod.id, preset.hex);
                                  }
                                }}
                                className={`w-5 h-5 rounded-full transition-transform cursor-pointer flex items-center justify-center ${
                                  isSelected ? 'scale-125 ring-2 ring-white shadow-md' : 'hover:scale-110 opacity-70 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: preset.hex }}
                                title={`${preset.label} (${preset.hex})`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#8B949E] pt-1">
                        <div>
                          컨텍스트 윈도우: <span className="text-[#E6EDF3] font-mono">{(mod.contextWindow / 1000).toFixed(0)}k</span>
                        </div>
                        <div>
                          입력/출력 단가: <span className="text-[#E6EDF3] font-mono">${mod.inputPricePerMillion} / ${mod.outputPricePerMillion}</span>
                        </div>
                        <div>
                          장애 시 Fallback: <span className="text-amber-400 font-mono">{mod.fallbackOrder.slice(0, 2).join(' → ')}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-[#30363D]">
              <button
                onClick={() => setShowModelMappingModal(false)}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                확인 완료
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 6: User Detail Supplementary Info Popover Modal */}
      {/* ========================================================================= */}
      {detailModalMember && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl max-w-2xl w-full p-5 flex flex-col max-h-[88vh] shadow-2xl animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
            {/* Fixed Header with Avatar & Basic Info */}
            <div className="flex items-start justify-between border-b border-[#30363D] pb-4 shrink-0">
              <div className="flex items-center gap-3.5">
                <img
                  src={detailModalMember.avatar}
                  alt={detailModalMember.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-blue-500 shadow-md shrink-0"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-[#E6EDF3]">{detailModalMember.name}</h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{detailModalMember.status}</span>
                    </span>
                  </div>
                  <div className="text-xs text-[#7D8590] mt-0.5 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{detailModalMember.department}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-slate-300 font-mono">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>{detailModalMember.email}</span>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDetailModalMember(null)}
                className="p-1 text-[#7D8590] hover:text-[#E6EDF3] rounded-lg hover:bg-[#21262D] cursor-pointer"
                title="닫기"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Contents Section under Fixed Basic Info */}
            <div className="flex-1 overflow-y-auto dark-custom-scrollbar pr-2 py-3.5 space-y-3.5 text-xs">
              {/* 1. Account Attributes */}
              <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2">
                <h4 className="font-semibold text-xs text-[#E6EDF3] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-400" />
                  <span>사용자 계정 식별 및 기본 정보</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#8B949E]">
                  <div>
                    <span className="text-[#7D8590] block text-[10px]">멤버 식별자:</span>
                    <span className="font-mono text-[#E6EDF3] font-semibold">{detailModalMember.id}</span>
                  </div>
                  <div>
                    <span className="text-[#7D8590] block text-[10px]">소속 부서:</span>
                    <span className="text-[#E6EDF3]">{detailModalMember.department}</span>
                  </div>
                  <div>
                    <span className="text-[#7D8590] block text-[10px]">계정 상태:</span>
                    <span className="text-emerald-400 font-semibold">{detailModalMember.status}</span>
                  </div>
                  <div>
                    <span className="text-[#7D8590] block text-[10px]">최근 활동:</span>
                    <span className="text-[#E6EDF3] font-mono">{detailModalMember.lastActive}</span>
                  </div>
                </div>
              </div>

              {/* 2. Project-Scoped RBAC Roles Overview */}
              <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-[#E6EDF3] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    <span>프로젝트별 RBAC 다중 역할 배정 현황</span>
                  </h4>
                  <span className="text-[10px] text-[#7D8590]">
                    총 {projects.length}개 프로젝트 관리 대상
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {projects.map((p) => {
                    const scopedRoles = getMemberRolesForProject(detailModalMember, p.id);
                    return (
                      <div
                        key={p.id}
                        className="p-2.5 rounded-md bg-[#161B22] border border-[#30363D] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#E6EDF3] flex items-center gap-1">
                            <FolderGit2 className="w-3 h-3 text-blue-400" />
                            <span>{p.name}</span>
                          </span>
                          <span className="text-[9px] font-mono text-[#7D8590]">[{p.code}]</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {scopedRoles.map((r) => {
                            const meta = ALL_ROLES.find((item) => item.role === r);
                            return (
                              <span
                                key={r}
                                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold border ${
                                  meta ? meta.badgeCls : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                <span>{meta ? meta.label : r}</span>
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. Allowed AI Models */}
              <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-[#E6EDF3] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                    <span>개인 등록 허용 AI 모델 ({detailModalMember.allowedModels.length}개)</span>
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {detailModalMember.allowedModels.map((m) => renderModelBadge(m))}
                </div>
              </div>

              {/* 4. Token Quota & Cost Usage */}
              <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2">
                <h4 className="font-semibold text-xs text-[#E6EDF3] flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>일일 토큰 쿼터 및 사용량 지표</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div className="p-2 rounded bg-[#161B22] border border-[#30363D]">
                    <span className="text-[#7D8590] block text-[10px]">일일 토큰 한도:</span>
                    <span className="font-mono text-[#E6EDF3] font-bold text-xs">
                      {(detailModalMember.dailyTokenLimit / 1000).toFixed(0)}k 토큰
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#161B22] border border-[#30363D]">
                    <span className="text-[#7D8590] block text-[10px]">금일 사용 토큰:</span>
                    <span className="font-mono text-emerald-400 font-bold text-xs">
                      {(detailModalMember.tokensUsedToday / 1000).toFixed(0)}k 토큰
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#161B22] border border-[#30363D]">
                    <span className="text-[#7D8590] block text-[10px]">월간 환산 예산:</span>
                    <span className="font-mono text-blue-400 font-bold text-xs">
                      약 ${(detailModalMember.dailyTokenLimit * 30 * 0.000003).toFixed(1)} / 월
                    </span>
                  </div>
                  <div className="p-2 rounded bg-[#161B22] border border-[#30363D]">
                    <span className="text-[#7D8590] block text-[10px]">쿼터 동기화 모드:</span>
                    <span className="font-mono text-indigo-300 font-semibold text-xs">
                      {detailModalMember.isTokenAutoSynced ? '⚡ 자동 연동' : '⚙️ 수동 지정'}
                    </span>
                  </div>
                </div>
              </div>

              {/* 5. Audit & Governance Metadata */}
              <div className="p-2.5 rounded-lg bg-[#161B22]/50 border border-[#30363D] text-[10px] text-[#7D8590] flex items-center justify-between flex-wrap gap-2">
                <span>등록 시스템: <strong className="text-slate-300 font-mono">JKADH_DEV</strong> • 등록자: <strong className="text-slate-300 font-mono">SYSTEM</strong></span>
                <span>등록일시: <strong className="text-slate-300 font-mono">2026-08-20 00:00:00</strong></span>
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex items-center justify-end pt-3 border-t border-[#30363D] shrink-0">
              <button
                onClick={() => setDetailModalMember(null)}
                className="px-4 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] text-xs font-semibold transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 5: Raw SQL DB Query Result Viewer (Harmonized 3 Members) */}
      {/* ========================================================================= */}
      {showDbRawModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#161B22] border border-[#30363D] rounded-xl max-w-3xl w-full p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#E6EDF3]">PostgreSQL 물리적 DB 쿼리 결과 원본</h3>
                  <p className="text-xs text-[#7D8590]">SELECT * FROM jkadhp_dev.team_members LIMIT 10; (총 {members.length}건 데이터)</p>
                </div>
              </div>
              <button
                onClick={() => setShowDbRawModal(false)}
                className="p-1 text-[#7D8590] hover:text-[#E6EDF3] rounded-lg hover:bg-[#21262D] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300">
                💡 <strong>데이터베이스 일원화 안내:</strong> 하네스 6대 라이프사이클 거버넌스 및 팀 멤버 정보가 DB `team_members` 테이블(조정국, 김민지, 이대원 등 총 3건)을 원천 소스로 하여 일원화 관리됩니다.
              </div>

              <div className="flex items-center justify-between text-xs text-[#7D8590]">
                <span>실시간 JSON 레코드 데이터 ({members.length} rows returned)</span>
                <span className="text-[10px] text-emerald-400 font-mono">STATUS: 200 OK • LATENCY: 3.5ms</span>
              </div>
              <pre className="p-4 rounded-lg bg-[#0D1117] border border-[#30363D] text-[11px] font-mono text-emerald-300/90 overflow-x-auto max-h-[350px]">
                {JSON.stringify(
                  {
                    database: 'jkadhp_dev',
                    schema: 'public',
                    table: 'team_members',
                    fetched_at: new Date().toISOString(),
                    total_count: members.length,
                    records: members.map((m) => ({
                      id: m.id,
                      name: m.name,
                      email: m.email,
                      avatar: m.avatar,
                      roles: getMemberRoles(m),
                      project_roles: m.projectRoles || { 'proj-all': getMemberRoles(m) },
                      allowed_models: m.allowedModels,
                      daily_token_limit: m.dailyTokenLimit,
                      tokens_used_today: m.tokensUsedToday,
                      is_token_auto_synced: m.isTokenAutoSynced,
                      status: m.status,
                      department: m.department,
                      audit: {
                        reg_sys_cd: 'JKADH_DEV',
                        reg_user_id: 'SYSTEM',
                        reg_dt: '2026-08-20 00:00:00',
                        mod_sys_cd: 'JKADH_DEV',
                        mod_user_id: 'mem-jkoo',
                        mod_dt: '2026-08-20 09:15:00'
                      }
                    }))
                  },
                  null,
                  2
                )}
              </pre>
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#30363D]">
              <button
                onClick={() => setShowDbRawModal(false)}
                className="px-4 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] text-xs font-semibold transition cursor-pointer"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
