import React, { useState } from 'react';
import { ExperimentDataPoint, MaterialsMode } from '../../types';
import { Zap, RotateCcw, Plus, Power, Lightbulb } from 'lucide-react';

interface OhmCircuitSimulatorProps {
  materialsMode: MaterialsMode;
  onRecordData: (point: ExperimentDataPoint) => void;
  recordedDataCount: number;
}

export const OhmCircuitSimulator: React.FC<OhmCircuitSimulatorProps> = ({
  materialsMode,
  onRecordData,
  recordedDataCount,
}) => {
  const [voltage, setVoltage] = useState<number>(materialsMode === 'standard' ? 6.0 : 1.8);
  const [resistance, setResistance] = useState<number>(220); // Ohms
  const [circuitClosed, setCircuitClosed] = useState<boolean>(true);
  const [lemonCount, setLemonCount] = useState<number>(2); // for alternative mode (each ~0.9V)

  // In alternative mode, voltage comes from lemons
  const activeVoltage = materialsMode === 'standard' ? voltage : Number((lemonCount * 0.9).toFixed(1));

  // Current in Amperes: I = V / R
  const currentAmps = circuitClosed ? (resistance > 0 ? activeVoltage / resistance : 0) : 0;
  const current_mA = Number((currentAmps * 1000).toFixed(2));
  const power_mW = Number((activeVoltage * current_mA).toFixed(1));

  // Glow intensity (0 to 1) for lightbulb or LED
  const glowOpacity = circuitClosed ? Math.min(1, current_mA / 40) : 0;

  const handleToggleSwitch = () => {
    setCircuitClosed((prev) => !prev);
  };

  const handleReset = () => {
    setVoltage(materialsMode === 'standard' ? 6.0 : 1.8);
    setResistance(220);
    setLemonCount(2);
    setCircuitClosed(true);
  };

  const handleSaveMeasurement = () => {
    const point: ExperimentDataPoint = {
      id: `ohm-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      voltaje_V: activeVoltage,
      resistencia_Ohms: resistance,
      corriente_mA: current_mA,
      potencia_mW: power_mW,
      circuito: circuitClosed ? 'Cerrado' : 'Abierto',
      fuente: materialsMode === 'standard' ? 'Fuente Regulada' : `Pila de ${lemonCount} limones`,
    };
    onRecordData(point);
  };

  return (
    <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 md:p-6 shadow-xl backdrop-blur-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Banco Experimental de Ley de Ohm
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700 text-amber-300 font-mono">
                {materialsMode === 'standard' ? 'Estándar: Fuente CD + Multímetro' : 'Comunitario: Pila de Limón + Grafito'}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              {materialsMode === 'standard'
                ? 'Relación matemática V = I × R con instrumentos digitales de banco'
                : 'Generación galvánica de potencial y resistencia con mina de grafito'}
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

      {/* Main Simulation Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Schematic Circuit Canvas (Interactive SVG) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[360px] overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Circuit Visual */}
          <svg className="w-full max-w-[380px] h-[300px]" viewBox="0 0 380 300" fill="none">
            {/* Main Circuit Loop Wires */}
            <path
              d="M 70 80 L 310 80 L 310 220 L 70 220 Z"
              stroke="#475569"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Electron Flow Animation along wire when closed */}
            {circuitClosed && current_mA > 0 && (
              <path
                d="M 70 80 L 310 80 L 310 220 L 70 220 Z"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="6 14"
                className="animate-pulse"
              />
            )}

            {/* LEFT: Power Source (Power Supply or Lemon battery) */}
            <g transform="translate(40, 120)">
              {materialsMode === 'standard' ? (
                // DC Power Supply Unit
                <g>
                  <rect x="-10" y="0" width="70" height="60" rx="6" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                  <rect x="-4" y="6" width="58" height="24" rx="3" fill="#0f172a" />
                  <text x="3" y="23" fill="#fbbf24" fontFamily="monospace" fontSize="13" fontWeight="bold">
                    {activeVoltage.toFixed(1)} V
                  </text>
                  <circle cx="5" cy="46" r="4" fill="#ef4444" />
                  <circle cx="35" cy="46" r="4" fill="#0f172a" stroke="#64748b" />
                  <text x="12" y="49" fill="#ef4444" fontSize="10" fontWeight="bold">
                    +
                  </text>
                  <text x="42" y="49" fill="#94a3b8" fontSize="10" fontWeight="bold">
                    -
                  </text>
                </g>
              ) : (
                // Bio-battery: Lemon with copper & zinc plates
                <g>
                  <ellipse cx="25" cy="30" rx="30" ry="22" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
                  {/* Copper electrode (+) */}
                  <rect x="12" y="10" width="6" height="25" rx="1" fill="#ea580c" />
                  <text x="13" y="7" fill="#ea580c" fontSize="11" fontWeight="bold">
                    Cu+
                  </text>
                  {/* Zinc electrode (-) */}
                  <rect x="32" y="10" width="6" height="25" rx="1" fill="#94a3b8" />
                  <text x="33" y="7" fill="#94a3b8" fontSize="11" fontWeight="bold">
                    Zn-
                  </text>
                  <text x="7" y="42" fill="#713f12" fontSize="9" fontWeight="bold">
                    Pila {lemonCount}L
                  </text>
                </g>
              )}
            </g>

            {/* TOP: Knife Switch */}
            <g transform="translate(160, 65)">
              <circle cx="0" cy="15" r="5" fill="#f59e0b" />
              <circle cx="60" cy="15" r="5" fill="#f59e0b" />
              {circuitClosed ? (
                // Closed Switch Blade
                <line x1="0" y1="15" x2="60" y2="15" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
              ) : (
                // Open Switch Blade (tilted up 35 deg)
                <line x1="0" y1="15" x2="48" y2="-12" stroke="#ef4444" strokeWidth="4" strokeLinecap="round" />
              )}
              <text x="15" y="-5" fill={circuitClosed ? '#10b981' : '#f87171'} fontSize="10" fontWeight="bold">
                {circuitClosed ? 'ON (Cerrado)' : 'OFF (Abierto)'}
              </text>
            </g>

            {/* RIGHT: Resistor or Graphite Bar */}
            <g transform="translate(300, 115)">
              {materialsMode === 'standard' ? (
                // Standard Resistor Zigzag
                <g>
                  <rect x="-15" y="-2" width="30" height="74" rx="6" fill="#d97706" opacity="0.3" />
                  <path
                    d="M 10 0 L 2 10 L 18 20 L 2 30 L 18 40 L 2 50 L 18 60 L 10 70"
                    stroke="#f59e0b"
                    strokeWidth="3.5"
                    fill="none"
                  />
                  <text x="24" y="38" fill="#cbd5e1" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    {resistance} Ω
                  </text>
                </g>
              ) : (
                // Pencil Graphite Bar
                <g>
                  <rect x="-8" y="0" width="16" height="70" rx="3" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />
                  <text x="14" y="38" fill="#cbd5e1" fontSize="10" fontFamily="monospace">
                    Grafito {resistance} Ω
                  </text>
                </g>
              )}
            </g>

            {/* BOTTOM: Lamp / LED Load + Ammeter */}
            <g transform="translate(160, 205)">
              {/* Load Lightbulb / LED */}
              <circle cx="30" cy="15" r="18" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
              {/* Glow filter */}
              <circle
                cx="30"
                cy="15"
                r={16 + glowOpacity * 10}
                fill="#fbbf24"
                opacity={glowOpacity * 0.75}
                className="transition-all duration-300"
              />
              <path
                d="M 22 18 Q 30 7 38 18"
                stroke={circuitClosed && current_mA > 0 ? '#ffffff' : '#64748b'}
                strokeWidth="2"
                fill="none"
              />
              <text x="12" y="44" fill="#94a3b8" fontSize="10">
                {materialsMode === 'standard' ? 'Lámpara' : 'LED'}
              </text>
            </g>

            {/* Digital Multimeter Display in Center */}
            <g transform="translate(130, 115)">
              <rect x="0" y="0" width="120" height="65" rx="8" fill="#0f172a" stroke="#0ea5e9" strokeWidth="2" />
              <rect x="10" y="8" width="100" height="28" rx="4" fill="#020617" />
              <text x="16" y="27" fill="#38bdf8" fontFamily="monospace" fontSize="15" fontWeight="bold">
                {current_mA.toFixed(1)} mA
              </text>
              <text x="12" y="48" fill="#94a3b8" fontSize="9">
                AMPERÍMETRO DIGITAL
              </text>
              <circle cx="104" cy="46" r="3" fill={circuitClosed ? '#10b981' : '#ef4444'} />
            </g>
          </svg>

          {/* Interactive Switch Button below canvas */}
          <div className="mt-2 flex items-center gap-3">
            <button
              onClick={handleToggleSwitch}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow ${
                circuitClosed
                  ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                  : 'bg-rose-600 text-white hover:bg-rose-500'
              }`}
            >
              <Power className="w-4 h-4" />
              Interruptor: {circuitClosed ? 'CERRADO (Fluye corriente)' : 'ABIERTO (Circuito desconectado)'}
            </button>
          </div>
        </div>

        {/* Right: Controls & Data Board */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Readings Overview */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Mediciones Eléctricas
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                <span className="text-xs text-slate-400 block">Diferencia de Potencial (V)</span>
                <span className="text-2xl font-bold font-mono text-amber-400">{activeVoltage.toFixed(1)}</span>
                <span className="text-xs text-slate-400 ml-1">V</span>
              </div>
              <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700">
                <span className="text-xs text-slate-400 block">Intensidad de Corriente (I)</span>
                <span className="text-2xl font-bold font-mono text-cyan-400">{current_mA.toFixed(1)}</span>
                <span className="text-xs text-slate-400 ml-1">mA</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-lg border border-slate-700/60">
              <span className="flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                Potencia Disipada (P = V × I):
              </span>
              <span className="font-mono font-bold text-amber-300">{power_mW} mW</span>
            </div>
          </div>

          {/* Voltage & Resistance Adjusters */}
          <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-4">
            {/* Voltage Control */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>
                  {materialsMode === 'standard' ? 'Voltaje de la Fuente (0 - 20 V):' : 'Pilas de Limón en Serie:'}
                </span>
                <span className="font-mono text-amber-400">{activeVoltage.toFixed(1)} V</span>
              </div>

              {materialsMode === 'standard' ? (
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={voltage}
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((count) => (
                    <button
                      key={count}
                      onClick={() => setLemonCount(count)}
                      className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                        lemonCount === count
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      🍋 {count} ({(count * 0.9).toFixed(1)}V)
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Resistance Selector */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-300 mb-1.5">
                <span>Valor de Resistencia (R):</span>
                <span className="font-mono text-teal-400">{resistance} Ω</span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[100, 220, 470, 1000].map((rVal) => (
                  <button
                    key={rVal}
                    onClick={() => setResistance(rVal)}
                    className={`py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      resistance === rVal
                        ? 'bg-teal-500/20 border-teal-400 text-teal-300 font-bold'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {rVal} Ω
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Record Button */}
          <button
            onClick={handleSaveMeasurement}
            className="w-full py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
          >
            <Plus className="w-5 h-5" />
            Registrar Medición en Bitácora ({recordedDataCount} guardadas)
          </button>
        </div>
      </div>
    </div>
  );
};
