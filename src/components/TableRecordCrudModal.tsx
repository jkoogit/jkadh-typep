import React, { useState } from 'react';
import { X, Plus, Edit2, Trash2, Check, AlertCircle, Save, Database } from 'lucide-react';
import { DatabaseTableMeta } from '../types';

interface TableRecordCrudModalProps {
  table: DatabaseTableMeta;
  targetDb: string;
  onClose: () => void;
  onExecuteSql: (sql: string, db: string) => Promise<any>;
  onRefreshTableData: () => void;
}

export const TableRecordCrudModal: React.FC<TableRecordCrudModalProps> = ({
  table,
  targetDb,
  onClose,
  onExecuteSql,
  onRefreshTableData,
}) => {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    table.columns.forEach((col) => {
      if (col.name === 'id') {
        initial[col.name] = `${table.tableName.slice(0, 3)}_${Date.now().toString().slice(-6)}`;
      } else if (col.name === 'reg_sys_cd' || col.name === 'mod_sys_cd') {
        initial[col.name] = 'JKADH_DEV';
      } else if (col.name === 'reg_user_id' || col.name === 'mod_user_id') {
        initial[col.name] = 'jkoogi';
      } else if (col.name.endsWith('_dt') || col.name.endsWith('_at')) {
        initial[col.name] = 'NOW()';
      } else if (col.type.includes('INT') || col.type.includes('NUMERIC') || col.type.includes('FLOAT')) {
        initial[col.name] = '0';
      } else if (col.type.includes('BOOL')) {
        initial[col.name] = 'true';
      } else if (col.type.includes('JSON')) {
        initial[col.name] = '{}';
      } else {
        initial[col.name] = '';
      }
    });
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (columnName: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [columnName]: value,
    }));
  };

  const handleInsert = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      const colNames: string[] = [];
      const colValues: string[] = [];

      for (const col of table.columns) {
        const val = formData[col.name];
        if (val === undefined || val === '') {
          if (!col.isNullable && !col.isPrimary && !col.description?.includes('Default')) {
            // Include empty default if required
            colNames.push(col.name);
            colValues.push("''");
          }
          continue;
        }

        colNames.push(col.name);

        if (val === 'NOW()' || val === 'CURRENT_TIMESTAMP') {
          colValues.push('NOW()');
        } else if (col.type.includes('INT') || col.type.includes('NUMERIC') || col.type.includes('FLOAT') || col.type.includes('DOUBLE')) {
          const num = Number(val);
          colValues.push(isNaN(num) ? '0' : `${num}`);
        } else if (col.type.includes('BOOL')) {
          colValues.push(val === 'true' || val === 't' ? 'TRUE' : 'FALSE');
        } else if (col.type.includes('JSON')) {
          colValues.push(`'${val.replace(/'/g, "''")}'::jsonb`);
        } else {
          colValues.push(`'${val.replace(/'/g, "''")}'`);
        }
      }

      const insertSql = `
        INSERT INTO ${table.tableName} (${colNames.join(', ')})
        VALUES (${colValues.join(', ')});
      `;

      const result = await onExecuteSql(insertSql, targetDb);
      if (result && result.success !== false) {
        setStatusMessage({
          type: 'success',
          text: `[${table.tableName}] 테이블에 새 행이 성공적으로 추가(INSERT)되었습니다.`,
        });
        onRefreshTableData();
      } else {
        throw new Error(result?.error || 'INSERT 작업 실패');
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: `행 추가 실패: ${err.message}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-[#161B22] border border-[#30363D] rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#30363D] flex items-center justify-between bg-[#0D1117]">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-[#E6EDF3] flex items-center gap-2">
              <span>새 레코드 추가 (INSERT INTO public.{table.tableName})</span>
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleInsert} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] text-xs text-[#8B949E] flex items-center justify-between">
            <span>
              대상 데이터베이스: <strong className="text-emerald-400 font-mono">{targetDb}</strong>
            </span>
            <span className="font-mono text-[11px] text-[#7D8590]">
              {table.columns.length}개 컬럼 정의 (6대 감사 컬럼 자동 지원)
            </span>
          </div>

          {statusMessage && (
            <div
              className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {table.columns.map((col) => {
              const isPk = col.isPrimary;
              const isAudit = col.name.startsWith('reg_') || col.name.startsWith('mod_');

              return (
                <div
                  key={col.name}
                  className={`p-2.5 rounded-lg border ${
                    isPk
                      ? 'bg-emerald-950/10 border-emerald-500/30 sm:col-span-2'
                      : isAudit
                      ? 'bg-[#0D1117]/60 border-[#30363D]'
                      : 'bg-[#0D1117] border-[#30363D]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-mono font-semibold text-[#E6EDF3] flex items-center gap-1.5">
                      <span className={isPk ? 'text-emerald-400' : 'text-blue-300'}>{col.name}</span>
                      {isPk && (
                        <span className="px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[9px] font-bold">
                          PK
                        </span>
                      )}
                      {!col.isNullable && !isPk && (
                        <span className="text-[9px] text-rose-400">*</span>
                      )}
                    </label>
                    <span className="text-[9px] font-mono text-[#7D8590]">{col.type}</span>
                  </div>

                  {col.type.includes('BOOL') ? (
                    <select
                      value={formData[col.name] || 'true'}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      className="w-full p-1.5 rounded bg-[#161B22] border border-[#30363D] text-[#E6EDF3] font-mono text-xs cursor-pointer focus:border-blue-500"
                    >
                      <option value="true">TRUE</option>
                      <option value="false">FALSE</option>
                    </select>
                  ) : col.type.includes('JSON') ? (
                    <textarea
                      rows={2}
                      value={formData[col.name] || ''}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      placeholder='{"key": "value"} or []'
                      className="w-full p-1.5 rounded bg-[#161B22] border border-[#30363D] text-amber-300 font-mono text-xs focus:border-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[col.name] || ''}
                      onChange={(e) => handleChange(col.name, e.target.value)}
                      placeholder={col.description || col.name}
                      className="w-full p-1.5 rounded bg-[#161B22] border border-[#30363D] text-[#E6EDF3] font-mono text-xs focus:border-blue-500"
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[#30363D] flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg border border-[#30363D] text-[#8B949E] hover:text-[#E6EDF3] hover:bg-[#21262D] text-xs font-semibold cursor-pointer"
            >
              닫기
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '저장 중...' : '레코드 INSERT 실행'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
