# 따뜻한 하루 일기 & AI 응원 (Warm Daily Diary)

오늘의 감정을 기록하고 Google Gemini API를 통해 다정한 위로와 내일을 위한 긍정적인 실천 제안을 받는 웹 애플리케이션입니다.

---

## 🛠️ 주요 기능
- **오늘의 감정 날씨 선택**: 기쁨 ☀️, 지침 🌙, 설렘 🌸, 불안 🍃
- **다정한 AI 응원 답장**: `@google/genai` (Gemini 3.8 Flash + 다중 모델 백업)를 활용한 위로 편지
- **내일을 위한 긍정적 행동 1가지**: 부담 없는 소소한 행동 추천 및 실천 체크 기능
- **데이터베이스 영구 저장**: Firebase Firestore + LocalStorage 이중 캐싱 지원
- **안전한 보안 아키텍처**: API 키는 서버 사이드 프록시 및 Vercel Serverless Function을 통해서만 호출되어 브라우저에 노출되지 않음

---

## 🚀 Vercel 배포 가이드 (GitHub 연동)

### 1단계: GitHub에 소스코드 푸시
```bash
git init
git add .
git commit -m "feat: 따뜻한 하루 일기 웹앱 완성"
git branch -M main
git remote add origin https://github.com/사용자아이디/레포지토리이름.git
git push -u origin main
```

### 2단계: Vercel에서 프로젝트 Import
1. [Vercel](https://vercel.com) 로그인 후 **Add New > Project**를 클릭합니다.
2. 방금 올린 GitHub 저장소를 선택(Import)합니다.
3. **Framework Preset**은 자동으로 `Vite`로 인식됩니다.
   - Build Command: `vite build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 3단계: 환경 변수(Environment Variables) 등록 (필수)
Vercel 대시보드의 **Environment Variables** 탭에서 아래 항목을 등록해주세요:

| Key | Value | 설명 |
|---|---|---|
| `GEMINI_API_KEY` | `AIzaSy...` (본인의 Gemini API 키) | Google AI Studio에서 발급받은 API 키 |

4. **Deploy** 버튼을 누르면 약 1분 이내에 배포가 완료됩니다!

---

## 💻 로컬 개발 환경 실행 방법

1. 저장소 클론 및 패키지 설치:
```bash
git clone https://github.com/사용자아이디/레포지토리이름.git
cd 레포지토리이름
npm install
```

2. `.env` 파일 생성:
루트 디렉토리에 `.env.example`을 복사하여 `.env`를 만듭니다:
```bash
cp .env.example .env
```
`.env` 파일에 발급받은 Gemini API 키를 입력합니다:
```env
GEMINI_API_KEY="AIzaSy..."
```

3. 로컬 개발 서버 실행:
```bash
npm run dev
```
브라우저에서 `http://localhost:3000`으로 접속합니다.
