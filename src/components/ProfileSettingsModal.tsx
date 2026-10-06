import { Check, Settings, User, Volume2, X } from 'lucide-react';
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { soundEffects } from '../utils/audio';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  profile: UserProfile;
  onClose: () => void;
  onSaveProfile: (profile: UserProfile) => void;
  onOpenSupabaseModal?: () => void;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  profile,
  onClose,
  onSaveProfile,
  onOpenSupabaseModal,
}) => {
  const [form, setForm] = useState<UserProfile>(profile);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    soundEffects.playSuccess();
    onSaveProfile(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border-2 border-slate-300 my-auto">
        {/* Header */}
        <div className="bg-slate-800 text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <h3 className="font-extrabold text-lg sm:text-xl">Metas & Preferências</h3>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1 rounded-xl hover:bg-slate-700 text-slate-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Nome do Participante ou Família
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-base font-semibold focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Peso Inicial (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.initialWeight}
                onChange={(e) => setForm({ ...form, initialWeight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-lg font-black focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Meta Desejada (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={form.targetWeight}
                onChange={(e) => setForm({ ...form, targetWeight: parseFloat(e.target.value) || 0 })}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-lg font-black focus:border-emerald-500 focus:outline-none text-emerald-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Altura (cm)
              </label>
              <input
                type="number"
                value={form.height}
                onChange={(e) => setForm({ ...form, height: parseInt(e.target.value) || 160 })}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-base font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
                Horário Domingo
              </label>
              <input
                type="time"
                value={form.sundayReminderTime}
                onChange={(e) => setForm({ ...form, sundayReminderTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border-2 border-slate-300 text-base font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Accessibility Toggles */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200">
            <label className="flex items-center justify-between p-3 rounded-2xl bg-amber-50 border border-amber-200 cursor-pointer">
              <span className="text-sm font-bold text-amber-950 flex items-center gap-2">
                <span>👓</span>
                <span>Modo Letra Grande & Botões Gigantes</span>
              </span>
              <input
                type="checkbox"
                checked={form.seniorMode}
                onChange={(e) => setForm({ ...form, seniorMode: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-emerald-600" />
                <span>Leitura em Voz Alta (Falar o peso)</span>
              </span>
              <input
                type="checkbox"
                checked={form.speechEnabled}
                onChange={(e) => setForm({ ...form, speechEnabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
              <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <span>🔔</span>
                <span>Sons & Efeitos Comemorativos</span>
              </span>
              <input
                type="checkbox"
                checked={form.soundEnabled}
                onChange={(e) => setForm({ ...form, soundEnabled: e.target.checked })}
                className="w-5 h-5 accent-emerald-600 rounded"
              />
            </label>
          </div>

          {/* Link para Configurar e Conectar Supabase */}
          {onOpenSupabaseModal && (
            <div className="pt-3 border-t border-slate-200">
              <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                    <span>🗄️</span>
                    <span>Conectar Banco Supabase</span>
                  </span>
                  <span className="text-[11px] text-emerald-800 font-medium block mt-0.5">
                    Informar URL do Projeto e Chave Anon
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSupabaseModal();
                  }}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shrink-0"
                >
                  Informar Links →
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base shadow-md transition-colors"
          >
            Salvar Preferências
          </button>
        </form>
      </div>
    </div>
  );
};
