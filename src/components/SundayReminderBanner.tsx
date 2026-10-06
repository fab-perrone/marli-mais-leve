import { BellRing, CalendarCheck, ChevronRight, Sparkles, Sun } from 'lucide-react';
import React from 'react';
import { UserProfile, WeightEntry } from '../types';
import { soundEffects } from '../utils/audio';
import { getDaysUntilSunday, isTodaySunday } from '../utils/notifications';

interface SundayReminderBannerProps {
  entries: WeightEntry[];
  profile: UserProfile;
  onOpenWeightModal: () => void;
  onTriggerSundayTest: () => void;
}

export const SundayReminderBanner: React.FC<SundayReminderBannerProps> = ({
  entries,
  profile,
  onOpenWeightModal,
  onTriggerSundayTest,
}) => {
  const isSunday = isTodaySunday();
  const daysUntilSunday = getDaysUntilSunday();

  // Check if weighed today
  const todayStr = new Date().toISOString().split('T')[0];
  const hasWeighedToday = entries.some((e) => e.date === todayStr);

  return (
    <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100 border-2 border-amber-300 rounded-3xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left icon & text */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-sm">
            <Sun className="w-8 h-8 text-amber-900 animate-spin-slow" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full">
                {isSunday ? '🌟 HOJE É DOMINGO!' : `⏰ PRÓXIMO DOMINGO EM ${daysUntilSunday} DIAS`}
              </span>
              <span className="text-xs font-semibold text-amber-900">
                Horário do Lembrete: {profile.sundayReminderTime}
              </span>
            </div>

            <h2
              className={`font-black text-amber-950 mt-1 ${
                profile.seniorMode ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
              }`}
            >
              {isSunday
                ? hasWeighedToday
                  ? 'Parabéns! Pesagem de hoje realizada! 🎉'
                  : 'Domingo da Vitória: Hora de se pesar!'
                : 'Seu Lembrete de Domingo está Ativo!'}
            </h2>

            <p className={`text-amber-900/90 mt-1 max-w-xl ${profile.seniorMode ? 'text-base sm:text-lg' : 'text-sm'}`}>
              {isSunday
                ? hasWeighedToday
                  ? 'Você manteve seu compromisso dominical de ouro. Continue com essa energia positiva!'
                  : 'Pesar todo domingo de manhã cria constância sem a ansiedade de se pesar todo dia. Suba na balança com calma!'
                : 'Pesar uma vez por semana aos domingos é o segredo de ouro para manter a saúde e o ânimo elevados.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenWeightModal();
            }}
            className={`font-extrabold rounded-2xl shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2 ${
              profile.seniorMode ? 'py-4 px-6 text-lg' : 'py-3 px-5 text-base'
            } ${
              hasWeighedToday
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-200 animate-pulse'
            }`}
          >
            <CalendarCheck className="w-6 h-6" />
            <span>{hasWeighedToday ? 'Registrar Novamente' : 'Pesar Agora'}</span>
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onTriggerSundayTest();
            }}
            title="Simular e testar o aviso sonoro e notificação que toca aos domingos"
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-amber-200 hover:bg-amber-300 text-amber-950 text-xs sm:text-sm font-bold transition-colors"
          >
            <BellRing className="w-4 h-4 text-amber-800" />
            <span>Testar Aviso Sonoro</span>
          </button>
        </div>
      </div>
    </div>
  );
};
