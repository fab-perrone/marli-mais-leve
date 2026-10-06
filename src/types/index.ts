export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // in kg
  note?: string;
  feeling?: 'otimo' | 'bem' | 'firme' | 'focado';
  isSunday: boolean;
  created_at: string;
}

export interface UserProfile {
  name: string;
  initialWeight: number;
  targetWeight: number;
  height: number; // in cm
  birthYear?: number;
  sundayReminderTime: string; // HH:mm
  soundEnabled: boolean;
  seniorMode: boolean; // Ultra large buttons and maximum contrast
  speechEnabled: boolean; // Text-to-speech for weight and tips
  weeklyGoalRate: number; // kg per week target (e.g. 0.5)
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'constancia' | 'progresso' | 'saude' | 'primeiros_passos';
  unlocked: boolean;
  unlockedAt?: string;
  rewardMessage: string;
  conditionDescription: string;
}

export interface HealthTip {
  id: string;
  title: string;
  category: 'alimentacao' | 'hidratacao' | 'longevidade' | 'rotina';
  icon: string;
  summary: string;
  advice: string;
  elderTip: string;
}

export interface MotivationalQuote {
  id: string;
  quote: string;
  author: string;
  tag: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  tableName: string;
}

export interface PushNotificationAlert {
  id: string;
  title: string;
  body: string;
  icon?: string;
  timestamp: string;
  type: 'sunday' | 'achievement' | 'goal' | 'tip';
}
