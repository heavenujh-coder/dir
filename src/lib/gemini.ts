import type { EmotionType, EncouragementResponse } from '../types/diary';

interface RequestParams {
  content: string;
  emotion: EmotionType;
  date: string;
}

export async function requestAiEncouragement(params: RequestParams): Promise<EncouragementResponse> {
  const { content, emotion, date } = params;

  // 1. Try server proxy endpoint first (Preferred for security: process.env.GEMINI_API_KEY)
  try {
    const response = await fetch('/api/encourage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content, emotion, date }),
    });

    if (response.ok) {
      const data = await response.json();
      return validateEncouragementData(data);
    }

    // If server responded with specific error message
    const errData = await response.json().catch(() => null);
    if (errData && response.status !== 404) {
      let msg = errData.error || errData.message;
      if (typeof msg === 'object') {
        msg = msg.message || JSON.stringify(msg);
      }
      if (typeof msg === 'string') {
        if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE')) {
          msg = '현재 구글 AI 서버에 일시적인 접속량 급증이 발생했습니다 (503). 잠시 후 [다시 시도하기]를 눌러주세요.';
        } else if (msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')) {
          msg = 'API 사용 한도에 도달했습니다. 잠시 후 다시 시도해주세요.';
        }
      }
      throw new Error(msg || `서버 오류가 발생했습니다 (${response.status})`);
    }
  } catch (err: any) {
    // If it's a known error message thrown from above, propagate
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    console.warn('Backend proxy fetch failed or not found, attempting client fallback if key exists:', err);
  }

  // 2. Fallback: If deployed as a purely static site with VITE_GEMINI_API_KEY in client env
  const clientApiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (clientApiKey) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${clientApiKey}`;
      
      const emotionLabels: Record<string, string> = {
        joy: '기쁨 (감사함, 행복한 하루)',
        tired: '지침 (방전됨, 위로가 필요한 하루)',
        flutter: '설렘 (기대감, 새로운 시작)',
        anxious: '불안 (초조함, 안정이 필요한 하루)',
      };
      const emotionText = emotionLabels[emotion] || emotion;

      const systemPrompt = `당신은 사용자의 하루를 가장 따뜻하고 다정하게 안아주는 '마음 비서'이자 온기 어린 친구입니다.
사용자의 마음 상태와 일기 속 감정에 깊이 공감하고, 진심 어린 위로와 내일을 위한 실천 제안을 전해주세요.
모든 글은 부드럽고 다정한 한국어 어투(~해요, ~했어요)로 작성하며, 지나치게 판에 박힌 상투적인 문구가 아닌 진정성 있는 온기를 전해야 합니다.
반드시 아래 JSON 포맷으로만 응답해주세요:
{
  "comfortMessage": "사용자의 감정을 다정하게 위로하고 깊게 공감하는 2~3단락의 편지글",
  "actionSuggestion": {
    "title": "내일을 위한 긍정적 작은 행동 제안 제목",
    "description": "추천 이유와 소소한 실천 가이드"
  },
  "encouragementQuote": "마음속에 품을 수 있는 다정한 한 줄 응원 문구",
  "moodTag": "오늘 하루를 요약하는 감성 태그"
}`;

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\n[오늘의 일기]\n날짜: ${date}\n감정: ${emotionText}\n내용:\n${content}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      });

      if (!res.ok) {
        const errorDetail = await res.json().catch(() => null);
        throw new Error(errorDetail?.error?.message || `API 요청 실패 (HTTP ${res.status})`);
      }

      const resJson = await res.json();
      const textOutput = resJson?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textOutput) {
        const parsed = JSON.parse(textOutput);
        return validateEncouragementData(parsed);
      }
    } catch (e: any) {
      throw new Error(`Gemini API 통신 실패: ${e?.message || '알 수 없는 오류'}`);
    }
  }

  throw new Error(
    'GEMINI_API_KEY가 서버 또는 환경 변수에 설정되어 있지 않습니다. .env 파일에 GEMINI_API_KEY를 설정하거나 Vercel 환경 변수를 확인해주세요.'
  );
}

function validateEncouragementData(data: any): EncouragementResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('올바르지 않은 응답 형식입니다.');
  }

  return {
    comfortMessage:
      data.comfortMessage ||
      '오늘 하루도 정말 고생 많으셨어요. 당신의 마음을 가만히 보듬어 드리고 싶어요. 오늘 하루를 묵묵히 버텨낸 것만으로도 당신은 충분히 빛나고 있습니다.',
    actionSuggestion: {
      title: data.actionSuggestion?.title || '따뜻한 차 한 잔과 함께 깊은 숨 3번 들이쉬기',
      description:
        data.actionSuggestion?.description ||
        '내일 아침 시작할 때 좋아하는 따뜻한 음료를 마시며 천천히 숨을 고르고, 나를 위한 온전한 5분을 선물해보세요.',
    },
    encouragementQuote:
      data.encouragementQuote || '내일의 아침 햇살은 오늘보다 조금 더 따스하게 당신을 비출 거예요.',
    moodTag: data.moodTag || '따스한 온기',
  };
}
