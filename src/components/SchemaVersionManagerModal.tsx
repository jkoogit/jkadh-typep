import React, { useState } from 'react';
import {
  History,
  GitCommit,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Shield,
  Copy,
  Check,
  Zap,
  Layers,
  Database,
} from 'lucide-react';
import { SCHEMA_VERSION_HISTORY, SCHEMA_MIGRATIONS_DDL } from '../data/schemaVersions';

interface AppliedMigrationItem {
  version: string;
  description: string;
  script_name: string;
  applied_by: string;
  applied_at: string;
  execution_time_ms: number;
  success: boolean;
}

interface SchemaVersionManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetDatabase: string;
  currentDbVersion: string | null;
  targetVersion: string;
  isUpToDate: boolean;
  appliedMigrations: AppliedMigrationItem[];
  pendingMigrations: string[];
  onApplyMigration: (targetVersion: string) => Promise<void>;
  isMigrating: boolean;
}

export const SchemaVersionManagerModal: React.FC<SchemaVersionManagerModalProps> = ({
  isOpen,
  onClose,
  targetDatabase,
  currentDbVersion,
  targetVersion,
  isUpToDate,
  appliedMigrations,
  pendingMigrations,
  onApplyMigration,
  isMigrating,
}) => {
  const [selectedVersion, setSelectedVersion] = useState<string>(targetVersion || 'v2.2.0');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentVersionData =
    SCHEMA_VERSION_HISTORY.find((v) => v.version === selectedVersion) ||
    SCHEMA_VERSION_HISTORY[SCHEMA_VERSION_HISTORY.length - 1];

  const handleCopy = (text: string, sectionKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionKey);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#30363D] flex items-center justify-between bg-[#0D1117]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#E6EDF3]">
                  PostgreSQL 메타 테이블 버전 관리 엔진 (<code className="text-blue-400">schema_migrations</code>)
                </h3>
                <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 font-bold">
                  Target: {targetDatabase}
                </span>
              </div>
              <p className="text-xs text-[#8B949E] mt-0.5">
                Flyway/Liquibase 표준 방식의 단일 메타 테이블로 DDL + 데이터 DML 원자적 마이그레이션 이력을 추적합니다.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#7D8590] hover:text-[#E6EDF3] p-1.5 rounded-lg hover:bg-[#21262D] transition cursor-pointer text-xs"
          >
            ✕ 닫기
          </button>
        </div>

        {/* Status Alert Banner */}
        <div
          className={`px-5 py-3 border-b text-xs flex items-center justify-between ${
            isUpToDate
              ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-950/30 border-amber-500/30 text-amber-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {isUpToDate ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>
              {isUpToDate
                ? `원격 PostgreSQL DB 버전이 코드 최신 베이스라인(${targetVersion})과 완전히 일치합니다.`
                : `원격 DB에 적용 대기 중인 마이그레이션 버전(${pendingMigrations.join(', ') || targetVersion})이 있습니다.`}
            </span>
          </div>

          {!isUpToDate && (
            <button
              onClick={() => onApplyMigration(targetVersion)}
              disabled={isMigrating}
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50 transition"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{isMigrating ? '마이그레이션 실행 중...' : `최신 ${targetVersion} 원자적 마이그레이션 실행`}</span>
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Applied History Table */}
          <div className="p-4 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-3">
            <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-bold text-[#E6EDF3] uppercase">
                  실제 적용된 마이그레이션 이력 (<code className="text-emerald-400 font-mono">public.schema_migrations</code>)
                </h4>
              </div>
              <span className="text-[11px] text-[#7D8590] font-mono">총 {appliedMigrations.length}개 릴리즈 적용 완료</span>
            </div>

            {appliedMigrations.length === 0 ? (
              <div className="p-4 text-center text-xs text-[#7D8590] border border-dashed border-[#30363D] rounded-lg">
                아직 적용된 마이그레이션 이력이 없습니다. 상단의 마이그레이션 실행 버튼을 눌러 스키마를 동기화하세요.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-[#30363D] bg-[#161B22] text-[#7D8590] font-mono text-[11px]">
                      <th className="py-2 px-3">Version</th>
                      <th className="py-2 px-3">Script Name</th>
                      <th className="py-2 px-3">Description</th>
                      <th className="py-2 px-3">Applied By</th>
                      <th className="py-2 px-3">Applied At</th>
                      <th className="py-2 px-3">Latency</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363D] font-mono text-[#8B949E]">
                    {appliedMigrations.map((m) => (
                      <tr key={m.version} className="hover:bg-[#21262D]/30">
                        <td className="py-2 px-3 text-emerald-400 font-bold">{m.version}</td>
                        <td className="py-2 px-3 text-blue-300">{m.script_name}</td>
                        <td className="py-2 px-3 text-[#E6EDF3] font-sans truncate max-w-xs">{m.description}</td>
                        <td className="py-2 px-3 text-[#7D8590]">{m.applied_by}</td>
                        <td className="py-2 px-3 text-[#7D8590] text-[11px]">{String(m.applied_at).replace('T', ' ').slice(0, 19)}</td>
                        <td className="py-2 px-3 text-amber-300/90">{m.execution_time_ms}ms</td>
                        <td className="py-2 px-3">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                            SUCCESS
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Version Timeline Selector */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
              <GitCommit className="w-4 h-4 text-blue-400" />
              코드베이스 정의 마이그레이션 스크립트 레지스트리
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SCHEMA_VERSION_HISTORY.map((v) => {
                const isSelected = v.version === selectedVersion;
                const isApplied = appliedMigrations.some((m) => m.version === v.version);
                return (
                  <button
                    key={v.version}
                    onClick={() => setSelectedVersion(v.version)}
                    className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#21262D] border-blue-500/70 shadow-sm ring-1 ring-blue-500/30'
                        : 'bg-[#0D1117] border-[#30363D] hover:bg-[#21262D]/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs text-blue-400">{v.version}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-mono font-bold ${
                          isApplied
                            ? 'bg-emerald-950/60 border border-emerald-500/30 text-emerald-400'
                            : 'bg-amber-950/60 border border-amber-500/30 text-amber-300'
                        }`}
                      >
                        {isApplied ? '● APPLIED' : '○ PENDING'}
                      </span>
                    </div>
                    <p className="text-xs text-[#E6EDF3] font-medium line-clamp-1">{v.summary}</p>
                    <div className="flex items-center justify-between text-[11px] text-[#7D8590] mt-2 pt-2 border-t border-[#30363D]/60">
                      <span className="font-mono text-[10px] truncate max-w-[140px]">{v.scriptName}</span>
                      <span>작성자: {v.author.split(' ')[0]}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Version Detail */}
          {currentVersionData && (
            <div className="space-y-4">
              {/* Snapshot metadata */}
              <div className="p-4 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-3">
                <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-emerald-400">
                      {currentVersionData.version} 스키마 엔티티 ({currentVersionData.scriptName})
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#7D8590]">{currentVersionData.releasedAt}</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#30363D] bg-[#161B22] text-[#7D8590] font-mono text-[11px]">
                        <th className="py-2 px-3">테이블명</th>
                        <th className="py-2 px-3">설명</th>
                        <th className="py-2 px-3">컬럼 수</th>
                        <th className="py-2 px-3">PK</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363D] font-mono text-[#8B949E]">
                      {currentVersionData.schemaSnapshot.map((snap) => (
                        <tr key={snap.tableName} className="hover:bg-[#21262D]/30">
                          <td className="py-2 px-3 text-blue-300 font-semibold">{snap.tableName}</td>
                          <td className="py-2 px-3 text-[#E6EDF3] font-sans text-xs">{snap.description}</td>
                          <td className="py-2 px-3 text-[#7D8590]">{snap.columnCount}개</td>
                          <td className="py-2 px-3 text-amber-300">{snap.primaryKey}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Migration SQL Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#8B949E] uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    원자적 마이그레이션 SQL (Atomic DDL + Data DML)
                  </label>
                  <button
                    onClick={() => handleCopy(currentVersionData.migrationSql, 'migration')}
                    className="flex items-center gap-1 text-xs text-[#8B949E] hover:text-[#E6EDF3] cursor-pointer"
                  >
                    {copiedSection === 'migration' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">복사 완료</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>SQL 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] text-emerald-300 font-mono text-xs overflow-x-auto max-h-52 leading-relaxed">
                  {currentVersionData.migrationSql}
                </pre>
              </div>

              {/* Rollback SQL Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-rose-400/90 uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-rose-400" />
                    롤백 안전 스크립트 ({currentVersionData.version} Rollback SQL)
                  </label>
                  <button
                    onClick={() => handleCopy(currentVersionData.rollbackSql, 'rollback')}
                    className="flex items-center gap-1 text-xs text-[#8B949E] hover:text-[#E6EDF3] cursor-pointer"
                  >
                    {copiedSection === 'rollback' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">복사 완료</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>SQL 복사</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3 rounded-lg bg-[#0D1117] border border-rose-500/20 text-rose-300/90 font-mono text-xs overflow-x-auto max-h-28 leading-relaxed">
                  {currentVersionData.rollbackSql}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#30363D] bg-[#0D1117] flex items-center justify-between text-xs">
          <span className="text-[#7D8590]">
            💡 서버 기동 시 <code>SELECT MAX(version) FROM schema_migrations</code> 1회 조회로 스키마 정합성을 검증합니다.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] font-semibold cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
