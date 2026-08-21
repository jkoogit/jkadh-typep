import React, { useEffect, useState } from 'react';
import {
  Database,
  Terminal,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  ShieldCheck,
  Zap,
  Globe,
  Settings,
  Layers,
  Sparkles,
  History,
  GitBranch,
  CheckCheck,
  HelpCircle,
  Plus,
  ChevronDown,
  Filter,
  Check,
} from 'lucide-react';
import { DatabaseTableMeta } from '../types';
import { api } from '../services/api';
import { SchemaVersionManagerModal } from './SchemaVersionManagerModal';
import { TableRecordCrudModal } from './TableRecordCrudModal';

export type TableGroupKey = 'ALL' | 'HARNESS_GOV' | 'CORE_OPS' | 'META_INFRA';

export interface TableGroupInfo {
  group: 'HARNESS_GOV' | 'CORE_OPS' | 'META_INFRA';
  groupLabel: string;
  groupShort: string;
  badgeClass: string;
  dotColor: string;
  description: string;
}

export const TABLE_GROUPS_META: Record<string, TableGroupInfo> = {
  harness_sessions: {
    group: 'HARNESS_GOV',
    groupLabel: '하네스 거버넌스',
    groupShort: '거버넌스',
    badgeClass: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
    dotColor: 'bg-purple-400',
    description: '작업 세션 상태 및 진행 제어',
  },
  task_nodes: {
    group: 'HARNESS_GOV',
    groupLabel: '하네스 거버넌스',
    groupShort: '거버넌스',
    badgeClass: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
    dotColor: 'bg-purple-400',
    description: 'WBS 노드 및 페이즈 게이트 정의',
  },
  task_execution_loops: {
    group: 'HARNESS_GOV',
    groupLabel: '하네스 거버넌스',
    groupShort: '거버넌스',
    badgeClass: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
    dotColor: 'bg-purple-400',
    description: 'P1~P7 프롬프트 실행 루프 및 추론 로그',
  },
  phase_gate_logs: {
    group: 'HARNESS_GOV',
    groupLabel: '하네스 거버넌스',
    groupShort: '거버넌스',
    badgeClass: 'bg-purple-950/60 border-purple-500/40 text-purple-300',
    dotColor: 'bg-purple-400',
    description: '품질 게이트 검증 및 통과 판정 이력',
  },
  ai_accounts: {
    group: 'CORE_OPS',
    groupLabel: 'AI 계정 및 운영',
    groupShort: '계정/운영',
    badgeClass: 'bg-blue-950/60 border-blue-500/40 text-blue-300',
    dotColor: 'bg-blue-400',
    description: 'Google AI Studio, OpenAI, Anthropic 계정 풀',
  },
  team_members: {
    group: 'CORE_OPS',
    groupLabel: 'AI 계정 및 운영',
    groupShort: '계정/운영',
    badgeClass: 'bg-blue-950/60 border-blue-500/40 text-blue-300',
    dotColor: 'bg-blue-400',
    description: '시스템 사용자 및 개발자 역할 권한',
  },
  execution_metrics: {
    group: 'CORE_OPS',
    groupLabel: 'AI 계정 및 운영',
    groupShort: '계정/운영',
    badgeClass: 'bg-blue-950/60 border-blue-500/40 text-blue-300',
    dotColor: 'bg-blue-400',
    description: '모델별 레이턴시, 토큰 소모량, 성공률 통계',
  },
  schema_migrations: {
    group: 'META_INFRA',
    groupLabel: '메타 인프라',
    groupShort: '메타',
    badgeClass: 'bg-zinc-800/80 border-zinc-600/50 text-zinc-300',
    dotColor: 'bg-zinc-400',
    description: 'Flyway/Liquibase 표준 스키마 버전 마이그레이션 메타',
  },
};

interface DevDatabaseExplorerViewProps {
  tables: DatabaseTableMeta[];
  databaseName: string;
  onRunQuery: (query: string, database?: string) => Promise<any>;
  onNavigateToAuditTrail?: (tableName?: string) => void;
}

