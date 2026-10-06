import { CheckCircle2, Delete, Heart, Sparkles, Volume2, X } from 'lucide-react';
import React, { useState } from 'react';
import { UserProfile, WeightEntry } from '../types';
import { soundEffects, speakWeight } from '../utils/audio';

interface ElderWeightInputProps {
  lastWeight: number;
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<WeightEntry, 'id' | 'created_at'>) => void;
}

export const ElderWeightInput: React.FC<ElderWeightInputProps> = ({
  lastWeight,
  profile,
  isOpen,
  onClose,
  onSave,
}) => {
  const [weight, setWeight] = useState<number>(lastWeight || 75.0);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [feeling, setFeeling] = useState<'otimo' | 'bem' | 'firme' | 'focado'>('otimo');
  const [note, setNote] = useState<string>('');
  const [keypadInput, setKeypadInput] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'steppers' | 'keypad'>('steppers');

  if (!isOpen) return null;

  const isSundayDate = new Date(selectedDate + 'T12:00:00').getDay() === 0;

  const handleAdjust = (delta: number) => {
    soundEffects.playClick();
    const newWeight = Math.max(30, Math.min(250, Number((weight + delta).toFixed(1))));
    setWeight(newWeight);
    if (profile.speechEnabled) {
      speakWeight(newWeight, true);
    }
  };

  const handleKeypadPress = (val: string) => {
    soundEffects.playClick();
    let nextStr = keypadInput;

    if (val === 'backspace') {
      nextStr = nextStr.slice(0, -1);
    } else if (val === '.') {
      if (!nextStr.includes('.') && nextStr.length < 5) {
        nextStr = nextStr === '' ? '0.' : nextStr + '.';
      }
    } else {
      if (nextStr.length < 5) {
        nextStr += val;
      }
    }

    setKeypadInput(nextStr);
    const parsed = parseFloat(nextStr);
    if (!isNaN(parsed) && parsed > 20 && parsed < 250) {
      setWeight(parsed);
      if (profile.speechEnabled && !nextStr.endsWith('.')) {
        speakWeight(parsed, true);
      }
    }
  };

  const handleConfirm = () => {
    soundEffects.playSuccess();
    onSave({
      date: selectedDate,
      weight: Number(weight.toFixed(1)),
      note: note.trim() || undefined,
      feeling,
      isSunday: isSundayDate,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border-4 border-emerald-500 my-auto">
        {/* Header */}
        <div className="bg-emerald-600 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚖️</span>
            <div>
              <h3 className="font-extrabold text-xl sm:text-2xl leading-tight">Registrar Meu Peso</h3>
              <p className="text-emerald-100 text-xs sm:text-sm">Fácil, rápido e sem complicações</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-5 bg-amber-50/30 max-h-[80vh] overflow-y-auto">
          {/* Date Selector with Sunday indicator */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border-2 border-slate-200">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Data da Pesagem
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="text-base sm:text-lg font-bold text-slate-800 focus:outline-none bg-transparent"
              />
            </div>
            {isSundayDate ? (
              <span className="bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-1 shadow-sm">
                ☀️ Domingo Oficial
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-slate-100 rounded-lg">
                Dia de semana
              </span>
            )}
          </div>

          {/* Huge Weight Display */}
          <div className="bg-gradient-to-b from-white to-emerald-50/50 rounded-3xl p-6 border-3 border-emerald-400 text-center shadow-inner relative">
            <span className="text-xs font-black text-emerald-800 uppercase tracking-widest bg-emerald-100 px-3 py-1 rounded-full">
              Seu Peso na Balança
            </span>

            <div className="my-2 flex items-baseline justify-center gap-2">
              <span className="text-6xl sm:text-7xl font-black text-emerald-950 tracking-tight tabular-nums">
                {weight.toFixed(1)}
              </span>
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">kg</span>
            </div>

            {/* Speech Button for Seniors */}
            <div className="flex justify-center mt-2">
              <button
                type="button"
                onClick={() => {
                  soundEffects.playClick();
                  speakWeight(weight, true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-sm font-extrabold transition-colors shadow-sm"
              >
                <Volume2 className="w-5 h-5 text-amber-700" />
                <span>Ouvir Peso em Voz Alta</span>
              </button>
            </div>
          </div>

          {/* Mode Switch: Steppers vs Keypad */}
          <div className="flex items-center gap-2 p-1 bg-slate-200/80 rounded-2xl">
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('steppers');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all ${
                activeTab === 'steppers'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Botões de Ajuste Rápido (+ / -)
            </button>
            <button
              type="button"
              onClick={() => {
                soundEffects.playClick();
                setActiveTab('keypad');
              }}
              className={`flex-1 py-2.5 rounded-xl font-bold text-sm sm:text-base transition-all ${
                activeTab === 'keypad'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              Teclado de Números Grandes
            </button>
          </div>

          {/* Steppers Option (Huge +/- Buttons for Elderly) */}
          {activeTab === 'steppers' && (
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-500 text-center uppercase tracking-wide">
                Toque nos botões para somar ou subtrair:
              </p>

              {/* Adjust +/- 0.5 kg */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleAdjust(-0.5)}
                  className="h-16 rounded-2xl bg-rose-50 border-3 border-rose-300 text-rose-800 hover:bg-rose-100 active:scale-95 font-black text-2xl sm:text-3xl flex items-center justify-center gap-1 shadow-sm transition-transform"
                >
                  <span className="text-rose-600">-</span> 0,5 kg
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjust(0.5)}
                  className="h-16 rounded-2xl bg-emerald-50 border-3 border-emerald-400 text-emerald-800 hover:bg-emerald-100 active:scale-95 font-black text-2xl sm:text-3xl flex items-center justify-center gap-1 shadow-sm transition-transform"
                >
                  <span className="text-emerald-600">+</span> 0,5 kg
                </button>
              </div>

              {/* Adjust +/- 0.1 kg and +/- 1.0 kg */}
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAdjust(-1.0)}
                  className="h-14 rounded-2xl bg-slate-100 border-2 border-slate-300 text-slate-800 font-bold text-base hover:bg-slate-200 active:scale-95"
                >
                  -1,0 kg
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjust(-0.1)}
                  className="h-14 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-900 font-bold text-base hover:bg-amber-100 active:scale-95"
                >
                  -0,1 kg
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjust(0.1)}
                  className="h-14 rounded-2xl bg-teal-50 border-2 border-teal-300 text-teal-900 font-bold text-base hover:bg-teal-100 active:scale-95"
                >
                  +0,1 kg
                </button>
                <button
                  type="button"
                  onClick={() => handleAdjust(1.0)}
                  className="h-14 rounded-2xl bg-emerald-100 border-2 border-emerald-400 text-emerald-900 font-bold text-base hover:bg-emerald-200 active:scale-95"
                >
                  +1,0 kg
                </button>
              </div>
            </div>
          )}

          {/* Keypad Option (Huge numeric buttons on screen) */}
          {activeTab === 'keypad' && (
            <div className="bg-white p-3 rounded-2xl border-2 border-slate-200">
              <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'backspace'].map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleKeypadPress(key)}
                    className="h-14 rounded-2xl bg-slate-100 hover:bg-emerald-100 border-2 border-slate-200 active:scale-95 font-black text-2xl text-slate-800 flex items-center justify-center transition-all"
                  >
                    {key === 'backspace' ? <Delete className="w-6 h-6 text-rose-600" /> : key === '.' ? ',' : key}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* How are you feeling */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1.5">
              Como você está se sentindo nesta pesagem?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'otimo', label: '😊 Ótimo', desc: 'Cheio de energia' },
                { id: 'bem', label: '👍 Bem', desc: 'Tranquilo' },
                { id: 'firme', label: '💪 Firme', desc: 'Com foco total' },
                { id: 'focado', label: '🎯 Focado', desc: 'Na meta' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    soundEffects.playClick();
                    setFeeling(item.id as 'otimo' | 'bem' | 'firme' | 'focado');
                  }}
                  className={`p-2.5 rounded-2xl border-2 text-center transition-all ${
                    feeling === item.id
                      ? 'bg-amber-100 border-amber-500 text-amber-950 font-black shadow-sm ring-2 ring-amber-300'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div className="text-base sm:text-lg font-bold">{item.label}</div>
                  <div className="text-[11px] text-slate-500 font-medium">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Short Note */}
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wide mb-1">
              Anotação Carinhosa (Opcional):
            </label>
            <input
              type="text"
              placeholder="Ex: Tomei bastante água e comi sopas leves..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-slate-200 text-base focus:border-emerald-500 focus:outline-none bg-white font-medium text-slate-800"
            />
          </div>

          {/* Giant Confirmation Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full h-18 py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black text-xl sm:text-2xl flex items-center justify-center gap-3 shadow-lg shadow-emerald-700/20 transition-all border-2 border-emerald-400"
          >
            <CheckCircle2 className="w-8 h-8 text-amber-300" />
            <span>CONFIRMAR E SALVAR MEU PESO</span>
          </button>
        </div>
      </div>
    </div>
  );
};
