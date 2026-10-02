import React, { useState } from 'react';
import type { EmotionType, DiaryEntry } from '../types/diary';
import { EmotionSelector } from './EmotionSelector';
import { requestAiEncouragement } from '../lib/gemini';
import { saveDiaryEntry } from '../lib/firebase';
import { Sparkles, Send, Loader2, Calendar, Lightbulb, RefreshCw, AlertCircle } from 'lucide-react';

interface DiaryFormProps {
  onDiarySaved: (entry: DiaryEntry) => void;
}

const INSPIRATION_PROMPTS = [
  '오늘 나를 미소 짓게 했던 소소한 순간',
  '누구에게도 털어놓지 못했던 솔직한 마음',
  '오늘 하루 가장 수고 많았던 나에게 해주고 싶은 말',
  '마음이 무겁거나 지치게 했던 일',
];

export const DiaryForm: React.FC<DiaryFormProps> = ({ onDiarySaved }) => {
  const [emotion, setEmotion] = useState<EmotionType>('joy');
  const [content, setContent] = useState('');
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formatted date string for Korean display
  const displayDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  }).format(new Date(date + 'T00:00:00'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setErrorMessage('오늘 하루 있었던 일이나 떠오르는 마음을 한 줄이라도 적어주세요.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Call Gemini API via server route / fallback
      const aiResponse = await requestAiEncouragement({
        content: content.trim(),
        emotion,
        date: displayDate,
      });

      // 2. Save to Firestore & local storage
      const savedEntry = await saveDiaryEntry({
        date,
        displayDate,
        emotion,
        content: content.trim(),
        response: aiResponse,
        actionCompleted: false,
        createdAt: Date.now(),
        isFavorite: false,
      });

      // 3. Notify parent component to display response
      onDiarySaved(savedEntry);
      setContent('');
    } catch (err: any) {
      console.error('Error submitting diary:', err);
      setErrorMessage(
        err?.message ||
          'AI 응원 편지를 불러오는 중 문제가 발생했습니다. API 키 설정 또는 네트워크를 확인해주세요.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyPrompt = (promptText: string) => {
    if (content.trim()) {
      setContent((prev) => prev + `\n- ${promptText}: `);
    } else {
      setContent(`- ${promptText}: `);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-xs border border-stone-200/90 rounded-2xl shadow-xs p-5 sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date Selection */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-stone-200/60">
          <div>
            <span className="text-xs font-semibold text-amber-700 tracking-wider font-dodum">
              TODAY'S JOURNAL
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-dodum">
              오늘 하루의 마음을 남겨주세요
            </h2>
          </div>
          <div className="flex items-center gap-2 text-stone-600 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200/80 text-xs">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLoading}
              className="bg-transparent text-stone-700 font-medium focus:outline-hidden cursor-pointer"
            />
          </div>
        </div>

        {/* Emotion Selector */}
        <EmotionSelector
          selectedEmotion={emotion}
          onSelectEmotion={setEmotion}
          disabled={isLoading}
        />

        {/* Writing Prompts (Quiet inspiration chips) */}
        <div>
          <div className="flex items-center gap-1.5 mb-2 text-xs text-stone-500 font-medium">
            <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
            <span>무엇을 적을지 고민된다면 다음 주제를 탭해보세요</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {INSPIRATION_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleApplyPrompt(prompt)}
                className="text-xs px-2.5 py-1 rounded-lg bg-stone-100/80 hover:bg-stone-200/80 text-stone-600 hover:text-stone-900 transition-colors border border-stone-200/50 cursor-pointer text-left"
              >
                + {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Diary Content Textarea */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="diary-content" className="block text-sm font-semibold text-stone-800 font-dodum">
              오늘 있었던 일과 생각
            </label>
            <span className="text-xs text-stone-600 font-mono">
              {content.length}자
            </span>
          </div>

          <div className="relative">
            <textarea
              id="diary-content"
              rows={6}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
              placeholder="오늘 어떤 일들이 있었나요? 기뻤던 일, 속상했던 일, 문득 스쳐간 생각까지... 그 어떤 이야기라도 괜찮아요. 편안하게 당신의 마음을 털어놓아 보세요."
              className="w-full rounded-xl border border-stone-300/90 bg-[#fdfcf9] px-4 py-3.5 text-sm sm:text-base text-stone-800 placeholder:text-stone-400 focus:border-amber-600 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 font-serif-kr leading-relaxed transition-all resize-y"
            />
          </div>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-rose-800 text-xs sm:text-sm">
            <div className="flex items-start gap-3 flex-1">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-900">응답을 받아오지 못했습니다</p>
                <p className="text-rose-700 leading-relaxed">{errorMessage}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>다시 시도하기</span>
              </button>
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                className="text-stone-400 hover:text-stone-600 px-2 py-1 text-xs"
              >
                닫기
              </button>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading || !content.trim()}
            className={`w-full py-4 px-6 rounded-xl font-bold font-dodum text-base sm:text-lg flex items-center justify-center gap-2.5 transition-all shadow-sm cursor-pointer ${
              isLoading || !content.trim()
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300/50'
                : 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 hover:from-amber-700 hover:to-orange-600 text-white shadow-amber-500/15 hover:shadow-md hover:scale-[1.005] active:scale-[0.995]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>AI 비서가 다정한 마음으로 답장을 작성하고 있어요...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 fill-amber-200 text-amber-200" />
                <span>AI 비서에게 일기 보여주기</span>
                <Send className="w-4 h-4 ml-1 opacity-80" />
              </>
            )}
          </button>
          <p className="text-center text-xs text-stone-500 mt-2.5">
            당신의 소중한 일기는 Firebase 데이터베이스에 안전하게 보관되며 언제든 다시 꺼내볼 수 있습니다.
          </p>
        </div>
      </form>
    </div>
  );
};
