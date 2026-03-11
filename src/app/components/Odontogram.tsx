import React, { useState, useCallback } from 'react';
import { ChevronLeft, Save, RotateCcw, Info, Trash2, Printer, FileDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

/* ───────────── types ───────────── */
interface ToothCondition { status: string; note?: string }
type ToothType = 'wisdom' | 'molar' | 'premolar' | 'canine' | 'lateral' | 'central';

/* ───────────── status catalogue ───────────── */
const STATUSES = [
  { value: 'cavity',      label: 'Caries',      fill: '#FEE2E2', stroke: '#F87171', text: '#991b1b', dot: '#ef4444' },
  { value: 'filled',      label: 'Restaurado',  fill: '#DBEAFE', stroke: '#93C5FD', text: '#1e40af', dot: '#60a5fa' },
  { value: 'extracted',   label: 'Extracción',  fill: '#FEF9C3', stroke: '#FCD34D', text: '#78350f', dot: '#fbbf24' },
  { value: 'implant',     label: 'Implante',    fill: '#D1FAE5', stroke: '#6EE7B7', text: '#064e3b', dot: '#34d399' },
  { value: 'endodontics', label: 'Endodoncia',  fill: '#FEF3C7', stroke: '#FCD34D', text: '#78350f', dot: '#f59e0b' },
  { value: 'crown',       label: 'Corona',      fill: '#EDE9FE', stroke: '#C4B5FD', text: '#4c1d95', dot: '#a78bfa' },
  { value: 'bridge',      label: 'Puente',      fill: '#FCE7F3', stroke: '#F9A8D4', text: '#831843', dot: '#f472b6' },
];
const getStatus = (v: string) => STATUSES.find(s => s.value === v) ?? null;

/* ───────────── tooth-type mapping ───────────── */
function getType(fdi: number): ToothType {
  const n = fdi % 10;
  if (n === 8) return 'wisdom';
  if (n === 7 || n === 6) return 'molar';
  if (n === 5 || n === 4) return 'premolar';
  if (n === 3) return 'canine';
  if (n === 2) return 'lateral';
  return 'central';
}

/* ───────────── tooth SVG paths ─────────────
   Local coordinate system:
     +X = tangential (mesio-distal)
     +Y = radial-outward (vestibular / buccal)
   All paths centered at (0,0).
───────────────────────────────────────────── */
const SHAPES: Record<ToothType, { outer: string; inner: string }> = {
  /* 3rd molar / wisdom – compact rounded-square */
  wisdom: {
    outer: `M -7.5,-7 C -9,-11 -5,-13 0,-13 C 5,-13 9,-11 7.5,-7
            C 10,-2.5 10,2.5 7.5,7 C 5,11 -5,11 -7.5,7
            C -10,2.5 -10,-2.5 -7.5,-7 Z`,
    inner: `M -3.5,-3.5 C -3.5,-6.5 -2,-7.5 0,-7.5
            C 2,-7.5 3.5,-6.5 3.5,-3.5 C 5,-1 5,1 3.5,3.5
            C 2,6.5 -2,6.5 -3.5,3.5 C -5,1 -5,-1 -3.5,-3.5 Z`,
  },
  /* 1st–2nd molar – large organic rounded-square */
  molar: {
    outer: `M -10.5,-8.5 C -12.5,-14 -7,-16 0,-16
            C 7,-16 12.5,-14 10.5,-8.5 C 13,-3.5 13,3.5 10.5,8.5
            C 7,14 -7,14 -10.5,8.5 C -13,3.5 -13,-3.5 -10.5,-8.5 Z`,
    inner: `M -5.5,-4.5 C -5.5,-9 -3,-10.5 0,-10.5
            C 3,-10.5 5.5,-9 5.5,-4.5 C 7,-2 7,2 5.5,4.5
            C 3,9 -3,9 -5.5,4.5 C -7,2 -7,-2 -5.5,-4.5 Z`,
  },
  /* premolar – oval, slightly taller in Y (BL > MD) */
  premolar: {
    outer: `M -7.5,-10 C -7.5,-14.5 -4,-16.5 0,-16.5
            C 4,-16.5 7.5,-14.5 7.5,-10 C 9.5,-5 9.5,5 7.5,10
            C 4,14.5 -4,14.5 -7.5,10 C -9.5,5 -9.5,-5 -7.5,-10 Z`,
    inner: `M -3.5,-5.5 C -3.5,-9.5 -2,-11 0,-11
            C 2,-11 3.5,-9.5 3.5,-5.5 C 5,-2 5,2 3.5,5.5
            C 2,9 -2,9 -3.5,5.5 C -5,2 -5,-2 -3.5,-5.5 Z`,
  },
  /* canine – oval, slightly elongated */
  canine: {
    outer: `M -6.5,-10.5 C -5,-15 5,-15 6.5,-10.5
            C 8.5,-5 8.5,5 6.5,10.5 C 5,14.5 -5,14.5 -6.5,10.5
            C -8.5,5 -8.5,-5 -6.5,-10.5 Z`,
    inner: `M -3,-5.5 C -2,-9 2,-9 3,-5.5
            C 4,-2 4,2 3,5.5 C 2,9 -2,9 -3,5.5
            C -4,2 -4,-2 -3,-5.5 Z`,
  },
  /* lateral incisor – narrow oval */
  lateral: {
    outer: `M -5.5,-9 C -4,-13.5 4,-13.5 5.5,-9
            C 7.5,-4 7.5,4 5.5,9 C 4,13 -4,13 -5.5,9
            C -7.5,4 -7.5,-4 -5.5,-9 Z`,
    inner: `M -2,-5 C -1.5,-8.5 1.5,-8.5 2,-5
            C 3,-2 3,2 2,5 C 1.5,8 -1.5,8 -2,5
            C -3,2 -3,-2 -2,-5 Z`,
  },
  /* central incisor – wider than deep (MD > BL) */
  central: {
    outer: `M -9,-7.5 C -7.5,-12 7.5,-12 9,-7.5
            C 11,-3 11,3 9,7.5 C 7.5,12 -7.5,12 -9,7.5
            C -11,3 -11,-3 -9,-7.5 Z`,
    inner: `M -4.5,-4 C -3,-7.5 3,-7.5 4.5,-4
            C 5.5,-1.5 5.5,1.5 4.5,4 C 3,7.5 -3,7.5 -4.5,4
            C -5.5,1.5 -5.5,-1.5 -4.5,-4 Z`,
  },
};

/* ───────────── arch position helpers ───────────── */
function buildArch(
  cx: number, cy: number, rx: number, ry: number,
  startDeg: number, endDeg: number, n: number,
) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const deg = startDeg + ((endDeg - startDeg) / (n - 1)) * i;
    const rad = (deg * Math.PI) / 180;
    const x   = cx + rx * Math.cos(rad);
    const y   = cy + ry * Math.sin(rad);
    // Rotate tooth so local +Y points radially outward
    const rot = (Math.atan2(y - cy, x - cx) * 180) / Math.PI - 90;
    pts.push({ x, y, rot });
  }
  return pts;
}

