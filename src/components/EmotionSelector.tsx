import React from 'react';
import { EMOTIONS, type EmotionType } from '../types/diary';
import { Check } from 'lucide-react';

interface EmotionSelectorProps {
  selectedEmotion: EmotionType;
  onSelectEmotion: (emotion: EmotionType) => void;
  disabled?: boolean;
}

export const EmotionSelector: React.FC<EmotionSelectorProps> = ({
  selectedEmotion,
  onSelectEmotion,
  disabled = false,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-stone-800 font-dodum">
          오늘 나의 마음 날씨 <span className="text-amber-600 font-normal text-xs ml-1">(감정 1개 선택)</span>
        </label>
        <span className="text-xs text-stone-500">
          지금 마음에 가장 가까운 단어를 골라주세요
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {EMOTIONS.map((emotion) => {
          const isSelected = selectedEmotion === emotion.id;
          return (
            <button
              key={emotion.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectEmotion(emotion.id)}
              className={`relative flex flex-col items-start p-3.5 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'border-amber-700 bg-amber-50/80 shadow-xs ring-1 ring-amber-600/30'
                  : 'border-stone-200 bg-white/90 hover:bg-stone-50/90 hover:border-stone-300'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <span className="text-2xl select-none" role="img" aria-label={emotion.label}>
                  {emotion.emoji}
                </span>
                {isSelected && (
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-600 text-white shadow-xs">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </span>
                )}
              </div>
              <span className={`text-base font-semibold font-dodum ${isSelected ? 'text-amber-950' : 'text-stone-800'}`}>
                {emotion.label}
              </span>
              <span className="text-xs text-stone-500 mt-0.5 line-clamp-1">
                {emotion.sublabel}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
