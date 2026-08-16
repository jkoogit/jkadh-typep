import React, { useState } from 'react';
import {
  Database,
  Terminal,
  Play,
  Table as TableIcon,
  CheckCircle2,
  Clock,
  Code,
  HardDrive,
} from 'lucide-react';
import { DatabaseTableMeta } from '../types';

interface DevDatabaseExplorerViewProps {
  tables: DatabaseTableMeta[];
  databaseName: string;
  onRunQuery: (query: string) => Promise<any>;
}

export const DevDatabaseExplorerView: React.FC<DevDatabaseExplorerViewProps> = ({
  tables,
  databaseName,
  onRunQuery,
}) => {
  const [selectedTableName, setSelectedTableName] = useState<string>(tables[0]?.tableName || 'task_nodes');
  const [sqlInput, setSqlInput] = useState<string>('SELECT * FROM task_nodes LIMIT 10;');
  const [queryResult, setQueryResult] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const selectedTable = tables.find((t) => t.tableName === selectedTableName) || tables[0];

  const handleExecute = async () => {
    setIsRunning(true);
    try {
      const res = await onRunQuery(sqlInput);
      setQueryResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const handlePreset = (query: string) => {
    setSqlInput(query);
  };

  return (
    <div className="space-y-4">
      {/* 1. Header & DB Info */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold uppercase tracking-wide">
            <Database className="w-3.5 h-3.5" />
            <span>PostgreSQL Single Dev Database</span>
          </div>
          <h2 className="text-base font-bold text-[#E6EDF3] mt-0.5">
            데이터베이스 탐색기: <code className="text-emerald-400 font-mono">{databaseName}</code>
          </h2>
          <p className="text-[11px] text-[#7D8590] mt-0.5">
            stg/prd 없는 단일 개발 DB 환경에서 트랜잭션 격리 및 스키마 현행화를 지원하는 탐색기
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-[#0D1117] border border-[#30363D] text-[#8B949E] font-mono text-[11px]">
            엔진: PostgreSQL 16.2
          </span>
          <span className="px-2.5 py-1 rounded bg-emerald-950/20 border border-emerald-500/30 text-emerald-300 font-mono text-[11px]">
            상태: ONLINE
          </span>
        </div>
      </div>

      {/* 2. Main Tables & Schema Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Table List */}
        <div className="lg:col-span-1 space-y-2">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#7D8590] px-1">
            {databaseName} 스키마 테이블 ({tables.length}개)
          </h3>
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

      {/* 3. SQL Query Console & Live Execution Result */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-xs text-[#E6EDF3]">PostgreSQL 대화형 SQL 콘솔 (jkadhp_dev)</h3>
          </div>

          {/* Presets */}
          <div className="flex flex-wrap gap-1 text-xs">
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
              onClick={() => handlePreset('SELECT * FROM execution_metrics ORDER BY timestamp DESC;')}
              className="px-2 py-0.5 rounded bg-[#0D1117] hover:bg-[#21262D] text-[#8B949E] hover:text-[#E6EDF3] border border-[#30363D] font-mono text-[10px] cursor-pointer"
            >
              execution_metrics
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
              className="w-full p-2.5 rounded-lg bg-[#0D1117] border border-[#30363D] text-blue-300 font-mono text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none"
              placeholder="SQL 쿼리를 입력하세요..."
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleExecute}
              disabled={isRunning}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-semibold transition cursor-pointer"
            >
              <Play className="w-3 h-3" />
              <span>{isRunning ? '쿼리 실행 중...' : 'SQL 쿼리 실행 (Execute)'}</span>
            </button>
          </div>
        </div>

        {/* Query Execution Result */}
        {queryResult && (
          <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2">
            <div className="flex items-center justify-between text-[11px] text-[#7D8590] font-mono">
              <span>반환 행 수: {queryResult.rowCount} rows</span>
              <span>실행 시간: {queryResult.executionTimeMs || 4.2}ms</span>
            </div>

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
                        <td key={col} className="py-1.5 px-2.5 truncate max-w-xs">
                          {typeof row[col] === 'object' ? JSON.stringify(row[col]) : String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
