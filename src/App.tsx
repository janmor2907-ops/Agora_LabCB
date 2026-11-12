import React, { useState, useEffect } from 'react';
import {
  EmotionType,
  StudentProfile,
  AccessibilitySettings,
  PracticeDefinition,
  MaterialsMode,
  ExperimentDataPoint,
  MCCEMSRubricResult,
  DisciplineType,
} from './types';
import { PRACTICES } from './data/practices';
import { Header } from './components/Header';
import { EmotionalCheckInModal } from './components/EmotionalCheckInModal';
import { StudentProfileModal } from './components/StudentProfileModal';
import { PracticeSelector } from './components/PracticeSelector';
import { HypothesisStep } from './components/HypothesisStep';
import { PictogramStepsGuide } from './components/PictogramStepsGuide';
import { AcidBaseSimulator } from './components/Simulators/AcidBaseSimulator';
import { OhmCircuitSimulator } from './components/Simulators/OhmCircuitSimulator';
import { BoyleGasSimulator } from './components/Simulators/BoyleGasSimulator';
import { ReactionKineticsSimulator } from './components/Simulators/ReactionKineticsSimulator';
import { DataLogAndChart } from './components/DataLogAndChart';
import { ConclusionsStep } from './components/ConclusionsStep';
import { MCCEMSRubricReport } from './components/MCCEMSRubricReport';
import { VirtualMentorChat } from './components/VirtualMentorChat';
import { pedagogicalEngine } from './services/pedagogicalEngine';
import {
  Compass,
  Lightbulb,
  Beaker,
  FileCheck2,
  Award,
  ChevronRight,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  // Student Profile
  const [studentProfile, setStudentProfile] = useState<StudentProfile>(() => {
    const saved = localStorage.getItem('agora_student_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {}
    }
    return {
      name: 'Valeria Morales Santos',
      school: 'CBTis No. 72 (Plataforma Modelo)',
      state: 'Puebla',
      semester: '4to Semestre',
      specialty: 'Técnico Laboratorista Químico',
      group: '4°B',
    };
  });

  // Socioemotional State
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('ansioso');
  const [isEmotionalModalOpen, setIsEmotionalModalOpen] = useState<boolean>(true); // Initial check-in on first turn

  // Accessibility Settings (UDL / DUA)
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>({
    simplifiedMode: false,
    dyslexicFont: false,
    fontSize: 'md',
    highContrast: false,
    reducedMotion: false,
    voiceEnabled: false,
  });

  // Navigation & Practices
  const [selectedPractice, setSelectedPractice] = useState<PracticeDefinition>(PRACTICES[0]);
  const [activeDisciplineFilter, setActiveDisciplineFilter] = useState<DisciplineType | 'Todas'>('Todas');
  const [activeTab, setActiveTab] = useState<'catalogo' | 'hipotesis' | 'simulador' | 'conclusiones' | 'rubrica'>('hipotesis');
  const [materialsMode, setMaterialsMode] = useState<MaterialsMode>('standard');

  // Practice state
  const [hypothesis, setHypothesis] = useState<string>('');
  const [recordedData, setRecordedData] = useState<ExperimentDataPoint[]>([]);
  const [conclusions, setConclusions] = useState<string>('');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [rubricResult, setRubricResult] = useState<MCCEMSRubricResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  // Modals & Drawers
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isVirtualMentorOpen, setIsVirtualMentorOpen] = useState<boolean>(false);

  // Sync profile to localStorage
  useEffect(() => {
    localStorage.setItem('agora_student_profile', JSON.stringify(studentProfile));
  }, [studentProfile]);

  // Apply accessibility classes to document body
  useEffect(() => {
    const body = document.body;
    if (accessibilitySettings.dyslexicFont) {
      body.classList.add('font-dyslexic');
    } else {
      body.classList.remove('font-dyslexic');
    }

    if (accessibilitySettings.highContrast) {
      body.classList.add('high-contrast');
    } else {
      body.classList.remove('high-contrast');
    }

    if (accessibilitySettings.reducedMotion) {
      body.classList.add('reduce-motion');
    } else {
      body.classList.remove('reduce-motion');
    }
  }, [accessibilitySettings]);

  // Handle Practice Switch
  const handleSelectPractice = (practice: PracticeDefinition) => {
    setSelectedPractice(practice);
    setHypothesis('');
    setRecordedData([]);
    setConclusions('');
    setCurrentStepIndex(0);
    setRubricResult(null);
    setActiveTab('hipotesis');
  };

  // Add measurement point
  const handleRecordDataPoint = (point: ExperimentDataPoint) => {
    setRecordedData((prev) => [...prev, point]);
    // Automatically advance pictogram step if relevant
    if (currentStepIndex < selectedPractice.steps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  // Delete measurement
  const handleDeleteDataPoint = (id: string) => {
    setRecordedData((prev) => prev.filter((p) => p.id !== id));
  };

  // Clear all measurements
  const handleClearAllData = () => {
    setRecordedData([]);
  };

  // Evaluate Rubric
  const handleGenerateRubric = async () => {
    setIsEvaluating(true);
    try {
      const result = await pedagogicalEngine.evaluateRubricMCCEMS({
        practice: selectedPractice,
        materialsMode,
        hypothesis,
        recordedData,
        conclusions,
        emotion: currentEmotion,
        studentProfile,
      });
      setRubricResult(result);
      setActiveTab('rubrica');
    } catch (err) {
      console.error('Error generating rubric:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Restart practice
  const handleRestartPractice = () => {
    setHypothesis('');
    setRecordedData([]);
    setConclusions('');
    setCurrentStepIndex(0);
    setRubricResult(null);
    setActiveTab('hipotesis');
  };

  // Font size class mapping
  const getFontSizeClass = () => {
    switch (accessibilitySettings.fontSize) {
      case 'sm':
        return 'text-sm';
      case 'lg':
        return 'text-lg';
      case 'xl':
        return 'text-xl';
      case 'md':
      default:
        return 'text-base';
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${getFontSizeClass()}`}>
      {/* 1. Header with branding, socioemotional chip, and UDL toggles */}
      <Header
        studentProfile={studentProfile}
        currentEmotion={currentEmotion}
        accessibilitySettings={accessibilitySettings}
        onUpdateAccessibility={(newSet) =>
          setAccessibilitySettings((prev) => ({ ...prev, ...newSet }))
        }
        onOpenEmotionalCheckIn={() => setIsEmotionalModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        isAccessibilityOpen={isAccessibilityOpen}
        onToggleAccessibility={() => setIsAccessibilityOpen(!isAccessibilityOpen)}
      />

      {/* 2. Navigation Steps Bar */}
      <nav className="no-print bg-slate-900 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between overflow-x-auto py-2.5 gap-2 no-scrollbar">
            {/* Step 1: Catálogo */}
            <button
              onClick={() => setActiveTab('catalogo')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'catalogo'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>1. Catálogo Prácticas</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            {/* Step 2: Hipótesis */}
            <button
              onClick={() => setActiveTab('hipotesis')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'hipotesis'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lightbulb className="w-4 h-4" />
              <span>2. Formular Hipótesis</span>
              {hypothesis && <span className="w-2 h-2 rounded-full bg-teal-400" />}
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            {/* Step 3: Simulador */}
            <button
              onClick={() => setActiveTab('simulador')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'simulador'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Beaker className="w-4 h-4" />
              <span>3. Mesa Experimental</span>
              {recordedData.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 bg-teal-400 text-slate-950 rounded-full font-mono">
                  {recordedData.length}
                </span>
              )}
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            {/* Step 4: Conclusiones */}
            <button
              onClick={() => setActiveTab('conclusiones')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'conclusiones'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>4. Conclusiones</span>
            </button>

            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

            {/* Step 5: Rúbrica MCCEMS */}
            <button
              onClick={() => {
                if (rubricResult) setActiveTab('rubrica');
                else handleGenerateRubric();
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'rubrica'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>5. Rúbrica MCCEMS</span>
              {rubricResult && (
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-500 text-white rounded font-mono">
                  {rubricResult.generalScore}/100
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* 3. Main Content Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* TAB 1: Catálogo de Prácticas */}
        {activeTab === 'catalogo' && (
          <div className="space-y-6 animate-fadeIn">
            <PracticeSelector
              selectedPracticeId={selectedPractice.id}
              onSelectPractice={handleSelectPractice}
              selectedDiscipline={activeDisciplineFilter}
              onFilterDiscipline={setActiveDisciplineFilter}
            />
          </div>
        )}

        {/* TAB 2: Formular Hipótesis */}
        {activeTab === 'hipotesis' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Banner of active practice */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-teal-950/40 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider block">
                  Práctica Seleccionada ({selectedPractice.discipline})
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {selectedPractice.title}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedPractice.mccemsProgression}
                </p>
              </div>

              <button
                onClick={() => setActiveTab('catalogo')}
                className="text-xs font-semibold text-teal-400 hover:text-teal-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 transition-colors"
              >
                Cambiar de Práctica
              </button>
            </div>

            <HypothesisStep
              practice={selectedPractice}
              materialsMode={materialsMode}
              onSelectMaterialsMode={setMaterialsMode}
              hypothesis={hypothesis}
              onUpdateHypothesis={setHypothesis}
              onProceedToExperiment={() => setActiveTab('simulador')}
              emotion={currentEmotion}
              simplifiedMode={accessibilitySettings.simplifiedMode}
            />
          </div>
        )}

        {/* TAB 3: Mesa Experimental de Simulación */}
        {activeTab === 'simulador' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Pictogram Steps Sequence Bar (DUA) */}
            <PictogramStepsGuide
              steps={selectedPractice.steps}
              currentStepIndex={currentStepIndex}
              onSelectStepIndex={setCurrentStepIndex}
              simplifiedMode={accessibilitySettings.simplifiedMode}
            />

            {/* Interactive Physical / Chemical Simulator */}
            {selectedPractice.id === 'acido-base-ph' && (
              <AcidBaseSimulator
                materialsMode={materialsMode}
                onRecordData={handleRecordDataPoint}
                recordedDataCount={recordedData.length}
              />
            )}

            {selectedPractice.id === 'ley-de-ohm' && (
              <OhmCircuitSimulator
                materialsMode={materialsMode}
                onRecordData={handleRecordDataPoint}
                recordedDataCount={recordedData.length}
              />
            )}

            {selectedPractice.id === 'ley-de-boyle' && (
              <BoyleGasSimulator
                materialsMode={materialsMode}
                onRecordData={handleRecordDataPoint}
                recordedDataCount={recordedData.length}
              />
            )}

            {selectedPractice.id === 'conservacion-materia' && (
              <ReactionKineticsSimulator
                materialsMode={materialsMode}
                onRecordData={handleRecordDataPoint}
                recordedDataCount={recordedData.length}
              />
            )}

            {/* Scientific Log Table and Real-time Chart */}
            <DataLogAndChart
              practice={selectedPractice}
              dataPoints={recordedData}
              onDeletePoint={handleDeleteDataPoint}
              onClearAll={handleClearAllData}
            />

            {/* Navigation bottom bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setActiveTab('hipotesis')}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              >
                ← Regresar a Hipótesis
              </button>

              <button
                onClick={() => setActiveTab('conclusiones')}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white shadow-lg shadow-teal-500/20 flex items-center gap-1.5 transition-all"
              >
                <span>Avanzar a Análisis y Conclusiones</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* TAB 4: Conclusiones y Discusión */}
        {activeTab === 'conclusiones' && (
          <div className="space-y-6 animate-fadeIn">
            <ConclusionsStep
              practice={selectedPractice}
              hypothesis={hypothesis}
              dataPoints={recordedData}
              conclusions={conclusions}
              onUpdateConclusions={setConclusions}
              onGenerateRubric={handleGenerateRubric}
              isEvaluating={isEvaluating}
              emotion={currentEmotion}
              studentProfile={studentProfile}
            />
          </div>
        )}

        {/* TAB 5: Rúbrica MCCEMS & Reporte Oficial */}
        {activeTab === 'rubrica' && rubricResult && (
          <div className="space-y-6 animate-fadeIn">
            <MCCEMSRubricReport
              rubric={rubricResult}
              practice={selectedPractice}
              studentProfile={studentProfile}
              materialsMode={materialsMode}
              hypothesis={hypothesis}
              dataPoints={recordedData}
              conclusions={conclusions}
              onRestartPractice={handleRestartPractice}
            />
          </div>
        )}
      </main>

      {/* 4. Docked / Floating Virtual Pedagogical Assistant Ágora-Lab */}
      <VirtualMentorChat
        practice={selectedPractice}
        emotion={currentEmotion}
        studentProfile={studentProfile}
        accessibilitySettings={accessibilitySettings}
        currentStepTitle={selectedPractice.steps[currentStepIndex]?.title || 'Práctica General'}
        variablesState={{
          hypothesis,
          dataCount: recordedData.length,
          lastMeasurement: recordedData[recordedData.length - 1],
          materialsMode,
        }}
        isOpen={isVirtualMentorOpen}
        onToggleOpen={() => setIsVirtualMentorOpen(!isVirtualMentorOpen)}
      />

      {/* 5. Socioemotional Check-in Modal */}
      <EmotionalCheckInModal
        isOpen={isEmotionalModalOpen}
        onClose={() => setIsEmotionalModalOpen(false)}
        currentEmotion={currentEmotion}
        onSelectEmotion={(emo) => {
          setCurrentEmotion(emo);
          setIsEmotionalModalOpen(false);
        }}
        studentProfile={studentProfile}
      />

      {/* 6. Student Profile Edit Modal */}
      <StudentProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={studentProfile}
        onSaveProfile={setStudentProfile}
      />

      {/* Footer (No print) */}
      <footer className="no-print mt-auto border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>
          Ágora-Lab • Simulador Científico Neuro-Adaptativo y DUA para Planteles DGETI / CBTis / CETis • Alineado al MCCEMS de la Educación Media Superior.
        </p>
      </footer>
    </div>
  );
}