/*
  Upper arch: center (310, 72), opens downward (front teeth at ~90° = lowest y)
  Tooth order: [18,17,...,11, 21,...,28]  (left-to-right in viewer)
*/
const UPPER_FDI = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER_FDI = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];

const UPPER_POS = buildArch(310, 72, 198, 112, 165, 15, 16);
const LOWER_POS = buildArch(310, 428, 198, 112, 195, 345, 16);

/* ───────────── single tooth SVG component ───────────── */
interface ToothProps {
  fdi: number;
  x: number;
  y: number;
  rot: number;
  condition?: ToothCondition;
  selected: boolean;
  onClick: (fdi: number) => void;
}

function Tooth({ fdi, x, y, rot, condition, selected, onClick }: ToothProps) {
  const shape = SHAPES[getType(fdi)];
  const st = condition ? getStatus(condition.status) : null;
  const extracted = condition?.status === 'extracted';

  /* colours */
  const baseFill   = st    ? st.fill   : '#EEF3FF';
  const baseStroke = st    ? st.stroke : '#8BAAEE';
  const selFill    = '#CBD8F8';
  const selStroke  = '#1d4ed8';

  return (
    <g
      transform={`translate(${x.toFixed(2)},${y.toFixed(2)}) rotate(${rot.toFixed(2)})`}
      onClick={() => onClick(fdi)}
      style={{ cursor: 'pointer' }}
    >
      {/* outer glow when selected */}
      {selected && (
        <path
          d={shape.outer}
          fill="none"
          stroke={selStroke}
          strokeWidth={5}
          strokeOpacity={0.18}
          transform="scale(1.22)"
        />
      )}

      {/* main tooth body */}
      <path
        d={shape.outer}
        fill={selected ? selFill : baseFill}
        stroke={selected ? selStroke : baseStroke}
        strokeWidth={selected ? 1.8 : 1.5}
      />

      {/* inner groove/shadow */}
      {!extracted && (
        <path
          d={shape.inner}
          fill="none"
          stroke={selected ? selStroke : baseStroke}
          strokeWidth={0.9}
          strokeOpacity={selected ? 0.7 : 0.55}
        />
      )}

      {/* ✕ for extracted */}
      {extracted && (
        <g stroke="#ef4444" strokeWidth={2.4} strokeLinecap="round" opacity={0.9}>
          <line x1="-6" y1="-6" x2="6" y2="6" />
          <line x1="6"  y1="-6" x2="-6" y2="6" />
        </g>
      )}
    </g>
  );
}

