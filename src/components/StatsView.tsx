import React from 'react';
import type { DiaryEntry } from '../types/diary';
import { EMOTIONS } from '../types/diary';
import { Heart, Sparkles, Award, CheckCircle, TrendingUp } from 'lucide-react';

interface StatsViewProps {
  entries: DiaryEntry[];
  onGoToWrite: () => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ entries, onGoToWrite }) => {
  const totalDiaries = entries.length;
  const completedActions = entries.filter((e) => e.actionCompleted).length;
  const actionCompletionRate = totalDiaries > 0 ? Math.round((completedActions / totalDiaries) * 100) : 0;

  // Emotion breakdown
  const emotionCounts = EMOTIONS.map((emo) => {
    const count = entries.filter((e) => e.emotion === emo.id).length;
    const percentage = totalDiaries > 0 ? Math.round((count / totalDiaries) * 100) : 0;
    return {
      ...emo,
      count,
      percentage,
    };
  });

  const dominantEmotion = [...emotionCounts].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-xs border border-stone-200/90 rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-semibold text-amber-700 tracking-wider font-dodum">
            EMOTIONAL INSIGHTS
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-stone-900 font-dodum mt-0.5">
            나의 마음 날씨 정원
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            기록해온 일기들을 통해 내 마음이 건네온 신호들을 돌아봅니다
          </p>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-stone-50/80 border border-stone-200/70 rounded-xl p-4.5">
            <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
              <span>기록한 하루</span>
              <Heart className="w-4 h-4 text-amber-600" />
            </div>
            <p className="text-2xl font-bold font-dodum text-stone-900">
              {totalDiaries}
              <span className="text-xs font-normal text-stone-500 ml-1">일의 이야기</span>
            </p>
          </div>

          <div className="bg-stone-50/80 border border-stone-200/70 rounded-xl p-4.5">
            <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
              <span>내일의 실천 달성</span>
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-dodum text-stone-900">
              {completedActions}
              <span className="text-xs font-normal text-stone-500 ml-1">번 완료 ({actionCompletionRate}%)</span>
            </p>
          </div>

          <div className="bg-stone-50/80 border border-stone-200/70 rounded-xl p-4.5">
            <div className="flex items-center justify-between text-stone-500 text-xs mb-1">
              <span>가장 잦았던 감정</span>
              <Sparkles className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-xl font-bold font-dodum text-stone-900 flex items-center gap-1.5">
              {totalDiaries > 0 ? (
                <>
                  <span>{dominantEmotion.emoji}</span>
                  <span>{dominantEmotion.label}</span>
                </>
              ) : (
                <span className="text-sm font-normal text-stone-400">기록 대기 중</span>
              )}
            </p>
          </div>
        </div>

        {/* Emotion Distribution Bars */}
        <div className="space-y-4 pt-2">
          <h3 className="text-sm font-bold text-stone-800 font-dodum flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-amber-700" />
            감정 날씨 분포
          </h3>

          <div className="space-y-3">
            {emotionCounts.map((item) => (
              <div key={item.id} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-medium text-stone-700">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{item.emoji}</span>
                    <span className="font-semibold">{item.label}</span>
                    <span className="text-stone-400 font-normal">({item.sublabel})</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-stone-500">{item.count}회</span>
                    <span className="font-bold text-stone-900">{item.percentage}%</span>
                  </div>
                </div>

                <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${item.accentColor}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warm Psychological Reflection Note */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-semibold font-dodum text-sm">
            <Award className="w-4 h-4 text-amber-700" />
            마음 친구의 다정한 코멘트
          </div>
          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-serif-kr">
            {totalDiaries === 0
              ? '아직 일기를 작성하지 않았어요. 어떤 감정이든 괜찮으니 편안하게 첫 장을 열어보세요.'
              : dominantEmotion.id === 'tired'
              ? '최근 지치고 고단한 날들이 많으셨군요. 그런 날들 속에서도 묵묵히 버텨내며 일기를 적어 내려간 당신은 정말 강한 사람이에요. 나를 위한 충분한 휴식을 선물해 주세요.'
              : dominantEmotion.id === 'anxious'
              ? '불안하고 걱정스러운 마음이 스쳐갈 때가 많았네요. 불안은 그만큼 내가 무언가를 소중히 여기고 잘 해내고 싶다는 증거이기도 해요. 천천히 호흡하며 지금 이 순간의 나를 안아주세요.'
              : dominantEmotion.id === 'flutter'
              ? '설렘과 기대감으로 가득한 날들을 지나고 계시네요! 새로운 시작과 두근거림을 온전히 즐기며 오늘 하루를 만끽해 보세요.'
              : '감사와 기쁨이 풍성했던 날들이 많았군요! 행복한 순간을 기록해두면 훗날 지칠 때 꺼내볼 수 있는 든든한 등대가 되어준답니다.'}
          </p>
        </div>

        <div className="pt-2 text-center">
          <button
            onClick={onGoToWrite}
            className="px-5 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
          >
            새로운 일기 작성하기
          </button>
        </div>
      </div>
    </div>
  );
};
