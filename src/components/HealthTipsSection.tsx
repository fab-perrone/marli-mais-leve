import { Apple, BookOpen, Check, Heart, Lightbulb, Quote, Salad, Sparkles, Volume2 } from 'lucide-react';
import React, { useState } from 'react';
import { healthTips, motivationalQuotes } from '../data/initialData';
import { HealthTip, UserProfile } from '../types';
import { soundEffects, speakText } from '../utils/audio';

interface HealthTipsSectionProps {
  profile: UserProfile;
}

export const HealthTipsSection: React.FC<HealthTipsSectionProps> = ({ profile }) => {
  const [selectedTip, setSelectedTip] = useState<HealthTip | null>(healthTips[0]);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [practicedTips, setPracticedTips] = useState<Record<string, boolean>>({});

  const currentQuote = motivationalQuotes[quoteIndex % motivationalQuotes.length];

  const handleNextQuote = () => {
    soundEffects.playClick();
    setQuoteIndex((prev) => (prev + 1) % motivationalQuotes.length);
  };

  const handleSpeakQuote = () => {
    soundEffects.playClick();
    speakText(`Frase de incentivo: ${currentQuote.quote}. Mensagem de ${currentQuote.author}`, true);
  };

  const togglePracticed = (id: string) => {
    soundEffects.playSuccess();
    setPracticedTips((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="space-y-6">
      {/* Motivational Quote Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm shrink-0">
              <Quote className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 bg-emerald-900/60 px-3 py-1 rounded-full">
                MENSAGEM DO CORAÇÃO • {currentQuote.tag}
              </span>
              <p
                className={`font-extrabold mt-3 text-white leading-relaxed ${
                  profile.seniorMode ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
                }`}
              >
                "{currentQuote.quote}"
              </p>
              <span className="text-xs sm:text-sm text-emerald-200 font-semibold block mt-2">
                — {currentQuote.author}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-emerald-500/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSpeakQuote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400 text-emerald-950 text-xs sm:text-sm font-extrabold shadow-sm hover:bg-amber-300 transition-colors"
            >
              <Volume2 className="w-4 h-4" />
              <span>Ouvir Frase</span>
            </button>
          </div>

          <button
            onClick={handleNextQuote}
            className="text-xs sm:text-sm font-bold text-emerald-100 hover:text-white underline"
          >
            Ver Outra Frase Inspiradora →
          </button>
        </div>
      </div>

      {/* Health & Nutrition Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🥗</span>
            <h2 className="font-extrabold text-xl sm:text-2xl text-slate-900">
              Dicas de Alimentação & Longevidade
            </h2>
          </div>
          <p className="text-sm text-slate-500">
            Dicas práticas e seguras formuladas com carinho para a melhor idade
          </p>
        </div>
      </div>

      {/* Grid of Health Tips */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {healthTips.map((tip) => {
          const isDone = practicedTips[tip.id];

          return (
            <div
              key={tip.id}
              className={`rounded-3xl p-5 border-2 transition-all flex flex-col justify-between ${
                isDone
                  ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
                  : 'bg-white border-slate-200 shadow-sm hover:border-emerald-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-amber-100 rounded-2xl">{tip.icon}</span>
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                        {tip.category}
                      </span>
                      <h3 className="font-extrabold text-base sm:text-lg text-slate-900 mt-0.5">
                        {tip.title}
                      </h3>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-2">
                  {tip.summary}
                </p>

                <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                  {tip.advice}
                </p>

                {/* Elder Tip Box */}
                <div className="mt-3 p-3 rounded-2xl bg-amber-50/90 border border-amber-200">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-amber-900 mb-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <span>Dica de Ouro para a Longevidade:</span>
                  </div>
                  <p className="text-xs text-amber-950 leading-relaxed font-medium">
                    {tip.elderTip}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    speakText(`${tip.title}. ${tip.advice}. Dica para longevidade: ${tip.elderTip}`, true);
                  }}
                  className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 hover:text-emerald-700"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Ouvir Dica</span>
                </button>

                <button
                  onClick={() => togglePracticed(tip.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                    isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Praticado hoje!' : 'Marcar como Feito'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
