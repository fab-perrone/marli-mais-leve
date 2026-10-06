/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BottomTabBar, TabId } from './components/BottomTabBar';
import { ElderWeightInput } from './components/ElderWeightInput';
import { GamificationSection } from './components/GamificationSection';
import { HealthTipsSection } from './components/HealthTipsSection';
import { InAppNotificationToast } from './components/InAppNotificationToast';
import { ProfileSettingsModal } from './components/ProfileSettingsModal';
import { ProgressChart } from './components/ProgressChart';
import { SundayReminderBanner } from './components/SundayReminderBanner';
import { SupabaseModal } from './components/SupabaseModal';
import { TopBar } from './components/TopBar';
import { getStoredSupabaseConfig, testSupabaseConnection } from './services/supabase';
import {
  addWeightEntry,
  deleteWeightEntry,
  loadAchievements,
  loadEntries,
  loadProfile,
  saveProfile,
  syncWithSupabaseIfAvailable,
} from './services/storage';
import { Achievement, PushNotificationAlert, SupabaseConfig, UserProfile, WeightEntry } from './types';
import { soundEffects } from './utils/audio';
import { requestPushPermission, triggerSundayNotification } from './utils/notifications';

export default function App() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile>(loadProfile());
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());
  const [currentTab, setCurrentTab] = useState<TabId>('overview');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);

  // Modals
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Toast notification
  const [currentToast, setCurrentToast] = useState<PushNotificationAlert | null>(null);

  // Initialize data on mount
  useEffect(() => {
    const localEntries = loadEntries();
    setEntries(localEntries);
    setAchievements(loadAchievements());

    // Auto-check Supabase if configured
    const cfg = getStoredSupabaseConfig();
    setSupabaseConfig(cfg);
    if (cfg.url && cfg.anonKey) {
      testSupabaseConnection(cfg.url, cfg.anonKey).then((res) => {
        if (res.success) {
          syncWithSupabaseIfAvailable(localEntries).then(({ syncedEntries }) => {
            setEntries(syncedEntries);
          });
        }
      });
    }

    // Request push notification permission gently on first interaction
    requestPushPermission().catch(() => {});
  }, []);

  const handleSaveWeightEntry = async (entryData: Omit<WeightEntry, 'id' | 'created_at'>) => {
    const res = await addWeightEntry(entryData, entries, profile, achievements);
    setEntries(res.entries);
    setAchievements(res.achievements);

    if (res.newlyUnlocked.length > 0) {
      const first = res.newlyUnlocked[0];
      setCurrentToast({
        id: 'toast-' + Date.now(),
        title: `🏆 Conquista: ${first.title}!`,
        body: first.rewardMessage,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'achievement',
      });
    } else {
      setCurrentToast({
        id: 'toast-' + Date.now(),
        title: '✅ Peso Registrado com Sucesso!',
        body: `Seu peso de ${entryData.weight} kg foi anotado com carinho!`,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        type: 'goal',
      });
    }
  };

  const handleDeleteEntry = async (id: string) => {
    const updated = await deleteWeightEntry(id, entries);
    setEntries(updated);
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleToggleSeniorMode = () => {
    const updated = { ...profile, seniorMode: !profile.seniorMode };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleToggleSound = () => {
    const updated = { ...profile, soundEnabled: !profile.soundEnabled };
    setProfile(updated);
    saveProfile(updated);
  };

  const handleTriggerSundayTest = () => {
    const alert = triggerSundayNotification();
    setCurrentToast(alert);
  };

  const handleManualSync = async () => {
    const { syncedEntries } = await syncWithSupabaseIfAvailable(entries);
    setEntries(syncedEntries);
    soundEffects.playSuccess();
    setCurrentToast({
      id: 'sync-' + Date.now(),
      title: '🔄 Sincronizado com Supabase!',
      body: 'Todas as pesagens estão salvas na sua nuvem!',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      type: 'goal',
    });
  };

  const lastLoggedWeight = entries.length > 0 ? entries[entries.length - 1].weight : profile.initialWeight;
  const unlockedAchievementsCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div
      className={`min-h-screen bg-amber-50/40 text-slate-800 transition-all font-sans ${
        profile.seniorMode ? 'text-lg' : 'text-base'
      }`}
    >
      {/* Toast Notification Alert */}
      <InAppNotificationToast alert={currentToast} onDismiss={() => setCurrentToast(null)} />

      {/* Outer Shell: either mobile device simulator or full responsive */}
      <div
        className={
          isMobileFrame
            ? 'max-w-[430px] mx-auto min-h-screen bg-white shadow-2xl border-x-4 border-slate-700 relative'
            : 'w-full'
        }
      >
        {/* Top App Bar */}
        <TopBar
          profile={profile}
          isMobileFrame={isMobileFrame}
          onToggleMobileFrame={() => setIsMobileFrame(!isMobileFrame)}
          onToggleSeniorMode={handleToggleSeniorMode}
          onToggleSound={handleToggleSound}
          onOpenSettingsModal={() => setIsProfileModalOpen(true)}
          onTestNotification={handleTriggerSundayTest}
        />

        {/* Content Container */}
        <main className="max-w-5xl mx-auto px-4 py-5 sm:py-6 pb-28 space-y-6">
          {/* Sunday Weekly Reminder Banner */}
          <SundayReminderBanner
            entries={entries}
            profile={profile}
            onOpenWeightModal={() => setIsWeightModalOpen(true)}
            onTriggerSundayTest={handleTriggerSundayTest}
          />

          {/* Tab Views */}
          {currentTab === 'overview' && (
            <section className="space-y-6 animate-fade-in">
              {/* Progress Charts & Weekly Stats */}
              <ProgressChart
                entries={entries}
                profile={profile}
                onDeleteEntry={handleDeleteEntry}
                onOpenWeightModal={() => setIsWeightModalOpen(true)}
              />
            </section>
          )}

          {currentTab === 'achievements' && (
            <section className="animate-fade-in">
              <GamificationSection
                achievements={achievements}
                profile={profile}
                entries={entries}
                onTriggerNotification={(title, desc) => {
                  setCurrentToast({
                    id: 'ach-' + Date.now(),
                    title: `🏆 ${title}`,
                    body: desc,
                    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
                    type: 'achievement',
                  });
                }}
              />
            </section>
          )}

          {currentTab === 'tips' && (
            <section className="animate-fade-in">
              <HealthTipsSection profile={profile} />
            </section>
          )}

          {/* Clean Footer with direct Supabase access */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <span className="font-semibold text-slate-600">
              Marli Mais Leve • Saúde, Longevidade & Constância Semanal
            </span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSupabaseModalOpen(true)}
                className="font-bold text-emerald-800 hover:text-emerald-900 underline flex items-center gap-1"
              >
                <span>🔗 Informar Links do Supabase</span>
              </button>
              <span>·</span>
              <button
                onClick={() => setIsProfileModalOpen(true)}
                className="font-bold text-slate-700 hover:text-slate-900 underline flex items-center gap-1"
              >
                <span>⚙️ Ajustes & Metas</span>
              </button>
            </div>
          </div>
        </main>

        {/* Mobile Fixed Bottom Navigation */}
        <BottomTabBar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenWeightModal={() => setIsWeightModalOpen(true)}
          unlockedCount={unlockedAchievementsCount}
        />
      </div>

      {/* Modals */}
      <ElderWeightInput
        isOpen={isWeightModalOpen}
        lastWeight={lastLoggedWeight}
        profile={profile}
        onClose={() => setIsWeightModalOpen(false)}
        onSave={handleSaveWeightEntry}
      />

      <SupabaseModal
        isOpen={isSupabaseModalOpen}
        config={supabaseConfig}
        onClose={() => setIsSupabaseModalOpen(false)}
        onSaveConfig={setSupabaseConfig}
        onSyncNow={handleManualSync}
      />

      <ProfileSettingsModal
        isOpen={isProfileModalOpen}
        profile={profile}
        onClose={() => setIsProfileModalOpen(false)}
        onSaveProfile={handleSaveProfile}
        onOpenSupabaseModal={() => setIsSupabaseModalOpen(true)}
      />
    </div>
  );
}
