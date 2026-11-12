import React from 'react';
import { EmotionType, StudentProfile, AccessibilitySettings } from '../types';
import { AccessibilityToolbar } from './AccessibilityToolbar';
import { pedagogicalEngine } from '../services/pedagogicalEngine';
import { Sparkles, User, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  studentProfile: StudentProfile;
  currentEmotion: EmotionType;
  accessibilitySettings: AccessibilitySettings;
  onUpdateAccessibility: (settings: Partial<AccessibilitySettings>) => void;
  onOpenEmotionalCheckIn: () => void;
  onOpenProfile: () => void;
  isAccessibilityOpen: boolean;
  onToggleAccessibility: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  studentProfile,
  currentEmotion,
  accessibilitySettings,
  onUpdateAccessibility,
  onOpenEmotionalCheckIn,
  onOpenProfile,
  isAccessibilityOpen,
  onToggleAccessibility,
}) => {
  const emotionInfo = pedagogicalEngine.getEmotionBadgeInfo(currentEmotion);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 via-emerald-400 to-cyan-400 p-0.5 shadow-lg shadow-teal-500/20 shrink-0">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-teal-300 font-extrabold text-lg">
              Á
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white">
                Ágora<span className="text-teal-400">-Lab</span>
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-teal-300 border border-teal-500/30">
                DGETI • MCCEMS
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Laboratorio de Ciencias con IA Pedagógica Neuro-Adaptativa y DUA
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick UDL / Pictograms Toggle */}
          <button
            onClick={() =>
              onUpdateAccessibility({ simplifiedMode: !accessibilitySettings.simplifiedMode })
            }
            className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              accessibilitySettings.simplifiedMode
                ? 'bg-teal-500/20 border-teal-400 text-teal-300 ring-2 ring-teal-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Activar secuencias visuales cortas y lenguaje sin sobrecarga cognitiva"
          >
            <span className="text-sm">🧪</span>
            <span>Pictogramas DUA</span>
            {accessibilitySettings.simplifiedMode && (
              <span className="text-[10px] bg-teal-400 text-slate-950 font-bold px-1.5 rounded">
                ON
              </span>
            )}
          </button>

          {/* Emotional State Chip (Clickable to change) */}
          <button
            onClick={onOpenEmotionalCheckIn}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-700 bg-slate-800/90 hover:bg-slate-800 hover:border-slate-600 transition-all shadow-sm"
            title="Cambiar estado socioemocional y tono pedagógico"
          >
            <span className="text-base">{emotionInfo.icon}</span>
            <span className="hidden sm:inline text-slate-300">{emotionInfo.label}</span>
            <span className="text-[10px] text-teal-400 hidden lg:inline">
              ({emotionInfo.message})
            </span>
          </button>

          {/* DUA Accessibility Menu */}
          <AccessibilityToolbar
            settings={accessibilitySettings}
            onUpdateSettings={onUpdateAccessibility}
            isOpen={isAccessibilityOpen}
            onToggleOpen={onToggleAccessibility}
          />

          {/* Student Profile Button */}
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-750 hover:border-slate-600 transition-all"
            title="Ver / Editar datos del alumno y plantel"
          >
            <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
              {studentProfile.name ? studentProfile.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="text-left hidden xl:block">
              <span className="block text-xs font-bold leading-tight">
                {studentProfile.name || 'Estudiante DGETI'}
              </span>
              <span className="block text-[10px] text-slate-400 leading-tight">
                {studentProfile.school || 'CBTis/CETis'}
              </span>
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
