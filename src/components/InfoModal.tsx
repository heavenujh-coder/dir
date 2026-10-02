import React from 'react';
import { X, ShieldCheck, Database, KeyRound, Server, Check } from 'lucide-react';
import { firebaseConfig } from '../lib/firebase';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-100 p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-base text-stone-900 font-dodum">
              시스템 및 보안 아키텍처 안내
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-5 text-xs text-stone-600 leading-relaxed">
          {/* Section 1: Security & API Key */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-stone-800 font-bold font-dodum text-sm">
              <KeyRound className="w-4 h-4 text-amber-700" />
              API 키 보안 및 서버 사이드 프록시
            </div>
            <p>
              Google Gemini API 키는 클라이언트 코드에 직접 하드코딩되지 않고, <strong>서버 사이드 프록시(Express 및 Vercel Serverless Function)</strong>를 통해 안전하게 처리됩니다.
            </p>
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 font-mono text-[11px] text-stone-700 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
                <Check className="w-3.5 h-3.5" />
                <span>서버 환경 변수: process.env.GEMINI_API_KEY</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600">
                <span>• 프록시 엔드포인트: /api/encourage</span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600">
                <span>• AI 모델: gemini-3.8-flash (@google/genai)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Firebase Database */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-stone-800 font-bold font-dodum text-sm">
              <Database className="w-4 h-4 text-orange-600" />
              Firebase Firestore 데이터베이스 연동
            </div>
            <p>
              입력하신 일기와 AI 답장은 제공해주신 Firebase 프로젝트에 안전하게 저장됩니다.
            </p>
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-200 font-mono text-[11px] text-stone-700 space-y-1">
              <div><strong className="text-stone-900">Project ID:</strong> {firebaseConfig.projectId}</div>
              <div><strong className="text-stone-900">Auth Domain:</strong> {firebaseConfig.authDomain}</div>
              <div><strong className="text-stone-900">Storage Bucket:</strong> {firebaseConfig.storageBucket}</div>
              <div><strong className="text-stone-900">오프라인 보장:</strong> LocalStorage 이중 캐싱 지원</div>
            </div>
          </div>

          {/* Section 3: Vercel & Local Deployment */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-stone-800 font-bold font-dodum text-sm">
              <Server className="w-4 h-4 text-indigo-600" />
              배포 및 로컬 실행 가이드
            </div>
            <div className="space-y-1.5">
              <p>
                <strong>1. Vercel 배포 시:</strong><br />
                Vercel 프로젝트 대시보드 <em>Settings &gt; Environment Variables</em>에서 <code className="bg-stone-100 px-1 py-0.5 rounded text-amber-800">GEMINI_API_KEY</code>를 등록하시면 <code className="bg-stone-100 px-1 py-0.5 rounded">api/encourage.ts</code>가 자동으로 동작합니다.
              </p>
              <p>
                <strong>2. 로컬 테스트 시:</strong><br />
                프로젝트 루트의 <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">.env.example</code> 파일을 복사하여 <code className="bg-stone-100 px-1 py-0.5 rounded text-stone-800">.env</code> 파일을 만들고 본인의 API 키를 입력하세요.
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
