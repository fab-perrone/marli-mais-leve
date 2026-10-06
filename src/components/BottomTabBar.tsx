import { Apple, Award, Calendar, PlusCircle, Scale, Sparkles, TrendingUp } from 'lucide-react';
import React from 'react';
import { soundEffects } from '../utils/audio';

export type TabId = 'overview' | 'weigh' | 'achievements' | 'tips' | 'settings';

interface BottomTabBarProps {
  currentTab: TabId;
  onSelectTab: (tab: TabId) => void;
  onOpenWeightModal: () => void;
  unlockedCount: number;
}

export const BottomTabBar: React.FC<BottomTabBarProps> = ({
  currentTab,
  onSelectTab,
  onOpenWeightModal,
  unlockedCount,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 shadow-lg pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-4 items-center h-16 px-2">
        {/* Tab 1: Visão Geral */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onSelectTab('overview');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'overview' ? 'text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className={`w-5 h-5 ${currentTab === 'overview' ? 'stroke-[2.8]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1 font-bold">Progresso</span>
          {currentTab === 'overview' && <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-0.5" />}
        </button>

        {/* Tab 2: Pesar (Action Highlight) */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onOpenWeightModal();
          }}
          className="flex flex-col items-center justify-center h-full min-h-[44px] group"
        >
          <div className="w-10 h-10 -mt-3 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-md group-hover:bg-emerald-700 group-active:scale-95 transition-all">
            <Scale className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-[11px] mt-0.5 font-black text-emerald-800">Pesar</span>
        </button>

        {/* Tab 3: Conquistas */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onSelectTab('achievements');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] relative transition-colors ${
            currentTab === 'achievements' ? 'text-amber-800 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <Award className={`w-5 h-5 ${currentTab === 'achievements' ? 'stroke-[2.8] text-amber-600' : 'stroke-2'}`} />
            {unlockedCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[9px] font-black rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                {unlockedCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 font-bold">Conquistas</span>
          {currentTab === 'achievements' && <span className="w-1.5 h-1.5 bg-amber-600 rounded-full mt-0.5" />}
        </button>

        {/* Tab 4: Dicas */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onSelectTab('tips');
          }}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'tips' ? 'text-teal-700 font-extrabold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Apple className={`w-5 h-5 ${currentTab === 'tips' ? 'stroke-[2.8]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1 font-bold">Dicas</span>
          {currentTab === 'tips' && <span className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-0.5" />}
        </button>
      </div>
    </nav>
  );
};
