import React from 'react';
import {
  MCCEMSRubricResult,
  PracticeDefinition,
  StudentProfile,
  MaterialsMode,
  ExperimentDataPoint,
} from '../types';
import {
  Award,
  Printer,
  Download,
  CheckCircle,
  Sparkles,
  RotateCcw,
  BookOpen,
  Heart,
  TrendingUp,
} from 'lucide-react';

interface MCCEMSRubricReportProps {
  rubric: MCCEMSRubricResult;
  practice: PracticeDefinition;
  studentProfile: StudentProfile;
  materialsMode: MaterialsMode;
  hypothesis: string;
  dataPoints: ExperimentDataPoint[];
  conclusions: string;
  onRestartPractice: () => void;
}

export const MCCEMSRubricReport: React.FC<MCCEMSRubricReportProps> = ({
  rubric,
  practice,
  studentProfile,
  materialsMode,
  hypothesis,
  dataPoints,
  conclusions,
  onRestartPractice,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadJSON = () => {
    const reportData = {
      institucion: 'DGETI - SEMS - SEP',
      estudiante: studentProfile,
      practica: {
        id: practice.id,
        titulo: practice.title,
        disciplina: practice.discipline,
        progresionMCCEMS: practice.mccemsProgression,
        modalidadInsumos: materialsMode === 'standard' ? 'Estándar de Laboratorio' : 'Alternativos Comunitarios',
      },
      hipotesis: hypothesis,
      datosExperimentales: dataPoints,
      conclusiones: conclusions,
      evaluacionFormativaMCCEMS: rubric,
      fechaGeneracion: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_DGETI_${practice.id}_${studentProfile.name.replace(/\s+/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getLevelBadgeClass = (level: string) => {
    switch (level) {
      case 'Estratégico':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Autónomo':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Resolutivo':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Receptivo':
      default:
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden during print) */}
      <div className="no-print flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-400" />
          <div>
            <h3 className="text-sm font-bold text-white">
              Reporte Formativo Oficial de Práctica DGETI
            </h3>
            <span className="text-[11px] text-slate-400">
              Evaluación alineada al Marco Curricular Común (MCCEMS)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow"
          >
            <Printer className="w-4 h-4 text-teal-400" />
            Imprimir / Guardar en PDF
          </button>
          <button
            onClick={handleDownloadJSON}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 transition-colors shadow"
          >
            <Download className="w-4 h-4" />
            Descargar Portafolio (JSON)
          </button>
          <button
            onClick={onRestartPractice}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Repetir Práctica
          </button>
        </div>
      </div>

      {/* Main Printable Report Document */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-slate-100 print:bg-white print:text-black print:p-0 print:border-none print-card">
        {/* Official Header */}
        <div className="border-b-2 border-teal-500 pb-5 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] tracking-widest uppercase font-bold text-teal-400 print:text-teal-700 block">
                SECRETARÍA DE EDUCACIÓN PÚBLICA • SUBSECRETARÍA DE EDUCACIÓN MEDIA SUPERIOR
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white print:text-black mt-0.5">
                DIRECCIÓN GENERAL DE EDUCACIÓN TECNOLÓGICA INDUSTRIAL Y DE SERVICIOS (DGETI)
              </h2>
              <p className="text-xs text-slate-400 print:text-slate-600 font-medium">
                Laboratorio de Ciencias Experimentales • Ágora-Lab Neuro-Adaptativo MCCEMS
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-2xl font-black text-teal-400 print:text-teal-700 font-mono block">
                {rubric.generalScore} / 100
              </span>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getLevelBadgeClass(rubric.levelReached)}`}>
                Nivel {rubric.levelReached}
              </span>
            </div>
          </div>

          {/* Student metadata box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-800 print:border-slate-300 text-xs">
            <div>
              <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase font-bold">
                Estudiante
              </span>
              <span className="font-bold text-white print:text-black">{studentProfile.name}</span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase font-bold">
                Plantel
              </span>
              <span className="font-semibold text-slate-200 print:text-slate-800">
                {studentProfile.school} ({studentProfile.state})
              </span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase font-bold">
                Especialidad / Semestre
              </span>
              <span className="font-semibold text-slate-200 print:text-slate-800">
                {studentProfile.specialty} • {studentProfile.semester} ({studentProfile.group})
              </span>
            </div>
            <div>
              <span className="text-slate-400 print:text-slate-500 block text-[10px] uppercase font-bold">
                Fecha de Evaluación
              </span>
              <span className="font-semibold text-slate-200 print:text-slate-800">
                {rubric.evaluationDate}
              </span>
            </div>
          </div>
        </div>

        {/* Practice info banner */}
        <div className="bg-slate-950/60 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300 mb-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-400 print:text-teal-800 block">
                {practice.discipline} • {practice.mccemsProgression.split(':')[0]}
              </span>
              <h3 className="text-base font-bold text-white print:text-black mt-0.5">
                {practice.title}
              </h3>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 print:bg-slate-200 text-slate-300 print:text-slate-800">
              Modalidad:{' '}
              {materialsMode === 'standard'
                ? 'Materiales Estándar de Laboratorio'
                : 'Materiales Alternativos Comunitarios'}
            </span>
          </div>
          <p className="text-xs text-slate-400 print:text-slate-600 mt-2">
            <strong>Objetivo:</strong> {practice.objective}
          </p>
        </div>

        {/* Formative Rubric Table */}
        <div className="space-y-4 mb-6">
          <h4 className="text-sm font-bold uppercase tracking-wider text-teal-400 print:text-teal-800 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Rúbrica de Desempeño Formativo por Progresión MCCEMS
          </h4>

          <div className="divide-y divide-slate-800 print:divide-slate-300 border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden">
            {rubric.criteria.map((c, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-950/40 print:bg-white hover:bg-slate-800/20 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 print:text-teal-700 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </span>
                    <h5 className="text-xs sm:text-sm font-bold text-white print:text-black">
                      {c.name}
                    </h5>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getLevelBadgeClass(
                        c.level
                      )}`}
                    >
                      {c.level}
                    </span>
                    <span className="text-xs font-mono font-bold text-teal-400 print:text-teal-700">
                      {c.score} / 25 pts
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 print:text-slate-700 mt-1 pl-7">
                  <strong className="text-slate-400 print:text-slate-600">Observación Formativa:</strong> {c.observation}
                </p>
                {c.recommendation && (
                  <p className="text-[11px] text-teal-300/90 print:text-teal-800 mt-1 pl-7 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 shrink-0 text-teal-400" />
                    <strong>Recomendación pedagógica:</strong> {c.recommendation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Socioemotional & Qualitative Feedback (Non-punitive) */}
        <div className="p-5 rounded-xl bg-teal-950/20 print:bg-teal-50 border border-teal-800/40 print:border-teal-300 space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-teal-400 print:text-teal-700" />
            <h5 className="text-xs font-bold uppercase tracking-wider text-teal-300 print:text-teal-800">
              Retroalimentación Pedagógica del Asistente Virtual Ágora-Lab
            </h5>
          </div>

          <p className="text-xs sm:text-sm text-slate-200 print:text-slate-800 leading-relaxed italic">
            "{rubric.overallFeedback}"
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
            {/* Achievements */}
            <div className="bg-slate-900/80 print:bg-white p-3 rounded-lg border border-slate-800 print:border-slate-300">
              <span className="font-bold text-emerald-400 print:text-emerald-700 block mb-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Logros Evidenciados:
              </span>
              <ul className="space-y-1 text-slate-300 print:text-slate-700 list-disc list-inside">
                {rubric.achievements.map((ach, i) => (
                  <li key={i}>{ach}</li>
                ))}
              </ul>
            </div>

            {/* Growth Areas */}
            <div className="bg-slate-900/80 print:bg-white p-3 rounded-lg border border-slate-800 print:border-slate-300">
              <span className="font-bold text-cyan-400 print:text-cyan-700 block mb-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Oportunidades de Aprendizaje:
              </span>
              <ul className="space-y-1 text-slate-300 print:text-slate-700 list-disc list-inside">
                {rubric.growthAreas.map((gr, i) => (
                  <li key={i}>{gr}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Student Experimental Evidence Summary (Hipótesis + Datos) */}
        <div className="border-t border-slate-800 print:border-slate-300 pt-4 space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 print:text-slate-600">
            Resumen de Evidencia Registrada por el Alumno
          </h5>

          <div className="text-xs text-slate-300 print:text-slate-800 space-y-1">
            <p>
              <strong>Hipótesis planteada:</strong> "{hypothesis || 'Sin registrar'}"
            </p>
            <p>
              <strong>Conclusiones del alumno:</strong> "{conclusions || 'Sin registrar'}"
            </p>
            <p>
              <strong>Total de datos experimentales validados:</strong> {dataPoints.length} puntos de medición.
            </p>
          </div>
        </div>

        {/* Validation signatures */}
        <div className="mt-8 pt-6 border-t border-slate-800 print:border-slate-300 grid grid-cols-2 gap-8 text-center text-xs">
          <div>
            <div className="border-b border-slate-700 print:border-black mx-auto w-48 h-12" />
            <span className="font-bold block mt-2 text-white print:text-black">{studentProfile.name}</span>
            <span className="text-[11px] text-slate-400 print:text-slate-600">Firma del Estudiante</span>
          </div>
          <div>
            <div className="border-b border-slate-700 print:border-black mx-auto w-48 h-12" />
            <span className="font-bold block mt-2 text-white print:text-black">Ágora-Lab Pedagógica</span>
            <span className="text-[11px] text-slate-400 print:text-slate-600">
              Validación Formativa DGETI / MCCEMS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
