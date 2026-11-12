import React from 'react';
import { PracticeDefinition, DisciplineType } from '../types';
import { PRACTICES } from '../data/practices';
import { Beaker, Zap, Gauge, Scale, Clock, Award, Compass, ArrowRight } from 'lucide-react';

interface PracticeSelectorProps {
  selectedPracticeId: string;
  onSelectPractice: (practice: PracticeDefinition) => void;
  selectedDiscipline: DisciplineType | 'Todas';
  onFilterDiscipline: (discipline: DisciplineType | 'Todas') => void;
}

export const PracticeSelector: React.FC<PracticeSelectorProps> = ({
  selectedPracticeId,
  onSelectPractice,
  selectedDiscipline,
  onFilterDiscipline,
}) => {
  const filteredPractices =
    selectedDiscipline === 'Todas'
      ? PRACTICES
      : PRACTICES.filter((p) => p.discipline === selectedDiscipline);

  const getDisciplineIcon = (id: string) => {
    switch (id) {
      case 'acido-base-ph':
        return <Beaker className="w-5 h-5 text-teal-400" />;
      case 'ley-de-ohm':
        return <Zap className="w-5 h-5 text-amber-400" />;
      case 'ley-de-boyle':
        return <Gauge className="w-5 h-5 text-sky-400" />;
      case 'conservacion-materia':
        return <Scale className="w-5 h-5 text-emerald-400" />;
      default:
        return <Beaker className="w-5 h-5 text-teal-400" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Pills Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-teal-400" />
            Catálogo de Prácticas Situadas DGETI
          </h2>
          <p className="text-xs text-slate-400">
            Alineadas a las Progresiones de Ciencias Naturales, Experimentales y Tecnología (MCCEMS)
          </p>
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {(['Todas', 'Química', 'Física'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => onFilterDiscipline(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDiscipline === cat
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Practices Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPractices.map((practice) => {
          const isSelected = selectedPracticeId === practice.id;
          return (
            <div
              key={practice.id}
              onClick={() => onSelectPractice(practice)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden group ${
                isSelected
                  ? 'bg-slate-800/90 border-teal-500/80 ring-2 ring-teal-500/20 shadow-xl shadow-teal-500/5'
                  : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              {/* Top Row with Discipline badge and duration */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                      practice.discipline === 'Química'
                        ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                        : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {getDisciplineIcon(practice.id)}
                    {practice.discipline}
                  </span>

                  <span className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {practice.durationMinutes} min
                  </span>
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
                  {practice.title}
                </h3>

                <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed">
                  {practice.objective}
                </p>

                {/* Community Context Pill */}
                <div className="mt-3 p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                  <strong className="text-slate-300 block mb-0.5">Contexto Situado:</strong>
                  {practice.communityContext}
                </div>
              </div>

              {/* Bottom Row: MCCEMS Tag & Action */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[11px] text-teal-400/90 font-medium truncate max-w-[240px]">
                  {practice.mccemsProgression.split(':')[0]}
                </span>
                <span className="flex items-center gap-1 font-semibold text-teal-400 group-hover:translate-x-0.5 transition-transform">
                  {isSelected ? 'Práctica Activa' : 'Seleccionar'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
