export type EmotionType = 'confiado' | 'motivado' | 'ansioso' | 'cansado' | 'frustrado';

export interface StudentProfile {
  name: string;
  school: string; // e.g. "CBTis No. 72", "CETis No. 10"
  state: string; // Estado de la República
  semester: string; // "2do Semestre", "4to Semestre", "6to Semestre"
  specialty: string; // "Técnico Laboratorista Químico", "Técnico en Mecatrónica", etc.
  group: string;
}

export interface AccessibilitySettings {
  simplifiedMode: boolean; // Modo Lenguaje Claro / Pictogramas DUA
  dyslexicFont: boolean; // Tipografía hiperlegible
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  highContrast: boolean;
  reducedMotion: boolean;
  voiceEnabled: boolean; // Text to Speech para lectura de pasos
}

export type DisciplineType = 'Química' | 'Física';
export type MaterialsMode = 'standard' | 'alternative';

export interface PictogramStep {
  stepNumber: number;
  icon: string;
  title: string;
  instruction: string;
  simplifiedInstruction: string;
  safetyTip?: string;
  parameterHint?: string;
}

export interface PracticeDefinition {
  id: string;
  title: string;
  discipline: DisciplineType;
  durationMinutes: number;
  mccemsProgression: string; // e.g., "Progresión CNET 03: Reacciones y conservación de materia"
  communityContext: string; // Situación contextualizada mexicana
  objective: string;
  standardMaterials: { name: string; icon: string; description: string }[];
  alternativeMaterials: { name: string; icon: string; description: string }[];
  hypothesisPrompt: {
    question: string;
    variablesToIdentify: { independent: string; dependent: string; controlled: string };
    exampleHypothesis: string;
    guidingQuestions: string[];
  };
  steps: PictogramStep[];
}

export interface ExperimentDataPoint {
  id: string;
  timestamp: string;
  stepName?: string;
  [key: string]: any;
}

export type MCCEMSLevel = 'Receptivo' | 'Resolutivo' | 'Autónomo' | 'Estratégico';

export interface MCCEMSCriterion {
  name: string;
  level: MCCEMSLevel;
  score: number; // 0 - 25
  observation: string;
  recommendation: string;
}

export interface MCCEMSRubricResult {
  generalScore: number; // 0 - 100
  levelReached: MCCEMSLevel;
  evaluationDate: string;
  criteria: MCCEMSCriterion[];
  overallFeedback: string;
  achievements: string[];
  growthAreas: string[];
  isAiGenerated: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'mentor';
  text: string;
  timestamp: string;
  isAudioPlaying?: boolean;
}