/* ───────────── tooth label (inner side of arch) ───────────── */
function Label({ fdi, tx, ty, cx, cy, selected }: {
  fdi: number; tx: number; ty: number;
  cx: number; cy: number; selected: boolean;
}) {
  const dx = cx - tx, dy = cy - ty;
  const len = Math.hypot(dx, dy) || 1;
  const lx = tx + (dx / len) * 21;
  const ly = ty + (dy / len) * 21;
  return (
    <text
      x={lx} y={ly}
      textAnchor="middle" dominantBaseline="middle"
      fontSize={8.5}
      fontFamily="ui-monospace,monospace"
      fontWeight={selected ? 700 : 400}
      fill={selected ? '#1d4ed8' : '#94A3B8'}
    >
      {fdi}
    </text>
  );
}

/* ───────────── history mock data ───────────── */
const HISTORY = [
  { date: '2026-02-20', tooth: 16, treatment: 'Restauración', doctor: 'Dr. Sánchez',   status: 'filled'      },
  { date: '2025-11-10', tooth: 26, treatment: 'Endodoncia',   doctor: 'Dr. Torres',    status: 'endodontics' },
  { date: '2025-08-15', tooth: 36, treatment: 'Extracción',   doctor: 'Dra. Martínez', status: 'extracted'   },
];

