import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  Calendar,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  FileText,
  Sparkles,
  ShieldAlert,
  Layers,
  Cpu,
  Database,
  Users,
  Terminal,
  Filter,
  Workflow,
  ShieldCheck,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DocumentationSection } from '../types';

interface DocumentationViewProps {
  sections: DocumentationSection[];
  onTriggerRefactor?: () => void;
}

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  sections,
  onTriggerRefactor,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(sections[0]?.id || 'doc-jkadh-overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);

  const categories = [
    { id: 'ALL', label: '전체 문서', icon: BookOpen },
    { id: 'METHODOLOGY', label: '아키텍처 개요', icon: Sparkles },
    { id: 'LIFECYCLE', label: '7단계 라이프사이클', icon: Layers },
    { id: 'TASK_GRAPH', label: '작업그래프 (DAG)', icon: Workflow },
    { id: 'HARNESS', label: '하네스 점검 & 비교', icon: ShieldCheck },
    { id: 'REFACTORING', label: '리팩토링 표준', icon: Code2 },
    { id: 'MODELS', label: 'AI 모델 거버넌스', icon: Cpu },
    { id: 'RBAC', label: '팀 계정 & 권한', icon: Users },
    { id: 'DATABASE', label: 'jkadhp_dev DB', icon: Database },
    { id: 'RUNBOOK', label: '운영 런북 & 복구', icon: Terminal },
    { id: 'RETROSPECTIVE', label: '세션 회고 보고서', icon: FileText },
  ];

  const filteredSections = sections.filter((sec) => {
    const matchCategory = selectedCategory === 'ALL' || sec.category === selectedCategory;
    const matchQuery =
      searchQuery === '' ||
      sec.titleKr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      sec.contentMarkdown.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchQuery;
  });

  const activeDoc = sections.find((s) => s.id === selectedDocId) || filteredSections[0] || sections[0];

  const handleCopyMarkdown = () => {
    if (activeDoc) {
      navigator.clipboard.writeText(activeDoc.contentMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner / Summary */}
      <div className="p-4 rounded-xl bg-[#161B22] border border-[#30363D] flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-[#E6EDF3] tracking-tight">
              jkadh 아키텍처 현행화 문서 & 거버넌스 지식 센터
            </h2>
          </div>
          <p className="text-xs text-[#7D8590]">
            프로젝트 비전, 7단계 엔드투엔드 라이프사이클, 작업그래프(DAG), 하네스 진화 비교, 리팩토링 기준 및 단일 개발 DB(<code className="text-emerald-400 font-mono">jkadhp_dev</code>) 표준을 실시간 현행화하여 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#21262D] hover:bg-[#30363D] text-[#E6EDF3] border border-[#30363D] text-xs font-medium transition cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#7D8590]" />}
            <span>{copied ? '복사 완료!' : '문서 Markdown 복사'}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Documentation Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sidebar: Category Filters & Document List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#7D8590] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="문서 내용, 태그, 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-md bg-[#0D1117] border border-[#30363D] text-xs text-[#E6EDF3] placeholder-[#7D8590] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Category Chips */}
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isCatActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition cursor-pointer border ${
                    isCatActive
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/40'
                      : 'bg-[#161B22] text-[#7D8590] border-[#30363D] hover:text-[#E6EDF3] hover:bg-[#21262D]'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Document Item List */}
          <div className="space-y-1.5 max-h-[580px] overflow-y-auto pr-1">
            {filteredSections.map((sec) => {
              const isSelected = sec.id === (activeDoc?.id || '');
              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedDocId(sec.id)}
                  className={`p-3 rounded-lg border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-[#21262D] border-blue-500 shadow-sm text-[#E6EDF3] ring-1 ring-blue-500/40'
                      : 'bg-[#161B22] border-[#30363D] text-[#7D8590] hover:bg-[#1C2128] hover:text-[#E6EDF3]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.2 rounded bg-[#0D1117] text-blue-400 border border-[#30363D]">
                      {sec.category}
                    </span>
                    <span className="text-[10px] text-[#7D8590] font-mono">{sec.lastUpdated}</span>
                  </div>

                  <h3 className="text-xs font-bold text-[#E6EDF3] leading-snug line-clamp-1">
                    {sec.titleKr}
                  </h3>

                  <p className="text-[11px] text-[#7D8590] line-clamp-2 leading-relaxed">
                    {sec.summary}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {sec.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.5 rounded bg-[#0D1117] border border-[#30363D] text-[#8B949E] font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="p-6 text-center text-xs text-[#7D8590] bg-[#161B22] rounded-lg border border-[#30363D]">
                검색 조건에 일치하는 문서가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Markdown Document Viewer */}
        <div className="lg:col-span-8 space-y-3">
          {activeDoc ? (
            <div className="p-6 rounded-xl bg-[#161B22] border border-[#30363D] space-y-4">
              {/* Document Header */}
              <div className="border-b border-[#30363D] pb-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-blue-400 uppercase tracking-wide">
                    {activeDoc.category} DOCUMENTATION • {activeDoc.id}
                  </span>
                  <span className="text-[11px] text-[#7D8590] flex items-center gap-1 font-mono">
                    <Calendar className="w-3 h-3 text-[#7D8590]" />
                    최종 현행화: {activeDoc.lastUpdated}
                  </span>
                </div>

                <h1 className="text-lg font-bold text-[#E6EDF3] tracking-tight">{activeDoc.titleKr}</h1>
                <p className="text-xs font-mono text-[#7D8590]">{activeDoc.titleEn}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeDoc.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono"
                    >
                      <Tag className="w-2.5 h-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rendered Markdown Body */}
              <div className="prose prose-invert max-w-none text-xs text-[#E6EDF3] leading-relaxed space-y-3">
                <ReactMarkdown
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-base font-bold text-[#E6EDF3] border-b border-[#30363D] pb-1.5 mt-4 mb-2">
                        {children}
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-sm font-bold text-[#E6EDF3] mt-3.5 mb-1.5 text-blue-300">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xs font-bold text-[#E6EDF3] mt-2.5 mb-1 text-emerald-400">
                        {children}
                      </h3>
                    ),
                    p: ({ children }) => <p className="text-xs text-[#C9D1D9] leading-relaxed mb-2">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 text-xs text-[#C9D1D9] mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 text-xs text-[#C9D1D9] mb-2">{children}</ol>,
                    li: ({ children }) => <li className="text-xs text-[#C9D1D9]">{children}</li>,
                    code: ({ children, className }) => {
                      const isInline = !className;
                      return isInline ? (
                        <code className="px-1.5 py-0.5 rounded bg-[#0D1117] text-blue-300 font-mono text-[11px] border border-[#30363D]">
                          {children}
                        </code>
                      ) : (
                        <pre className="p-3 rounded-lg bg-[#0A0C10] border border-[#30363D] text-[11px] font-mono text-emerald-300 overflow-x-auto my-2">
                          <code>{children}</code>
                        </pre>
                      );
                    },
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-3 border border-[#30363D] rounded-lg">
                        <table className="w-full text-left text-[11px] text-[#C9D1D9] divide-y divide-[#30363D]">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => <thead className="bg-[#0D1117] text-[#E6EDF3] font-semibold">{children}</thead>,
                    tbody: ({ children }) => <tbody className="divide-y divide-[#30363D] bg-[#161B22]">{children}</tbody>,
                    tr: ({ children }) => <tr className="hover:bg-[#21262D]/50 transition">{children}</tr>,
                    th: ({ children }) => <th className="px-3 py-2 text-[11px] font-mono font-bold text-[#E6EDF3]">{children}</th>,
                    td: ({ children }) => <td className="px-3 py-2 text-[11px]">{children}</td>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-blue-500 pl-3 py-1 bg-blue-500/5 text-[#E6EDF3] italic my-2 rounded-r">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {activeDoc.contentMarkdown}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#7D8590] bg-[#161B22] rounded-xl border border-[#30363D]">
              선택된 문서가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
