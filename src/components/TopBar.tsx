import { Bell, Monitor, Settings, Smartphone, Volume2, VolumeX } from 'lucide-react';
import React from 'react';
import { UserProfile } from '../types';
import { soundEffects } from '../utils/audio';

interface TopBarProps {
  profile: UserProfile;
  isMobileFrame: boolean;
  onToggleMobileFrame: () => void;
  onToggleSeniorMode: () => void;
  onToggleSound: () => void;
  onOpenSettingsModal: () => void;
  onTestNotification: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  profile,
  isMobileFrame,
  onToggleMobileFrame,
  onToggleSeniorMode,
  onToggleSound,
  onOpenSettingsModal,
  onTestNotification,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-emerald-700 text-white shadow-md">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-emerald-950 font-black text-xl flex items-center justify-center shadow-inner">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Em Forma
              </span>
              <span className="text-[11px] font-semibold bg-emerald-800/80 text-amber-300 px-2 py-0.5 rounded-full border border-emerald-600">
                Semanal
              </span>
            </div>
            <p className="text-[12px] text-emerald-100 hidden sm:block">Controle de peso & domingo da saúde</p>
          </div>
        </div>

        {/* Action Controls (Clean, elder-friendly) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Senior Mode Toggle Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onToggleSeniorMode();
            }}
            title={profile.seniorMode ? 'Desativar modo letra grande' : 'Ativar modo idoso com botões grandes'}
            className={`px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all ${
              profile.seniorMode
                ? 'bg-amber-400 text-emerald-950 shadow-sm ring-2 ring-amber-300'
                : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-600'
            }`}
          >
            <span className="text-base" role="img" aria-label="Óculos">👓</span>
            <span className="hidden xs:inline">{profile.seniorMode ? 'Letra Grande' : 'Modo Padrão'}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundEffects.playClick();
            }}
            title={profile.soundEnabled ? 'Silenciar sons' : 'Ativar sons e voz'}
            className={`p-2 rounded-xl text-sm transition-all ${
              profile.soundEnabled
                ? 'bg-emerald-800 text-amber-300 hover:bg-emerald-600'
                : 'bg-emerald-900/60 text-emerald-300 hover:bg-emerald-800'
            }`}
          >
            {profile.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Sunday Test Push Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onTestNotification();
            }}
            title="Testar notificação push de Domingo"
            className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-600 text-emerald-100 transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Settings Modal Button (Discreet configuration) */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenSettingsModal();
            }}
            title="Ajustes e Metas"
            className="p-2 rounded-xl bg-emerald-800 hover:bg-emerald-600 text-emerald-100 transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mobile frame toggle (desktop only) */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onToggleMobileFrame();
            }}
            title={isMobileFrame ? 'Ver tela cheia desktop' : 'Simular tela de celular'}
            className="hidden lg:flex p-2 rounded-xl bg-emerald-800 hover:bg-emerald-600 text-emerald-100 transition-colors"
          >
            {isMobileFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
