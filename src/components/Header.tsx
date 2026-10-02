import React from 'react';
import { BookOpen, PenLine, BarChart3, Sparkles, CloudCheck, HardDrive, Info } from 'lucide-react';

interface HeaderProps {
  activeTab: 'write' | 'list' | 'stats';
  onTabChange: (tab: 'write' | 'list' | 'stats') => void;
  diaryCount: number;
  isCloudSynced: boolean;
  onOpenInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  diaryCount,
  isCloudSynced,
  onOpenInfo,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date());

  return (
    <header className="border-b border-stone-200/80 bg-white/70 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand & Date */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-stone-900 font-dodum flex items-center gap-1.5">
                따뜻한 하루 일기
                <span className="text-xs font-normal text-amber-800 bg-amber-100/70 px-1.5 py-0.5 rounded-sm">
                  AI 응원
                </span>
              </h1>
              <p className="text-xs text-stone-500 flex items-center gap-1.5">
                <span>{todayFormatted}</span>
                <span className="text-stone-300">·</span>
                <span className="inline-flex items-center gap-1">
                  {isCloudSynced ? (
                    <>
                      <CloudCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px] text-emerald-700">Firebase 연동</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-3.5 h-3.5 text-stone-400" />
                      <span className="text-[11px] text-stone-500">로컬 안전 보관</span>
                    </>
                  )}
                </span>
              </p>
            </div>
          </div>

          {/* Info Modal trigger button for mobile */}
          <button
            onClick={onOpenInfo}
            className="sm:hidden p-2 rounded-lg text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
            title="앱 및 환경 설정 정보"
            aria-label="안내 정보"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs & Desktop Info */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <nav className="flex items-center p-1 bg-stone-100/90 rounded-xl border border-stone-200/80 text-xs font-medium">
            <button
              onClick={() => onTabChange('write')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'write'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>일기 쓰기</span>
            </button>

            <button
              onClick={() => onTabChange('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'list'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>지난 일기장</span>
              {diaryCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-bold">
                  {diaryCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange('stats')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-white text-stone-900 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>마음 통계</span>
            </button>
          </nav>

          <button
            onClick={onOpenInfo}
            className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-transparent hover:border-stone-200 transition-colors"
            title="앱 및 API 설정 안내"
          >
            <Info className="w-3.5 h-3.5" />
            <span>설정 안내</span>
          </button>
        </div>
      </div>
    </header>
  );
};
