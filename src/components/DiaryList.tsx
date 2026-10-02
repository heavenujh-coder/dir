import React, { useState, useMemo } from 'react';
import type { DiaryEntry, EmotionType } from '../types/diary';
import { EMOTIONS } from '../types/diary';
import { AiResponseCard } from './AiResponseCard';
import {
  Search,
  Calendar,
  Trash2,
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Heart,
  BookOpen,
} from 'lucide-react';

interface DiaryListProps {
  entries: DiaryEntry[];
  onToggleAction: (id: string, completed: boolean) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteEntry: (id: string) => void;
  onGoToWrite: () => void;
}

export const DiaryList: React.FC<DiaryListProps> = ({
  entries,
  onToggleAction,
  onToggleFavorite,
  onDeleteEntry,
  onGoToWrite,
}) => {
  const [selectedEmotionFilter, setSelectedEmotionFilter] = useState<EmotionType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchEmotion =
        selectedEmotionFilter === 'all' || entry.emotion === selectedEmotionFilter;
      const matchSearch =
        !searchQuery.trim() ||
        entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.response?.comfortMessage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.response?.actionSuggestion?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.displayDate?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchEmotion && matchSearch;
    });
  }, [entries, selectedEmotionFilter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="bg-white/80 backdrop-blur-xs border border-stone-200/90 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-dodum flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-amber-700" />
              지난 일기장 서재
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              그동안 나를 스쳐간 감정들과 AI 비서의 다정한 답장들을 모아두었어요
            </p>
          </div>

          <span className="text-xs text-stone-500 self-start sm:self-auto font-medium">
            총 {entries.length}편의 기록
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-stone-100">
          {/* Emotion filter tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedEmotionFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 ${
                selectedEmotionFilter === 'all'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              전체 보기
            </button>
            {EMOTIONS.map((emo) => {
              const count = entries.filter((e) => e.emotion === emo.id).length;
              return (
                <button
                  key={emo.id}
                  onClick={() => setSelectedEmotionFilter(emo.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 ${
                    selectedEmotionFilter === emo.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  <span>{emo.emoji}</span>
                  <span>{emo.label}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="일기 내용이나 위로 문구 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-stone-200 bg-stone-50/80 text-xs text-stone-800 placeholder:text-stone-400 focus:bg-white focus:border-amber-600 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Diary Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="bg-white/60 border border-stone-200/80 rounded-2xl p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-stone-800 font-dodum text-base">
            {entries.length === 0
              ? '아직 작성된 일기가 없어요'
              : '조건에 맞는 일기를 찾을 수 없어요'}
          </h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {entries.length === 0
              ? '오늘 하루 있었던 일과 마음을 적고 첫 번째 AI 응원 편지를 받아보세요.'
              : '검색어를 바꾸거나 다른 감정 필터를 선택해보세요.'}
          </p>
          {entries.length === 0 && (
            <button
              onClick={onGoToWrite}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer"
            >
              오늘 일기 쓰러 가기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredEntries.map((entry) => {
            const emotionMeta = EMOTIONS.find((e) => e.id === entry.emotion) || EMOTIONS[0];
            const isExpanded = expandedId === entry.id;

            return (
              <div
                key={entry.id}
                className="bg-white/90 border border-stone-200/90 rounded-2xl shadow-2xs overflow-hidden transition-all"
              >
                {/* Entry Header / Summary Row */}
                <div className="p-4 sm:p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl" role="img" aria-label={emotionMeta.label}>
                        {emotionMeta.emoji}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-stone-900 font-dodum">
                            {emotionMeta.label}
                          </span>
                          <span className="text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full font-medium border border-amber-200/50">
                            {entry.response?.moodTag || '다정한 하루'}
                          </span>
                        </div>
                        <span className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          {entry.displayDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleFavorite(entry.id)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          entry.isFavorite
                            ? 'text-amber-500 bg-amber-50'
                            : 'text-stone-300 hover:text-stone-500 hover:bg-stone-100'
                        }`}
                        title="즐겨찾기"
                      >
                        <Star
                          className={`w-4 h-4 ${entry.isFavorite ? 'fill-amber-400' : ''}`}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('이 일기를 삭제하시겠습니까?')) {
                            onDeleteEntry(entry.id);
                          }
                        }}
                        className="p-2 rounded-lg text-stone-300 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="일기 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer ml-1"
                      >
                        <span>{isExpanded ? '접기' : '답장 보기'}</span>
                        {isExpanded ? (
                          <ChevronUp className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Diary Content Preview */}
                  <p className="text-sm text-stone-700 font-serif-kr line-clamp-2 leading-relaxed">
                    {entry.content}
                  </p>

                  {/* Tomorrow's Action Pill / Quick Check */}
                  {entry.response?.actionSuggestion && (
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100 text-xs">
                      <div className="flex items-center gap-2 text-stone-600">
                        <span className="font-semibold text-amber-700 font-dodum">
                          내일의 실천:
                        </span>
                        <span
                          className={`line-clamp-1 ${
                            entry.actionCompleted ? 'line-through text-stone-400' : 'text-stone-800'
                          }`}
                        >
                          {entry.response.actionSuggestion.title}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleAction(entry.id, !entry.actionCompleted)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                          entry.actionCompleted
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-stone-50 text-stone-600 border border-stone-200 hover:bg-amber-50 hover:text-amber-800'
                        }`}
                      >
                        <CheckCircle2
                          className={`w-3.5 h-3.5 ${
                            entry.actionCompleted ? 'text-emerald-600' : 'text-stone-400'
                          }`}
                        />
                        <span>{entry.actionCompleted ? '실천 완료' : '실천하기'}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Expanded Full AI Response View */}
                {isExpanded && (
                  <div className="border-t border-stone-200/80 p-4 sm:p-6 bg-stone-50/50">
                    <AiResponseCard entry={entry} onToggleAction={onToggleAction} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
