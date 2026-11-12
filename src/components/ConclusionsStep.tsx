import React, { useState } from 'react';
import { PracticeDefinition, ExperimentDataPoint, EmotionType, StudentProfile } from '../types';
import { speechService } from '../services/speechService';
import {
  CheckCircle2,
  Mic,
  MicOff,
  Sparkles,
  HelpCircle,
  Award,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';

interface ConclusionsStepProps {
  practice: PracticeDefinition;
  hypothesis: string;
  dataPoints: ExperimentDataPoint[];
  conclusions: string;
  onUpdateConclusions: (text: string) => void;
  onGenerateRubric: () => void;
  isEvaluating: boolean;
  emotion: EmotionType;
  studentProfile: StudentProfile;
}

export const ConclusionsStep: React.FC<ConclusionsStepProps> = ({
  practice,
  hypothesis,
  dataPoints,
  conclusions,
  onUpdateConclusions,
  onGenerateRubric,
  isEvaluating,
  emotion,
  studentProfile,
}) => {
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);

  // Toggle voice dictation
  const handleToggleVoiceInput = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }

    if (!speechService.isSpeechRecognitionSupported()) {
      alert('Tu navegador no soporta reconocimiento de voz nativo. Puedes redactar en el recuadro.');
      return;
    }

    setIsRecordingVoice(true);
    const recognition = speechService.createRecognition(
      (transcript) => {
        onUpdateConclusions(conclusions ? `${conclusions} ${transcript}` : transcript);
      },
      (err) => {
        console.error('Speech recognition error:', err);
        setIsRecordingVoice(false);
      },
      () => {
        setIsRecordingVoice(false);
      }
    );

    if (recognition) {
      try {
        recognition.start();
      } catch {
        setIsRecordingVoice(false);
      }
    }
  };

  const hasMinimumData = dataPoints.length >= 3;

  return (
    <div className="space-y-6">
      {/* 1. Summary of Evidence & Hypothesis Contrast */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
              Fase 4 • Análisis, Contrastación y Conclusiones (MCCEMS)
            </span>
            <h3 className="text-base font-bold text-white">
              Contrasta tu Hipótesis Inicial con los Datos Obtenidos
            </h3>
          </div>
        </div>

        {/* Contrast Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Student Hypothesis */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
              Tu Hipótesis Inicial formulada:
            </span>
            <p className="text-xs text-slate-200 italic leading-relaxed">
              "{hypothesis || 'No redactaste una hipótesis previa.'}"
            </p>
          </div>

          {/* Evidence Gathered */}
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block mb-1">
              Evidencia Experimental Recolectada:
            </span>
            <p className="text-xs text-slate-300">
              {dataPoints.length} mediciones registradas en la bitácora.{' '}
              {hasMinimumData ? (
                <span className="text-emerald-400 font-semibold block mt-1">
                  ✓ Cuentas con suficientes puntos para sustentar tus conclusiones científicas.
                </span>
              ) : (
                <span className="text-amber-400 font-semibold block mt-1">
                  ⚠ Tienes pocas mediciones. Puedes regresar a la mesa para tomar más datos.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Guiding Questions for Analysis */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/80 space-y-2">
          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            Preguntas Guía para estructurar tu conclusión:
          </span>
          <ul className="text-xs text-slate-400 space-y-1.5 list-disc list-inside">
            {practice.hypothesisPrompt.guidingQuestions.map((q, idx) => (
              <li key={idx} className="text-slate-300">
                {q}
              </li>
            ))}
          </ul>
        </div>

        {/* Conclusions Textarea with Voice Dictation */}
        <div className="space-y-2 pt-2">
          <label className="text-xs font-bold text-slate-200 block">
            Redacta tus conclusiones y reflexión de transferencia técnica/comunitaria:
          </label>

          <div className="relative">
            <textarea
              rows={4}
              value={conclusions}
              onChange={(e) => onUpdateConclusions(e.target.value)}
              placeholder="Escribe tus conclusiones: ¿Se confirmó tu hipótesis? ¿Qué relación matemática o química observaste en la gráfica? ¿Cómo aplicarías este conocimiento en tu especialidad técnica de DGETI o en tu comunidad?..."
              className="w-full bg-slate-950/90 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-12"
            />

            <button
              onClick={handleToggleVoiceInput}
              className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
                isRecordingVoice
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isRecordingVoice ? 'Detener dictado' : 'Dictar conclusiones por voz'}
            >
              {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {isRecordingVoice && (
            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Escuchando dictado de conclusiones...
            </div>
          )}
        </div>

        {/* Generate Rubric CTA */}
        <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
          <span className="text-xs text-slate-400">
            Al evaluar, se generará la <strong className="text-teal-300">Rúbrica Formativa MCCEMS</strong> y el Reporte Oficial descargable.
          </span>

          <button
            onClick={onGenerateRubric}
            disabled={isEvaluating}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-500 via-emerald-600 to-cyan-600 hover:from-teal-400 hover:to-emerald-500 shadow-xl shadow-teal-500/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isEvaluating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-white" />
                <span>Evaluando con IA Pedagógica MCCEMS...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4" />
                <span>Generar Rúbrica de Desempeño y Reporte DGETI</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
