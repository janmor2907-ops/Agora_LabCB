import React from 'react';
import { AccessibilitySettings } from '../types';
import {
  Eye,
  Type,
  Volume2,
  VolumeX,
  Sparkles,
  ZapOff,
  Sliders,
  Check,
} from 'lucide-react';

interface AccessibilityToolbarProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const AccessibilityToolbar: React.FC<AccessibilityToolbarProps> = ({
  settings,
  onUpdateSettings,
  isOpen,
  onToggleOpen,
}) => {
  return (
    <div className="relative">
      <button
        onClick={onToggleOpen}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
          isOpen || settings.simplifiedMode || settings.dyslexicFont || settings.highContrast
            ? 'bg-teal-500/20 border-teal-400 text-teal-300 shadow-md shadow-teal-500/10'
            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
        }`}
        title="Herramientas de Accesibilidad y DUA / UDL"
      >
        <Eye className="w-4 h-4 text-teal-400" />
        <span className="hidden sm:inline">Accesibilidad DUA</span>
        {(settings.simplifiedMode || settings.dyslexicFont || settings.highContrast) && (
          <span className="w-2 h-2 rounded-full bg-teal-400" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900/95 border border-slate-700 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-50 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Diseño Universal para el Aprendizaje (DUA)
              </h4>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-950 text-teal-300 border border-teal-800">
              MCCEMS
            </span>
          </div>

          <div className="space-y-3">
            {/* Modo Lenguaje Claro / Pictogramas (TEA y lectura fácil) */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧪</span>
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Lenguaje Claro / Pictogramas
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Pasos visuales cortos e iconos (Modo TEA)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ simplifiedMode: !settings.simplifiedMode })}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    settings.simplifiedMode ? 'bg-teal-500' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle Lenguaje Claro"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.simplifiedMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Tipografía Dislexia */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Fuente Hiperlegible (Dislexia)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Mayor espaciado y diferenciación de caracteres
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ dyslexicFont: !settings.dyslexicFont })}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    settings.dyslexicFont ? 'bg-sky-500' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle Fuente Dislexia"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.dyslexicFont ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Tamaño de texto */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <span className="text-xs font-bold text-white block mb-1.5">
                Escala de Texto
              </span>
              <div className="grid grid-cols-4 gap-1.5">
                {(['sm', 'md', 'lg', 'xl'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => onUpdateSettings({ fontSize: size })}
                    className={`py-1 text-xs font-semibold rounded-lg border transition-all ${
                      settings.fontSize === size
                        ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {size === 'sm' ? 'Pequeño' : size === 'md' ? 'Normal' : size === 'lg' ? 'Grande' : 'Muy Gde'}
                  </button>
                ))}
              </div>
            </div>

            {/* Alto Contraste & Reducción de Estímulos */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
                className={`p-2 rounded-xl border text-left transition-all ${
                  settings.highContrast
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  {settings.highContrast && <Check className="w-3 h-3" />}
                </div>
                <span className="text-xs font-bold block">Alto Contraste</span>
                <span className="text-[10px] text-slate-400">Contraste visual 125%</span>
              </button>

              <button
                onClick={() => onUpdateSettings({ reducedMotion: !settings.reducedMotion })}
                className={`p-2 rounded-xl border text-left transition-all ${
                  settings.reducedMotion
                    ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                    : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <ZapOff className="w-3.5 h-3.5" />
                  {settings.reducedMotion && <Check className="w-3 h-3" />}
                </div>
                <span className="text-xs font-bold block">Menos Estímulos</span>
                <span className="text-[10px] text-slate-400">Pausa animaciones</span>
              </button>
            </div>

            {/* Text-to-Speech lectura de voz */}
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {settings.voiceEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Lectura por Voz Asistida
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Lee instrucciones en voz alta
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => onUpdateSettings({ voiceEnabled: !settings.voiceEnabled })}
                  className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                    settings.voiceEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                  aria-label="Toggle Lectura por Voz"
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white transition-transform ${
                      settings.voiceEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
