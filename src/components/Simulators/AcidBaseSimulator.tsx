import React, { useState, useId } from 'react';
import { ExperimentDataPoint, MaterialsMode } from '../../types';
import { Beaker, RotateCcw, Plus, Play, Sparkles, AlertTriangle } from 'lucide-react';

interface AcidBaseSimulatorProps {
  materialsMode: MaterialsMode;
  onRecordData: (point: ExperimentDataPoint) => void;
  recordedDataCount: number;
}

export const AcidBaseSimulator: React.FC<AcidBaseSimulatorProps> = ({
  materialsMode,
  onRecordData,
  recordedDataCount,
}) => {
  const [volumeAdded, setVolumeAdded] = useState<number>(0); // mL of base added
  const [isStirring, setIsStirring] = useState<boolean>(true);
  const [buretteDripping, setBuretteDripping] = useState<boolean>(false);
  const maskId = useId();

  // Initial conditions: 25 mL of 0.1 M Acid (HCl or Acetic Acid in vinegar)
  // Neutralized with 0.1 M Base (NaOH or Bicarbonate)
  // Equivalence point at exactly 25.0 mL
  const calculatePH = (vol: number): number => {
    const vEq = 25.0;
    if (vol === 0) return materialsMode === 'standard' ? 1.05 : 2.4; // Strong vs Weak acid
    if (vol < vEq) {
      // Acidic region
      const fractionRemaining = (vEq - vol) / vEq;
      if (materialsMode === 'standard') {
        const hConc = 0.1 * fractionRemaining * (25 / (25 + vol));
        return Math.max(1.0, -Math.log10(Math.max(hConc, 1e-7)));
      } else {
        // Buffer region for acetic acid/vinegar
        const ph = 4.76 + Math.log10(vol / Math.max(vEq - vol, 0.05));
        return Math.min(6.5, Math.max(2.4, ph));
      }
    } else if (Math.abs(vol - vEq) < 0.2) {
      return 7.0; // Equivalence neutral point
    } else {
      // Basic region
      const excess = vol - vEq;
      const ohConc = 0.1 * (excess / (25 + vol));
      const pOH = -Math.log10(Math.max(ohConc, 1e-7));
      return Math.min(13.2, 14 - pOH);
    }
  };

  const currentPH = Number(calculatePH(volumeAdded).toFixed(2));

  // Determine solution color based on indicator
  const getColorData = (ph: number) => {
    if (materialsMode === 'standard') {
      // Fenolftaleína: Incoloro a pH < 8.2, Rosa tenue a pH 8.3-9.0, Fucsia a pH > 9.0
      if (ph < 8.2) {
        return {
          fill: '#f1f5f9',
          name: 'Incoloro transparente',
          label: 'Incoloro (Medio Ácido / Fenolftaleína inactiva)',
          twBadge: 'bg-slate-700 text-slate-200',
        };
      } else if (ph < 9.0) {
        return {
          fill: '#f472b6',
          name: 'Rosa pálido (Punto de Viraje)',
          label: 'Rosa tenue (Punto final de equivalencia)',
          twBadge: 'bg-pink-600 text-white font-semibold',
        };
      } else {
        return {
          fill: '#db2777',
          name: 'Fucsia / Magenta intenso',
          label: 'Fucsia intenso (Exceso de base NaOH)',
          twBadge: 'bg-fuchsia-700 text-white font-semibold',
        };
      }
    } else {
      // Extracto de Col Morada (Antocianinas caseras)
      if (ph < 3.0) {
        return {
          fill: '#ef4444',
          name: 'Rojo carmesí intenso',
          label: 'Rojo (Muy ácido: pH 1 - 3)',
          twBadge: 'bg-red-600 text-white',
        };
      } else if (ph < 6.0) {
        return {
          fill: '#ec4899',
          name: 'Rosa violáceo',
          label: 'Rosa / Violeta (Ácido moderado: pH 4 - 6)',
          twBadge: 'bg-pink-600 text-white',
        };
      } else if (ph < 8.0) {
        return {
          fill: '#8b5cf6',
          name: 'Púrpura / Morado neutro',
          label: 'Púrpura (Neutro: pH ~ 7)',
          twBadge: 'bg-purple-600 text-white',
        };
      } else if (ph < 10.5) {
        return {
          fill: '#10b981',
          name: 'Verde esmeralda',
          label: 'Verde (Básico: pH 8 - 10)',
          twBadge: 'bg-emerald-600 text-white',
        };
      } else {
        return {
          fill: '#eab308',
          name: 'Amarillo verdoso intenso',
          label: 'Amarillo (Muy alcalino: pH > 11)',
          twBadge: 'bg-amber-500 text-slate-900 font-bold',
        };
      }
    }
  };

  const colorInfo = getColorData(currentPH);

  const handleAddVolume = (increment: number) => {
    setVolumeAdded((prev) => {
      const next = Math.min(50, Math.max(0, Number((prev + increment).toFixed(1))));
      return next;
    });
    setBuretteDripping(true);
    setTimeout(() => setBuretteDripping(false), 600);
  };

  const handleReset = () => {
    setVolumeAdded(0);
    setBuretteDripping(false);
  };

  const handleSaveMeasurement = () => {
    const point: ExperimentDataPoint = {
      id: `pt-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      volumenBase_mL: volumeAdded,
      pH: currentPH,
      coloracion: colorInfo.name,
      estadoNeutralizacion:
        currentPH < 6.8 ? 'Ácido' : currentPH <= 7.5 ? 'Punto de Neutralización' : 'Básico / Alcalino',
    };
    onRecordData(point);
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-sm">
      {/* Header with Title and Mode */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-teal-500/10 border border-teal-500/30 rounded-xl text-teal-400">
            <Beaker className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Mesa de Titulación y Viraje de pH
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-teal-300 font-mono">
                {materialsMode === 'standard' ? 'Estándar: HCl + NaOH' : 'Comunitario: Vinagre + Col Morada'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {materialsMode === 'standard'
                ? 'Monitoreo de pH con sensor de electrodo y bureta de 50 mL'
                : 'Indicador natural de antocianinas y dosificador milimétrico'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
            title="Reiniciar matraz y bureta"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reiniciar
          </button>
        </div>
      </div>

      {/* Main Simulation Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Left: Interactive Apparatus Visual (SVG Graphic) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[360px] overflow-hidden">
          {/* Background Grid Accent */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Interactive SVG Apparatus */}
          <svg className="w-full max-w-[340px] h-[320px]" viewBox="0 0 340 320" fill="none">
            {/* Lab Stand */}
            <rect x="50" y="295" width="240" height="12" rx="4" fill="#334155" />
            <rect x="75" y="20" width="8" height="280" rx="3" fill="#475569" />
            <rect x="75" y="70" width="80" height="6" rx="2" fill="#64748b" />
            <rect x="75" y="150" width="70" height="6" rx="2" fill="#64748b" />

            {/* Burette / Syringe */}
            <g transform="translate(135, 25)">
              {/* Burette Glass Body */}
              <rect x="0" y="0" width="22" height="135" rx="3" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.5" />
              {/* Liquid Level inside Burette (decreases as volume added increases) */}
              <rect
                x="2"
                y={Math.min(125, 4 + (volumeAdded / 50) * 115)}
                width="18"
                height={Math.max(0, 125 - (volumeAdded / 50) * 115)}
                fill="#38bdf8"
                opacity="0.75"
              />
              {/* Volume Graduations */}
              {[10, 25, 40, 55, 70, 85, 100, 115].map((y, i) => (
                <line key={i} x1="14" y1={y} x2="21" y2={y} stroke="#cbd5e1" strokeWidth="1" />
              ))}
              {/* Burette Stopcock / Valve */}
              <circle cx="11" cy="142" r="5" fill="#f59e0b" />
              <rect x="6" y="140" width="10" height="4" fill="#d97706" />
              {/* Burette Tip */}
              <polygon points="9,147 13,147 12,160 10,160" fill="#94a3b8" />

              {/* Falling Drops Animation */}
              {buretteDripping && (
                <circle cx="11" cy="172" r="2.5" fill="#38bdf8" className="animate-bounce" />
              )}
            </g>

            {/* Erlenmeyer Flask or Glass Beaker */}
            <g transform="translate(100, 195)">
              <defs>
                <clipPath id={maskId}>
                  <polygon points="30,5 60,5 82,75 8,75" />
                </clipPath>
              </defs>

              {/* Flask Neck and Outline */}
              <polygon
                points="30,5 60,5 84,80 6,80"
                fill="#0f172a"
                stroke="#94a3b8"
                strokeWidth="2"
              />
              <rect x="28" y="0" width="34" height="6" rx="2" fill="#64748b" />

              {/* Liquid Inside Flask with Dynamic Color */}
              <g clipPath={`url(#${maskId})`}>
                <rect
                  x="0"
                  y={Math.max(20, 50 - (volumeAdded / 50) * 20)}
                  width="90"
                  height="70"
                  fill={colorInfo.fill}
                  opacity="0.88"
                  className="transition-colors duration-700 ease-in-out"
                />

                {/* Swirling lines when magnetic stirrer is on */}
                {isStirring && (
                  <ellipse
                    cx="45"
                    cy="62"
                    rx="22"
                    ry="5"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    className="animate-spin origin-center"
                  />
                )}
              </g>

              {/* Magnetic Stirring Bar */}
              <rect x="36" y="74" width="18" height="4" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.5" />
            </g>

            {/* pH Meter Digital Probe */}
            <g transform="translate(185, 175)">
              <rect x="0" y="0" width="6" height="75" rx="2" fill="#64748b" />
              {/* Glass electrode bulb at bottom inside liquid */}
              <circle cx="3" cy="78" r="4.5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
              {/* Wire going to digital display */}
              <path d="M 3 0 Q 35 -30 65 -10" fill="none" stroke="#334155" strokeWidth="2.5" />
            </g>

            {/* Digital Sensor Box with LCD readout */}
            <g transform="translate(230, 140)">
              <rect x="0" y="0" width="95" height="58" rx="6" fill="#1e293b" stroke="#0ea5e9" strokeWidth="1.5" />
              <rect x="8" y="8" width="79" height="26" rx="3" fill="#0f172a" />
              <text x="14" y="27" fill="#38bdf8" fontFamily="monospace" fontSize="17" fontWeight="bold">
                {currentPH.toFixed(2)}
              </text>
              <text x="62" y="26" fill="#64748b" fontFamily="sans-serif" fontSize="10">
                pH
              </text>
              <text x="10" y="47" fill="#94a3b8" fontFamily="sans-serif" fontSize="9">
                SENSOR DGETI
              </text>
              <circle cx="80" cy="46" r="3" fill="#10b981" />
            </g>
          </svg>

          {/* Color & State Badge */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className={`text-xs px-3 py-1 rounded-full ${colorInfo.twBadge} shadow`}>
              Viraje: {colorInfo.label}
            </span>
            <button
              onClick={() => setIsStirring(!isStirring)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                isStirring
                  ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                  : 'bg-slate-800 border-slate-600 text-slate-400'
              }`}
            >
              Agitación: {isStirring ? 'Activada 🌀' : 'Pausada'}
            </button>
          </div>
        </div>

        {/* Right: Controls & Measurement Dashboard */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Readings Card */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Lecturas en Tiempo Real
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                <span className="text-xs text-slate-400 block">Base agregada</span>
                <span className="text-2xl font-bold font-mono text-cyan-400">{volumeAdded.toFixed(1)}</span>
                <span className="text-xs text-slate-400 ml-1">mL</span>
              </div>

              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                <span className="text-xs text-slate-400 block">pH de la disolución</span>
                <span
                  className={`text-2xl font-bold font-mono ${
                    currentPH < 6.8
                      ? 'text-rose-400'
                      : currentPH > 7.5
                      ? 'text-emerald-400'
                      : 'text-purple-300'
                  }`}
                >
                  {currentPH.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 ml-1">
                  {currentPH < 6.8 ? 'Ácido' : currentPH > 7.5 ? 'Básico' : 'Neutro'}
                </span>
              </div>
            </div>

            {/* Real-time Indicator Hint */}
            <div className="mt-3 p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-start gap-2 text-xs text-slate-300">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong>Observación visual:</strong> {colorInfo.name}.
                {volumeAdded >= 24.5 && volumeAdded <= 25.5 && (
                  <span className="block text-emerald-400 font-semibold mt-1">
                    🎯 ¡Has alcanzado la zona de neutralización estequiométrica (25 mL)!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Dosing Controls */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
            <label className="text-xs font-semibold text-slate-300 block mb-2">
              Dosificación de Base ({materialsMode === 'standard' ? 'NaOH 0.1 M' : 'Bicarbonato de Sodio'}):
            </label>

            {/* Slider */}
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="50"
                step="0.5"
                value={volumeAdded}
                onChange={(e) => setVolumeAdded(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-400"
              />
              <span className="text-xs font-mono font-bold text-slate-300 w-12 text-right">
                {volumeAdded} mL
              </span>
            </div>

            {/* Quick Increment Buttons (Gota a gota y pasos de 5 mL) */}
            <div className="grid grid-cols-4 gap-2 mt-3">
              <button
                onClick={() => handleAddVolume(0.2)}
                className="px-2 py-1.5 text-xs font-medium rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 transition-all flex items-center justify-center gap-1"
                title="Agregar 2 a 3 gotas (0.2 mL)"
              >
                + Gota (0.2 mL)
              </button>
              <button
                onClick={() => handleAddVolume(1.0)}
                className="px-2 py-1.5 text-xs font-medium rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 transition-all flex items-center justify-center gap-1"
              >
                + 1.0 mL
              </button>
              <button
                onClick={() => handleAddVolume(2.5)}
                className="px-2 py-1.5 text-xs font-medium rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 transition-all flex items-center justify-center gap-1"
              >
                + 2.5 mL
              </button>
              <button
                onClick={() => handleAddVolume(5.0)}
                className="px-2 py-1.5 text-xs font-medium rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 transition-all flex items-center justify-center gap-1"
              >
                + 5.0 mL
              </button>
            </div>
          </div>

          {/* Action: Record Point to Notebook */}
          <button
            onClick={handleSaveMeasurement}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
          >
            <Plus className="w-5 h-5" />
            Registrar Medición en Bitácora ({recordedDataCount} guardadas)
          </button>
        </div>
      </div>
    </div>
  );
};
