import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Helper to retrieve API key safely from environment
const getApiKey = (): string => {
  return process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';
};

const CANDIDATE_MODELS = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];

// API Endpoint for generating warm diary encouragement
app.post(['/api/encourage', '/api/gemini/encourage'], async (req: Request, res: Response) => {
  try {
    const { content, emotion, date } = req.body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: '일기 내용을 입력해주세요.' });
    }

    const apiKey = getApiKey();
    if (!apiKey) {
      return res.status(500).json({
        error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다. .env 파일이나 호스팅 환경 변수에 GEMINI_API_KEY를 등록해주세요.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const emotionLabels: Record<string, string> = {
      joy: '기쁨 (감사함, 뿌듯함, 행복한 하루)',
      tired: '지침 (방전됨, 피로함, 쉼이 간절한 하루)',
      flutter: '설렘 (기대감, 두근거림, 새로운 시작)',
      anxious: '불안 (걱정, 초조함, 안정이 필요한 하루)',
    };
    const emotionText = emotionLabels[emotion] || emotion || '기쁨';

    const systemInstruction = `당신은 사용자의 하루를 가장 따뜻하고 다정하게 안아주는 '마음 비서'이자 온기 어린 친구입니다.
사용자의 마음 상태와 일기 속 감정에 깊이 공감하고, 진심 어린 위로와 내일을 위한 실천 제안을 전해주세요.
모든 글은 부드럽고 다정한 한국어 어투(~해요, ~했어요, ~일 거예요)로 작성하며, 지나치게 판에 박힌 상투적인 문구가 아닌 진정성 있는 온기를 전해야 합니다.`;

    const userPrompt = `[오늘의 감정 및 일기]
- 작성 날짜: ${date || '오늘'}
- 사용자의 감정: ${emotionText}
- 일기 본문:
"""
${content}
"""

위 일기를 다정하고 섬세하게 읽고 다음 JSON 형식으로 따뜻한 응원 편지를 작성해주세요:
1. comfortMessage: 사용자가 느낀 감정을 온전히 인정해주고 알아주는 다정하고 따뜻한 위로와 공감의 편지글 (2~3개 단락). 일기 속 상황과 감정을 자연스럽게 인용하며 온기를 전하세요.
2. actionSuggestion: 내일을 조금 더 가볍고 행복하게 맞이할 수 있는 소소하고 확실한 긍정적 행동 1가지. (title: 15자 내외의 명확한 행동 제목, description: 부담 없이 실천할 수 있는 구체적인 팁 2~3문장).
3. encouragementQuote: 마음속에 간직하고 싶을 만큼 뭉클하고 다정한 한 줄 문구.
4. moodTag: 오늘 하루를 요약하고 축복하는 감성 태그 (예: 잔잔한 쉼표, 빛나는 용기, 반짝이는 설렘, 토닥토닥 등).`;

    let lastError: any = null;
    let parsedData = null;

    // Multi-model fallback sequence to mitigate temporary 503 spikes
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: userPrompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                comfortMessage: {
                  type: Type.STRING,
                  description: '사용자의 감정을 다정하게 위로하고 깊게 공감하는 2~3단락의 편지글',
                },
                actionSuggestion: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: '내일을 위한 긍정적 행동 제목',
                    },
                    description: {
                      type: Type.STRING,
                      description: '추천 이유와 실천 가이드',
                    },
                  },
                  required: ['title', 'description'],
                },
                encouragementQuote: {
                  type: Type.STRING,
                  description: '가슴에 남는 따뜻한 한 줄 응원 문구',
                },
                moodTag: {
                  type: Type.STRING,
                  description: '오늘 하루의 감성 태그',
                },
              },
              required: ['comfortMessage', 'actionSuggestion', 'encouragementQuote', 'moodTag'],
            },
          },
        });

        const responseText = response.text;
        if (responseText) {
          parsedData = JSON.parse(responseText);
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${model} unavailable, trying fallback:`, err?.message);
        lastError = err;
        await new Promise((resolve) => setTimeout(resolve, 600));
      }
    }

    if (!parsedData) {
      throw lastError || new Error('답장을 생성하지 못했습니다.');
    }

    return res.status(200).json(parsedData);
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    const rawMsg = error?.message || '';
    let userFriendlyMsg = '답장을 생성하는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';

    if (rawMsg.includes('503') || rawMsg.includes('high demand') || rawMsg.includes('UNAVAILABLE')) {
      userFriendlyMsg = '현재 구글 AI 서버 이용량이 일시적으로 급증했습니다 (503). 2~3초 뒤 [다시 시도하기] 버튼을 눌러주세요.';
    } else if (rawMsg.includes('429') || rawMsg.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyMsg = '요청 한도에 도달했습니다. 잠시 후 다시 시도해주세요.';
    }

    return res.status(503).json({
      error: userFriendlyMsg,
      rawError: rawMsg,
    });
  }
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(getApiKey()),
    time: new Date().toISOString(),
  });
});

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(` 따뜻한 하루 일기 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
