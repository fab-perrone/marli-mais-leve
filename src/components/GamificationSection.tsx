import confetti from 'canvas-confetti';
import { Award, Bell, CheckCircle2, Lock, PartyPopper, Sparkles, Star, Trophy } from 'lucide-react';
import React from 'react';
import { Achievement, UserProfile, WeightEntry } from '../types';
import { soundEffects } from '../utils/audio';
import { triggerAchievementNotification } from '../utils/notifications';

interface GamificationSectionProps {
  achievements: Achievement[];
  profile: UserProfile;
  entries: WeightEntry[];
  onTriggerNotification: (title: string, desc: string) => void;
}

export const GamificationSection: React.FC<GamificationSectionProps> = ({
  achievements,
  profile,
  entries,
  onTriggerNotification,
}) => {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const progressPercent = Math.round((unlockedCount / totalCount) * 100);

  const handleBurstConfetti = () => {
    soundEffects.playSuccess();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // ignore
    }
  };

  const handleTestBadgeNotification = (ach: Achievement) => {
    soundEffects.playSuccess();
    triggerAchievementNotification(ach.title, ach.rewardMessage);
    onTriggerNotification(ach.title, ach.rewardMessage);
    handleBurstConfetti();
  };

  return (
    <div className="space-y-6">
      {/* Gamification Banner */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 rounded-3xl p-6 text-amber-950 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white text-amber-600 flex items-center justify-center shadow-md text-3xl shrink-0">
              🏆
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider bg-amber-600/20 text-amber-950 px-3 py-1 rounded-full">
                SISTEMA DE CONQUISTAS DA VITÓRIA
              </span>
              <h2 className="text-2xl sm:text-3xl font-black mt-1 text-amber-950">
                Seu Mural de Troféus de Saúde
              </h2>
              <p className="text-sm sm:text-base font-semibold text-amber-900/90 mt-0.5">
                Cada domingo é uma vitória celebrada com festa e carinho!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={handleBurstConfetti}
              className="py-3 px-5 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-extrabold text-sm shadow-md flex items-center gap-2 transition-transform active:scale-95"
            >
              <PartyPopper className="w-5 h-5 text-amber-600" />
              <span>Chuva de Confetes</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 bg-white/40 p-3 rounded-2xl backdrop-blur-sm">
          <div className="flex justify-between items-center text-xs font-black text-amber-950 mb-1.5">
            <span>Progresso Geral das Conquistas</span>
            <span>
              {unlockedCount} de {totalCount} Conquistas ({progressPercent}%)
            </span>
          </div>
          <div className="w-full bg-amber-950/20 rounded-full h-3.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-3.5 rounded-full transition-all duration-500 shadow-inner"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Trophies Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((ach) => (
          <div
            key={ach.id}
            className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
              ach.unlocked
                ? 'bg-white border-amber-300 shadow-sm hover:shadow-md'
                : 'bg-slate-50/80 border-slate-200 opacity-75'
            }`}
          >
            <div>
              {/* Top Card Bar */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm ${
                    ach.unlocked ? 'bg-amber-100 ring-2 ring-amber-300' : 'bg-slate-200'
                  }`}
                >
                  {ach.unlocked ? ach.icon : <Lock className="w-6 h-6 text-slate-400" />}
                </div>

                <div className="flex flex-col items-end">
                  {ach.unlocked ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Conquistado!
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded-full">
                      Bloqueado
                    </span>
                  )}
                  {ach.unlockedAt && (
                    <span className="text-[10px] text-slate-400 mt-1">
                      {new Date(ach.unlockedAt + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </span>
                  )}
                </div>
              </div>

              {/* Title & Description */}
              <h3
                className={`font-black text-lg ${
                  ach.unlocked ? 'text-slate-900' : 'text-slate-600'
                }`}
              >
                {ach.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">{ach.description}</p>

              {/* Reward / Motivational Message */}
              {ach.unlocked && (
                <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs font-semibold text-amber-900">
                  💬 "{ach.rewardMessage}"
                </div>
              )}

              {!ach.unlocked && (
                <div className="mt-3 text-[11px] font-medium text-slate-500 bg-slate-100 p-2 rounded-xl">
                  Requisito: {ach.conditionDescription}
                </div>
              )}
            </div>

            {/* Test Notification CTA */}
            {ach.unlocked && (
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Notificação Personalizada</span>
                <button
                  type="button"
                  onClick={() => handleTestBadgeNotification(ach)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Enviar Alerta</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
