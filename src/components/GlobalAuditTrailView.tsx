import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  AlertOctagon, 
  Info, 
  Cpu, 
  Database, 
  GitMerge, 
  Users, 
  Layers, 
  Download, 
  Copy, 
  Check, 
  X, 
  RefreshCw, 
  Plus, 
  Minus, 
  ArrowRight,
  Terminal,
  Activity,
  RotateCcw,
  Tag
} from 'lucide-react';
import { AuditTrailRecord, AuditCategory, AuditSeverity, AuditActionType } from '../types';

interface GlobalAuditTrailViewProps {
  auditRecords: AuditTrailRecord[];
  onAddAuditRecord?: (record: AuditTrailRecord) => void;
  initialSearchQuery?: string;
}

export const GlobalAuditTrailView: React.FC<GlobalAuditTrailViewProps> = ({
  auditRecords,
  onAddAuditRecord,
  initialSearchQuery = ''
}) => {
  // Filter States
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [selectedCategory, setSelectedCategory] = useState<AuditCategory | 'ALL'>('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState<AuditSeverity | 'ALL'>('ALL');
  const [selectedAction, setSelectedAction] = useState<AuditActionType | 'ALL'>('ALL');

  // Sync initialSearchQuery when prop changes
  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchQuery(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  const isFiltered = selectedCategory !== 'ALL' || selectedSeverity !== 'ALL' || selectedAction !== 'ALL' || searchQuery.trim() !== '';

  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setSelectedSeverity('ALL');
    setSelectedAction('ALL');
    setSearchQuery('');
  };

  // Modal State for JSON Diff
  const [selectedRecord, setSelectedRecord] = useState<AuditTrailRecord | null>(null);
  const [diffViewMode, setDiffViewMode] = useState<'TOP_BOTTOM' | 'SIDE_BY_SIDE' | 'UNIFIED'>('TOP_BOTTOM');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [maskSecrets, setMaskSecrets] = useState<boolean>(true);

  // Simulation State
  const [isSimulating, setIsSimulating] = useState(false);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return auditRecords.filter(record => {
      const matchesSearch = 
        record.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.target_resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.reg_user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.audit_id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'ALL' || record.category === selectedCategory;
      const matchesSeverity = selectedSeverity === 'ALL' || record.severity === selectedSeverity;
      const matchesAction = selectedAction === 'ALL' || record.action_type === selectedAction;

      return matchesSearch && matchesCategory && matchesSeverity && matchesAction;
    });
  }, [auditRecords, searchQuery, selectedCategory, selectedSeverity, selectedAction]);

  // Copy to clipboard helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export Filtered Logs to JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(filteredRecords, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `audit-trail-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Trigger Simulation Event
  const handleSimulateEvent = () => {
    if (!onAddAuditRecord) return;
    setIsSimulating(true);

    const simulationTemplates: AuditTrailRecord[] = [
      {
        audit_id: `AUD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        category: 'SECURITY_VAULT',
        action_type: 'ROTATE_KEY',
        severity: 'WARNING',
        event_name: 'OpenAI GPT-4o Key Auto-Rotation Triggered',
        summary: '주기적 보안 정책에 따른 OpenAI API Key Vault 자격증명 자동 회전 완료',
        target_resource: 'vault_secrets / SEC-OPENAI-OMNI-01',
        ip_address: '10.244.0.22',
        user_agent: 'JKADH-VaultService/v2.4',
        session_id: 'SES-LIVE-SIMULATOR',
        reg_sys_cd: 'SEC_VAULT_SRV',
        reg_user_id: 'sys-vault-daemon',
        reg_dt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        mod_sys_cd: 'SEC_VAULT_SRV',
        mod_user_id: 'sys-vault-daemon',
        mod_dt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        before_state: {
          secret_key: 'sk-proj-9999...masked_old',
          status: 'EXPIRING_SOON',
          token_quota_used: 89.4
        },
        after_state: {
          secret_key: 'sk-proj-8888...masked_new',
          status: 'ACTIVE_HEALTHY',
          token_quota_used: 0.0
        },
        diff_summary: {
          added_keys: [],
          removed_keys: [],
          modified_keys: ['secret_key', 'status', 'token_quota_used']
        }
      },
      {
        audit_id: `AUD-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`,
        category: 'AI_ROUTING',
        action_type: 'FALLBACK',
        severity: 'INFO',
        event_name: 'Model Quota Auto-Scale Route Balanced',
        summary: '토큰 사용량 분산을 위해 Gemini 2.5 Flash -> Claude 3.7 Sonnet 동적 라우팅 트래픽 조정',
        target_resource: 'model_router / DynamicBalancer',
        ip_address: '10.244.3.50',
        user_agent: 'JKADH-RouterEngine/v2.4',
        session_id: 'SES-LIVE-SIMULATOR',
        reg_sys_cd: 'AI_ROUTER_SRV',
        reg_user_id: 'sys-router',
        reg_dt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        mod_sys_cd: 'AI_ROUTER_SRV',
        mod_user_id: 'sys-router',
        mod_dt: new Date().toISOString().replace('T', ' ').slice(0, 19),
        before_state: {
          traffic_share_gemini: '80%',
          traffic_share_claude: '20%'
        },
        after_state: {
          traffic_share_gemini: '50%',
          traffic_share_claude: '50%'
        },
        diff_summary: {
          added_keys: [],
          removed_keys: [],
          modified_keys: ['traffic_share_gemini', 'traffic_share_claude']
        }
      }
    ];

    const randomRecord = simulationTemplates[Math.floor(Math.random() * simulationTemplates.length)];
    onAddAuditRecord(randomRecord);

    setTimeout(() => {
      setIsSimulating(false);
    }, 600);
  };

  // Helper for Category Badge
  const getCategoryBadge = (category: AuditCategory) => {
    switch (category) {
      case 'SECURITY_VAULT':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60">
            <Shield className="w-3 h-3 text-amber-400" /> Vault 보안
          </span>
        );
      case 'AI_ROUTING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/60">
            <Cpu className="w-3 h-3 text-indigo-400" /> AI 라우팅
          </span>
        );
      case 'SCHEMA_MIGRATION':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">
            <Database className="w-3 h-3 text-emerald-400" /> 스키마 DDL
          </span>
        );
      case 'HARNESS_LIFECYCLE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60">
            <GitMerge className="w-3 h-3 text-cyan-400" /> 라이프사이클
          </span>
        );
      case 'TEAM_RBAC':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-purple-950/60 text-purple-300 border border-purple-800/60">
            <Users className="w-3 h-3 text-purple-400" /> 팀 RBAC
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-gray-800 text-gray-300 border border-gray-700">
            <Layers className="w-3 h-3" /> 데이터
          </span>
        );
    }
  };

  // Helper for Severity Icon & Badge
  const getSeverityBadge = (severity: AuditSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-red-950/80 text-red-300 border border-red-800/70">
            <AlertOctagon className="w-3 h-3 text-red-400" /> CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-700/60">
            <AlertTriangle className="w-3 h-3 text-amber-400" /> WARNING
          </span>
        );
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-700/60">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> SUCCESS
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/60">
            <Info className="w-3 h-3 text-blue-400" /> INFO
          </span>
        );
    }
  };

  // Helper to mask sensitive keys in JSON string
  const maskSensitiveValues = (obj: any): any => {
    if (!obj || typeof obj !== 'object') return obj;
    if (!maskSecrets) return obj;

    const sensitiveKeywords = ['key', 'secret', 'token', 'password', 'preview', 'auth'];
    const cloned = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key in cloned) {
      if (typeof cloned[key] === 'object' && cloned[key] !== null) {
        cloned[key] = maskSensitiveValues(cloned[key]);
      } else if (typeof cloned[key] === 'string') {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeywords.some(kw => lowerKey.includes(kw))) {
          const val = cloned[key];
          if (val.length > 8) {
            cloned[key] = val.slice(0, 6) + '...***' + val.slice(-4);
          } else {
            cloned[key] = '***MASKED***';
          }
        }
      }
    }
    return cloned;
  };

  return (
    <div className="space-y-6 select-text text-gray-200">
      {/* Top Header & Statistics Banner */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/30 to-purple-600/30 border border-indigo-500/40 flex items-center justify-center shadow-inner">
              <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-100">정보 변경이력 조회 (JSON Diff)</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800/80">
                  v2.4.0 Engine
                </span>
              </div>
              <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">
                보안 Vault, AI 모델 라우팅, 스키마 DDL, 하네스 라이프사이클 및 6대 감사 메타데이터 실시간 추적 및 JSON Diff 분석
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportJson}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] text-gray-200 border border-[#30363d] rounded-lg transition-colors shadow-sm cursor-pointer"
              title="현재 필터링된 변경이력을 JSON 파일로 내보냅니다."
            >
              <Download className="w-3.5 h-3.5 text-gray-400" /> JSON 내보내기 ({filteredRecords.length})
            </button>
            <button
              onClick={handleSimulateEvent}
              disabled={isSimulating}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50 cursor-pointer"
              title="실시간 변경 이벤트를 시뮬레이션하여 타임라인에 등록합니다."
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} /> 변경 이벤트 시뮬레이터
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-4 border-t border-[#30363d]">
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
            <div className="text-xs text-gray-400 flex items-center justify-between">
              <span>총 누적 변경이력</span>
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-bold text-gray-100 mt-1">{auditRecords.length} <span className="text-xs font-normal text-gray-500">Events</span></div>
          </div>
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
            <div className="text-xs text-gray-400 flex items-center justify-between">
              <span>보안 & 권한 변경</span>
              <Shield className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-300 mt-1">
              {auditRecords.filter(r => r.category === 'SECURITY_VAULT' || r.category === 'TEAM_RBAC').length}
            </div>
          </div>
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
            <div className="text-xs text-gray-400 flex items-center justify-between">
              <span>AI 모델 & 스키마</span>
              <Database className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-300 mt-1">
              {auditRecords.filter(r => r.category === 'AI_ROUTING' || r.category === 'SCHEMA_MIGRATION').length}
            </div>
          </div>
          <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
            <div className="text-xs text-gray-400 flex items-center justify-between">
              <span>하네스 라이프사이클</span>
              <GitMerge className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-bold text-cyan-300 mt-1">
              {auditRecords.filter(r => r.category === 'HARNESS_LIFECYCLE').length}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="이벤트명, 리소스, 사용자, 요약 내용 또는 감사 ID 검색..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg pl-9 pr-8 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 cursor-pointer"
                title="검색어 지우기"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Compact Dropdown Filters & Reset Button */}
          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
            <div className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-gray-300">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="bg-transparent text-gray-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-[#161b22]">전체 카테고리</option>
                <option value="SECURITY_VAULT" className="bg-[#161b22]">보안 Vault</option>
                <option value="AI_ROUTING" className="bg-[#161b22]">AI 모델 라우팅</option>
                <option value="SCHEMA_MIGRATION" className="bg-[#161b22]">스키마 마이그레이션</option>
                <option value="HARNESS_LIFECYCLE" className="bg-[#161b22]">하네스 라이프사이클</option>
                <option value="TEAM_RBAC" className="bg-[#161b22]">팀 RBAC</option>
                <option value="DATA_RECORD" className="bg-[#161b22]">데이터 레코드</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-gray-300">
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as any)}
                className="bg-transparent text-gray-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-[#161b22]">전체 중요도</option>
                <option value="CRITICAL" className="bg-[#161b22]">CRITICAL</option>
                <option value="WARNING" className="bg-[#161b22]">WARNING</option>
                <option value="SUCCESS" className="bg-[#161b22]">SUCCESS</option>
                <option value="INFO" className="bg-[#161b22]">INFO</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg px-2.5 py-1.5 text-xs text-gray-300">
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as any)}
                className="bg-transparent text-gray-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="ALL" className="bg-[#161b22]">전체 액션</option>
                <option value="ROTATE_KEY" className="bg-[#161b22]">ROTATE_KEY</option>
                <option value="UPDATE" className="bg-[#161b22]">UPDATE</option>
                <option value="EXECUTE" className="bg-[#161b22]">EXECUTE</option>
                <option value="FALLBACK" className="bg-[#161b22]">FALLBACK</option>
                <option value="PROMOTE" className="bg-[#161b22]">PROMOTE</option>
                <option value="CREATE" className="bg-[#161b22]">CREATE</option>
                <option value="DELETE" className="bg-[#161b22]">DELETE</option>
              </select>
            </div>

            {/* Reset Filters Button */}
            {isFiltered && (
              <button
                onClick={handleResetFilters}
                className="px-2.5 py-1.5 text-xs font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                title="모든 필터 및 검색어를 초기화합니다."
              >
                <RotateCcw className="w-3 h-3" />
                초기화
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Audit Trail Timeline & Table */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 border-b border-[#30363d] flex items-center justify-between bg-[#161b22]/70">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Clock className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-semibold text-gray-200">변경이력 타임라인 스트림</h2>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="px-2 py-0.5 font-medium rounded-full bg-[#21262d] text-indigo-300 border border-[#30363d]">
                전체 {auditRecords.length}건 중 {filteredRecords.length}건 표시
              </span>
              {isFiltered && (
                <span className="px-1.5 py-0.5 rounded text-[11px] bg-amber-950/60 text-amber-300 border border-amber-800/50">
                  필터 적용 중
                </span>
              )}
            </div>
          </div>
          {isFiltered && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-gray-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> 전체 보기
            </button>
          )}
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <AlertTriangle className="w-10 h-10 text-gray-500 mx-auto mb-3" />
            <p className="font-medium text-gray-300">조건에 일치하는 감사 로그가 없습니다.</p>
            <p className="text-xs text-gray-500 mt-1">검색어나 필터 조건을 변경해 보십시오.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#30363d]">
            {filteredRecords.map((record) => (
              <div
                key={record.audit_id}
                onClick={() => setSelectedRecord(record)}
                className="p-4 hover:bg-[#1f242c] transition-colors cursor-pointer group space-y-2.5"
              >
                {/* 1단 (상단 메타 헤더): 배지, 액션, 감사ID, 일시 */}
                <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    {getCategoryBadge(record.category)}
                    {getSeverityBadge(record.severity)}
                    <span className="px-2 py-0.5 text-xs font-mono bg-[#0d1117] text-gray-300 border border-[#30363d] rounded">
                      {record.action_type}
                    </span>
                    <span className="font-mono text-gray-400 bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                      {record.audit_id}
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-gray-400 font-mono text-xs">
                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                    {record.reg_dt}
                  </span>
                </div>

                {/* 2단 (중단 제목): 이벤트 명 */}
                <div>
                  <h3 className="text-sm font-bold text-gray-100 group-hover:text-indigo-300 transition-colors">
                    {record.event_name}
                  </h3>
                </div>

                {/* 3단 (본문 요약): 상세 설명 */}
                <p className="text-xs text-gray-300 leading-relaxed">
                  {record.summary}
                </p>

                {/* 4단 (하단 메타 & 조작): 대상 리소스, 실행자, IP 및 Diff 상세 버튼 */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-[#30363d]/50 text-xs text-gray-400">
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-500 font-mono">Target:</span>
                      <code className="text-indigo-300 bg-[#0d1117] px-2 py-0.5 rounded border border-[#30363d]">
                        {record.target_resource}
                      </code>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="text-gray-500 font-mono">Actor:</span>
                      <span className="text-gray-200 font-semibold">{record.reg_user_id}</span>
                      <span className="text-gray-500">({record.reg_sys_cd})</span>
                    </span>
                    <span className="flex items-center gap-1 font-mono text-gray-500">
                      <span>IP:</span> {record.ip_address}
                    </span>
                  </div>

                  {/* Diff Trigger Hint Button */}
                  <div className="flex items-center gap-2">
                    {record.diff_summary && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                        <span>~{record.diff_summary.modified_keys.length} 변경</span>
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-indigo-400 group-hover:translate-x-0.5 transition-transform font-medium">
                      JSON Diff 상세 <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2-Tier JSON Diff Modal Viewer (Strict No Visual Clutter Standards) */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-5xl h-[88vh] flex flex-col shadow-2xl overflow-hidden">
            
            {/* L1: Fixed Header */}
            <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between gap-3 bg-[#161b22] shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-950/80 border border-indigo-700/60 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base font-bold text-gray-100">{selectedRecord.event_name}</h3>
                    {getCategoryBadge(selectedRecord.category)}
                    {getSeverityBadge(selectedRecord.severity)}
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">
                    Audit ID: {selectedRecord.audit_id} • Target: {selectedRecord.target_resource}
                  </p>
                </div>
              </div>

              {/* Close Button Only */}
              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1.5 text-gray-400 hover:text-gray-100 hover:bg-[#30363d] rounded-lg transition-colors cursor-pointer shrink-0"
                title="닫기"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* L2: Scrollable Body (flex-1 overflow-y-auto with 6px slim scrollbar) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#0d1117] custom-scrollbar">
              
              {/* 6 Audit Standard Metadata Table */}
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-4">
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" /> 6대 공통 감사 컬럼 메타데이터
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                    <span className="text-gray-500 font-mono block">등록 시스템 (reg_sys_cd)</span>
                    <span className="text-gray-200 font-semibold mt-0.5 block">{selectedRecord.reg_sys_cd}</span>
                  </div>
                  <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                    <span className="text-gray-500 font-mono block">등록자 (reg_user_id)</span>
                    <span className="text-gray-200 font-semibold mt-0.5 block">{selectedRecord.reg_user_id}</span>
                  </div>
                  <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                    <span className="text-gray-500 font-mono block">등록 일시 (reg_dt)</span>
                    <span className="text-gray-200 font-mono mt-0.5 block">{selectedRecord.reg_dt}</span>
                  </div>
                  <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                    <span className="text-gray-500 font-mono block">수정 시스템 (mod_sys_cd)</span>
                    <span className="text-gray-200 font-semibold mt-0.5 block">{selectedRecord.mod_sys_cd}</span>
                  </div>
                  <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                    <span className="text-gray-500 font-mono block">수정자 (mod_user_id)</span>
                    <span className="text-gray-200 font-semibold mt-0.5 block">{selectedRecord.mod_user_id}</span>
                  </div>
                  <div className="bg-[#0d1117] p-2.5 rounded border border-[#30363d]">
                    <span className="text-gray-500 font-mono block">수정 일시 (mod_dt)</span>
                    <span className="text-gray-200 font-mono mt-0.5 block">{selectedRecord.mod_dt}</span>
                  </div>
                </div>
              </div>

              {/* JSON Diff Viewer Canvas */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#161b22] border border-[#30363d] p-3 rounded-xl">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs font-bold text-gray-200 uppercase tracking-wider flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-indigo-400" /> JSON State Diff Payload
                    </h4>
                    {selectedRecord.diff_summary && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-red-400">-{selectedRecord.diff_summary.removed_keys.length} 삭제</span>
                        <span className="text-emerald-400">+{selectedRecord.diff_summary.added_keys.length} 추가</span>
                        <span className="text-amber-400">~{selectedRecord.diff_summary.modified_keys.length} 변경</span>
                      </div>
                    )}
                  </div>

                  {/* JSON Control Buttons Group */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Mask Toggle */}
                    <button
                      onClick={() => setMaskSecrets(!maskSecrets)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors cursor-pointer whitespace-nowrap ${
                        maskSecrets 
                          ? 'bg-amber-950/70 text-amber-300 border-amber-700/60' 
                          : 'bg-[#21262d] text-gray-400 border-[#30363d]'
                      }`}
                      title="보안 토큰 및 비밀값 마스킹 여부를 전환합니다."
                    >
                      <Shield className="w-3 h-3 inline mr-1" />
                      {maskSecrets ? '비밀 마스킹 ON' : '마스킹 OFF'}
                    </button>

                    {/* Diff View Mode Toggle */}
                    <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-lg p-0.5 text-xs">
                      <button
                        onClick={() => setDiffViewMode('TOP_BOTTOM')}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                          diffViewMode === 'TOP_BOTTOM'
                            ? 'bg-indigo-600 text-white font-semibold shadow'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        상하 비교
                      </button>
                      <button
                        onClick={() => setDiffViewMode('SIDE_BY_SIDE')}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                          diffViewMode === 'SIDE_BY_SIDE'
                            ? 'bg-indigo-600 text-white font-semibold shadow'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        좌우 분할
                      </button>
                      <button
                        onClick={() => setDiffViewMode('UNIFIED')}
                        className={`px-2.5 py-1 rounded transition-colors cursor-pointer whitespace-nowrap ${
                          diffViewMode === 'UNIFIED'
                            ? 'bg-indigo-600 text-white font-semibold shadow'
                            : 'text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        단일 Diff
                      </button>
                    </div>
                  </div>
                </div>

                {/* Modified Keys Tag Cloud */}
                {selectedRecord.diff_summary && selectedRecord.diff_summary.modified_keys.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-xs">
                    <span className="text-gray-400 font-mono flex items-center gap-1">
                      <Tag className="w-3 h-3 text-amber-400" /> 변경 속성:
                    </span>
                    {selectedRecord.diff_summary.modified_keys.map((k) => (
                      <span
                        key={k}
                        className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/50 font-mono text-[11px]"
                        title={`수정된 속성: ${k}`}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                )}

                {diffViewMode === 'TOP_BOTTOM' ? (
                  /* Top-Bottom Vertical View (Simple & Clean) */
                  <div className="space-y-4">
                    {/* Before State (Top) */}
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-2 bg-red-950/30 border-b border-red-900/40 flex items-center justify-between text-xs text-red-300 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Minus className="w-3.5 h-3.5 text-red-400" /> 1단계: 변경 전 상태 (before_state)
                        </span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(selectedRecord.before_state, null, 2), 'before')}
                          className="hover:text-red-100 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === 'before' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} 복사
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto custom-scrollbar max-h-72">
                        {selectedRecord.before_state 
                          ? JSON.stringify(maskSensitiveValues(selectedRecord.before_state), null, 2)
                          : <span className="text-gray-500 italic font-sans">// 이전 상태 없음 (신규 생성)</span>}
                      </pre>
                    </div>

                    {/* After State (Bottom) */}
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-sm">
                      <div className="px-4 py-2 bg-emerald-950/30 border-b border-emerald-900/40 flex items-center justify-between text-xs text-emerald-300 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5 text-emerald-400" /> 2단계: 변경 후 상태 (after_state)
                        </span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(selectedRecord.after_state, null, 2), 'after')}
                          className="hover:text-emerald-100 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === 'after' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} 복사
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto custom-scrollbar max-h-72">
                        {selectedRecord.after_state 
                          ? JSON.stringify(maskSensitiveValues(selectedRecord.after_state), null, 2)
                          : <span className="text-gray-500 italic font-sans">// 이후 상태 없음 (레코드 삭제)</span>}
                      </pre>
                    </div>
                  </div>
                ) : diffViewMode === 'SIDE_BY_SIDE' ? (
                  /* Side-by-Side View */
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Before State */}
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-red-950/30 border-b border-red-900/40 flex items-center justify-between text-xs text-red-300 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Minus className="w-3.5 h-3.5" /> 변경 전 상태 (before_state)
                        </span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(selectedRecord.before_state, null, 2), 'before')}
                          className="hover:text-red-100 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === 'before' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} 복사
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto custom-scrollbar max-h-96">
                        {selectedRecord.before_state 
                          ? JSON.stringify(maskSensitiveValues(selectedRecord.before_state), null, 2)
                          : <span className="text-gray-500 italic font-sans">// 이전 상태 없음 (신규 생성)</span>}
                      </pre>
                    </div>

                    {/* After State */}
                    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                      <div className="px-4 py-2 bg-emerald-950/30 border-b border-emerald-900/40 flex items-center justify-between text-xs text-emerald-300 font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Plus className="w-3.5 h-3.5" /> 변경 후 상태 (after_state)
                        </span>
                        <button
                          onClick={() => handleCopy(JSON.stringify(selectedRecord.after_state, null, 2), 'after')}
                          className="hover:text-emerald-100 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === 'after' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} 복사
                        </button>
                      </div>
                      <pre className="p-4 text-xs font-mono text-gray-300 overflow-x-auto custom-scrollbar max-h-96">
                        {selectedRecord.after_state 
                          ? JSON.stringify(maskSensitiveValues(selectedRecord.after_state), null, 2)
                          : <span className="text-gray-500 italic font-sans">// 이후 상태 없음 (레코드 삭제)</span>}
                      </pre>
                    </div>
                  </div>
                ) : (
                  /* Unified Diff View */
                  <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
                    <div className="px-4 py-2 bg-[#21262d] border-b border-[#30363d] flex items-center justify-between text-xs text-gray-300 font-semibold">
                      <span>단일 통합 Diff 리스트 (Unified Line Diff)</span>
                      <button
                        onClick={() => handleCopy(JSON.stringify({ before: selectedRecord.before_state, after: selectedRecord.after_state }, null, 2), 'unified')}
                        className="hover:text-gray-100 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedId === 'unified' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />} 전체 복사
                      </button>
                    </div>
                    <div className="p-4 font-mono text-xs space-y-1 overflow-x-auto custom-scrollbar max-h-96">
                      {selectedRecord.diff_summary?.modified_keys.map(key => {
                        const beforeVal = selectedRecord.before_state ? selectedRecord.before_state[key] : undefined;
                        const afterVal = selectedRecord.after_state ? selectedRecord.after_state[key] : undefined;
                        return (
                          <div key={key} className="p-2 rounded bg-[#0d1117] border border-[#30363d] space-y-1">
                            <span className="text-amber-400 font-bold block">~ [{key}]</span>
                            <div className="text-red-400 bg-red-950/20 px-2 py-0.5 rounded">
                              - {JSON.stringify(beforeVal)}
                            </div>
                            <div className="text-emerald-400 bg-emerald-950/20 px-2 py-0.5 rounded">
                              + {JSON.stringify(afterVal)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* L3: Fixed Footer */}
            <div className="px-6 py-3 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between shrink-0">
              <div className="text-xs text-gray-400 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>ISO-27001 & SOC-2 거버넌스 감사 규정 준수 검증 완료</span>
              </div>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-[#21262d] hover:bg-[#30363d] text-gray-200 border border-[#30363d] rounded-lg transition-colors cursor-pointer"
              >
                닫기 (Close)
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
