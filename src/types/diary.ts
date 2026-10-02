export type EmotionType = 'joy' | 'tired' | 'flutter' | 'anxious';

export interface EmotionInfo {
  id: EmotionType;
  label: string;
  sublabel: string;
  emoji: string;
  colorName: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  lightBg: string;
}

export interface ActionSuggestion {
  title: string;
  description: string;
}

export interface EncouragementResponse {
  comfortMessage: string;
  actionSuggestion: ActionSuggestion;
  encouragementQuote: string;
  moodTag: string;
}

export interface DiaryEntry {
  id: string;
  date: string; // YYYY-MM-DD
  displayDate: string; // 2026년 10월 1일 목요일
  emotion: EmotionType;
  content: string;
  response: EncouragementResponse;
  actionCompleted: boolean;
  actionCompletedAt?: number;
  createdAt: number;
  isFavorite?: boolean;
}

export const EMOTIONS: EmotionInfo[] = [
  {
    id: 'joy',
    label: '기쁨',
    sublabel: '행복하고 감사한 순간',
    emoji: '☀️',
    colorName: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-300',
    accentColor: 'from-amber-400 to-orange-400',
    lightBg: 'bg-amber-50/60',
  },
  {
    id: 'tired',
    label: '지침',
    sublabel: '토닥임이 필요한 피곤한 날',
    emoji: '🌙',
    colorName: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-900',
    borderColor: 'border-indigo-300',
    accentColor: 'from-indigo-400 to-slate-500',
    lightBg: 'bg-indigo-50/60',
  },
  {
    id: 'flutter',
    label: '설렘',
    sublabel: '두근거리는 시작과 기대',
    emoji: '🌸',
    colorName: 'rose',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-900',
    borderColor: 'border-rose-300',
    accentColor: 'from-rose-400 to-pink-400',
    lightBg: 'bg-rose-50/60',
  },
  {
    id: 'anxious',
    label: '불안',
    sublabel: '마음의 쉼과 안정이 필요할 때',
    emoji: '🍃',
    colorName: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-900',
    borderColor: 'border-emerald-300',
    accentColor: 'from-emerald-400 to-teal-500',
    lightBg: 'bg-emerald-50/60',
  },
];
