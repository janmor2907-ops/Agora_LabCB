import React from 'react';
import { EmotionType, StudentProfile } from '../types';
import { Smile, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

interface EmotionalCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmotion: EmotionType;
  onSelectEmotion: (emotion: EmotionType) => void;
  studentProfile: StudentProfile;
}

export const EmotionalCheckInModal: React.FC<EmotionalCheckInModalProps> = ({
  isOpen,
  onClose,
  currentEmotion,
  onSelectEmotion,
  studentProfile,
}) => {
  if (!isOpen) return null;

  const emotions: {
    type: EmotionType;
    emoji: string;
    title: string;
    subtitle: string;
    pedagogy: string;
    color: string;
    activeBorder: string;
  }[] = [
    {
      type: 'confiado',
      emoji: '😎',
      title: 'Confiado / Seguro',
      subtitle: 'Me siento preparado para experimentar sin miedo.',
      pedagogy: 'Te propondré retos avanzados, formulación de modelos y análisis de variables socrático.',
      color: 'hover:border-emerald-500/80 bg-emerald-950/20',
      activeBorder: 'border-emerald-400 ring-2 ring-emerald-500/30',
    },
    {
      type: 'motivado',
      emoji: '🚀',
      title: 'Curioso / Motivado',
      subtitle: 'Tengo entusiasmo por descubrir cómo funciona el fenómeno.',
      pedagogy: 'Profundizaremos en hipótesis complejas y aplicaciones directas a tu especialidad técnica.',
      color: 'hover:border-cyan-500/80 bg-cyan-950/20',
      activeBorder: 'border-cyan-400 ring-2 ring-cyan-500/30',
    },
    {
      type: 'ansioso',
      emoji: '😟',
      title: 'Ansioso por la práctica',
      subtitle: 'Tengo nervios de cometer errores o no entender los cálculos.',
      pedagogy: 'Desglosaré el experimento en pasos muy sencillos, felicitaré cada intento y daré pistas sin restar puntaje.',
      color: 'hover:border-amber-500/80 bg-amber-950/20',
      activeBorder: 'border-amber-400 ring-2 ring-amber-500/30',
    },
    {
      type: 'cansado',
      emoji: '🥱',
      title: 'Cansado / Con poca energía',
      subtitle: 'Ha sido un día pesado y me cuesta concentrarme.',
      pedagogy: 'Instrucciones cortas y directas, sin sobrecarga cognitiva ni textos extensos. Tú marcas el ritmo.',
      color: 'hover:border-indigo-500/80 bg-indigo-950/20',
      activeBorder: 'border-indigo-400 ring-2 ring-indigo-500/30',
    },
    {
      type: 'frustrado',
      emoji: '😣',
      title: 'Frustrado / Con dudas',
      subtitle: 'Siento que la física o química son difíciles para mí.',
      pedagogy: 'Te acompañaré con empatía absoluta: en la ciencia no hay fracasos, los fallos son datos valiosos.',
      color: 'hover:border-rose-500/80 bg-rose-950/20',
      activeBorder: 'border-rose-400 ring-2 ring-rose-500/30',
    },
  ];

  const studentFirstName = studentProfile.name ? studentProfile.name.split(' ')[0] : 'colega';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Heart className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">
              Check-In Socioemocional Inicial
            </h2>
            <p className="text-xs text-slate-400">
              Ágora-Lab adapta su tono pedagógico a tu bienestar cognitivo y emocional
            </p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mt-3 mb-4">
          ¡Hola, <strong className="text-teal-300">{studentFirstName}</strong>! Antes de colocarnos la bata virtual, cuéntanos cómo te sientes para la práctica de hoy:
        </p>

        {/* Emotion Cards */}
        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {emotions.map((item) => {
            const isSelected = currentEmotion === item.type;
            return (
              <button
                key={item.type}
                onClick={() => onSelectEmotion(item.type)}
                className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-start gap-3.5 ${
                  item.color
                } ${
                  isSelected
                    ? `${item.activeBorder} bg-slate-800`
                    : 'border-slate-800/80 hover:bg-slate-800/50'
                }`}
              >
                <span className="text-3xl shrink-0 mt-0.5 select-none">{item.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-white">{item.title}</span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-teal-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Seleccionado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{item.subtitle}</p>
                  <p className="text-[11px] text-teal-300/90 mt-1.5 flex items-center gap-1 bg-slate-900/60 px-2 py-1 rounded-lg">
                    <Sparkles className="w-3 h-3 shrink-0 text-teal-400" />
                    <strong>Adaptación pedagógica:</strong> {item.pedagogy}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer / Confirm button */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 shadow-lg shadow-teal-500/20 transition-all"
          >
            Comenzar Sesión con Ágora-Lab
          </button>
        </div>
      </div>
    </div>
  );
};
