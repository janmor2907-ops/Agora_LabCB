import React, { useState } from 'react';
import { PictogramStep } from '../types';
import { speechService } from '../services/speechService';
import { Volume2, VolumeX, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface PictogramStepsGuideProps {
  steps: PictogramStep[];
  currentStepIndex: number;
  onSelectStepIndex: (index: number) => void;
  simplifiedMode: boolean;
}

export const PictogramStepsGuide: React.FC<PictogramStepsGuideProps> = ({
  steps,
  currentStepIndex,
  onSelectStepIndex,
  simplifiedMode,
}) => {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const handlePlayVoice = (index: number, text: string) => {
    if (playingIndex === index) {
      speechService.stopSpeaking();
      setPlayingIndex(null);
      return;
    }

    speechService.speakText(text, {
      onStart: () => setPlayingIndex(index),
      onEnd: () => setPlayingIndex(null),
      onError: () => setPlayingIndex(null),
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">🧭</span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              Secuencia Procedimental • Guía Visual DUA
            </h4>
            <p className="text-[11px] text-slate-400">
              {simplifiedMode
                ? 'Modo Pictogramas Activo: Pasos visuales directos'
                : 'Sigue cada fase experimental para garantizar el rigor científico'}
            </p>
          </div>
        </div>

        {simplifiedMode && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
            TEA / DUA
          </span>
        )}
      </div>

      {/* Pictogram Steps List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {steps.map((step, idx) => {
          const isCurrent = currentStepIndex === idx;
          const isDone = currentStepIndex > idx;
          const textToSpeak = simplifiedMode ? step.simplifiedInstruction : step.instruction;

          return (
            <div
              key={step.stepNumber}
              onClick={() => onSelectStepIndex(idx)}
              className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between relative ${
                isCurrent
                  ? 'bg-teal-950/40 border-teal-400 ring-2 ring-teal-500/20 shadow-md'
                  : isDone
                  ? 'bg-slate-900/60 border-slate-700/60 opacity-80 hover:opacity-100'
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-2xl select-none">{step.icon}</span>
                  <div className="flex items-center gap-1">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                        isCurrent
                          ? 'bg-teal-400 text-slate-950'
                          : isDone
                          ? 'bg-emerald-900 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      Paso {step.stepNumber}
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayVoice(idx, textToSpeak);
                      }}
                      className="p-1 text-slate-400 hover:text-teal-300 transition-colors"
                      title="Escuchar instrucción"
                    >
                      {playingIndex === idx ? (
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                <h5 className="text-xs font-bold text-white line-clamp-1">{step.title}</h5>

                <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
                  {simplifiedMode ? step.simplifiedInstruction : step.instruction}
                </p>

                {step.parameterHint && (
                  <span className="inline-block mt-1 text-[10px] text-teal-400 font-mono">
                    {step.parameterHint}
                  </span>
                )}
              </div>

              {step.safetyTip && !simplifiedMode && (
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] text-amber-300/90 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3 shrink-0 text-amber-400" />
                  <span className="truncate">{step.safetyTip}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
