import React, { useState } from 'react';
import type { DiaryEntry, EncouragementResponse } from '../types/diary';
import { EMOTIONS } from '../types/diary';
import {
  Sparkles,
  Heart,
  CheckCircle2,
  Circle,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Calendar,
  Share2,
  BookmarkCheck,
} from 'lucide-react';

interface AiResponseCardProps {
  entry: DiaryEntry;
  onToggleAction?: (id: string, completed: boolean) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const AiResponseCard: React.FC<AiResponseCardProps> = ({
  entry,
  onToggleAction,
  onClose,
  showCloseButton = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const currentEmotion = EMOTIONS.find((e) => e.id === entry.emotion) || EMOTIONS[0];
  const response: EncouragementResponse = entry.response;

  // Handle Korean Speech Synthesis
  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('이 브라우저는 음성 읽어주기 기능을 지원하지 않습니다.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const textToSpeak = `${response.comfortMessage}. 내일을 위한 작은 행동입니다. ${response.actionSuggestion.title}. ${response.actionSuggestion.description}. ${response.encouragementQuote}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'ko-KR';
    utterance.rate = 0.95; // Gentle pace
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleCopy = async () => {
    const text = `[따뜻한 하루 일기 - AI 친구의 응원]\n\n날짜: ${entry.displayDate}\n마음 날씨: ${currentEmotion.label} ${currentEmotion.emoji}\n\n💌 다정한 위로:\n${response.comfortMessage}\n\n🌱 내일을 위한 작은 한 걸음:\n[${response.actionSuggestion.title}]\n${response.actionSuggestion.description}\n\n✨ 오늘의 마음에 품는 한 줄:\n"${response.encouragementQuote}"`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Failed to copy', e);
    }
  };

  return (
    <div className="bg-amber-50/40 border border-stone-200/90 rounded-2xl shadow-sm overflow-hidden text-stone-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-700 text-white px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-xs">
            <Heart className="w-4 h-4 fill-white text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-base font-dodum flex items-center gap-1.5">
              AI 비서의 따뜻한 답장
              <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-normal">
                {response.moodTag}
              </span>
            </h3>
            <p className="text-xs text-amber-100 flex items-center gap-1.5">
              <span>{entry.displayDate}</span>
              <span>·</span>
              <span>
                {currentEmotion.label} {currentEmotion.emoji}
              </span>
            </p>
          </div>
        </div>

        {/* Action utility buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleSpeech}
            className={`p-2 rounded-lg text-white transition-colors cursor-pointer ${
              isPlayingAudio ? 'bg-amber-800' : 'bg-white/15 hover:bg-white/25'
            }`}
            title={isPlayingAudio ? '읽기 멈추기' : '소리내어 편지 듣기'}
            aria-label="음성 읽기"
          >
            {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
            title="답장 복사하기"
            aria-label="답장 복사"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="p-5 sm:p-7 space-y-6">
        {/* User's Original Diary Snippet (Quiet Reference) */}
        <div className="bg-stone-50 border border-stone-200/60 rounded-xl p-3.5 text-xs text-stone-600">
          <div className="flex items-center justify-between text-stone-400 mb-1">
            <span className="font-medium text-stone-700">내가 남긴 오늘의 기록</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {entry.date}
            </span>
          </div>
          <p className="line-clamp-2 italic text-stone-600 font-serif-kr">"{entry.content}"</p>
        </div>

        {/* 1. Comfort & Empathy Message */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-amber-800">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-bold font-dodum tracking-tight">다정한 위로와 공감</h4>
          </div>
          <div className="bg-white rounded-xl p-5 border border-amber-100 shadow-2xs">
            <p className="font-serif-kr text-[15px] leading-relaxed text-stone-700 whitespace-pre-line">
              {response.comfortMessage}
            </p>
          </div>
        </div>

        {/* 2. Positive Action Suggestion for Tomorrow */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-stone-800">
              <span className="text-lg">🌱</span>
              <h4 className="text-sm font-bold font-dodum tracking-tight">
                내일을 위한 긍정적인 행동 1가지
              </h4>
            </div>
            {onToggleAction && (
              <span className="text-xs text-stone-500">
                {entry.actionCompleted ? '실천 완료됨' : '내일 실천해보기'}
              </span>
            )}
          </div>

          <div
            className={`rounded-xl p-4.5 border transition-all ${
              entry.actionCompleted
                ? 'bg-emerald-50/70 border-emerald-300'
                : 'bg-white border-amber-200/90 shadow-2xs'
            }`}
          >
            <div className="flex items-start gap-3">
              {onToggleAction && (
                <button
                  type="button"
                  onClick={() => onToggleAction(entry.id, !entry.actionCompleted)}
                  className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors cursor-pointer"
                  title={entry.actionCompleted ? '실천 완료 취소' : '실천 완료 체크하기'}
                >
                  {entry.actionCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-stone-300 hover:text-stone-400" />
                  )}
                </button>
              )}
              <div className="flex-1 space-y-1.5">
                <h5
                  className={`text-base font-bold font-dodum ${
                    entry.actionCompleted ? 'text-emerald-900 line-through' : 'text-stone-900'
                  }`}
                >
                  {response.actionSuggestion.title}
                </h5>
                <p className="text-xs sm:text-sm text-stone-600 leading-relaxed font-sans">
                  {response.actionSuggestion.description}
                </p>

                {onToggleAction && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => onToggleAction(entry.id, !entry.actionCompleted)}
                      className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                        entry.actionCompleted
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      <BookmarkCheck className="w-3.5 h-3.5" />
                      {entry.actionCompleted ? '내일 실천 완료했습니다!' : '내일 꼭 실천해볼게요 ✨'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Daily Heartwarming Quote */}
        <div className="bg-gradient-to-br from-amber-100/60 to-orange-100/40 rounded-xl p-4 border border-amber-200/60 text-center">
          <p className="text-xs text-amber-800/80 mb-1 font-medium">오늘 마음에 품을 한 줄</p>
          <p className="font-serif-kr text-base font-semibold text-stone-800">
            "{response.encouragementQuote}"
          </p>
        </div>

        {/* Footer actions */}
        {showCloseButton && onClose && (
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-medium hover:bg-stone-800 transition-colors cursor-pointer"
            >
              닫기
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
