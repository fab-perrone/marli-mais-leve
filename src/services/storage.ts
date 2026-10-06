import confetti from 'canvas-confetti';
import { defaultProfile, initialAchievements, initialWeightEntries } from '../data/initialData';
import { Achievement, UserProfile, WeightEntry } from '../types';
import { soundEffects } from '../utils/audio';
import { triggerAchievementNotification, triggerGoalNotification } from '../utils/notifications';
import { deleteEntryFromSupabase, fetchEntriesFromSupabase, getSupabaseClient, syncEntryToSupabase } from './supabase';

const ENTRIES_KEY = 'vivaleve_entries_v1';
const PROFILE_KEY = 'vivaleve_profile_v1';
const ACHIEVEMENTS_KEY = 'vivaleve_achievements_v1';

export function loadEntries(): WeightEntry[] {
  if (typeof window === 'undefined') return initialWeightEntries;
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Erro ao ler entries do localStorage', err);
  }
  // Store initial sample entries
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(initialWeightEntries));
  return initialWeightEntries;
}

export function saveEntries(entries: WeightEntry[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return defaultProfile;
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      return { ...defaultProfile, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return defaultProfile;
}

export function saveProfile(profile: UserProfile) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function loadAchievements(): Achievement[] {
  if (typeof window === 'undefined') return initialAchievements;
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  return initialAchievements;
}

export function saveAchievements(achievements: Achievement[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(achievements));
}

// Check and unlock achievements dynamically based on state
export function evaluateAchievements(
  entries: WeightEntry[],
  profile: UserProfile,
  currentAchievements: Achievement[],
  onNotification?: (title: string, desc: string) => void
): { updated: Achievement[]; newlyUnlocked: Achievement[] } {
  const newlyUnlocked: Achievement[] = [];
  const sorted = [...entries].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const initialWeight = profile.initialWeight;
  const targetWeight = profile.targetWeight;
  const currentWeight = sorted.length > 0 ? sorted[sorted.length - 1].weight : initialWeight;
  const weightLost = initialWeight - currentWeight;
  const totalGoalToLose = initialWeight - targetWeight;
  const sundayEntries = sorted.filter((e) => e.isSunday);

  const updated = currentAchievements.map((ach) => {
    if (ach.unlocked) return ach;

    let shouldUnlock = false;

    if (ach.id === 'ach-1' && entries.length >= 1) {
      shouldUnlock = true;
    } else if (ach.id === 'ach-2' && sundayEntries.length >= 3) {
      shouldUnlock = true;
    } else if (ach.id === 'ach-3' && weightLost >= 2.0) {
      shouldUnlock = true;
    } else if (ach.id === 'ach-4' && entries.length >= 4) {
      shouldUnlock = true;
    } else if (ach.id === 'ach-5' && totalGoalToLose > 0 && weightLost >= totalGoalToLose * 0.5) {
      shouldUnlock = true;
    } else if (ach.id === 'ach-6' && currentWeight <= targetWeight) {
      shouldUnlock = true;
    } else if (ach.id === 'ach-8' && sundayEntries.length >= 1) {
      shouldUnlock = true;
    }

    if (shouldUnlock) {
      const unlockedItem: Achievement = {
        ...ach,
        unlocked: true,
        unlockedAt: new Date().toISOString().split('T')[0],
      };
      newlyUnlocked.push(unlockedItem);
      return unlockedItem;
    }
    return ach;
  });

  if (newlyUnlocked.length > 0) {
    saveAchievements(updated);
    newlyUnlocked.forEach((item) => {
      triggerAchievementNotification(item.title, item.rewardMessage);
      if (onNotification) {
        onNotification(item.title, item.rewardMessage);
      }
    });

    // Fire joyful confetti burst!
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // ignore
    }
  }

  // Check if target was hit exactly
  if (currentWeight <= targetWeight && targetWeight > 0) {
    triggerGoalNotification(`Parabéns de todo o coração! Você alcançou o seu peso meta de ${targetWeight.toFixed(2)} kg!`);
  }

  return { updated, newlyUnlocked };
}

export async function addWeightEntry(
  entry: Omit<WeightEntry, 'id' | 'created_at'>,
  currentEntries: WeightEntry[],
  profile: UserProfile,
  achievements: Achievement[]
): Promise<{
  entries: WeightEntry[];
  achievements: Achievement[];
  newlyUnlocked: Achievement[];
}> {
  const newEntry: WeightEntry = {
    ...entry,
    id: 'entry-' + Date.now(),
    created_at: new Date().toISOString(),
  };

  const newEntries = [...currentEntries, newEntry].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  saveEntries(newEntries);

  // Sync to Supabase in background if client configured
  const supabase = getSupabaseClient();
  if (supabase) {
    syncEntryToSupabase(newEntry).catch((err) => console.warn('Supabase sync falhou:', err));
  }

  soundEffects.playSuccess();

  // Evaluate achievements
  const { updated, newlyUnlocked } = evaluateAchievements(newEntries, profile, achievements);

  return {
    entries: newEntries,
    achievements: updated,
    newlyUnlocked,
  };
}

export async function deleteWeightEntry(
  id: string,
  currentEntries: WeightEntry[]
): Promise<WeightEntry[]> {
  const updated = currentEntries.filter((e) => e.id !== id);
  saveEntries(updated);

  const supabase = getSupabaseClient();
  if (supabase) {
    deleteEntryFromSupabase(id).catch((err) => console.warn('Supabase delete falhou:', err));
  }

  return updated;
}

export async function syncWithSupabaseIfAvailable(
  localEntries: WeightEntry[]
): Promise<{ syncedEntries: WeightEntry[]; fromRemote: boolean }> {
  const remoteEntries = await fetchEntriesFromSupabase();
  if (remoteEntries && remoteEntries.length > 0) {
    saveEntries(remoteEntries);
    return { syncedEntries: remoteEntries, fromRemote: true };
  }
  return { syncedEntries: localEntries, fromRemote: false };
}
