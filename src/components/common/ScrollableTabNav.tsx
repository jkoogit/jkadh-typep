import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TabItem<T extends string = string> {
  id: T;
  label: string;
  icon?: React.ElementType;
  badge?: string;
}

interface ScrollableTabNavProps<T extends string = string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onSelectTab: (tabId: T) => void;
  idPrefix?: string;
  className?: string;
}

export function ScrollableTabNav<T extends string = string>({
  tabs,
  activeTab,
  onSelectTab,
  idPrefix = 'tab',
  className = ''
}: ScrollableTabNavProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // 스크롤 가능 여부 체크
  const checkScrollability = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    checkScrollability();

    const handleScroll = () => checkScrollability();
    el.addEventListener('scroll', handleScroll, { passive: true });

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => checkScrollability());
      resizeObserver.observe(el);
    }

    window.addEventListener('resize', handleScroll);

    return () => {
      el.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [checkScrollability, tabs]);

  // 활성 탭 변경 시 해당 탭 버튼을 화면 중앙으로 자동 스크롤
  useEffect(() => {
    const activeEl = scrollContainerRef.current?.querySelector<HTMLElement>(`#${idPrefix}-${activeTab}`);
    if (activeEl && scrollContainerRef.current) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeTab, idPrefix]);

  // 좌/우 스크롤 이동 (탭 간격 기준 200px 이동)
  const handleScrollStep = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const scrollStep = Math.max(180, Math.floor(el.clientWidth * 0.6));
    el.scrollBy({
      left: direction === 'left' ? -scrollStep : scrollStep,
      behavior: 'smooth'
    });
  };

  return (
    <div className={`relative flex items-center bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800 shadow-xs group ${className}`}>
      {/* 좌측 스크롤 화살표 버튼 */}
      {canScrollLeft && (
        <div className="absolute left-1 z-10 flex items-center h-[calc(100%-12px)]">
          <button
            type="button"
            onClick={() => handleScrollStep('left')}
            className="h-8 w-8 rounded-xl bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
            aria-label="이전 탭으로 이동"
            title="이전 탭으로 스크롤"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 좌측 그라데이션 페이드 인디케이터 */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-slate-900 to-transparent pointer-events-none rounded-l-2xl z-5" />
      )}

      {/* 탭 버튼 스크롤 컨테이너 */}
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-1 overflow-x-auto scroll-smooth py-0.5 px-1 w-full scrollbar-none select-none"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`${idPrefix}-${tab.id}`}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono uppercase shrink-0 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 우측 그라데이션 페이드 인디케이터 */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-900 to-transparent pointer-events-none rounded-r-2xl z-5" />
      )}

      {/* 우측 스크롤 화살표 버튼 */}
      {canScrollRight && (
        <div className="absolute right-1 z-10 flex items-center h-[calc(100%-12px)]">
          <button
            type="button"
            onClick={() => handleScrollStep('right')}
            className="h-8 w-8 rounded-xl bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 border border-slate-200 dark:border-slate-700 shadow-md flex items-center justify-center transition-all cursor-pointer backdrop-blur-xs"
            aria-label="다음 탭으로 이동"
            title="다음 탭으로 스크롤"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
