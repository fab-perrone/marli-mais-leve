import { ArrowDownRight, ArrowUpRight, Award, Calendar, CheckCircle2, ChevronRight, Minus, Sparkles, Trash2, TrendingDown } from 'lucide-react';
import React, { useState } from 'react';
import { UserProfile, WeightEntry } from '../types';
import { soundEffects } from '../utils/audio';

interface ProgressChartProps {
  entries: WeightEntry[];
  profile: UserProfile;
  onDeleteEntry: (id: string) => void;
  onOpenWeightModal: () => void;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  entries,
  profile,
  onDeleteEntry,
  onOpenWeightModal,
}) => {
  const [filterRange, setFilterRange] = useState<'4' | '8' | 'all'>('all');
  const [hoveredEntry, setHoveredEntry] = useState<WeightEntry | null>(null);

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const filteredEntries = React.useMemo(() => {
    if (filterRange === '4') return sortedEntries.slice(-4);
    if (filterRange === '8') return sortedEntries.slice(-8);
    return sortedEntries;
  }, [sortedEntries, filterRange]);

  const initialWeight = sortedEntries.length > 0 ? sortedEntries[0].weight : profile.initialWeight;
  const currentWeight = sortedEntries.length > 0 ? sortedEntries[sortedEntries.length - 1].weight : profile.initialWeight;
  const targetWeight = profile.targetWeight;
  const totalChange = currentWeight - initialWeight;
  const remainingToGoal = currentWeight - targetWeight;

  // Elderly BMI Calculation (adapted for seniors >= 60 yrs, where 23.0 to 28.0 is optimal)
  const heightM = profile.height / 100;
  const bmi = heightM > 0 ? Number((currentWeight / (heightM * heightM)).toFixed(1)) : 24.5;
  let bmiCategory = 'Adequado para Longevidade';
  let bmiColor = 'text-emerald-700 bg-emerald-100';
  if (bmi < 22) {
    bmiCategory = 'Atenção: Peso Baixo';
    bmiColor = 'text-amber-800 bg-amber-100';
  } else if (bmi > 27) {
    bmiCategory = 'Sobrepeso Leve';
    bmiColor = 'text-orange-800 bg-orange-100';
  }

  // SVG Chart Calculation
  const width = 640;
  const height = 240;
  const paddingX = 45;
  const paddingTop = 25;
  const paddingBottom = 40;

  const weights = filteredEntries.map((e) => e.weight);
  const minW = Math.min(...weights, targetWeight) - 1.0;
  const maxW = Math.max(...weights, targetWeight) + 1.0;
  const rangeW = maxW - minW || 1;

  const getX = (index: number) => {
    if (filteredEntries.length <= 1) return width / 2;
    return paddingX + (index / (filteredEntries.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    return height - paddingBottom - ((val - minW) / rangeW) * (height - paddingTop - paddingBottom);
  };

  // Construct SVG path line
  const points = filteredEntries.map((e, idx) => ({
    x: getX(idx),
    y: getY(e.weight),
    entry: e,
  }));

  const lineD = points.reduce((acc, curr, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${curr.x} ${curr.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${lineD} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`
    : '';

  const targetY = getY(targetWeight);

  return (
    <div className="space-y-6">
      {/* 4 Big Stat Cards for Seniors */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Peso Inicial */}
        <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Peso Inicial</span>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-black text-slate-800 tabular-nums">
              {initialWeight.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-slate-500 ml-1">kg</span>
          </div>
          <span className="text-[11px] text-slate-500">Ponto de partida</span>
        </div>

        {/* Card 2: Peso Atual */}
        <div className="bg-emerald-50 rounded-2xl p-4 border-2 border-emerald-300 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">Peso Atual</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <div className="my-1">
            <span className="text-3xl sm:text-4xl font-black text-emerald-950 tabular-nums">
              {currentWeight.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-emerald-700 ml-1">kg</span>
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold">
            Última medição
          </span>
        </div>

        {/* Card 3: Variação Total */}
        <div className="bg-white rounded-2xl p-4 border-2 border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Evolução Total</span>
          <div className="my-1 flex items-center gap-1">
            {totalChange < 0 ? (
              <TrendingDown className="w-6 h-6 text-emerald-600" />
            ) : totalChange > 0 ? (
              <ArrowUpRight className="w-6 h-6 text-amber-600" />
            ) : (
              <Minus className="w-6 h-6 text-slate-400" />
            )}
            <span
              className={`text-2xl sm:text-3xl font-black tabular-nums ${
                totalChange < 0 ? 'text-emerald-700' : totalChange > 0 ? 'text-amber-700' : 'text-slate-700'
              }`}
            >
              {totalChange > 0 ? `+${totalChange.toFixed(1)}` : totalChange.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-slate-500">kg</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {totalChange < 0 ? 'Eliminados com saúde!' : 'Equilíbrio e manutenção'}
          </span>
        </div>

        {/* Card 4: Meta Desejada */}
        <div className="bg-amber-50 rounded-2xl p-4 border-2 border-amber-300 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-900 uppercase tracking-wide">Sua Meta</span>
          <div className="my-1">
            <span className="text-2xl sm:text-3xl font-black text-amber-950 tabular-nums">
              {targetWeight.toFixed(1)}
            </span>
            <span className="text-sm font-bold text-amber-800 ml-1">kg</span>
          </div>
          <span className="text-[11px] text-amber-900 font-bold">
            {remainingToGoal > 0 ? `Faltam ${remainingToGoal.toFixed(1)} kg` : 'Meta Alcançada! 🏆'}
          </span>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border-2 border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📈</span>
              <h3 className="font-extrabold text-lg sm:text-xl text-slate-900">
                Gráfico de Progresso Semanal
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Pontos amarelos indicam pesagens registradas nos domingos
            </p>
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => {
                soundEffects.playClick();
                setFilterRange('4');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filterRange === '4' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Últimas 4 semanas
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setFilterRange('8');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filterRange === '8' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              8 semanas
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setFilterRange('all');
              }}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                filterRange === 'all' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({sortedEntries.length})
            </button>
          </div>
        </div>

        {/* Interactive SVG Chart Canvas */}
        <div className="relative overflow-x-auto w-full">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto max-h-[300px] select-none"
          >
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Background Grid Horizontal Lines */}
            {[0.25, 0.5, 0.75].map((factor, i) => {
              const yVal = paddingTop + factor * (height - paddingTop - paddingBottom);
              const valNum = maxW - factor * rangeW;
              return (
                <g key={i}>
                  <line
                    x1={paddingX}
                    y1={yVal}
                    x2={width - paddingX}
                    y2={yVal}
                    stroke="#e2e8f0"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 6}
                    y={yVal + 4}
                    textAnchor="end"
                    className="text-[11px] fill-slate-400 font-mono tabular-nums"
                  >
                    {valNum.toFixed(0)}k
                  </text>
                </g>
              );
            })}

            {/* Target Weight Line */}
            {targetY >= paddingTop && targetY <= height - paddingBottom && (
              <g>
                <line
                  x1={paddingX}
                  y1={targetY}
                  x2={width - paddingX}
                  y2={targetY}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <text
                  x={width - paddingX}
                  y={targetY - 6}
                  textAnchor="end"
                  className="text-[11px] font-bold fill-amber-700"
                >
                  Meta: {targetWeight} kg
                </text>
              </g>
            )}

            {/* Area Fill */}
            {areaD && <path d={areaD} fill="url(#areaGradient)" />}

            {/* Weight Line */}
            {lineD && (
              <path
                d={lineD}
                fill="none"
                stroke="#059669"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Data Points */}
            {points.map((p, idx) => {
              const isSunday = p.entry.isSunday;
              const isHovered = hoveredEntry?.id === p.entry.id;

              return (
                <g
                  key={p.entry.id}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredEntry(p.entry)}
                  onClick={() => setHoveredEntry(p.entry)}
                >
                  {/* Sunday glow halo */}
                  {isSunday && (
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="12"
                      fill="#fef3c7"
                      stroke="#f59e0b"
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                  )}

                  {/* Main Point Circle */}
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={isHovered ? 7 : 5}
                    fill={isSunday ? '#d97706' : '#059669'}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    className="transition-all duration-150"
                  />

                  {/* Value label above point */}
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className={`text-[11px] font-bold tabular-nums ${
                      isSunday ? 'fill-amber-900 font-black' : 'fill-emerald-900'
                    }`}
                  >
                    {p.entry.weight.toFixed(1)}
                  </text>

                  {/* Date label at bottom */}
                  <text
                    x={p.x}
                    y={height - 12}
                    textAnchor="middle"
                    className={`text-[10px] font-medium ${
                      isSunday ? 'fill-amber-800 font-bold' : 'fill-slate-500'
                    }`}
                  >
                    {new Date(p.entry.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected / Hovered Detail Tooltip Bar */}
        {hoveredEntry && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-50 border-2 border-amber-300 flex items-center justify-between text-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <span className="text-xl">{hoveredEntry.isSunday ? '☀️' : '📅'}</span>
              <div>
                <span className="font-extrabold text-amber-950">
                  {new Date(hoveredEntry.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                  :
                </span>{' '}
                <span className="font-black text-emerald-800 text-base tabular-nums">
                  {hoveredEntry.weight.toFixed(1)} kg
                </span>
                {hoveredEntry.note && (
                  <p className="text-xs text-amber-900/80 italic mt-0.5">"{hoveredEntry.note}"</p>
                )}
              </div>
            </div>
            <button
              onClick={() => setHoveredEntry(null)}
              className="text-xs text-amber-800 hover:underline font-bold"
            >
              Fechar
            </button>
          </div>
        )}

        {/* Elder Health Insight / BMI Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">Índice Corporal Saudável (IMC):</span>
            <span className="font-mono font-black text-slate-900 tabular-nums">{bmi}</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${bmiColor}`}>
              {bmiCategory}
            </span>
          </div>
          <span className="text-slate-500 text-xs">
            Padrão adaptado para preservação de massa óssea e muscular em pessoas 60+
          </span>
        </div>
      </div>

      {/* History Table with Large Senior Rows */}
      <div className="bg-white rounded-3xl p-5 border-2 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-extrabold text-base sm:text-lg text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            <span>Histórico de Pesagens Semanal</span>
          </h4>
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenWeightModal();
            }}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 underline"
          >
            + Nova Pesagem
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {sortedEntries.slice().reverse().map((entry, idx) => {
            const dateObj = new Date(entry.date + 'T12:00:00');
            const dayName = dateObj.toLocaleDateString('pt-BR', { weekday: 'short' });
            const fullDate = dateObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

            return (
              <div
                key={entry.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      entry.isSunday
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {entry.isSunday ? 'Dom' : dayName.slice(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {fullDate}
                      </span>
                      {entry.isSunday && (
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full">
                          ☀️ Domingo
                        </span>
                      )}
                    </div>
                    {entry.note ? (
                      <p className="text-xs text-slate-500 truncate max-w-xs sm:max-w-md">
                        {entry.note}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400">Pesagem de rotina</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-emerald-950 tabular-nums">
                      {entry.weight.toFixed(1)}
                    </span>
                    <span className="text-xs font-bold text-slate-500 ml-1">kg</span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`Deseja excluir a pesagem de ${entry.weight} kg do dia ${fullDate}?`)) {
                        soundEffects.playClick();
                        onDeleteEntry(entry.id);
                      }
                    }}
                    title="Excluir este registro"
                    className="p-2 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
