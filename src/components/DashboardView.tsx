import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Cpu,
  Zap,
  ShieldCheck,
  AlertCircle,
  Clock,
  ArrowUpRight,
  Activity,
  Layers,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AIAccount, ExecutionMetric } from '../types';

interface DashboardViewProps {
  accounts: AIAccount[];
  chartData: ExecutionMetric[];
  summary: {
    totalTokensConsumed: number;
    totalRemainingTokens: number;
    monthlyBudgetUSD: number;
    currentCostUSD: number;
    activeMembersCount: number;
    avgSpecValidationScore: number;
  };
}

const MODEL_COLORS: Record<string, string> = {
  'claude-3-7-sonnet': '#818cf8',
  'gpt-4o-codex': '#34d399',
  'gemini-3-7-flash': '#38bdf8',
  'manus-operator': '#fbbf24',
};

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  chartData,
  summary,
}) => {
  const modelUsagePie = [
    { name: 'Claude 3.7 Sonnet', value: 6890000, color: '#388bfd' },
    { name: 'Gemini 3.7 Flash', value: 5410000, color: '#2ea043' },
    { name: 'ChatGPT Codex', value: 4230000, color: '#58a6ff' },
    { name: 'Manus Operator', value: 2790000, color: '#d29922' },
  ];

  return (
    <div className="space-y-4">
      {/* 1. Top Summary Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#7D8590]">
            <span className="text-[10px] uppercase font-bold tracking-wider">남은 토큰 쿼터 (AI Pool)</span>
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {(summary.totalRemainingTokens / 1000000).toFixed(1)}M
            </span>
            <span className="text-[11px] text-[#7D8590]">
              / {((summary.totalTokensConsumed + summary.totalRemainingTokens) / 1000000).toFixed(0)}M
            </span>
          </div>
          <div className="w-full h-1 bg-[#0D1117] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full"
              style={{
                width: `${
                  (summary.totalRemainingTokens /
                    (summary.totalTokensConsumed + summary.totalRemainingTokens)) *
                  100
                }%`,
              }}
            />
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#7D8590]">
            <span className="text-[10px] uppercase font-bold tracking-wider">월간 누적 사용 비용</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#E6EDF3]">
              ${summary.currentCostUSD.toFixed(1)}
            </span>
            <span className="text-[11px] text-[#7D8590]">/ ${summary.monthlyBudgetUSD}</span>
          </div>
          <span className="text-[10px] text-blue-400 flex items-center gap-1 font-mono">
            예산 소진율 {Math.round((summary.currentCostUSD / summary.monthlyBudgetUSD) * 100)}% (정상 범위)
          </span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#7D8590]">
            <span className="text-[10px] uppercase font-bold tracking-wider">평균 명세 준수율 (Gatekeeper)</span>
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-emerald-400">
              {summary.avgSpecValidationScore}%
            </span>
            <span className="text-[11px] text-emerald-300">0% Spec Drift</span>
          </div>
          <span className="text-[10px] text-[#7D8590]">7단계 완료 조건 전수 자동 검증</span>
        </div>

        <div className="p-3.5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-1.5">
          <div className="flex items-center justify-between text-xs text-[#7D8590]">
            <span className="text-[10px] uppercase font-bold tracking-wider">활성 계정 & 멤버 수</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-[#E6EDF3]">4개 계정</span>
            <span className="text-[11px] text-[#7D8590]">({summary.activeMembersCount}명 활성)</span>
          </div>
          <span className="text-[10px] text-cyan-300 font-mono">PostgreSQL jkadhp_dev</span>
        </div>
      </div>

      {/* 2. Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Token Usage Trend Area Chart */}
        <div className="lg:col-span-2 p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
          <div className="flex items-center justify-between border-b border-[#30363D] pb-2">
            <div>
              <h3 className="font-bold text-xs text-[#E6EDF3] flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                시간대별 토큰 소비량 및 Fallback 발생 추이
              </h3>
              <p className="text-[11px] text-[#7D8590] mt-0.5">
                실시간 요청 트래픽 및 429/Quota 초과 시 모델 자동 전환 모니터링
              </p>
            </div>
            <span className="text-[10px] text-blue-400 font-mono">Live Sync</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="tokenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#388bfd" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#388bfd" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="timestamp" stroke="#7D8590" fontSize={10} tickLine={false} />
                <YAxis stroke="#7D8590" fontSize={10} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161B22',
                    borderColor: '#30363D',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                    color: '#E6EDF3',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="tokens"
                  stroke="#388bfd"
                  strokeWidth={1.5}
                  fillOpacity={1}
                  fill="url(#tokenGradient)"
                  name="소비 토큰"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Model Distribution Pie Chart */}
        <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
          <div className="border-b border-[#30363D] pb-2">
            <h3 className="font-bold text-xs text-[#E6EDF3] flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              모델별 토큰 점유율
            </h3>
            <p className="text-[11px] text-[#7D8590] mt-0.5">Claude vs Gemini vs Codex vs Manus</p>
          </div>

          <div className="h-40 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={modelUsagePie}
                  innerRadius={42}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {modelUsagePie.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#161B22',
                    borderColor: '#30363D',
                    borderRadius: '0.5rem',
                    fontSize: '11px',
                    color: '#E6EDF3',
                  }}
                  formatter={(val: number) => [`${(val / 1000000).toFixed(2)}M Tokens`, '사용량']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            {modelUsagePie.map((m) => (
              <div key={m.name} className="flex items-center gap-1.5 text-[#8B949E]">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: m.color }} />
                <span className="truncate text-[10px]">{m.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Real-time Account Health & Circuit Breaker Status */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
        <h3 className="font-bold text-xs text-[#E6EDF3] flex items-center gap-1.5 border-b border-[#30363D] pb-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          AI 제공업체 계정 상태 및 서킷 브레이커 (Circuit Breakers)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#E6EDF3]">{acc.provider}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded font-bold font-mono ${
                    acc.status === 'HEALTHY'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {acc.status}
                </span>
              </div>
              <div className="text-xs text-[#8B949E]">
                <span className="text-[#7D8590] block text-[10px]">계정명:</span>
                <span className="font-medium truncate block text-[#E6EDF3]">{acc.accountName}</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-[10px] text-[#7D8590]">
                  <span>잔여 토큰</span>
                  <span className="font-mono text-emerald-400">
                    {(acc.remainingTokens / 1000000).toFixed(2)}M
                  </span>
                </div>
                <div className="w-full h-1 bg-[#161B22] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      acc.status === 'HEALTHY' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{
                      width: `${(acc.remainingTokens / acc.totalTokenQuota) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <div className="text-[10px] text-[#7D8590] font-mono pt-1 border-t border-[#30363D] flex justify-between">
                <span>24h 에러: {acc.errorCount24h}건</span>
                <span className="text-blue-400">FB: {acc.primaryFallbackModelId?.split('-')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
