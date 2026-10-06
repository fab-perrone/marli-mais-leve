import { Bell, CheckCircle2, Trophy, X } from 'lucide-react';
import React from 'react';
import { PushNotificationAlert } from '../types';
import { soundEffects } from '../utils/audio';

interface InAppNotificationToastProps {
  alert: PushNotificationAlert | null;
  onDismiss: () => void;
}

export const InAppNotificationToast: React.FC<InAppNotificationToastProps> = ({
  alert,
  onDismiss,
}) => {
  if (!alert) return null;

  return (
    <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-bounce-subtle">
      <div className="bg-slate-900 text-white rounded-3xl p-4 shadow-2xl border-2 border-amber-400 flex items-start justify-between gap-3 backdrop-blur-md">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-amber-400 text-slate-950 font-black shrink-0 mt-0.5">
            {alert.type === 'achievement' ? '🏆' : alert.type === 'sunday' ? '☀️' : '🔔'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-900/60 px-2 py-0.5 rounded-full">
                Notificação Marli Mais Leve
              </span>
              <span className="text-[10px] text-slate-400">{alert.timestamp}</span>
            </div>
            <h4 className="font-extrabold text-sm sm:text-base text-white mt-1 leading-snug">
              {alert.title}
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 mt-1 leading-relaxed">
              {alert.body}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            onDismiss();
          }}
          className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
