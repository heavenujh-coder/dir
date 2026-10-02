/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import type { DiaryEntry } from './types/diary';
import { fetchDiaryEntries, updateActionCompleted, toggleFavorite, deleteDiaryEntry } from './lib/firebase';
import { Header } from './components/Header';
import { DiaryForm } from './components/DiaryForm';
import { DiaryList } from './components/DiaryList';
import { StatsView } from './components/StatsView';
import { AiResponseCard } from './components/AiResponseCard';
import { InfoModal } from './components/InfoModal';
import { Sparkles, PenLine, BookOpen, Check } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'write' | 'list' | 'stats'>('write');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(false);
  const [latestSavedEntry, setLatestSavedEntry] = useState<DiaryEntry | null>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load diaries on mount
  useEffect(() => {
    async function loadData() {
      try {
        const { entries: loaded, isCloudSynced: synced } = await fetchDiaryEntries();
        setEntries(loaded);
        setIsCloudSynced(synced);
      } catch (e) {
        console.warn('Initial data load notice:', e);
      }
    }
    loadData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleDiarySaved = (newEntry: DiaryEntry) => {
    setEntries((prev) => [newEntry, ...prev.filter((e) => e.id !== newEntry.id)]);
    setLatestSavedEntry(newEntry);
    showToast('AI 비서의 따뜻한 답장이 도착했습니다!');
  };

  const handleToggleAction = async (id: string, completed: boolean) => {
    await updateActionCompleted(id, completed);
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, actionCompleted: completed } : e))
    );
    if (latestSavedEntry && latestSavedEntry.id === id) {
      setLatestSavedEntry((prev) => (prev ? { ...prev, actionCompleted: completed } : null));
    }
    showToast(completed ? '내일의 긍정적인 실천을 완료했습니다! 🎉' : '실천 완료 상태를 변경했습니다.');
  };

  const handleToggleFavorite = async (id: string) => {
    const nextState = await toggleFavorite(id);
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, isFavorite: nextState } : e))
    );
    showToast(nextState ? '즐겨찾기에 담았습니다 ⭐' : '즐겨찾기에서 제외했습니다.');
  };

  const handleDeleteEntry = async (id: string) => {
    await deleteDiaryEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
    if (latestSavedEntry && latestSavedEntry.id === id) {
      setLatestSavedEntry(null);
    }
    showToast('일기가 삭제되었습니다.');
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-stone-800 paper-texture flex flex-col font-sans selection:bg-amber-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'write') {
            setLatestSavedEntry(null);
          }
        }}
        diaryCount={entries.length}
        isCloudSynced={isCloudSynced}
        onOpenInfo={() => setIsInfoModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Tab 1: Write Diary */}
        {activeTab === 'write' && (
          <div className="space-y-6">
            {latestSavedEntry ? (
              <div className="space-y-5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-800">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <h2 className="text-lg font-bold font-dodum">방금 도착한 따뜻한 답장</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setLatestSavedEntry(null)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <PenLine className="w-3.5 h-3.5" />
                      새 일기 쓰기
                    </button>
                    <button
                      onClick={() => {
                        setLatestSavedEntry(null);
                        setActiveTab('list');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-medium transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      서재로 가기
                    </button>
                  </div>
                </div>

                <AiResponseCard
                  entry={latestSavedEntry}
                  onToggleAction={handleToggleAction}
                  onClose={() => setLatestSavedEntry(null)}
                />
              </div>
            ) : (
              <DiaryForm onDiarySaved={handleDiarySaved} />
            )}
          </div>
        )}

        {/* Tab 2: Past Diaries List */}
        {activeTab === 'list' && (
          <DiaryList
            entries={entries}
            onToggleAction={handleToggleAction}
            onToggleFavorite={handleToggleFavorite}
            onDeleteEntry={handleDeleteEntry}
            onGoToWrite={() => setActiveTab('write')}
          />
        )}

        {/* Tab 3: Mood & Stats Garden */}
        {activeTab === 'stats' && (
          <StatsView
            entries={entries}
            onGoToWrite={() => setActiveTab('write')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 bg-white/50 py-6 text-center text-xs text-stone-400 mt-auto">
        <div className="max-w-3xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>따뜻한 하루 일기 & AI 응원 · Gemini 3.8 Flash 연동</span>
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="hover:text-stone-700 transition-colors underline cursor-pointer"
          >
            Firebase & API 환경 설정 정보
          </button>
        </div>
      </footer>

      {/* Architecture & Settings Info Modal */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
      />
    </div>
  );
}
