import React, { useState, useEffect } from 'react';
import { ExperimentDataPoint, MaterialsMode } from '../../types';
import { Scale, RotateCcw, Plus, Play, ShieldAlert, Sparkles } from 'lucide-react';

interface ReactionKineticsSimulatorProps {
  materialsMode: MaterialsMode;
  onRecordData: (point: ExperimentDataPoint) => void;
  recordedDataCount: number;
}

export const ReactionKineticsSimulator: React.FC<ReactionKineticsSimulatorProps> = ({
  materialsMode,
  onRecordData,
  recordedDataCount,
}) => {
  // System mode: 'closed' (with balloon/stopper) vs 'open' (no stopper, gas escapes)
  const [systemType, setSystemType] = useState<'closed' | 'open'>('closed');
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [reactionProgress, setReactionProgress] = useState<number>(0); // 0 to 100%
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);

  // Initial mass: 120.00 grams (water + container + tablet/bicarbonate)
  const initialMass = 120.0;
  // Dióxido de carbono CO2 produced that can escape in open system: ~1.55 g
  const maxGasReleased = 1.55;

  // Calculate current mass on the scale
  const massLost = systemType === 'open' ? (reactionProgress / 100) * maxGasReleased : 0;
  const currentMass = Number((initialMass - massLost).toFixed(2));

  // Simulation timer during reaction
  useEffect(() => {
    let timer: any = null;
    if (isReacting && reactionProgress < 100) {
      timer = setInterval(() => {
        setReactionProgress((prev) => {
          if (prev >= 100) {
            setIsReacting(false);
            return 100;
          }
          return Math.min(100, prev + 5);
        });
        setElapsedSeconds((sec) => sec + 1);
      }, 500);
    }
    return () => clearInterval(timer);
  }, [isReacting, reactionProgress]);

  const handleStartReaction = () => {
    if (reactionProgress === 100) return;
    setIsReacting(true);
  };

  const handleReset = () => {
    setIsReacting(false);
    setReactionProgress(0);
    setElapsedSeconds(0);
  };

  const handleSaveMeasurement = () => {
    const point: ExperimentDataPoint = {
      id: `lavoisier-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      tiempo_s: elapsedSeconds,
      sistema: systemType === 'closed' ? 'Sistema Cerrado (Hermético)' : 'Sistema Abierto',
      masa_g: currentMass,
      masaGasEscapada_g: Number(massLost.toFixed(2)),
      progresoReaccion: `${reactionProgress}%`,
    };
    onRecordData(point);
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Balanza de Lavoisier: Conservación de la Masa
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-emerald-300 font-mono">
                {materialsMode === 'standard' ? 'Estándar: Matraz con Tapón y Balanza 0.01g' : 'Comunitario: Botella con Globo + Balanza Cocina'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Comparación de masa en sistema cerrado vs sistema abierto durante la liberación de CO₂
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-700/60 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Restablecer
        </button>
      </div>

      {/* Main Simulation View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Visual Graphic Apparatus */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[360px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* SVG Container */}
          <svg className="w-full max-w-[340px] h-[310px]" viewBox="0 0 340 310" fill="none">
            {/* Digital Scale Platform */}
            <g transform="translate(70, 210)">
              {/* Scale Platform Base */}
              <rect x="0" y="30" width="200" height="55" rx="8" fill="#1e293b" stroke="#334155" strokeWidth="2" />
              <rect x="15" y="10" width="170" height="20" rx="3" fill="#475569" stroke="#64748b" strokeWidth="1.5" />

              {/* Digital LED Display */}
              <rect x="50" y="42" width="100" height="30" rx="4" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1" />
              <text x="58" y="63" fill="#38bdf8" fontFamily="monospace" fontSize="16" fontWeight="bold">
                {currentMass.toFixed(2)}
              </text>
              <text x="132" y="62" fill="#64748b" fontFamily="sans-serif" fontSize="10">
                g
              </text>
            </g>

            {/* Container on top of the scale (Flask or Bottle) */}
            <g transform="translate(125, 60)">
              {/* Bottle / Flask Body */}
              <path
                d="M 30 50 L 30 30 L 60 30 L 60 50 L 80 150 L 10 150 Z"
                fill="#0f172a"
                stroke="#94a3b8"
                strokeWidth="2"
              />

              {/* Liquid inside container */}
              <path
                d="M 18 110 L 72 110 L 78 148 L 12 148 Z"
                fill="#0284c7"
                opacity="0.6"
              />

              {/* Effervescent tablet dissolving at the bottom */}
              {reactionProgress < 100 && (
                <rect
                  x="38"
                  y="136"
                  width="14"
                  height={Math.max(2, 6 - (reactionProgress / 100) * 5)}
                  rx="2"
                  fill="#f8fafc"
                />
              )}

              {/* Bubbles when reacting */}
              {reactionProgress > 0 && reactionProgress < 100 && (
                <g>
                  <circle cx="35" cy="125" r="2" fill="#e0f2fe" className="animate-ping" />
                  <circle cx="50" cy="118" r="3" fill="#e0f2fe" className="animate-bounce" />
                  <circle cx="58" cy="130" r="2.5" fill="#e0f2fe" className="animate-pulse" />
                  <circle cx="42" cy="112" r="2" fill="#e0f2fe" />
                </g>
              )}

              {/* TOP OF FLASK: Stopper / Balloon vs Open Escape */}
              {systemType === 'closed' ? (
                // Closed Hermetic: Balloon or Rubber stopper
                materialsMode === 'standard' ? (
                  // Rubber Stopper sealing the neck
                  <rect x="28" y="24" width="34" height="12" rx="3" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" />
                ) : (
                  // In alternative mode: Inflating Balloon on mouth!
                  <g transform="translate(45, 25)">
                    {/* Balloon neck */}
                    <rect x="-6" y="0" width="12" height="6" fill="#ec4899" />
                    {/* Balloon body expanding with CO2 */}
                    {(() => {
                      const balloonR = 10 + (reactionProgress / 100) * 22;
                      return (
                        <circle
                          cx="0"
                          cy={-balloonR + 2}
                          r={balloonR}
                          fill="#ec4899"
                          opacity="0.85"
                          stroke="#db2777"
                          strokeWidth="1.5"
                          className="transition-all duration-300"
                        />
                      );
                    })()}
                  </g>
                )
              ) : (
                // Open System: CO2 gas escaping to the air
                <g transform="translate(45, 20)">
                  <path
                    d="M -10 -5 Q 0 -25 10 -35"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                    className="animate-pulse"
                  />
                  <path
                    d="M 5 -5 Q 15 -25 25 -35"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    fill="none"
                    className="animate-pulse"
                  />
                  <text x="-25" y="-38" fill="#f87171" fontSize="9" fontWeight="bold">
                    Escape de CO₂ ↑
                  </text>
                </g>
              )}
            </g>
          </svg>

          {/* System Badge */}
          <div className="mt-2 flex items-center gap-2">
            <span
              className={`text-xs px-3 py-1 rounded-full font-semibold ${
                systemType === 'closed'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
              }`}
            >
              {systemType === 'closed'
                ? '🔒 Sistema Cerrado (El gas permanece dentro)'
                : '🔓 Sistema Abierto (El gas escapa al entorno)'}
            </span>
          </div>
        </div>

        {/* Right: Controls & Observation */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Readings */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Mediciones de Masa y Tiempo
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                <span className="text-xs text-slate-400 block">Masa en Balanza (m)</span>
                <span className="text-2xl font-bold font-mono text-emerald-400">{currentMass.toFixed(2)}</span>
                <span className="text-xs text-slate-400 ml-1">g</span>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                <span className="text-xs text-slate-400 block">Tiempo de Reacción</span>
                <span className="text-2xl font-bold font-mono text-sky-400">{elapsedSeconds}</span>
                <span className="text-xs text-slate-400 ml-1">seg</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60">
              <span>Masa inicial de reactivos:</span>
              <span className="font-mono font-bold text-slate-200">{initialMass.toFixed(2)} g</span>
            </div>
            {systemType === 'open' && massLost > 0 && (
              <div className="mt-1 flex items-center justify-between text-xs text-rose-300 bg-rose-950/30 p-2 rounded border border-rose-800/40">
                <span>Gas CO₂ dispersado al aire:</span>
                <span className="font-mono font-bold">-{massLost.toFixed(2)} g</span>
              </div>
            )}
          </div>

          {/* System Selection & Reaction Trigger */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <label className="text-xs font-semibold text-slate-300 block">
              Configuración del Sistema Experimental:
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setSystemType('closed');
                  handleReset();
                }}
                disabled={isReacting}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                  systemType === 'closed'
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                🔒 Sistema Cerrado
                <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                  Con tapón hermético o globo
                </span>
              </button>

              <button
                onClick={() => {
                  setSystemType('open');
                  handleReset();
                }}
                disabled={isReacting}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left ${
                  systemType === 'open'
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
              >
                🔓 Sistema Abierto
                <span className="block text-[10px] font-normal text-slate-400 mt-0.5">
                  Sin tapa, gas libre
                </span>
              </button>
            </div>

            {/* Reaction Trigger Button */}
            <button
              onClick={handleStartReaction}
              disabled={isReacting || reactionProgress === 100}
              className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                reactionProgress === 100
                  ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                  : isReacting
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow'
              }`}
            >
              <Play className="w-4 h-4" />
              {reactionProgress === 100
                ? 'Reacción Concluida'
                : isReacting
                ? `Efervescencia en curso (${reactionProgress}%)`
                : 'Iniciar Reacción Química (Soltar reactivo)'}
            </button>
          </div>

          {/* Record Button */}
          <button
            onClick={handleSaveMeasurement}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
          >
            <Plus className="w-5 h-5" />
            Registrar Medición en Bitácora ({recordedDataCount} guardadas)
          </button>
        </div>
      </div>
    </div>
  );
};