/* ───────────── main component ───────────── */
export function Odontogram() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [toothData, setToothData] = useState<Record<number, ToothCondition>>({
    16: { status: 'filled'      },
    26: { status: 'endodontics' },
    36: { status: 'extracted'   },
  });
  const [selected, setSelected]   = useState<number | null>(null);
  const [status, setStatus]       = useState('cavity');
  const [note, setNote]           = useState('');

  const handleClick = useCallback((fdi: number) => {
    setSelected(prev => (prev === fdi ? null : fdi));
    setNote(toothData[fdi]?.note ?? '');
  }, [toothData]);

  const apply = () => {
    if (!selected) return;
    setToothData(d => ({ ...d, [selected]: { status, note } }));
    toast.success(`Estado aplicado al diente #${selected}`);
  };

  const clear = () => {
    if (!selected) return;
    const d = { ...toothData };
    delete d[selected];
    setToothData(d);
    setSelected(null);
    toast.info(`Diente #${selected} restablecido`);
  };

  const save  = () => toast.success('Odontograma guardado');
  const reset = () => { setToothData({}); setSelected(null); toast.info('Restablecido'); };

  return (
    <div className="p-6 space-y-5">

      {/* ── header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/patients/${id}`)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Odontograma</h1>
            <p className="text-sm text-gray-400 mt-0.5">Ana García Martínez · FDI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />Restablecer
          </button>
          <button onClick={save} className="flex items-center gap-2 px-4 py-2 text-sm bg-[#0066CC] text-white rounded-xl hover:bg-[#0052A3] transition-colors">
            <Save className="w-3.5 h-3.5" />Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5">

        {/* ── SVG chart ── */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arcada Superior</span>
            <span className="text-xs text-gray-400">
              {Object.keys(toothData).length} diente{Object.keys(toothData).length !== 1 && 's'} con condición
            </span>
          </div>

          <svg viewBox="0 0 620 510" className="w-full select-none" style={{ maxHeight: 400 }}>
            <defs>
              <filter id="ts" x="-30%" y="-30%" width="160%" height="160%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#8BAAEE" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* arch guide ellipses */}
            <ellipse cx={310} cy={72}  rx={198} ry={112} fill="none" stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 5" />
            <ellipse cx={310} cy={428} rx={198} ry={112} fill="none" stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 5" />

            {/* midline */}
            <line x1={310} y1={193} x2={310} y2={317} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3 4" />

            {/* quadrant labels */}
            {[
              [125, 36, 'Q1 · Sup. Derecha'  ],
              [495, 36, 'Q2 · Sup. Izquierda'],
              [125, 490,'Q4 · Inf. Derecha'  ],
              [495, 490,'Q3 · Inf. Izquierda'],
            ].map(([x, y, label]) => (
              <text key={String(label)} x={Number(x)} y={Number(y)} textAnchor="middle"
                fontSize={8.5} fill="#CBD5E1" fontFamily="sans-serif">{label}</text>
            ))}

            {/* upper teeth */}
            <g filter="url(#ts)">
              {UPPER_FDI.map((fdi, i) => (
                <Tooth key={fdi} fdi={fdi}
                  x={UPPER_POS[i].x} y={UPPER_POS[i].y} rot={UPPER_POS[i].rot}
                  condition={toothData[fdi]} selected={selected === fdi} onClick={handleClick} />
              ))}
            </g>
            {UPPER_FDI.map((fdi, i) => (
              <Label key={fdi} fdi={fdi}
                tx={UPPER_POS[i].x} ty={UPPER_POS[i].y} cx={310} cy={72}
                selected={selected === fdi} />
            ))}

            {/* lower teeth */}
            <g filter="url(#ts)">
              {LOWER_FDI.map((fdi, i) => (
                <Tooth key={fdi} fdi={fdi}
                  x={LOWER_POS[i].x} y={LOWER_POS[i].y} rot={LOWER_POS[i].rot}
                  condition={toothData[fdi]} selected={selected === fdi} onClick={handleClick} />
              ))}
            </g>
            {LOWER_FDI.map((fdi, i) => (
              <Label key={fdi} fdi={fdi}
                tx={LOWER_POS[i].x} ty={LOWER_POS[i].y} cx={310} cy={428}
                selected={selected === fdi} />
            ))}
          </svg>

          <div className="text-center mt-0.5 mb-3">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arcada Inferior</span>
          </div>

          {/* legend */}
          <div className="border-t border-gray-50 pt-3">
            <div className="flex flex-wrap gap-x-4 gap-y-1.5">
              {STATUSES.map(s => (
                <div key={s.value} className="flex items-center gap-1.5">
                  <div className="w-3.5 h-3.5 rounded border" style={{ background: s.fill, borderColor: s.stroke }} />
                  <span className="text-xs text-gray-500">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── control panel ── */}
        <div className="flex flex-col gap-4">

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-4">Estado del Diente</h3>

            {selected ? (
              <div className="space-y-4">
                {/* selected tooth badge */}
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-400 font-medium">Diente seleccionado</p>
                    <p className="text-2xl font-bold text-blue-700">#{selected}</p>
                  </div>
                  <span className="text-xs text-blue-300 capitalize">{getType(selected)}</span>
                </div>

                {/* condition picker */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Condición</p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {STATUSES.map(s => (
                      <button
                        key={s.value}
                        onClick={() => setStatus(s.value)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                          status === s.value ? 'ring-2 ring-offset-1 ring-[#0066CC]' : ''
                        }`}
                        style={{
                          background: s.fill,
                          borderColor: status === s.value ? '#0066CC' : s.stroke,
                          color: s.text,
                        }}
                      >
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: s.dot }} />
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* notes */}
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">Notas</p>
                  <textarea
                    rows={2}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl
                               focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30
                               resize-none bg-gray-50"
                    placeholder="Diagnóstico o tratamiento…"
                  />
                </div>

                <div className="flex gap-2">
                  <button onClick={apply}
                    className="flex-1 py-2 text-sm font-semibold bg-[#0066CC] text-white rounded-xl hover:bg-[#0052A3] transition-colors">
                    Aplicar
                  </button>
                  <button onClick={clear}
                    className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl
                               hover:bg-red-50 hover:border-red-200 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Info className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">Haz clic en un diente</p>
                <p className="text-xs text-gray-300 mt-1">para editar su estado</p>
              </div>
            )}
          </div>

          {/* quick actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 text-sm mb-3">Acciones</h3>
            <div className="space-y-1">
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-left">
                <Printer className="w-3.5 h-3.5" />Imprimir odontograma
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-left">
                <FileDown className="w-3.5 h-3.5" />Exportar a PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── history ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-semibold text-gray-800">Historial de Cambios</h3>
          <span className="text-xs text-gray-400">{HISTORY.length} registros</span>
        </div>
        <div className="divide-y divide-gray-50">
          {HISTORY.map((h, i) => {
            const s = getStatus(h.status);
            return (
              <div key={i} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ background: s?.fill, color: s?.text, border: `1.5px solid ${s?.stroke}` }}>
                  {h.tooth}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-800">{h.treatment}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ background: s?.fill, color: s?.text }}>{s?.label}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{h.doctor} · {h.date}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}