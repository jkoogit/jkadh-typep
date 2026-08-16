import React, { useState } from 'react';
import {
  Lightbulb,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Layers,
  Cpu,
  Database,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Zap,
  Target,
} from 'lucide-react';
import { ArchitecturalProposalCase } from '../types';

interface ProposalViewProps {
  proposals: ArchitecturalProposalCase[];
  onSelectTaskTab: () => void;
}

export const ProposalView: React.FC<ProposalViewProps> = ({ proposals, onSelectTaskTab }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(proposals[0]?.id || 'prop-1');

  const selectedCase = proposals.find((p) => p.id === selectedCaseId) || proposals[0];

  return (
    <div className="space-y-4">
      {/* Top Banner: Vibe Coding Readiness & Scope Analysis */}
      <div className="rounded-xl bg-[#161B22] border border-[#30363D] p-5 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>JKADH 바이브코딩 명세 구체화 & 사례 기반 아키텍처 제안</span>
            </div>
            <h2 className="text-xl font-bold text-[#E6EDF3] tracking-tight">
              대상 작업 정밀 분석 및 단계별 검증 절차 체계화
            </h2>
            <p className="text-xs text-[#7D8590] leading-relaxed">
              요청하신 <strong className="text-[#E6EDF3]">AI 개발 플랫폼(팀 계정 관리, RBAC 권한, 사용량 대시보드, 다중 모델 Fallback)</strong>과
              샘플 타겟인 <strong className="text-[#E6EDF3]">PDFowers</strong>에 대해, 
              바이브코딩의 모호성을 제거하고 7단계 라이프사이클의 완료 조건을 프로그램 로직으로 강제할 수 있도록 분석한 제안서입니다.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="px-3.5 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-center min-w-[120px]">
              <span className="text-[10px] text-[#7D8590] block font-medium">명세 완성도</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">98.5%</span>
            </div>
            <div className="px-3.5 py-2 rounded-lg bg-[#0D1117] border border-[#30363D] text-center min-w-[120px]">
              <span className="text-[10px] text-[#7D8590] block font-medium">검증 통제 룰셋</span>
              <span className="text-lg font-bold text-blue-400 font-mono">14개 Gate</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: 4 Architectural Proposal Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Column: Case Selector Navigation */}
        <div className="lg:col-span-1 space-y-2.5">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-[#7D8590] px-1">
            사례 기반 아키텍처 의사결정 항목
          </h3>
          <div className="space-y-1.5">
            {proposals.map((prop, idx) => {
              const isSelected = prop.id === selectedCaseId;
              return (
                <button
                  key={prop.id}
                  onClick={() => setSelectedCaseId(prop.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all border cursor-pointer ${
                    isSelected
                      ? 'bg-[#21262D] border-blue-500/70 shadow-sm text-[#E6EDF3] ring-1 ring-blue-500/40'
                      : 'bg-[#161B22] border-[#30363D] text-[#8B949E] hover:bg-[#21262D]/60 hover:border-[#484F58] hover:text-[#E6EDF3]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-blue-400 tracking-wide uppercase text-[10px]">
                      Case 0{idx + 1} • {prop.category}
                    </span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />}
                  </div>
                  <h4 className="font-semibold text-xs leading-snug line-clamp-2">{prop.title}</h4>
                </button>
              );
            })}
          </div>

          {/* Quick Action Card */}
          <div className="p-3.5 rounded-lg bg-[#161B22] border border-[#30363D] text-xs space-y-2.5 text-[#7D8590]">
            <div className="flex items-center gap-1.5 text-[#E6EDF3] font-semibold">
              <Target className="w-3.5 h-3.5 text-emerald-400" />
              <span>PDFowers 샘플 대상 검토 완료</span>
            </div>
            <p className="text-[11px] text-[#7D8590] leading-relaxed">
              고해상도 다국어 OCR, 테이블 감지, 벡터 워터마크, DRM PII 마스킹 등 6개 모듈이 작업그래프로 연결되어 즉시 7단계 검증 파이프라인에 투입 가능합니다.
            </p>
            <button
              onClick={onSelectTaskTab}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-medium text-xs transition cursor-pointer"
            >
              <span>7단계 라이프사이클 뷰로 이동</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right 2 Columns: Detailed Case Proposal Content */}
        {selectedCase && (
          <div className="lg:col-span-2 space-y-4">
            <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-4">
              <div className="border-b border-[#30363D] pb-3">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                  {selectedCase.category}
                </span>
                <h3 className="text-base font-bold text-[#E6EDF3] mt-0.5 leading-snug">{selectedCase.title}</h3>
              </div>

              {/* 1. Problem Statement & Empirical Real Case */}
              <div className="space-y-2.5">
                <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-800/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-300 font-semibold text-xs uppercase tracking-wide">
                    <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    <span>실제 발생 문제점 (Problem Statement)</span>
                  </div>
                  <p className="text-xs text-rose-200/90 leading-relaxed">{selectedCase.problemStatement}</p>
                  <div className="mt-1.5 pt-1.5 border-t border-rose-900/40 text-[11px] text-rose-300/80">
                    <strong className="text-rose-200">실제 발생 사례:</strong> {selectedCase.empiricalCase}
                  </div>
                </div>

                {/* 2. Recommended Solution */}
                <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-300 font-semibold text-xs uppercase tracking-wide">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>권장 아키텍처 및 보완 제안 (Recommended Solution)</span>
                  </div>
                  <p className="text-xs text-emerald-200/90 leading-relaxed">{selectedCase.recommendedSolution}</p>
                </div>
              </div>

              {/* 3. Benefit & Risk Mitigation Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-1">
                  <span className="text-[10px] font-bold text-[#7D8590] uppercase">도입 효과 (Benefit)</span>
                  <p className="text-xs text-[#E6EDF3] leading-relaxed">{selectedCase.benefit}</p>
                </div>
                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] space-y-1">
                  <span className="text-[10px] font-bold text-[#7D8590] uppercase">
                    리스크 완화 (Risk Mitigation)
                  </span>
                  <p className="text-xs text-[#E6EDF3] leading-relaxed">{selectedCase.riskMitigation}</p>
                </div>
              </div>

              {/* 4. Concrete Code Rule Enforcement Logic */}
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-[#E6EDF3] flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-blue-400" />
                  프로그램 오작동 통제 명세 로직 (Code Rule Specification)
                </span>
                <div className="p-3 rounded-lg bg-[#0D1117] border border-[#30363D] font-mono text-xs text-blue-300 overflow-x-auto">
                  <code>{selectedCase.specRuleLogic}</code>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison Table: As-Is Ambiguity vs To-Be Structured Vibe Coding */}
      <div className="p-5 rounded-xl bg-[#161B22] border border-[#30363D] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-sm text-[#E6EDF3]">
              바이브코딩 모호성 제거 및 단계별 통제 명세 대조표 (As-Is vs. To-Be)
            </h3>
          </div>
          <span className="text-[11px] text-[#7D8590] font-mono">JKADH Governance Specification</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#30363D] bg-[#0D1117] text-[#7D8590] font-semibold">
                <th className="py-2.5 px-3">라이프사이클 단계</th>
                <th className="py-2.5 px-3 text-rose-400/90">기존 모호한 방식 (As-Is)</th>
                <th className="py-2.5 px-3 text-emerald-400">JKADH 구조화 방식 (To-Be)</th>
                <th className="py-2.5 px-3 text-blue-400">오작동 통제 게이트키퍼 룰</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363D] text-[#E6EDF3]">
              <tr className="hover:bg-[#21262D]/50">
                <td className="py-2.5 px-3 font-semibold text-[#E6EDF3]">1. 작업대상 검토</td>
                <td className="py-2.5 px-3 text-rose-300/80">구두 설명 또는 단순 지시</td>
                <td className="py-2.5 px-3 text-emerald-300">DAG 작업그래프 & 영향 반경 자동 계산</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#7D8590]">no_cyclic_deps && upstream_resolved</td>
              </tr>
              <tr className="hover:bg-[#21262D]/50">
                <td className="py-2.5 px-3 font-semibold text-[#E6EDF3]">2. 작업 선정</td>
                <td className="py-2.5 px-3 text-rose-300/80">개발자 임의 선택</td>
                <td className="py-2.5 px-3 text-emerald-300">ROI/복잡도/토큰소모/RBAC 권한 쿼터 검증</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#7D8590]">quota_headroom &gt; estimated_tokens</td>
              </tr>
              <tr className="hover:bg-[#21262D]/50">
                <td className="py-2.5 px-3 font-semibold text-[#E6EDF3]">3. 작업 기획</td>
                <td className="py-2.5 px-3 text-rose-300/80">Happy Path(정상동작)만 대략 기획</td>
                <td className="py-2.5 px-3 text-emerald-300">정상 / 오류(4000) / 예외(OOM,토큰) 3대 시나리오 필수</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#7D8590]">has_all(['NORMAL', 'ERROR', 'EXCEPTION'])</td>
              </tr>
              <tr className="hover:bg-[#21262D]/50">
                <td className="py-2.5 px-3 font-semibold text-[#E6EDF3]">4. 작업 설계</td>
                <td className="py-2.5 px-3 text-rose-300/80">타입 없이 바로 프롬프트 작성</td>
                <td className="py-2.5 px-3 text-emerald-300">JSON Schema Draft-07 & strict TypeScript 명세</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#7D8590]">schema_valid && no_any_types</td>
              </tr>
              <tr className="hover:bg-[#21262D]/50">
                <td className="py-2.5 px-3 font-semibold text-[#E6EDF3]">5. 테스트 설계</td>
                <td className="py-2.5 px-3 text-rose-300/80">테스트 생략하거나 단순 출력 확인</td>
                <td className="py-2.5 px-3 text-emerald-300">Mock 금지, 3대 시나리오 100% 매핑 테스트 설계</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#7D8590]">all_scenarios_tested && fallback_injected</td>
              </tr>
              <tr className="hover:bg-[#21262D]/50">
                <td className="py-2.5 px-3 font-semibold text-[#E6EDF3]">6. 코드 작성</td>
                <td className="py-2.5 px-3 text-rose-300/80">에러 발생 시 무한 루프 수정</td>
                <td className="py-2.5 px-3 text-emerald-300">컴파일/린트 0개 에러 & Fallback 다단계 체인 탑재</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#7D8590]">tsc_zero_errors && fallback_guarded</td>
              </tr>
              <tr className="hover:bg-[#21262D]/50">
                <td className="py-2.5 px-3 font-semibold text-[#E6EDF3]">7. 문서 작성</td>
                <td className="py-2.5 px-3 text-rose-300/80">코드만 남기고 문서 미작성</td>
                <td className="py-2.5 px-3 text-emerald-300">미처리 백로그 생성 & DB 작업그래프 자동 현행화</td>
                <td className="py-2.5 px-3 font-mono text-[11px] text-[#7D8590]">spec_drift == 0 && graph_synced_to_db</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
