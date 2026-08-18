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
} from 'lucide-react';
import { DatabaseTableMeta } from '../types';
import { api } from '../services/api';

interface DevDatabaseExplorerViewProps {
  tables: DatabaseTableMeta[];
  databaseName: string;
  onRunQuery: (query: string, database?: string) => Promise<any>;
}

export const DevDatabaseExplorerView: React.FC<DevDatabaseExplorerViewProps> = ({
  tables: initialTables,
  databaseName: initialDbName,
  onRunQuery,
}) => {
  const [targetDb, setTargetDb] = useState<string>(initialDbName || 'jkadhp_dev');
  const [tables, setTables] = useState<DatabaseTableMeta[]>(initialTables);
  const [selectedTableName, setSelectedTableName] = useState<string>(initialTables[0]?.tableName || 'ai_accounts');
  const [sqlInput, setSqlInput] = useState<string>('SELECT current_database(), version(), NOW();');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isInitializingSchema, setIsInitializingSchema] = useState(false);

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
        // Refresh tables
        const tableRes = await api.getDbTables(dbToTest ?? targetDb);
        if (tableRes?.success && tableRes.data) {
          setTables(tableRes.data);
        }
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
      await testConnection(bridgeUrl, bridgeSecret, targetDb);
    } catch (e: any) {
      alert('설정 저장 오류: ' + e.message);
    }
  };

  const handleInitSchema = async () => {
    if (!window.confirm(`우분투 PostgreSQL [${targetDb}]에 필수 테이블(ai_accounts, task_nodes, execution_metrics)을 생성 및 초기화하시겠습니까?`)) {
      return;
    }
    setIsInitializingSchema(true);
    try {
      const res = await api.initRemoteDbSchema(targetDb);
      if (res?.success) {
        alert(`성공: ${res.message}`);
        // Run test query to see accounts
        setSqlInput('SELECT * FROM ai_accounts;');
        const queryRes = await onRunQuery('SELECT * FROM ai_accounts;', targetDb);
        setQueryResult(queryRes);
        // Reload tables
        const tableRes = await api.getDbTables(targetDb);
        if (tableRes?.success && tableRes.data) {
          setTables(tableRes.data);
        }
      } else {
        alert('스키마 생성 실패: ' + res?.error);
      }
    } catch (err: any) {
      alert('오류: ' + err.message);
    } finally {
      setIsInitializingSchema(false);
    }
  };

  const selectedTable = tables.find((t) => t.tableName === selectedTableName) || tables[0];

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

  return (
    <div className="space-y-4">
      {/* 1. Remote Gateway Connection Status Banner */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
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
              <span>
                우분투 터미널에서 발급받은 <code className="text-blue-400 font-mono">https://*.trycloudflare.com</code> URL을 입력하여 연결하세요.
              </span>
            )}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Target DB Selector */}
          <div className="flex items-center gap-1 bg-[#0D1117] border border-[#30363D] px-2 py-1 rounded-lg text-xs">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[#7D8590] text-[11px]">DB:</span>
            <select
              value={targetDb}
              onChange={(e) => {
                const newDb = e.target.value;
                setTargetDb(newDb);
                testConnection(bridgeUrl, bridgeSecret, newDb);
              }}
              className="bg-transparent text-emerald-400 font-mono font-bold focus:outline-none cursor-pointer"
            >
              <option value="jkadhp_dev" className="bg-[#161B22] text-[#E6EDF3]">jkadhp_dev (DEV :35432 / devdbusr)</option>
              <option value="jkadh_dev" className="bg-[#161B22] text-[#E6EDF3]">jkadh_dev (DEV :35432 / devdbusr)</option>
              <option value="jkadh_stg" className="bg-[#161B22] text-[#E6EDF3]">jkadh_stg (STG :45432 / stgdbusr)</option>
              <option value="jkadh_prd" className="bg-[#161B22] text-[#E6EDF3]">jkadh_prd (PRD :55432 / prddbusr)</option>
            </select>
          </div>

          {/* Test Connection Button */}
          <button
            onClick={() => testConnection()}
            disabled={connStatus === 'TESTING'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] border border-[#30363D] text-xs font-semibold text-[#E6EDF3] transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${connStatus === 'TESTING' ? 'animate-spin text-amber-400' : 'text-blue-400'}`} />
            <span>연결 테스트 (Ping)</span>
          </button>

          {/* Init Schema Button */}
          <button
            onClick={handleInitSchema}
            disabled={isInitializingSchema || connStatus !== 'CONNECTED'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-xs font-semibold text-emerald-300 transition cursor-pointer disabled:opacity-40"
            title="우분투 PostgreSQL에 ai_accounts, task_nodes 등 필수 테이블을 생성합니다."
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{isInitializingSchema ? '동기화 중...' : '테이블 생성/동기화'}</span>
          </button>

          {/* Bridge URL Settings Button */}
          <button
            onClick={() => setIsConfigOpen(!isConfigOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/40 text-xs font-semibold text-blue-300 transition cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-blue-400" />
            <span>터널 URL 설정</span>
          </button>
        </div>
      </div>

      {/* 2. Collapsible Bridge Configuration Panel */}
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
              닫기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="space-y-1">
              <label className="text-[#8B949E] font-medium flex items-center gap-1">
                <span>Cloudflare Tunnel 엔드포인트 URL</span>
                <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={bridgeUrl}
                onChange={(e) => setBridgeUrl(e.target.value)}
                placeholder="https://example-name.trycloudflare.com"
                className="w-full px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-[#7D8590]">
                우분투에서 <code>cloudflared tunnel --url http://localhost:45432</code> 실행 시 출력된 주소
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[#8B949E] font-medium flex items-center gap-1">
                <span>보안 비밀키 (X-JKADH-SECRET 헤더)</span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              </label>
              <input
                type="password"
                value={bridgeSecret}
                onChange={(e) => setBridgeSecret(e.target.value)}
                placeholder="jkadh-secure-secret-token-2026"
                className="w-full px-3 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-[#E6EDF3] font-mono text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
              />
              <p className="text-[11px] text-[#7D8590]">
                우분투 <code>server.js</code>에 설정된 보안 인증 토큰
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-[#30363D]">
            <button
              onClick={() => setIsConfigOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#8B949E] text-xs font-semibold cursor-pointer"
            >
              취소
            </button>
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

      {/* 3. Main Tables & Schema Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Table List */}
        <div className="lg:col-span-1 space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#7D8590]">
              {targetDb} 스키마 테이블 ({tables.length}개)
            </h3>
            <span className="text-[10px] font-mono text-emerald-400/90">
              {connStatus === 'CONNECTED' ? '● Live Remote DB' : '○ Local Mock'}
            </span>
          </div>

          <div className="space-y-1.5">
            {tables.map((table) => {
              const isSelected = table.tableName === selectedTableName;
              return (
                <button
                  key={table.tableName}
                  onClick={() => {
                    setSelectedTableName(table.tableName);
                    setSqlInput(`SELECT * FROM ${table.tableName} LIMIT 10;`);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#21262D] border-emerald-500/70 shadow-sm text-[#E6EDF3] ring-1 ring-emerald-500/30'
                      : 'bg-[#161B22] border-[#30363D] text-[#8B949E] hover:bg-[#21262D]/60 hover:border-[#484F58]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-0.5">
                    <span className="font-mono font-bold text-emerald-400">{table.tableName}</span>
                    <span className="text-[10px] text-[#7D8590] font-mono">{table.rowCount} rows</span>
                  </div>
                  <p className="text-[11px] text-[#7D8590] line-clamp-2 leading-relaxed">{table.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Columns: Table Schema & Columns */}
        {selectedTable && (
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
              <div className="flex items-center justify-between border-b border-[#30363D] pb-2.5">
                <div>
                  <span className="text-[10px] text-[#7D8590] font-mono">public.{selectedTable.tableName}</span>
                  <h4 className="text-xs font-bold text-[#E6EDF3] mt-0.5">{selectedTable.description}</h4>
                </div>
                <span className="text-[10px] text-[#7D8590] font-mono">{selectedTable.sizeKb} KB</span>
              </div>

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

      {/* 4. SQL Query Console & Live Execution Result */}
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
              onClick={() => handlePreset("SELECT table_name FROM information_schema.tables WHERE table_schema='public';")}
              className="px-2 py-0.5 rounded bg-[#0D1117] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] font-mono text-[10px] cursor-pointer"
            >
              테이블 목록 조회
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

          <div className="flex items-center justify-between">
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
              <div className="p-2 rounded bg-rose-950/30 border border-rose-500/30 text-rose-300 font-mono text-xs">
                {queryResult.error}
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
    </div>
  );
};
