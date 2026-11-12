import React, { useState } from 'react';
import { ExperimentDataPoint, MaterialsMode } from '../../types';
import { Gauge, RotateCcw, Plus, CircleGauge } from 'lucide-react';

interface BoyleGasSimulatorProps {
  materialsMode: MaterialsMode;
  onRecordData: (point: ExperimentDataPoint) => void;
  recordedDataCount: number;
}

export const BoyleGasSimulator: React.FC<BoyleGasSimulatorProps> = ({
  materialsMode,
  onRecordData,
  recordedDataCount,
}) => {
  // Initial state: P0 = 100 kPa (approx 1 atm), V0 = 60 mL
  // Constant k = P * V = 100 * 60 = 6000 kPa·mL
  const [pressure_kPa, setPressure_kPa] = useState<number>(100);
  const [weightsCount, setWeightsCount] = useState<number>(0); // 0 to 6 weights for alternative mode

  // When in alternative mode, each weight adds ~50 kPa
  const activePressure = materialsMode === 'standard' ? pressure_kPa : 100 + weightsCount * 50;

  // Boyle's Law: V = (P0 * V0) / P
  const volume_mL = Number((6000 / activePressure).toFixed(1));
  const pTimesV = Math.round(activePressure * volume_mL);

  // Marshmallow compression scale factor: from 1.0 down to 0.45
  const marshmallowScale = Math.max(0.4, volume_mL / 60);

  const handleReset = () => {
    setPressure_kPa(100);
    setWeightsCount(0);
  };

  const handleSaveMeasurement = () => {
    const point: ExperimentDataPoint = {
      id: `boyle-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      presion_kPa: activePressure,
      volumen_mL: volume_mL,
      producto_PV: pTimesV,
      pesosAplicados: materialsMode === 'standard' ? `${activePressure} kPa` : `${weightsCount} monedas/pesas`,
    };
    onRecordData(point);
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/30 rounded-xl text-sky-400">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Cámara de Compresión: Ley de Boyle (P × V = k)
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-sky-300 font-mono">
                {materialsMode === 'standard' ? 'Estándar: Cilindro con Manómetro' : 'Comunitario: Jeringa de 60 mL + Malvavisco'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {materialsMode === 'standard'
                ? 'Monitoreo de presión absoluta en kPa y desplazamiento micrométrico del émbolo'
                : 'Jeringa hipodérmica sellada con pesos de monedas y malvavisco visualizador'}
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
        {/* Piston / Syringe Visual Graphic */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[360px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* SVG Apparatus */}
          <svg className="w-full max-w-[340px] h-[310px]" viewBox="0 0 340 310" fill="none">
            {/* Cylinder / Syringe Body */}
            {/* Height 180px, Volume 60 mL corresponds to top piston at y = 50, down to y = 170 at min volume */}
            {/* Piston Y position: y=50 when V=60mL; y=155 when V=15mL */}
            {(() => {
              const pistonY = 50 + ((60 - volume_mL) / 45) * 105;
              const gasHeight = 220 - pistonY;

              return (
                <g>
                  {/* Cylinder walls */}
                  <rect x="100" y="45" width="140" height="180" rx="4" fill="#0f172a" stroke="#64748b" strokeWidth="2.5" />
                  {/* Base seal */}
                  <rect x="90" y="222" width="160" height="12" rx="3" fill="#334155" />

                  {/* Gas Volume Chamber with particles */}
                  <rect x="103" y={pistonY + 16} width="134" height={gasHeight - 16} fill="#0284c7" opacity="0.15" />

                  {/* Gas Particles (dots) */}
                  {[
                    { cx: 120, cy: pistonY + 25 },
                    { cx: 150, cy: pistonY + 35 },
                    { cx: 180, cy: pistonY + 22 },
                    { cx: 210, cy: pistonY + 30 },
                    { cx: 135, cy: pistonY + 45 },
                    { cx: 165, cy: pistonY + 42 },
                    { cx: 195, cy: pistonY + 50 },
                  ].map(
                    (p, i) =>
                      p.cy < 215 && (
                        <circle
                          key={i}
                          cx={p.cx}
                          cy={p.cy}
                          r="2.5"
                          fill="#38bdf8"
                          className="animate-pulse"
                        />
                      )
                  )}

                  {/* In Alternative Mode: Mini Marshmallow or Mini Balloon */}
                  {materialsMode === 'alternative' && (
                    <g transform={`translate(170, ${pistonY + (gasHeight - 16) / 2}) scale(${marshmallowScale})`}>
                      <ellipse cx="0" cy="0" rx="20" ry="14" fill="#fbcfe8" stroke="#f472b6" strokeWidth="1.5" />
                      <text x="-12" y="3" fill="#831843" fontSize="8" fontWeight="bold">
                        Malvavisco
                      </text>
                    </g>
                  )}

                  {/* Moving Piston with Rubber Gasket */}
                  <g transform={`translate(102, ${pistonY})`}>
                    <rect x="0" y="0" width="136" height="16" rx="2" fill="#475569" stroke="#94a3b8" strokeWidth="1" />
                    {/* Rubber O-rings */}
                    <rect x="2" y="3" width="132" height="4" fill="#020617" />
                    <rect x="2" y="9" width="132" height="4" fill="#020617" />

                    {/* Piston Rod pointing UP */}
                    <rect x="62" y="-35" width="12" height="36" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1" />
                    {/* Piston Handle / Plate */}
                    <rect x="35" y="-42" width="66" height="8" rx="2" fill="#64748b" />

                    {/* Stacked Weights on top of piston handle in alternative mode */}
                    {materialsMode === 'alternative' && weightsCount > 0 && (
                      <g transform="translate(48, -43)">
                        {Array.from({ length: weightsCount }).map((_, idx) => (
                          <rect
                            key={idx}
                            x="0"
                            y={-(idx + 1) * 7}
                            width="40"
                            height="6"
                            rx="1.5"
                            fill="#f59e0b"
                            stroke="#b45309"
                            strokeWidth="0.8"
                          />
                        ))}
                      </g>
                    )}
                  </g>

                  {/* Graduation Scale Marks on Cylinder */}
                  {[
                    { label: '60 mL', y: 65 },
                    { label: '50 mL', y: 92 },
                    { label: '40 mL', y: 120 },
                    { label: '30 mL', y: 148 },
                    { label: '20 mL', y: 175 },
                    { label: '10 mL', y: 202 },
                  ].map((mark, i) => (
                    <g key={i}>
                      <line x1="100" y1={mark.y} x2="115" y2={mark.y} stroke="#94a3b8" strokeWidth="1" />
                      <text x="70" y={mark.y + 3} fill="#64748b" fontSize="8" fontFamily="monospace">
                        {mark.label}
                      </text>
                    </g>
                  ))}

                  {/* Pressure Sensor / Gauge Port at Base */}
                  <path d="M 240 210 L 265 210" stroke="#64748b" strokeWidth="3" />
                  <g transform="translate(265, 185)">
                    <circle cx="25" cy="25" r="24" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    {/* Gauge needle rotates with pressure */}
                    <circle cx="25" cy="25" r="3" fill="#ef4444" />
                    <line
                      x1="25"
                      y1="25"
                      x2={25 + 16 * Math.cos(((activePressure - 100) / 400) * Math.PI - 2.5)}
                      y2={25 + 16 * Math.sin(((activePressure - 100) / 400) * Math.PI - 2.5)}
                      stroke="#ef4444"
                      strokeWidth="2"
                    />
                    <text x="13" y="38" fill="#38bdf8" fontSize="7" fontWeight="bold">
                      {activePressure} kPa
                    </text>
                  </g>
                </g>
              );
            })()}
          </svg>

          {/* Marshmallow observation tag */}
          {materialsMode === 'alternative' && (
            <div className="mt-2 text-xs text-pink-300 bg-pink-950/40 border border-pink-700/50 px-3 py-1 rounded-full">
              🍬 Observación: El malvavisco interno se comprime al {Math.round(marshmallowScale * 100)}% de su tamaño
            </div>
          )}
        </div>

        {/* Right: Controls & Data Point */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Readings */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Estado Termodinámico (T = 298 K Constante)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                <span className="text-xs text-slate-400 block">Presión Absoluta (P)</span>
                <span className="text-2xl font-bold font-mono text-sky-400">{activePressure}</span>
                <span className="text-xs text-slate-400 ml-1">kPa</span>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                <span className="text-xs text-slate-400 block">Volumen del Gas (V)</span>
                <span className="text-2xl font-bold font-mono text-teal-400">{volume_mL}</span>
                <span className="text-xs text-slate-400 ml-1">mL</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60">
              <span className="flex items-center gap-1.5">
                <CircleGauge className="w-4 h-4 text-sky-400" />
                Producto Isotérmico (P × V):
              </span>
              <span className="font-mono font-bold text-sky-300">
                {pTimesV} <span className="text-[10px] text-slate-400 font-normal">kPa·mL</span>
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-4">
            {materialsMode === 'standard' ? (
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                  <span>Presión aplicada al émbolo:</span>
                  <span className="font-mono text-sky-400">{pressure_kPa} kPa</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="450"
                  step="25"
                  value={pressure_kPa}
                  onChange={(e) => setPressure_kPa(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>
            ) : (
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-300 mb-2">
                  <span>Pesas de monedas de $10 colocadas sobre el émbolo:</span>
                  <span className="font-mono text-amber-400">{weightsCount} pesas (~{activePressure} kPa)</span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6].map((w) => (
                    <button
                      key={w}
                      onClick={() => setWeightsCount(w)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        weightsCount === w
                          ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      🪙 {w} {w === 0 ? '(1 atm)' : ''}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Record Button */}
          <button
            onClick={handleSaveMeasurement}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
          >
            <Plus className="w-5 h-5" />
            Registrar Medición en Bitácora ({recordedDataCount} guardadas)
          </button>
        </div>
      </div>
    </div>
  );
};