export const DevDatabaseExplorerView: React.FC<DevDatabaseExplorerViewProps> = ({
  tables: initialTables,
  databaseName: initialDbName,
  onRunQuery,
  onNavigateToAuditTrail,
}) => {
  const [targetDb, setTargetDb] = useState<string>(initialDbName || 'jkadhp_dev');
  const [tables, setTables] = useState<DatabaseTableMeta[]>(initialTables);
  const [selectedTableName, setSelectedTableName] = useState<string>(initialTables[0]?.tableName || 'ai_accounts');
  const [sqlInput, setSqlInput] = useState<string>('SELECT current_database(), version(), NOW();');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  // Granular migration state
  const [isInitializingSchema, setIsInitializingSchema] = useState(false);
  const [syncingTableName, setSyncingTableName] = useState<string | null>(null);
  const [syncingGroupName, setSyncingGroupName] = useState<string | null>(null);
  const [activeGroupFilter, setActiveGroupFilter] = useState<TableGroupKey>('ALL');
  const [isGroupDropdownOpen, setIsGroupDropdownOpen] = useState(false);

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isCrudModalOpen, setIsCrudModalOpen] = useState(false);
  const [syncNotice, setSyncNotice] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    scope?: string;
    details?: string[];
  } | null>(null);

  // Schema diff check state
  const [currentDbVersion, setCurrentDbVersion] = useState<string | null>('v2.2.0');
  const [targetVersion, setTargetVersion] = useState<string>('v2.2.0');
  const [appliedMigrations, setAppliedMigrations] = useState<any[]>([]);
  const [pendingMigrations, setPendingMigrations] = useState<string[]>([]);
  const [isUpToDate, setIsUpToDate] = useState<boolean>(true);
  const [isCheckingSchema, setIsCheckingSchema] = useState<boolean>(false);

  // Bridge Config & Connection State
  const [bridgeUrl, setBridgeUrl] = useState<string>('');
  const [bridgeSecret, setBridgeSecret] = useState<string>('jkadh-secure-secret-token-2026');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [connStatus, setConnStatus] = useState<'CONNECTED' | 'ERROR' | 'UNCONFIGURED' | 'TESTING'>('UNCONFIGURED');
  const [connMessage, setConnMessage] = useState<string | null>(null);
  const [connDiagnostics, setConnDiagnostics] = useState<any>(null);
  const [latency, setLatency] = useState<number>(0);

  // Fetch initial bridge configuration from server
  useEffect(() => {
    async function loadBridgeConfig() {
      try {
        const res = await api.getRemoteDbConfig();
        if (res?.success && res.config) {
          setBridgeUrl(res.config.url || '');
          if (res.config.targetDatabase) {
            setTargetDb(res.config.targetDatabase);
          }
          if (res.config.lastStatus) {
            setConnStatus(res.config.lastStatus);
            setLatency(res.config.lastLatencyMs || 0);
            if (res.config.lastError) {
              setConnMessage(res.config.lastError);
            }
          }
          // If URL is configured, auto-run connection test
          if (res.config.url) {
            testConnection(res.config.url, bridgeSecret, res.config.targetDatabase || targetDb);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch remote DB config:', e);
      }
    }
    loadBridgeConfig();
  }, []);

  const runSchemaCheck = async (dbName?: string) => {
    setIsCheckingSchema(true);
    try {
      const res = await api.checkRemoteDbSchema(dbName || targetDb);
      if (res?.success) {
        setCurrentDbVersion(res.currentDbVersion);
        setTargetVersion(res.targetVersion || 'v2.2.0');
        setIsUpToDate(res.isUpToDate);
        setAppliedMigrations(res.appliedMigrations || []);
        setPendingMigrations(res.pendingMigrations || []);
      }
    } catch (e) {
      console.warn('Schema check error:', e);
    } finally {
      setIsCheckingSchema(false);
    }
  };

  const testConnection = async (urlToTest?: string, secretToTest?: string, dbToTest?: string) => {
    setConnStatus('TESTING');
    setConnMessage('우분투 DB 게이트웨이에 보안 터널로 접속 테스트 중...');
    try {
      const res = await api.testRemoteDbConnection({
        url: urlToTest ?? bridgeUrl,
        secret: secretToTest ?? bridgeSecret,
        targetDatabase: dbToTest ?? targetDb,
      });

      if (res?.success) {
        setConnStatus('CONNECTED');
        setLatency(res.latencyMs || 0);
        setConnDiagnostics(res.diagnostics);
        setConnMessage(res.message);
        // Refresh tables & check schema diff
        const tableRes = await api.getDbTables(dbToTest ?? targetDb);
        if (tableRes?.success && tableRes.data) {
          setTables(tableRes.data);
        }
        await runSchemaCheck(dbToTest ?? targetDb);
      } else {
        setConnStatus('ERROR');
        setConnMessage(res?.message || '연결 실패');
      }
    } catch (err: any) {
      setConnStatus('ERROR');
      setConnMessage(err?.message || '네트워크 오류가 발생했습니다.');
    }
  };

  const handleSaveConfig = async () => {
    try {
      await api.updateRemoteDbConfig({
        url: bridgeUrl,
        secret: bridgeSecret,
        targetDatabase: targetDb,
      });
      setIsConfigOpen(false);
      setSyncNotice({
        type: 'info',
        message: `브릿지 설정이 저장되었습니다. PostgreSQL [${targetDb}] 연결 테스트를 진행합니다...`,
      });
      await testConnection(bridgeUrl, bridgeSecret, targetDb);
    } catch (e: any) {
      setSyncNotice({
        type: 'error',
        message: `설정 저장 오류: ${e.message}`,
      });
    }
  };

  /**
   * Granular Schema Migration Handler
   * - scope: 'ALL' (전체 8개 테이블)
   * - scope: 'GROUP' (지정 그룹: HARNESS_GOV, CORE_OPS, META_INFRA)
   * - scope: 'TABLE' (지정 단일 테이블)
   */
  const handleInitSchema = async (
    scope: 'ALL' | 'GROUP' | 'TABLE' = 'ALL',
    target?: { tableName?: string; group?: 'HARNESS_GOV' | 'CORE_OPS' | 'META_INFRA' },
    targetVer: string = 'v2.2.0'
  ) => {
    const groupNameMap: Record<string, string> = {
      HARNESS_GOV: '하네스 거버넌스(4개)',
      CORE_OPS: 'AI 계정 및 운영(3개)',
      META_INFRA: '메타 인프라(1개)',
    };

    let targetLabel = '전체 스키마(8개 테이블)';
    if (scope === 'TABLE' && target?.tableName) {
      targetLabel = `개별 테이블 [${target.tableName}]`;
      setSyncingTableName(target.tableName);
    } else if (scope === 'GROUP' && target?.group) {
      targetLabel = `그룹 [${groupNameMap[target.group] || target.group}]`;
      setSyncingGroupName(target.group);
    } else {
      setIsInitializingSchema(true);
    }

    setSyncNotice({
      type: 'info',
      scope: `${scope}${target?.tableName ? `:${target.tableName}` : target?.group ? `:${target.group}` : ''}`,
      message: `우분투 PostgreSQL [${targetDb}]에 ${targetLabel} 최신 버전(${targetVer}) 스키마 마이그레이션(DDL/DML)을 실행 중입니다...`,
    });

    try {
      const res = await api.initRemoteDbSchema({
        database: targetDb,
        scope,
        targetTable: target?.tableName,
        targetGroup: target?.group,
        targetVersion: targetVer,
      });

      if (res?.success) {
        setSyncNotice({
          type: 'success',
          scope: `${scope}${target?.tableName ? `:${target.tableName}` : target?.group ? `:${target.group}` : ''}`,
          message: res.message || `성공: PostgreSQL [${targetDb}]에 ${targetLabel} 현행화가 완료되었습니다! (버전: ${targetVer})`,
          details: res.result?.statementLogs,
        });

        // Run test query to see table content
        const targetTableToSelect =
          target?.tableName ||
          (scope === 'GROUP' && target?.group === 'HARNESS_GOV'
            ? 'task_nodes'
            : scope === 'GROUP' && target?.group === 'META_INFRA'
            ? 'schema_migrations'
            : 'ai_accounts');

        setSelectedTableName(targetTableToSelect);
        setSqlInput(`SELECT * FROM ${targetTableToSelect} LIMIT 10;`);
        const queryRes = await onRunQuery(`SELECT * FROM ${targetTableToSelect} LIMIT 10;`, targetDb);
        setQueryResult(queryRes);

        // Reload tables & re-run schema check
        const tableRes = await api.getDbTables(targetDb);
        if (tableRes?.success && tableRes.data) {
          setTables(tableRes.data);
        }
        await runSchemaCheck(targetDb);
      } else {
        setSyncNotice({
          type: 'error',
          scope: `${scope}`,
          message: `스키마 현행화 실패: ${res?.error || '알 수 없는 오류가 발생했습니다.'}`,
        });
      }
    } catch (err: any) {
      setSyncNotice({
        type: 'error',
        scope: `${scope}`,
        message: `오류 발생: ${err.message}`,
      });
    } finally {
      setIsInitializingSchema(false);
      setSyncingTableName(null);
      setSyncingGroupName(null);
      setIsGroupDropdownOpen(false);
    }
  };

  const selectedTable = tables.find((t) => t.tableName === selectedTableName) || tables[0];
  const selectedTableGroup = selectedTable ? TABLE_GROUPS_META[selectedTable.tableName] : null;

  const handleExecute = async () => {
    setIsRunning(true);
    try {
      const res = await onRunQuery(sqlInput, targetDb);
      setQueryResult(res);
    } catch (e: any) {
      setQueryResult({
        success: false,
        error: e.message || 'Execution error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handlePreset = (query: string) => {
    setSqlInput(query);
  };

  // Filter tables by active group tab
  const filteredTables = tables.filter((t) => {
    if (activeGroupFilter === 'ALL') return true;
    const meta = TABLE_GROUPS_META[t.tableName];
    return meta?.group === activeGroupFilter;
  });

  const isAnySyncing = isInitializingSchema || !!syncingTableName || !!syncingGroupName;

  return (
    <div className="space-y-4">
      {/* 1. Remote Gateway Connection Status Banner (상하 열거 레이아웃) */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3.5 shadow-xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              {connStatus === 'CONNECTED' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  connStatus === 'CONNECTED'
                    ? 'bg-emerald-500'
                    : connStatus === 'TESTING'
                    ? 'bg-amber-400 animate-pulse'
                    : connStatus === 'ERROR'
                    ? 'bg-rose-500'
                    : 'bg-zinc-500'
                }`}
              ></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#8B949E] flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              우분투 홈 서버 PostgreSQL 연동 상태:
            </span>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded font-mono ${
                connStatus === 'CONNECTED'
                  ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-400'
                  : connStatus === 'TESTING'
                  ? 'bg-amber-950/40 border border-amber-500/40 text-amber-300'
                  : connStatus === 'ERROR'
                  ? 'bg-rose-950/40 border border-rose-500/40 text-rose-400'
                  : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
              }`}
            >
              {connStatus === 'CONNECTED'
                ? `ONLINE (Live Bridge / ${latency}ms)`
                : connStatus === 'TESTING'
                ? '연결 확인 중...'
                : connStatus === 'ERROR'
                ? '연결 오류 (Error)'
                : '미설정 (In-Memory Baseline)'}
            </span>
          </div>

          <p className="text-xs text-[#8B949E]">
            {connStatus === 'CONNECTED' ? (
              <span className="text-emerald-300/90 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Cloudflare 제로트러스트 보안 터널을 통해 우분투 로컬 PostgreSQL (포트 5432)에 실시간 연결되었습니다.
              </span>
            ) : connStatus === 'ERROR' ? (
              <span className="text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {connMessage || '우분투 서버의 cloudflared 터널 상태 및 server.js 가동 여부를 확인해 주세요.'}
              </span>
            ) : (
              <span>로컬 브라우저 세션 모드로 동작 중입니다. 우분투 PostgreSQL 연동 시 실시간 데이터가 저장됩니다.</span>
            )}
          </p>
        </div>

        {/* Action Controls & Granular Sync Action Buttons (하단 배치) */}
        <div className="pt-2 border-t border-[#30363D]/70 flex flex-wrap items-center gap-2">
          <button
            onClick={() => testConnection()}
            disabled={connStatus === 'TESTING'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-semibold text-[#E6EDF3] transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${connStatus === 'TESTING' ? 'animate-spin text-amber-400' : 'text-blue-400'}`} />
            <span>연결 테스트</span>
          </button>

          {/* Schema Version History & Migration Modal Button */}
          <button
            onClick={() => setIsVersionModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/40 text-xs font-semibold text-purple-300 transition cursor-pointer"
          >
            <History className="w-3.5 h-3.5 text-purple-400" />
            <span>변경이력 & 스키마 관리</span>
          </button>

          {/* Granular Migration Dropdown / Buttons */}
          <div className="relative">
            <div className="inline-flex rounded-lg shadow-sm">
              {/* Primary 1-Click ALL Migration Button */}
              <button
                onClick={() => handleInitSchema('ALL')}
                disabled={isAnySyncing || connStatus !== 'CONNECTED'}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-l-lg bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition cursor-pointer disabled:opacity-40"
                title="전체 8개 테이블 스키마 DDL 및 감사 컬럼/코멘트를 원자적으로 현행화합니다."
              >
                <Sparkles className={`w-3.5 h-3.5 text-emerald-400 ${isInitializingSchema ? 'animate-spin' : ''}`} />
                <span>{isInitializingSchema ? '전체 현행화 중...' : '전체 현행화 (ALL)'}</span>
              </button>

              {/* Dropdown Toggle for Group Selection */}
              <button
                onClick={() => setIsGroupDropdownOpen(!isGroupDropdownOpen)}
                disabled={isAnySyncing || connStatus !== 'CONNECTED'}
                className="px-2 py-1.5 rounded-r-lg bg-emerald-950/60 hover:bg-emerald-900/80 border-t border-r border-b border-emerald-500/40 border-l border-emerald-500/20 text-emerald-300 text-xs transition cursor-pointer disabled:opacity-40"
                title="그룹별 / 개별 스키마 현행화 선택"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Dropdown Menu for Group Sync */}
            {isGroupDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 rounded-xl bg-[#161B22] border border-[#30363D] shadow-2xl z-30 p-1.5 space-y-1 animate-fadeIn">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7D8590] border-b border-[#30363D]">
                  마이그레이션 범위 선택
                </div>

                <button
                  onClick={() => handleInitSchema('ALL')}
                  disabled={isAnySyncing}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#21262D] text-xs text-[#E6EDF3] flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>전체 8개 테이블 (ALL)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">8개</span>
                </button>

                <div className="h-px bg-[#30363D] my-1" />

                <button
                  onClick={() => handleInitSchema('GROUP', { group: 'HARNESS_GOV' })}
                  disabled={isAnySyncing}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-purple-950/40 text-xs text-purple-300 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-400 shrink-0"></span>
                    <span>하네스 거버넌스 그룹</span>
                  </div>
                  <span className="text-[10px] font-mono text-purple-400">4개 테이블</span>
                </button>

                <button
                  onClick={() => handleInitSchema('GROUP', { group: 'CORE_OPS' })}
                  disabled={isAnySyncing}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-950/40 text-xs text-blue-300 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0"></span>
                    <span>AI 계정 및 운영 그룹</span>
                  </div>
                  <span className="text-[10px] font-mono text-blue-400">3개 테이블</span>
                </button>

                <button
                  onClick={() => handleInitSchema('GROUP', { group: 'META_INFRA' })}
                  disabled={isAnySyncing}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-800/60 text-xs text-zinc-300 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0"></span>
                    <span>메타 인프라 그룹</span>
                  </div>
                  <span className="text-[10px] font-mono text-zinc-400">1개 테이블</span>
                </button>
              </div>
            )}
          </div>

          {/* Bridge URL Settings Button */}
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-xs font-semibold text-blue-300 transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span>터널 설정</span>
          </button>
        </div>
      </div>

      {/* Live Sync Notice Feedback Banner with Scope Indicator */}
      {syncNotice && (
        <div
          className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs animate-fadeIn ${
            syncNotice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
              : syncNotice.type === 'error'
              ? 'bg-rose-950/40 border-rose-500/50 text-rose-300'
              : 'bg-blue-950/40 border-blue-500/50 text-blue-300'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {syncNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : syncNotice.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            ) : (
              <RefreshCw className="w-4 h-4 text-blue-400 shrink-0 animate-spin mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold">{syncNotice.message}</p>
                {syncNotice.scope && (
                  <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-black/50 border border-current">
                    Scope: {syncNotice.scope}
                  </span>
                )}
              </div>
              {syncNotice.details && syncNotice.details.length > 0 && (
                <div className="mt-1.5 p-2 rounded bg-black/40 font-mono text-[11px] text-[#8B949E] max-h-32 overflow-y-auto space-y-0.5 border border-white/5">
                  {syncNotice.details.map((d, idx) => (
                    <div key={idx}>{d}</div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setSyncNotice(null)}
            className="text-[#7D8590] hover:text-[#E6EDF3] text-xs shrink-0 cursor-pointer font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Schema Drift & Version Synchronized Banner */}
      <div
        className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs ${
          isUpToDate
            ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/25 border-amber-500/40 text-amber-200'
        }`}
      >
        <div className="flex items-center gap-2.5">
          {isUpToDate ? (
            <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold">
                {isUpToDate
                  ? `스키마 버전 관리 상태: [${currentDbVersion || targetVersion} 최신 베이스라인 일치]`
                  : `마이그레이션 적용 대상 감지: [DB: ${currentDbVersion || 'UNINITIALIZED'} ➔ 목표: ${targetVersion}]`}
              </span>
              <span className="px-1.5 py-0.2 rounded font-mono text-[10px] bg-black/40 border border-current">
                schema_migrations Meta Table
              </span>
            </div>
            <p className="text-[11px] opacity-80 mt-0.5">
              {isUpToDate
                ? `PostgreSQL [${targetDb}] 메타 테이블에 v2.2.0 DDL 및 3대 공급자 데이터 마이그레이션(DML)이 정상 기록되어 있습니다.`
                : `원격 DB에 누락된 버전(${pendingMigrations.join(', ') || targetVersion})이 있습니다. [개별 / 그룹 / 전체 현행화]를 실행할 수 있습니다.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => runSchemaCheck()}
            disabled={isCheckingSchema}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-[#E6EDF3] text-xs font-mono cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isCheckingSchema ? 'animate-spin' : ''}`} />
            <span>재검사</span>
          </button>
          {!isUpToDate && (
            <button
              onClick={() => handleInitSchema('ALL')}
              disabled={isAnySyncing}
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer"
            >
              {isInitializingSchema ? '마이그레이션 중...' : '원자적 전체 현행화'}
            </button>
          )}
        </div>
      </div>

      {/* 3. Collapsible Bridge Configuration Panel */}
      {isConfigOpen && (
        <div className="p-4 rounded-xl bg-[#161B22] border border-blue-500/30 space-y-3 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase">
              <Globe className="w-4 h-4" />
              <span>우분투 DB 브릿지 게이트웨이 설정 (Cloudflare Zero-Trust Tunnel)</span>
            </div>
            <button
              onClick={() => setIsConfigOpen(false)}
              className="text-[#7D8590] hover:text-[#E6EDF3] text-xs cursor-pointer"
            >
              ✕ 닫기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#8B949E]">우분투 Cloudflare 터널 URL</label>
              <input
                type="text"
                value={bridgeUrl}
                onChange={(e) => setBridgeUrl(e.target.value)}
                placeholder="https://db-bridge.your-domain.com"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#8B949E]">보안 토큰 (Bearer Token)</label>
              <input
                type="password"
                value={bridgeSecret}
                onChange={(e) => setBridgeSecret(e.target.value)}
                placeholder="보안 토큰 입력"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-[#8B949E]">연동 대상 데이터베이스</label>
              <input
                type="text"
                value={targetDb}
                onChange={(e) => setTargetDb(e.target.value)}
                placeholder="jkadhp_dev"
                className="w-full px-2.5 py-1.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] text-xs font-mono focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={handleSaveConfig}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>설정 저장 및 즉시 연결</span>
            </button>
          </div>
        </div>
      )}

      {/* 4. Main Tables & Schema Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Table List with Scope Tabs & Granular Controls */}
        <div className="lg:col-span-1 space-y-2">
          {/* Header & Group Filter Tabs */}
          <div className="space-y-2 px-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#7D8590]">
                  {targetDb} 테이블 관리
                </h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/90">
                {connStatus === 'CONNECTED' ? '● Live Remote DB' : '○ Local Mock'}
              </span>
            </div>

            {/* Scope Filter Tabs: ALL, HARNESS_GOV, CORE_OPS, META_INFRA */}
            <div className="flex flex-wrap gap-1 p-1 rounded-lg bg-[#0D1117] border border-[#30363D]">
              <button
                onClick={() => setActiveGroupFilter('ALL')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeGroupFilter === 'ALL'
                    ? 'bg-[#21262D] text-[#E6EDF3] shadow-xs'
                    : 'text-[#8B949E] hover:text-[#E6EDF3]'
                }`}
              >
                <span>전체 ({tables.length})</span>
              </button>

              <button
                onClick={() => setActiveGroupFilter('HARNESS_GOV')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeGroupFilter === 'HARNESS_GOV'
                    ? 'bg-purple-950/70 border border-purple-500/50 text-purple-300 shadow-xs'
                    : 'text-purple-400/70 hover:text-purple-300'
                }`}
                title="하네스 거버넌스 그룹 (harness_sessions, task_nodes, task_execution_loops, phase_gate_logs)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                <span>하네스 (4)</span>
              </button>

              <button
                onClick={() => setActiveGroupFilter('CORE_OPS')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeGroupFilter === 'CORE_OPS'
                    ? 'bg-blue-950/70 border border-blue-500/50 text-blue-300 shadow-xs'
                    : 'text-blue-400/70 hover:text-blue-300'
                }`}
                title="AI 계정 및 운영 그룹 (ai_accounts, team_members, execution_metrics)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                <span>계정/운영 (3)</span>
              </button>

              <button
                onClick={() => setActiveGroupFilter('META_INFRA')}
                className={`px-2 py-1 rounded text-[10px] font-bold transition cursor-pointer flex items-center gap-1 ${
                  activeGroupFilter === 'META_INFRA'
                    ? 'bg-zinc-800 border border-zinc-600 text-zinc-200 shadow-xs'
                    : 'text-zinc-400 hover:text-zinc-300'
                }`}
                title="메타 인프라 그룹 (schema_migrations)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
                <span>메타 (1)</span>
              </button>
            </div>

            {/* If a specific group is filtered, provide a dedicated Group Sync button */}
            {activeGroupFilter !== 'ALL' && (
              <div className="flex items-center justify-between px-1 py-1 rounded bg-[#161B22] border border-[#30363D] text-xs">
                <span className="text-[11px] text-[#8B949E] flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeGroupFilter === 'HARNESS_GOV'
                        ? 'bg-purple-400'
                        : activeGroupFilter === 'CORE_OPS'
                        ? 'bg-blue-400'
                        : 'bg-zinc-400'
                    }`}
                  ></span>
                  <span>
                    {activeGroupFilter === 'HARNESS_GOV'
                      ? '하네스 거버넌스 그룹'
                      : activeGroupFilter === 'CORE_OPS'
                      ? 'AI 계정/운영 그룹'
                      : '메타 인프라 그룹'}
                  </span>
                </span>

                <button
                  onClick={() => handleInitSchema('GROUP', { group: activeGroupFilter })}
                  disabled={isAnySyncing || connStatus !== 'CONNECTED'}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer disabled:opacity-40 ${
                    syncingGroupName === activeGroupFilter
                      ? 'bg-amber-500 text-black'
                      : 'bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300'
                  }`}
                  title={`[${activeGroupFilter}] 그룹에 속한 테이블만 선별 현행화합니다.`}
                >
                  <Sparkles className={`w-3 h-3 ${syncingGroupName === activeGroupFilter ? 'animate-spin text-black' : 'text-emerald-400'}`} />
                  <span>{syncingGroupName === activeGroupFilter ? '그룹 현행화 진행중...' : '이 그룹만 현행화'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Tables Cards List */}
          <div className="space-y-1.5">
            {filteredTables.map((table) => {
              const isSelected = table.tableName === selectedTableName;
              const isTableOutdated = table.detectedVersion && table.detectedVersion !== targetVersion;
              const isThisCardSyncing = syncingTableName === table.tableName;
              const meta = TABLE_GROUPS_META[table.tableName];

              return (
                <div
                  key={table.tableName}
                  className={`group relative rounded-lg transition-all border ${
                    isSelected
                      ? 'bg-[#21262D] border-emerald-500/70 shadow-sm text-[#E6EDF3] ring-1 ring-emerald-500/30'
                      : 'bg-[#161B22] border-[#30363D] text-[#8B949E] hover:bg-[#21262D]/60 hover:border-[#484F58]'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedTableName(table.tableName);
                      setSqlInput(`SELECT * FROM ${table.tableName} LIMIT 10;`);
                    }}
                    className="w-full text-left p-3 cursor-pointer"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-emerald-400">{table.tableName}</span>
                        {meta && (
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-medium border ${meta.badgeClass}`}>
                            {meta.groupShort}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`px-1.5 py-0.2 rounded font-mono text-[9px] ${
                            isTableOutdated
                              ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300'
                              : 'bg-blue-950/60 border border-blue-500/30 text-blue-300'
                          }`}
                        >
                          {table.detectedVersion || 'v2.2.0'}
                        </span>
                        <span className="text-[10px] text-[#7D8590] font-mono">{table.rowCount} rows</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-[#7D8590] line-clamp-2 leading-relaxed">{table.description}</p>
                  </button>

                  {/* Individual Table Quick Sync Action Button (TABLE Scope) */}
                  <div className="px-3 pb-2 pt-0 flex items-center justify-between border-t border-[#30363D]/40 mt-1 pt-1.5">
                    <span className="text-[10px] font-mono text-[#7D8590]">
                      {table.columns.length} cols / {table.sizeKb} KB
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInitSchema('TABLE', { tableName: table.tableName });
                      }}
                      disabled={isAnySyncing || connStatus !== 'CONNECTED'}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold transition cursor-pointer disabled:opacity-40 ${
                        isThisCardSyncing
                          ? 'bg-amber-500 text-black border border-amber-400 font-bold'
                          : 'bg-[#0D1117] hover:bg-[#30363D] border border-[#30363D] text-[#C9D1D9] hover:text-emerald-300'
                      }`}
                      title={`[TABLE: ${table.tableName}] 단독 DDL 생성 및 6대 감사 컬럼/코멘트 현행화`}
                    >
                      <RefreshCw
                        className={`w-2.5 h-2.5 ${
                          isThisCardSyncing ? 'animate-spin text-black' : 'text-emerald-400'
                        }`}
                      />
                      <span>{isThisCardSyncing ? '단독 현행화중...' : '단독 현행화'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Table Schema, Comments & Columns */}
        {selectedTable && (
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#30363D] pb-2.5 gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      public.{selectedTable.tableName}
                    </span>

                    {selectedTableGroup && (
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] border ${selectedTableGroup.badgeClass}`}>
                        그룹: {selectedTableGroup.groupLabel}
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-semibold">
                      Version: {selectedTable.detectedVersion || 'v2.2.0'}
                    </span>
                  </div>
                  <h4 className="text-xs text-[#E6EDF3] mt-1 font-medium">{selectedTable.description}</h4>
                </div>

                {/* Scoped Actions on Selected Table */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {/* Table Single Sync Button */}
                  <button
                    onClick={() => handleInitSchema('TABLE', { tableName: selectedTable.tableName })}
                    disabled={isAnySyncing || connStatus !== 'CONNECTED'}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer disabled:opacity-40 ${
                      syncingTableName === selectedTable.tableName
                        ? 'bg-amber-500 text-black border border-amber-400 font-bold'
                        : 'bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300'
                    }`}
                    title={`[TABLE] ${selectedTable.tableName} 테이블만 단독으로 현행화합니다.`}
                  >
                    <RefreshCw
                      className={`w-3 h-3 ${
                        syncingTableName === selectedTable.tableName ? 'animate-spin text-black' : 'text-emerald-400'
                      }`}
                    />
                    <span>
                      {syncingTableName === selectedTable.tableName ? '단독 현행화중...' : '이 테이블 단독 현행화'}
                    </span>
                  </button>

                  {/* Group Sync Button for this table's group */}
                  {selectedTableGroup && (
                    <button
                      onClick={() => handleInitSchema('GROUP', { group: selectedTableGroup.group })}
                      disabled={isAnySyncing || connStatus !== 'CONNECTED'}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-semibold text-[#E6EDF3] transition cursor-pointer disabled:opacity-40"
                      title={`[GROUP] ${selectedTableGroup.groupLabel} 그룹 테이블 전체를 현행화합니다.`}
                    >
                      <Layers className="w-3 h-3 text-purple-400" />
                      <span>{selectedTableGroup.groupShort} 그룹 현행화</span>
                    </button>
                  )}

                  <button
                    onClick={() => setIsCrudModalOpen(true)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 hover:text-emerald-200 text-xs font-semibold transition cursor-pointer"
                    title="이 테이블에 새 레코드를 직접 추가합니다"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>새 레코드 추가</span>
                  </button>

                  {onNavigateToAuditTrail && (
                    <button
                      onClick={() => onNavigateToAuditTrail(selectedTable.tableName)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/40 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 hover:text-indigo-200 text-xs font-semibold transition cursor-pointer"
                      title="이 테이블의 변경이력 (JSON Diff)을 조회합니다"
                    >
                      <History className="w-3.5 h-3.5 text-indigo-400" />
                      <span>변경이력 조회</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Table Comment Metadata Banner */}
              {selectedTable.tableComment && (
                <div className="p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] flex items-center gap-2 text-xs">
                  <span className="text-[#7D8590] font-mono shrink-0">COMMENT ON TABLE:</span>
                  <code className="text-emerald-300/90 font-mono text-[11px] truncate">{selectedTable.tableComment}</code>
                </div>
              )}

              {/* Columns Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#30363D] bg-[#0D1117] text-[#7D8590] font-semibold font-mono text-[11px]">
                      <th className="py-2 px-3">Column Name</th>
                      <th className="py-2 px-3">Data Type</th>
                      <th className="py-2 px-3">Key / Nullable</th>
                      <th className="py-2 px-3">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363D] text-[#8B949E]">
                    {selectedTable.columns.map((col) => (
                      <tr key={col.name} className="hover:bg-[#21262D]/40">
                        <td className="py-2 px-3 font-mono font-semibold text-blue-300">{col.name}</td>
                        <td className="py-2 px-3 font-mono text-amber-300/90 text-[11px]">{col.type}</td>
                        <td className="py-2 px-3">
                          {col.isPrimary && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px] mr-1 font-bold">
                              PK
                            </span>
                          )}
                          <span className="text-[10px] text-[#7D8590] font-mono">
                            {col.isNullable ? 'NULL' : 'NOT NULL'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-[#7D8590] text-[11px]">{col.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. SQL Query Console & Live Execution Result */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs text-[#E6EDF3]">
              PostgreSQL 대화형 SQL 콘솔 (<span className="text-emerald-400 font-mono">{targetDb}</span>)
            </h3>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1 text-xs">
            <button
              onClick={() => handlePreset('SELECT current_database(), version(), NOW();')}
              className="px-2 py-0.5 rounded bg-[#0D1117] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] font-mono text-[10px] cursor-pointer"
            >
              PostgreSQL 버전 확인
            </button>
            <button
              onClick={() => handlePreset('SELECT * FROM ai_accounts;')}
              className="px-2 py-0.5 rounded bg-[#0D1117] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] font-mono text-[10px] cursor-pointer"
            >
              ai_accounts
            </button>
            <button
              onClick={() => handlePreset('SELECT * FROM task_nodes;')}
              className="px-2 py-0.5 rounded bg-[#0D1117] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] font-mono text-[10px] cursor-pointer"
            >
              task_nodes
            </button>
            <button
              onClick={() => handlePreset('SELECT * FROM harness_sessions;')}
              className="px-2 py-0.5 rounded bg-[#0D1117] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] font-mono text-[10px] cursor-pointer"
            >
              harness_sessions
            </button>
            <button
              onClick={() =>
                handlePreset(
                  "SELECT c.relname, pg_catalog.obj_description(c.oid, 'pg_class') as table_comment FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace WHERE n.nspname = 'public' AND c.relkind = 'r';"
                )
              }
              className="px-2 py-0.5 rounded bg-[#0D1117] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] font-mono text-[10px] cursor-pointer"
            >
              테이블 코멘트(버전) 조회
            </button>
          </div>
        </div>

        {/* Query Input Box */}
        <div className="space-y-2.5">
          <div className="relative">
            <textarea
              value={sqlInput}
              onChange={(e) => setSqlInput(e.target.value)}
              rows={3}
              className="w-full p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-emerald-300 font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              placeholder="SQL 쿼리를 입력하세요... (예: SELECT * FROM ai_accounts;)"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] text-[#7D8590] font-mono">
              대상 DB: <span className="text-blue-400 font-bold">{targetDb}</span> | 실행 모드:{' '}
              {connStatus === 'CONNECTED' ? (
                <span className="text-emerald-400 font-bold">⚡ 우분투 실서버 (Live Remote)</span>
              ) : (
                <span className="text-zinc-400">로컬 시뮬레이터 (Local Baseline)</span>
              )}
            </span>

            <button
              onClick={handleExecute}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isRunning ? '쿼리 전송 중...' : 'SQL 쿼리 실행 (Execute)'}</span>
            </button>
          </div>
        </div>

        {/* Query Execution Result */}
        {queryResult && (
          <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#7D8590] font-mono border-b border-[#30363D]/60 pb-1.5">
              <div className="flex items-center gap-2">
                <span className={queryResult.success !== false ? 'text-emerald-400' : 'text-rose-400'}>
                  {queryResult.success !== false ? '● 쿼리 실행 완료 (SUCCESS)' : '● 쿼리 실행 실패 (FAILED)'}
                </span>
                {queryResult.isRemote && (
                  <span className="px-1.5 py-0.2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[10px]">
                    우분투 실시간 DB
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {queryResult.rowCount !== undefined && <span>반환 행 수: {queryResult.rowCount} rows</span>}
                {queryResult.executionTimeMs !== undefined && <span>응답 시간: {queryResult.executionTimeMs}ms</span>}
              </div>
            </div>

            {queryResult.error ? (
              <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300 font-mono text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-rose-400">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>PostgreSQL 오류: {queryResult.error}</span>
                </div>
                {String(queryResult.error).includes('does not exist') && (
                  <div className="pt-2 border-t border-rose-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="text-[11px] text-[#E6EDF3] font-sans">
                      💡 원격 DB(<code>{targetDb}</code>)에 쿼리 대상 테이블이 아직 생성되지 않았습니다.
                    </span>
                    <div className="flex items-center gap-2">
                      {selectedTable && (
                        <button
                          onClick={() => handleInitSchema('TABLE', { tableName: selectedTable.tableName })}
                          disabled={isAnySyncing}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold font-sans cursor-pointer"
                        >
                          {isThisTableSyncing(selectedTable.tableName)
                            ? '생성 중...'
                            : `[TABLE: ${selectedTable.tableName}] 단독 생성`}
                        </button>
                      )}
                      <button
                        onClick={() => handleInitSchema('ALL')}
                        disabled={isAnySyncing}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold font-sans cursor-pointer"
                      >
                        {isInitializingSchema ? '생성 중...' : '전체 8개 테이블 자동 생성'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#30363D] bg-[#161B22] text-[#7D8590] font-mono text-[11px]">
                      {queryResult.columns?.map((col: string) => (
                        <th key={col} className="py-1.5 px-2.5">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363D] font-mono text-[#8B949E] text-[11px]">
                    {queryResult.rows?.map((row: any, i: number) => (
                      <tr key={i} className="hover:bg-[#161B22]/40">
                        {queryResult.columns?.map((col: string) => (
                          <td key={col} className="py-1.5 px-2.5 truncate max-w-xs text-[#E6EDF3]">
                            {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col] ?? 'NULL')}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Schema Version Manager Modal */}
      <SchemaVersionManagerModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        targetDatabase={targetDb}
        currentDbVersion={currentDbVersion}
        targetVersion={targetVersion}
        isUpToDate={isUpToDate}
        appliedMigrations={appliedMigrations}
        pendingMigrations={pendingMigrations}
        onApplyMigration={async (v) => {
          await handleInitSchema('ALL', undefined, v);
        }}
        isMigrating={isInitializingSchema}
      />

      {/* 7. Table Record CRUD / Insert Modal */}
      {isCrudModalOpen && selectedTable && (
        <TableRecordCrudModal
          table={selectedTable}
          targetDb={targetDb}
          onClose={() => setIsCrudModalOpen(false)}
          onExecuteSql={onRunQuery}
          onRefreshTableData={() => {
            setSqlInput(`SELECT * FROM ${selectedTable.tableName} ORDER BY 1 DESC LIMIT 20;`);
            handleExecute();
          }}
        />
      )}
    </div>
  );

  function isThisTableSyncing(tableName: string) {
    return syncingTableName === tableName;
  }
};
