import React from 'react';
import { ExperimentDataPoint, PracticeDefinition } from '../types';
import { Table, Trash2, Download, TrendingUp, Sparkles, AlertCircle } from 'lucide-react';

interface DataLogAndChartProps {
  practice: PracticeDefinition;
  dataPoints: ExperimentDataPoint[];
  onDeletePoint: (id: string) => void;
  onClearAll: () => void;
}

export const DataLogAndChart: React.FC<DataLogAndChartProps> = ({
  practice,
  dataPoints,
  onDeletePoint,
  onClearAll,
}) => {
  // Export data to CSV file
  const handleExportCSV = () => {
    if (dataPoints.length === 0) return;
    const keys = Object.keys(dataPoints[0]).filter((k) => k !== 'id');
    const headerRow = keys.join(',');
    const rows = dataPoints.map((pt) => keys.map((k) => JSON.stringify(pt[k] ?? '')).join(','));
    const csvContent = 'data:text/csv;charset=utf-8,' + [headerRow, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bitacora_${practice.id}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine X and Y variables depending on practice
  let xKey = '';
  let yKey = '';
  let xLabel = '';
  let yLabel = '';
  let xMin = 0;
  let xMax = 50;
  let yMin = 0;
  let yMax = 14;

  if (practice.id === 'acido-base-ph') {
    xKey = 'volumenBase_mL';
    yKey = 'pH';
    xLabel = 'Volumen Base (mL)';
    yLabel = 'pH';
    xMin = 0;
    xMax = 50;
    yMin = 0;
    yMax = 14;
  } else if (practice.id === 'ley-de-ohm') {
    xKey = 'voltaje_V';
    yKey = 'corriente_mA';
    xLabel = 'Voltaje V (Voltios)';
    yLabel = 'Corriente I (mA)';
    xMin = 0;
    xMax = 20;
    yMin = 0;
    yMax = 100;
  } else if (practice.id === 'ley-de-boyle') {
    xKey = 'volumen_mL';
    yKey = 'presion_kPa';
    xLabel = 'Volumen V (mL)';
    yLabel = 'Presión P (kPa)';
    xMin = 10;
    xMax = 65;
    yMin = 80;
    yMax = 500;
  } else {
    xKey = 'tiempo_s';
    yKey = 'masa_g';
    xLabel = 'Tiempo (seg)';
    yLabel = 'Masa (g)';
    xMin = 0;
    xMax = 60;
    yMin = 117;
    yMax = 121;
  }

  // Calculate dynamic axis ranges if points exceed defaults
  if (dataPoints.length > 0) {
    const xVals = dataPoints.map((p) => Number(p[xKey])).filter((n) => !isNaN(n));
    const yVals = dataPoints.map((p) => Number(p[yKey])).filter((n) => !isNaN(n));
    if (xVals.length > 0) {
      xMin = Math.min(xMin, Math.min(...xVals));
      xMax = Math.max(xMax, Math.max(...xVals) * 1.1);
    }
    if (yVals.length > 0) {
      yMin = Math.min(yMin, Math.min(...yVals) * 0.9);
      yMax = Math.max(yMax, Math.max(...yVals) * 1.1);
    }
  }

  // SVG Chart Dimensions
  const svgWidth = 520;
  const svgHeight = 260;
  const padding = { top: 25, right: 30, bottom: 45, left: 55 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  const scaleX = (val: number) => {
    return padding.left + ((val - xMin) / (xMax - xMin || 1)) * plotWidth;
  };

  const scaleY = (val: number) => {
    return padding.top + plotHeight - ((val - yMin) / (yMax - yMin || 1)) * plotHeight;
  };

  // Sort points by X for connected lines
  const sortedPoints = [...dataPoints]
    .filter((p) => p[xKey] !== undefined && p[yKey] !== undefined)
    .sort((a, b) => Number(a[xKey]) - Number(b[xKey]));

  const pathData = sortedPoints
    .map((p, idx) => {
      const x = scaleX(Number(p[xKey]));
      const y = scaleY(Number(p[yKey]));
      return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-6">
      {/* Title & Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-teal-400" />
            Bitácora Científica y Gráfica del Fenómeno
          </h3>
          <p className="text-xs text-slate-400">
            Registro sistemático de variables empíricas ({dataPoints.length} mediciones tomadas)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {dataPoints.length > 0 && (
            <>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-teal-300 border border-slate-700 transition-colors"
                title="Descargar datos en formato CSV"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </button>
              <button
                onClick={onClearAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 transition-colors"
                title="Limpiar todas las filas de la tabla"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Limpiar
              </button>
            </>
          )}
        </div>
      </div>

      {dataPoints.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-8 h-8 text-slate-500 mb-2" />
          <h4 className="text-sm font-bold text-slate-300">
            Aún no has registrado mediciones en la mesa
          </h4>
          <p className="text-xs text-slate-400 max-w-md mt-1">
            Usa los controles del simulador (deslizadores, botones de incremento o interruptores) y presiona el botón{' '}
            <strong className="text-teal-400">"Registrar Medición en Bitácora"</strong> para graficar tus datos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Scientific Chart (SVG) */}
          <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
            <span className="text-xs font-bold text-slate-300 self-start mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              Modelo Gráfico: {yLabel} vs {xLabel}
            </span>

            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full min-w-[360px] h-[240px]"
              >
                {/* Axes Lines */}
                <line
                  x1={padding.left}
                  y1={padding.top + plotHeight}
                  x2={padding.left + plotWidth}
                  y2={padding.top + plotHeight}
                  stroke="#475569"
                  strokeWidth="2"
                />
                <line
                  x1={padding.left}
                  y1={padding.top}
                  x2={padding.left}
                  y2={padding.top + plotHeight}
                  stroke="#475569"
                  strokeWidth="2"
                />

                {/* Grid Lines X */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const x = padding.left + ratio * plotWidth;
                  const val = (xMin + ratio * (xMax - xMin)).toFixed(0);
                  return (
                    <g key={i}>
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={padding.top + plotHeight}
                        stroke="#1e293b"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={x}
                        y={padding.top + plotHeight + 16}
                        fill="#64748b"
                        fontSize="9"
                        textAnchor="middle"
                        fontFamily="monospace"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Grid Lines Y */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                  const y = padding.top + plotHeight - ratio * plotHeight;
                  const val = (yMin + ratio * (yMax - yMin)).toFixed(0);
                  return (
                    <g key={i}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + plotWidth}
                        y2={y}
                        stroke="#1e293b"
                        strokeDasharray="3 3"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        fill="#64748b"
                        fontSize="9"
                        textAnchor="end"
                        fontFamily="monospace"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* Axis Labels */}
                <text
                  x={padding.left + plotWidth / 2}
                  y={svgHeight - 8}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {xLabel}
                </text>
                <text
                  x={-(padding.top + plotHeight / 2)}
                  y={16}
                  fill="#94a3b8"
                  fontSize="10"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform="rotate(-90)"
                >
                  {yLabel}
                </text>

                {/* Fitted Curve Line */}
                {pathData && (
                  <path
                    d={pathData}
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* Data Points Dots */}
                {sortedPoints.map((pt, idx) => {
                  const cx = scaleX(Number(pt[xKey]));
                  const cy = scaleY(Number(pt[yKey]));
                  return (
                    <g key={idx}>
                      <circle cx={cx} cy={cy} r="5" fill="#0f172a" stroke="#2dd4bf" strokeWidth="2.5" />
                      <circle cx={cx} cy={cy} r="2" fill="#5eead4" />
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Table of Measurements */}
          <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800 rounded-xl p-3 max-h-[320px] overflow-y-auto">
            <span className="text-xs font-bold text-slate-300 block mb-2">
              Tabla de Mediciones Registradas
            </span>

            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900 text-slate-400 font-semibold sticky top-0">
                <tr>
                  <th className="p-2">#</th>
                  <th className="p-2">{xLabel.split(' ')[0]}</th>
                  <th className="p-2">{yLabel.split(' ')[0]}</th>
                  <th className="p-2 text-right">Borrar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {dataPoints.map((pt, i) => (
                  <tr key={pt.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-2 text-slate-500 font-mono">{i + 1}</td>
                    <td className="p-2 font-mono text-cyan-300 font-semibold">
                      {pt[xKey] !== undefined ? String(pt[xKey]) : '-'}
                    </td>
                    <td className="p-2 font-mono text-teal-300 font-semibold">
                      {pt[yKey] !== undefined ? String(pt[yKey]) : '-'}
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() => onDeletePoint(pt.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                        title="Eliminar medición"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
