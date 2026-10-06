import { PushNotificationAlert } from '../types';
import { soundEffects } from './audio';

// Web Notification API wrapper + in-app notification manager
export async function requestPushPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

export function sendPushNotification(title: string, options?: NotificationOptions): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options,
      });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function triggerSundayNotification(): PushNotificationAlert {
  const alert: PushNotificationAlert = {
    id: 'sunday-' + Date.now(),
    title: '☀️ Bom dia! Domingo da Vitória',
    body: 'Hoje é dia da sua pesagem semanal! Suba na balança com calma e registre seu progresso. Cada semana é uma conquista de saúde!',
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    type: 'sunday',
  };

  sendPushNotification(alert.title, {
    body: alert.body,
    tag: 'sunday-weigh-in',
  });

  soundEffects.playSundayFanfare();
  return alert;
}

export function triggerAchievementNotification(title: string, description: string): PushNotificationAlert {
  const alert: PushNotificationAlert = {
    id: 'achieve-' + Date.now(),
    title: `🏆 Conquista Desbloqueada: ${title}!`,
    body: description,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    type: 'achievement',
  };

  sendPushNotification(alert.title, {
    body: alert.body,
    tag: 'achievement-' + Date.now(),
  });

  soundEffects.playSuccess();
  return alert;
}

export function triggerGoalNotification(message: string): PushNotificationAlert {
  const alert: PushNotificationAlert = {
    id: 'goal-' + Date.now(),
    title: '🎯 Meta Alcançada com Sucesso!',
    body: message,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    type: 'goal',
  };

  sendPushNotification(alert.title, {
    body: alert.body,
    tag: 'goal-milestone',
  });

  soundEffects.playSuccess();
  return alert;
}

export function isTodaySunday(): boolean {
  const today = new Date();
  return today.getDay() === 0;
}

export function getDaysUntilSunday(): number {
  const today = new Date();
  const day = today.getDay();
  if (day === 0) return 0;
  return 7 - day;
}
