import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Tag,
  Calendar,
  Copy,
  Check,
  Code2,
  FileText,
  Sparkles,
  Layers,
  Cpu,
  Database,
  Users,
  Terminal,
  Workflow,
  ShieldCheck,
  ExternalLink,
  Type,
  ChevronDown,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DocumentationSection } from '../types';

interface DocumentationViewProps {
  sections: DocumentationSection[];
  onTriggerRefactor?: () => void;
}

// 코드 블록 복사 및 구문 스타일링 보조 컴포넌트
const CodeBlock: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-xs">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 text-[11px] font-mono text-slate-400">
        <span className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          {language || 'code'}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[10px]"
          title="코드 복사"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">복사됨</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>복사</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3.5 text-[12px] font-mono leading-relaxed overflow-x-auto text-emerald-300 bg-slate-950/50 selection:bg-blue-600/40">
        <code>{codeContent}</code>
      </pre>
    </div>
  );
};

export const DocumentationView: React.FC<DocumentationViewProps> = ({
  sections,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(sections[0]?.id || 'doc-jkadh-overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large'>('normal');

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

  const categoryDocCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: sections.length };
    sections.forEach((sec) => {
      counts[sec.category] = (counts[sec.category] || 0) + 1;
    });
    return counts;
  }, [sections]);

  const activeCategoryObj = useMemo(() => {
    return categories.find((c) => c.id === selectedCategory) || categories[0];
  }, [categories, selectedCategory]);
  const ActiveCategoryIcon = activeCategoryObj.icon;

  const filteredSections = useMemo(() => {
    return sections.filter((sec) => {
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
  }, [sections, selectedCategory, searchQuery]);

  const activeDoc = useMemo(() => {
    return sections.find((s) => s.id === selectedDocId) || filteredSections[0] || sections[0];
  }, [sections, selectedDocId, filteredSections]);

  const handleCopyMarkdown = () => {
    if (activeDoc) {
      navigator.clipboard.writeText(activeDoc.contentMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* 상단 브리프 카드 (상하 열거 레이아웃) */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/80">
              <BookOpen className="w-4 h-4" />
            </span>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              jkadh 아키텍처 현행화 문서 & 거버넌스 지식 센터
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            프로젝트 비전, 7단계 엔드투엔드 라이프사이클, 작업그래프(DAG), 하네스 진화 비교, 리팩토링 기준 및 단일 개발 DB(<code className="text-emerald-600 dark:text-emerald-400 font-mono font-semibold">jkadhp_dev</code>) 표준을 실시간 현행화하여 관리합니다.
          </p>
        </div>
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            총 <strong className="text-blue-600 dark:text-blue-400 font-bold">{sections.length}</strong>개 표준 규격 문서
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300">
            실시간 버전 현행화 동기화됨
          </span>
        </div>
      </div>

      {/* Main 2-Column Documentation Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Sidebar: Category Filters & Document List */}
        <div className="lg:col-span-4 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="문서 내용, 태그, 키워드 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
            />
          </div>

          {/* Category Dropdown with Active Icon */}
          <div className="relative flex items-center">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 pointer-events-none flex items-center justify-center">
              <ActiveCategoryIcon className="w-4 h-4" />
            </div>
            <select
              id="select-doc-category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full pl-9 pr-8 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-800 dark:text-slate-200 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs transition-colors"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {cat.label} ({categoryDocCounts[cat.id] ?? 0})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Document Item List */}
          <div className="space-y-1.5">
            {filteredSections.map((sec) => {
              const isSelected = sec.id === (activeDoc?.id || '');
              return (
                <div
                  key={sec.id}
                  onClick={() => setSelectedDocId(sec.id)}
                  className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 shadow-2xs text-slate-900 dark:text-slate-100 ring-1 ring-blue-400/30'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                      {sec.category}
                    </span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">{sec.lastUpdated}</span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-1">
                    {sec.titleKr}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {sec.summary}
                  </p>

                  <div className="flex flex-wrap gap-1 pt-1">
                    {sec.tags.slice(0, 3).map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredSections.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                검색 조건에 일치하는 문서가 없습니다.
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Markdown Document Viewer */}
        <div className="lg:col-span-8 space-y-3">
          {activeDoc ? (
            <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5 shadow-xs">
              {/* Document Header */}
              <div className="border-b border-slate-200 dark:border-slate-800 pb-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800">
                      {activeDoc.category} DOCUMENTATION • {activeDoc.id}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      최종 현행화: {activeDoc.lastUpdated}
                    </span>
                  </div>

                  {/* Actions: Font Size & Copy Markdown */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFontSize(fontSize === 'normal' ? 'large' : 'normal')}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-medium transition cursor-pointer"
                      title="글자 크기 전환"
                    >
                      <Type className="w-3.5 h-3.5 text-slate-500" />
                      <span>{fontSize === 'normal' ? '가독성 확대' : '기본 크기'}</span>
                    </button>
                    <button
                      id="btn-copy-doc-markdown"
                      type="button"
                      onClick={handleCopyMarkdown}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition shadow-xs cursor-pointer"
                      title="전체 마크다운 클립보드 복사"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>복사 완료!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>문서 Markdown 복사</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {activeDoc.titleKr}
                  </h1>
                  <p className="text-xs font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeDoc.titleEn}
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeDoc.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-mono font-medium"
                    >
                      <Tag className="w-2.5 h-2.5 text-slate-400" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rendered Markdown Body with Remark GFM */}
              <div
                className={`markdown-content max-w-none text-slate-800 dark:text-slate-200 leading-relaxed ${
                  fontSize === 'large' ? 'text-sm' : 'text-xs'
                }`}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 mt-6 mb-3 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-blue-600 dark:bg-blue-400 rounded-full inline-block"></span>
                        <span>{children}</span>
                      </h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-5 mb-2.5 text-blue-700 dark:text-blue-300">
                        {children}
                      </h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-4 mb-2 text-emerald-700 dark:text-emerald-400">
                        {children}
                      </h3>
                    ),
                    h4: ({ children }) => (
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-3 mb-1 text-purple-700 dark:text-purple-300">
                        {children}
                      </h4>
                    ),
                    p: ({ children }) => (
                      <p className="leading-relaxed mb-3 text-slate-700 dark:text-slate-300">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 space-y-1.5 mb-3 text-slate-700 dark:text-slate-300">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 space-y-1.5 mb-3 text-slate-700 dark:text-slate-300">
                        {children}
                      </ol>
                    ),
                    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                    // 인라인 코드 및 멀티라인 코드
                    code: ({ children, className }) => {
                      const isInline = !className;
                      if (isInline) {
                        return (
                          <code className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-blue-700 dark:text-blue-300 font-mono text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                            {children}
                          </code>
                        );
                      }
                      return <CodeBlock className={className}>{children}</CodeBlock>;
                    },
                    // 표 (Table) 렌더링: 반응형 래퍼, 헤더 강조, 보더 라인, 호버
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-4 border border-slate-200 dark:border-slate-700/80 rounded-xl shadow-2xs bg-white dark:bg-slate-900/60">
                        <table className="w-full text-left border-collapse text-slate-700 dark:text-slate-300">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-900 dark:text-slate-100 font-semibold border-b border-slate-200 dark:border-slate-700 text-[11px]">
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-[11px]">
                        {children}
                      </tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        {children}
                      </tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-3.5 py-2.5 font-semibold text-slate-900 dark:text-slate-100 border-r border-slate-200 dark:border-slate-700/60 last:border-r-0 whitespace-nowrap">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3.5 py-2.5 border-r border-slate-200/60 dark:border-slate-800/60 last:border-r-0 leading-normal">
                        {children}
                      </td>
                    ),
                    // 인용구
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-blue-500 dark:border-blue-400 pl-3.5 py-1.5 my-3 bg-blue-50/60 dark:bg-blue-950/30 text-slate-800 dark:text-slate-200 rounded-r-lg text-xs leading-relaxed">
                        {children}
                      </blockquote>
                    ),
                    // 구분선
                    hr: () => (
                      <hr className="my-6 border-slate-200 dark:border-slate-800" />
                    ),
                    // 하이퍼링크
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5 font-medium"
                      >
                        <span>{children}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    ),
                  }}
                >
                  {activeDoc.contentMarkdown}
                </ReactMarkdown>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              선택된 문서가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
