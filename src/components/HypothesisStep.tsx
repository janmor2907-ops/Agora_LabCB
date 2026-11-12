import React, { useState } from 'react';
import { PracticeDefinition, MaterialsMode, EmotionType } from '../types';
import { speechService } from '../services/speechService';
import {
  Lightbulb,
  Mic,
  MicOff,
  Volume2,
  Sparkles,
  HelpCircle,
  Layers,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';

interface HypothesisStepProps {
  practice: PracticeDefinition;
  materialsMode: MaterialsMode;
  onSelectMaterialsMode: (mode: MaterialsMode) => void;
  hypothesis: string;
  onUpdateHypothesis: (hypothesis: string) => void;
  onProceedToExperiment: () => void;
  emotion: EmotionType;
  simplifiedMode: boolean;
}

export const HypothesisStep: React.FC<HypothesisStepProps> = ({
  practice,
  materialsMode,
  onSelectMaterialsMode,
  hypothesis,
  onUpdateHypothesis,
  onProceedToExperiment,
  emotion,
  simplifiedMode,
}) => {
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [showExamples, setShowExamples] = useState(false);

  const materials =
    materialsMode === 'standard' ? practice.standardMaterials : practice.alternativeMaterials;

  // Speech-to-Text Dictation
  const handleToggleVoiceInput = () => {
    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      return;
    }

    if (!speechService.isSpeechRecognitionSupported()) {
      alert('Tu navegador no soporta reconocimiento de voz nativo. Puedes escribir tu hipótesis en el recuadro.');
      return;
    }

    setIsRecordingVoice(true);
    const recognition = speechService.createRecognition(
      (transcript) => {
        onUpdateHypothesis(hypothesis ? `${hypothesis} ${transcript}` : transcript);
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

  // Text-to-Speech playback of instructions
  const handlePlayPromptAudio = () => {
    if (isPlayingAudio) {
      speechService.stopSpeaking();
      setIsPlayingAudio(false);
      return;
    }

    const textToRead = simplifiedMode
      ? `Pregunta de investigación: ${practice.hypothesisPrompt.question}. Escribe tu hipótesis antes de experimentar.`
      : `Planteamiento del problema: ${practice.hypothesisPrompt.question}. Identifica las variables y formula tu hipótesis científica.`;

    speechService.speakText(textToRead, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false),
    });
  };

  const handleUseExample = () => {
    onUpdateHypothesis(practice.hypothesisPrompt.exampleHypothesis);
  };

  return (
    <div className="space-y-6">
      {/* 1. Materials Mode Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" />
              Modalidad de Materiales e Insumos
            </h3>
            <p className="text-xs text-slate-400">
              ¿Con qué recursos realizarás o compararás la práctica de hoy?
            </p>
          </div>

          <div className="grid grid-cols-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <button
              onClick={() => onSelectMaterialsMode('standard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                materialsMode === 'standard'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🧪 Material Estándar (Laboratorio)
            </button>
            <button
              onClick={() => onSelectMaterialsMode('alternative')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                materialsMode === 'alternative'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌱 Insumos Comunitarios / Caseros
            </button>
          </div>
        </div>

        {/* Display Materials Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {materials.map((m, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex flex-col items-center text-center hover:bg-slate-800 transition-colors"
            >
              <span className="text-2xl mb-1.5">{m.icon}</span>
              <span className="text-xs font-bold text-slate-200 line-clamp-1">{m.name}</span>
              <span className="text-[10px] text-slate-400 line-clamp-2 mt-0.5">{m.description}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Scientific Problem & Variables Guide */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block">
                Fase 1 • Formulación de Hipótesis (MCCEMS)
              </span>
              <h3 className="text-base font-bold text-white mt-0.5">
                {practice.hypothesisPrompt.question}
              </h3>
            </div>
          </div>

          <button
            onClick={handlePlayPromptAudio}
            className={`p-2.5 rounded-xl border transition-all shrink-0 ${
              isPlayingAudio
                ? 'bg-teal-500/20 border-teal-400 text-teal-300 animate-pulse'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="Escuchar problema y pregunta en voz alta"
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>

        {/* Variables Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
              Variable Independiente (Causa)
            </span>
            <p className="text-xs text-slate-200 mt-1 font-medium">
              {practice.hypothesisPrompt.variablesToIdentify.independent}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
              Variable Dependiente (Efecto medido)
            </span>
            <p className="text-xs text-slate-200 mt-1 font-medium">
              {practice.hypothesisPrompt.variablesToIdentify.dependent}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Variables de Control
            </span>
            <p className="text-xs text-slate-300 mt-1">
              {practice.hypothesisPrompt.variablesToIdentify.controlled}
            </p>
          </div>
        </div>

        {/* Hypothesis Editor with Voice Dictation */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-slate-200">
              Redacta tu hipótesis científica:
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExamples(!showExamples)}
                className="text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                {showExamples ? 'Ocultar sugerencia' : 'Ver estructura de ayuda'}
              </button>
            </div>
          </div>

          {showExamples && (
            <div className="p-3 rounded-xl bg-teal-950/30 border border-teal-800/40 text-xs text-slate-300 space-y-2">
              <p>
                <strong>Estructura recomendada MCCEMS:</strong>{' '}
                <em>"Si [aumentamos/disminuimos la variable independiente], entonces [la variable dependiente aumentará/disminuirá], debido a que [principio físico o químico]."</em>
              </p>
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-teal-400 italic">
                  Ejemplo: "{practice.hypothesisPrompt.exampleHypothesis}"
                </span>
                <button
                  onClick={handleUseExample}
                  className="px-2.5 py-1 text-[11px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-lg hover:bg-teal-500/30"
                >
                  Usar ejemplo como base
                </button>
              </div>
            </div>
          )}

          <div className="relative">
            <textarea
              rows={3}
              value={hypothesis}
              onChange={(e) => onUpdateHypothesis(e.target.value)}
              placeholder="Ejemplo: Si aumentamos el volumen de base agregada, entonces el pH ascenderá hasta alcanzar el punto de equivalencia estequiométrica a 25 mL porque los iones hidronio se neutralizan con los hidroxilo..."
              className="w-full bg-slate-950/90 border border-slate-700 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 pr-12"
            />

            {/* Dictation Button */}
            <button
              onClick={handleToggleVoiceInput}
              className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all ${
                isRecordingVoice
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title={isRecordingVoice ? 'Detener dictado' : 'Dictar hipótesis por voz'}
            >
              {isRecordingVoice ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
          </div>

          {isRecordingVoice && (
            <div className="text-xs text-rose-400 font-semibold flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Escuchando tu voz... Habla con naturalidad hacia el micrófono.
            </div>
          )}
        </div>

        {/* Proceed to simulation button */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={onProceedToExperiment}
            className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <span>Ir a la Mesa Experimental de Simulación</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
