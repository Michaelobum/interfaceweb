import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, Save, RotateCcw, X, Trash2, Printer, FileDown, CheckCircle2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

/* ─── types ─── */
type Surface = 'V' | 'L' | 'M' | 'D' | 'O';
type ToothType = 'wisdom' | 'molar' | 'premolar' | 'canine' | 'lateral' | 'central';

interface SurfaceCondition { status: string }
interface ToothCondition {
  status: string;
  note?: string;
  surfaces: Partial<Record<Surface, SurfaceCondition>>;
}

/* ─── status catalogue ─── */
const STATUSES = [
  { value: 'cavity',      label: 'Caries',      fill: '#FEE2E2', stroke: '#F87171', text: '#991b1b', dot: '#ef4444' },
  { value: 'filled',      label: 'Restaurado',  fill: '#DBEAFE', stroke: '#93C5FD', text: '#1e40af', dot: '#60a5fa' },
  { value: 'extracted',   label: 'Extracción',  fill: '#FEF9C3', stroke: '#FCD34D', text: '#78350f', dot: '#fbbf24' },
  { value: 'implant',     label: 'Implante',    fill: '#D1FAE5', stroke: '#6EE7B7', text: '#064e3b', dot: '#34d399' },
  { value: 'endodontics', label: 'Endodoncia',  fill: '#FEF3C7', stroke: '#F59E0B', text: '#78350f', dot: '#f59e0b' },
  { value: 'crown',       label: 'Corona',      fill: '#EDE9FE', stroke: '#C4B5FD', text: '#4c1d95', dot: '#a78bfa' },
  { value: 'bridge',      label: 'Puente',      fill: '#FCE7F3', stroke: '#F9A8D4', text: '#831843', dot: '#f472b6' },
];
const getStatus = (v: string) => STATUSES.find(s => s.value === v) ?? null;

/* ─── tooth type helpers ─── */
function getType(fdi: number): ToothType {
  const n = fdi % 10;
  if (n === 8) return 'wisdom';
  if (n === 7 || n === 6) return 'molar';
  if (n === 5 || n === 4) return 'premolar';
  if (n === 3) return 'canine';
  if (n === 2) return 'lateral';
  return 'central';
}
const TYPE_NAMES: Record<ToothType, string> = {
  wisdom: 'Molar del Juicio', molar: 'Molar', premolar: 'Premolar',
  canine: 'Canino', lateral: 'Lateral', central: 'Central',
};

/* ─── organic tooth paths ─── */
const SHAPES: Record<ToothType, { outer: string; inner: string }> = {
  wisdom: {
    outer: `M -7.5,-7 C -9,-11 -5,-13 0,-13 C 5,-13 9,-11 7.5,-7 C 10,-2.5 10,2.5 7.5,7 C 5,11 -5,11 -7.5,7 C -10,2.5 -10,-2.5 -7.5,-7 Z`,
    inner: `M -3.5,-3.5 C -3.5,-6.5 -2,-7.5 0,-7.5 C 2,-7.5 3.5,-6.5 3.5,-3.5 C 5,-1 5,1 3.5,3.5 C 2,6.5 -2,6.5 -3.5,3.5 C -5,1 -5,-1 -3.5,-3.5 Z`,
  },
  molar: {
    outer: `M -10.5,-8.5 C -12.5,-14 -7,-16 0,-16 C 7,-16 12.5,-14 10.5,-8.5 C 13,-3.5 13,3.5 10.5,8.5 C 7,14 -7,14 -10.5,8.5 C -13,3.5 -13,-3.5 -10.5,-8.5 Z`,
    inner: `M -5.5,-4.5 C -5.5,-9 -3,-10.5 0,-10.5 C 3,-10.5 5.5,-9 5.5,-4.5 C 7,-2 7,2 5.5,4.5 C 3,9 -3,9 -5.5,4.5 C -7,2 -7,-2 -5.5,-4.5 Z`,
  },
  premolar: {
    outer: `M -7.5,-10 C -7.5,-14.5 -4,-16.5 0,-16.5 C 4,-16.5 7.5,-14.5 7.5,-10 C 9.5,-5 9.5,5 7.5,10 C 4,14.5 -4,14.5 -7.5,10 C -9.5,5 -9.5,-5 -7.5,-10 Z`,
    inner: `M -3.5,-5.5 C -3.5,-9.5 -2,-11 0,-11 C 2,-11 3.5,-9.5 3.5,-5.5 C 5,-2 5,2 3.5,5.5 C 2,9 -2,9 -3.5,5.5 C -5,2 -5,-2 -3.5,-5.5 Z`,
  },
  canine: {
    outer: `M -6.5,-10.5 C -5,-15 5,-15 6.5,-10.5 C 8.5,-5 8.5,5 6.5,10.5 C 5,14.5 -5,14.5 -6.5,10.5 C -8.5,5 -8.5,-5 -6.5,-10.5 Z`,
    inner: `M -3,-5.5 C -2,-9 2,-9 3,-5.5 C 4,-2 4,2 3,5.5 C 2,9 -2,9 -3,5.5 C -4,2 -4,-2 -3,-5.5 Z`,
  },
  lateral: {
    outer: `M -5.5,-9 C -4,-13.5 4,-13.5 5.5,-9 C 7.5,-4 7.5,4 5.5,9 C 4,13 -4,13 -5.5,9 C -7.5,4 -7.5,-4 -5.5,-9 Z`,
    inner: `M -2,-5 C -1.5,-8.5 1.5,-8.5 2,-5 C 3,-2 3,2 2,5 C 1.5,8 -1.5,8 -2,5 C -3,2 -3,-2 -2,-5 Z`,
  },
  central: {
    outer: `M -9,-7.5 C -7.5,-12 7.5,-12 9,-7.5 C 11,-3 11,3 9,7.5 C 7.5,12 -7.5,12 -9,7.5 C -11,3 -11,-3 -9,-7.5 Z`,
    inner: `M -4.5,-4 C -3,-7.5 3,-7.5 4.5,-4 C 5.5,-1.5 5.5,1.5 4.5,4 C 3,7.5 -3,7.5 -4.5,4 C -5.5,1.5 -5.5,-1.5 -4.5,-4 Z`,
  },
};

/* ─── arch positions ─── */
function buildArch(cx: number, cy: number, rx: number, ry: number,
  startDeg: number, endDeg: number, n: number) {
  return Array.from({ length: n }, (_, i) => {
    const deg = startDeg + ((endDeg - startDeg) / (n - 1)) * i;
    const rad = (deg * Math.PI) / 180;
    const x = cx + rx * Math.cos(rad);
    const y = cy + ry * Math.sin(rad);
    const rot = (Math.atan2(y - cy, x - cx) * 180) / Math.PI - 90;
    return { x, y, rot };
  });
}

const UPPER_FDI = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28];
const LOWER_FDI = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38];
const UPPER_POS = buildArch(310, 72, 198, 112, 165, 15, 16);
const LOWER_POS = buildArch(310, 428, 198, 112, 195, 345, 16);

/* ─── tooth SVG (used both in chart and in modal) ─── */
function ToothShape({ fdi, condition, selected, scale = 1, onClick }: {
  fdi: number; condition?: ToothCondition; selected?: boolean;
  scale?: number; onClick?: (fdi: number) => void;
}) {
  const shape = SHAPES[getType(fdi)];
  const st = condition ? getStatus(condition.status) : null;
  const extracted = condition?.status === 'extracted';
  const fill   = st ? st.fill   : '#EEF3FF';
  const stroke = st ? st.stroke : '#8BAAEE';

  return (
    <g onClick={() => onClick?.(fdi)} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      {selected && (
        <path d={shape.outer} fill="none" stroke="#1d4ed8"
          strokeWidth={5 / scale} strokeOpacity={0.18} transform="scale(1.22)" />
      )}
      <path d={shape.outer} fill={selected ? '#CBD8F8' : fill}
        stroke={selected ? '#1d4ed8' : stroke} strokeWidth={selected ? 1.8 / scale : 1.5 / scale} />
      {!extracted && (
        <path d={shape.inner} fill="none"
          stroke={selected ? '#1d4ed8' : stroke}
          strokeWidth={0.9 / scale} strokeOpacity={selected ? 0.7 : 0.55} />
      )}
      {extracted && (
        <g stroke="#ef4444" strokeWidth={2.4 / scale} strokeLinecap="round" opacity={0.9}>
          <line x1="-6" y1="-6" x2="6" y2="6" />
          <line x1="6" y1="-6" x2="-6" y2="6" />
        </g>
      )}
    </g>
  );
}

/* ─── arch tooth with label ─── */
function ArchTooth({ fdi, pos, condition, selected, onClick }: {
  fdi: number; pos: { x: number; y: number; rot: number };
  condition?: ToothCondition; selected?: boolean; onClick: (fdi: number) => void;
}) {
  const cx = fdi < 30 ? 310 : 310; // same center x; just for label direction
  const cy = fdi < 30 ? 72 : 428;
  const dx = cx - pos.x, dy = cy - pos.y;
  const len = Math.hypot(dx, dy) || 1;
  const lx = pos.x + (dx / len) * 21;
  const ly = pos.y + (dy / len) * 21;

  return (
    <g>
      <g transform={`translate(${pos.x.toFixed(2)},${pos.y.toFixed(2)}) rotate(${pos.rot.toFixed(2)})`}>
        <ToothShape fdi={fdi} condition={condition} selected={selected} onClick={() => onClick(fdi)} />
      </g>
      <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
        fontSize={8.5} fontFamily="ui-monospace,monospace"
        fontWeight={selected ? 700 : 400}
        fill={selected ? '#1d4ed8' : '#94A3B8'}>
        {fdi}
      </text>
    </g>
  );
}

/* ═══════════════════════════════════════════
   TOOTH DETAIL MODAL
═══════════════════════════════════════════ */

/* 5-surface diagram — front-view layout:
     [V]          vestibular (top of diagram)
   [M][O][D]      mesial, occlusal/center, distal
     [L]          lingual (bottom)
*/
const SURFACE_NAMES: Record<Surface, string> = {
  V: 'Vestibular', L: 'Lingual / Palatina',
  M: 'Mesial', D: 'Distal', O: 'Oclusal / Incisal',
};

function SurfaceDiagram({ surfaces, hoveredSurf, onHover, onSelect, toothType }: {
  surfaces: Partial<Record<Surface, SurfaceCondition>>;
  hoveredSurf: Surface | null;
  onHover: (s: Surface | null) => void;
  onSelect: (s: Surface) => void;
  toothType: ToothType;
}) {
  const isFront = toothType === 'canine' || toothType === 'lateral' || toothType === 'central';
  const oclusalLabel = isFront ? 'Incisal' : 'Oclusal';

  const surfBtn = (surf: Surface, label: string, extraClass = '') => {
    const cond = surfaces[surf];
    const st = cond ? getStatus(cond.status) : null;
    const isHov = hoveredSurf === surf;
    return (
      <button
        key={surf}
        onMouseEnter={() => onHover(surf)}
        onMouseLeave={() => onHover(null)}
        onClick={() => onSelect(surf)}
        className={`flex items-center justify-center text-[11px] font-semibold rounded-lg border-2 transition-all select-none ${extraClass}`}
        style={{
          background: isHov ? '#EEF3FF' : (st ? st.fill : '#F8FAFF'),
          borderColor: isHov ? '#3B82F6' : (st ? st.stroke : '#C7D7F4'),
          color: st ? st.text : '#64748b',
          boxShadow: isHov ? '0 0 0 3px rgba(59,130,246,0.2)' : 'none',
        }}
      >
        {label}
        {cond && (
          <span className="ml-1 w-2 h-2 rounded-full inline-block flex-shrink-0"
            style={{ background: getStatus(cond.status)?.dot }} />
        )}
      </button>
    );
  };

  return (
    <div className="grid gap-1.5" style={{ gridTemplateAreas: `'. V .' 'M O D' '. L .'`, gridTemplateColumns: '1fr 2fr 1fr' }}>
      <div style={{ gridArea: 'V' }}>{surfBtn('V', 'V · Vestibular', 'h-10')}</div>
      <div style={{ gridArea: 'M' }}>{surfBtn('M', 'M · Mesial', 'h-10')}</div>
      <div style={{ gridArea: 'O' }}>{surfBtn('O', isFront ? 'I · ' + oclusalLabel : 'O · ' + oclusalLabel, 'h-10')}</div>
      <div style={{ gridArea: 'D' }}>{surfBtn('D', 'D · Distal', 'h-10')}</div>
      <div style={{ gridArea: 'L' }}>{surfBtn('L', 'L · Lingual', 'h-10')}</div>
    </div>
  );
}

interface ModalProps {
  fdi: number;
  condition?: ToothCondition;
  onSave: (fdi: number, cond: ToothCondition) => void;
  onClear: (fdi: number) => void;
  onClose: () => void;
}

function ToothModal({ fdi, condition, onSave, onClear, onClose }: ModalProps) {
  const type = getType(fdi);
  const quadrant = Math.floor(fdi / 10);

  const [status, setStatus]   = useState(condition?.status ?? 'cavity');
  const [note, setNote]       = useState(condition?.note ?? '');
  const [surfaces, setSurfaces] = useState<Partial<Record<Surface, SurfaceCondition>>>(
    condition?.surfaces ?? {}
  );
  const [hoveredSurf, setHoveredSurf] = useState<Surface | null>(null);

  // close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const toggleSurface = (surf: Surface) => {
    setSurfaces(prev => {
      const next = { ...prev };
      if (next[surf]) delete next[surf];
      else next[surf] = { status };
      return next;
    });
  };

  const handleApply = () => {
    const dominant = Object.keys(surfaces).length > 0
      ? surfaces[Object.keys(surfaces)[0] as Surface]?.status ?? status
      : status;
    onSave(fdi, { status: dominant, note, surfaces });
  };

  const curSt = getStatus(status);
  const toothPreview: ToothCondition = { status, note, surfaces };

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        style={{ animation: 'modalIn 0.18s ease-out' }}
      >
        {/* ── modal header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg viewBox="-16 -18 32 36" className="w-5 h-5">
                <ToothShape fdi={fdi} condition={toothPreview} />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-gray-900">Diente #{fdi}</span>
                <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-medium">
                  FDI · Q{quadrant}
                </span>
              </div>
              <p className="text-xs text-gray-400">{TYPE_NAMES[type]}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">

          {/* ── surface selector ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Carilla / Superficie</p>
              {Object.keys(surfaces).length > 0 && (
                <button onClick={() => setSurfaces({})} className="text-xs text-red-400 hover:text-red-600 transition-colors">
                  Limpiar superficies
                </button>
              )}
            </div>

            <SurfaceDiagram
              surfaces={surfaces}
              hoveredSurf={hoveredSurf}
              onHover={setHoveredSurf}
              onSelect={toggleSurface}
              toothType={type}
            />

            {hoveredSurf && (
              <p className="text-[11px] text-center text-blue-500 mt-2 font-medium">
                {surfaces[hoveredSurf]
                  ? `Clic para quitar: ${SURFACE_NAMES[hoveredSurf]}`
                  : `Clic para marcar: ${SURFACE_NAMES[hoveredSurf]}`}
              </p>
            )}
          </div>

          <hr className="border-gray-100" />

          {/* ── treatment ── */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2.5">Tratamiento</p>
            <div className="grid grid-cols-2 gap-2">
              {STATUSES.map(s => (
                <button
                  key={s.value}
                  onClick={() => {
                    setStatus(s.value);
                    // apply to already-selected surfaces
                    if (Object.keys(surfaces).length > 0) {
                      setSurfaces(prev => {
                        const next = { ...prev };
                        (Object.keys(next) as Surface[]).forEach(k => { next[k] = { status: s.value }; });
                        return next;
                      });
                    }
                  }}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold border-2 transition-all`}
                  style={{
                    background: status === s.value ? s.fill : '#FAFAFA',
                    borderColor: status === s.value ? s.stroke : '#E5EAF0',
                    color: status === s.value ? s.text : '#64748b',
                    boxShadow: status === s.value ? `0 0 0 2px ${s.stroke}55` : 'none',
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: s.dot }} />
                  {s.label}
                  {status === s.value && <CheckCircle2 className="w-3 h-3 ml-auto shrink-0" style={{ color: s.text }} />}
                </button>
              ))}
            </div>
          </div>

          {/* ── notes ── */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Notas clínicas</p>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Diagnóstico, observaciones, próximos pasos…"
              className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-blue-200 resize-none bg-gray-50"
            />
          </div>
        </div>

        {/* ── footer ── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/60">
          <button
            onClick={() => { onClear(fdi); onClose(); }}
            className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-600 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Limpiar diente
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#0066CC] rounded-xl hover:bg-[#0052A3] transition-colors"
              style={{ boxShadow: '0 2px 8px rgba(0,102,204,0.3)' }}
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.96) translateY(6px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);   }
        }
      `}</style>
    </div>
  );
}

/* ═══════════════════════════════════════════
   HISTORY MOCK
═══════════════════════════════════════════ */
const HISTORY = [
  { date: '2026-02-20', tooth: 16, treatment: 'Restauración', doctor: 'Dr. Sánchez',   status: 'filled'      },
  { date: '2025-11-10', tooth: 26, treatment: 'Endodoncia',   doctor: 'Dr. Torres',    status: 'endodontics' },
  { date: '2025-08-15', tooth: 36, treatment: 'Extracción',   doctor: 'Dra. Martínez', status: 'extracted'   },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════ */
export function Odontogram() {
  const navigate = useNavigate();
  const { id }   = useParams();

  const [toothData, setToothData] = useState<Record<number, ToothCondition>>({
    16: { status: 'filled',      note: '',  surfaces: {} },
    26: { status: 'endodontics', note: '',  surfaces: {} },
    36: { status: 'extracted',   note: '',  surfaces: {} },
  });
  const [modalFdi, setModalFdi] = useState<number | null>(null);

  const openModal  = useCallback((fdi: number) => setModalFdi(fdi), []);
  const closeModal = useCallback(() => setModalFdi(null), []);

  const saveTooth = useCallback((fdi: number, cond: ToothCondition) => {
    setToothData(d => ({ ...d, [fdi]: cond }));
    setModalFdi(null);
    toast.success(`Diente #${fdi} actualizado`);
  }, []);

  const clearTooth = useCallback((fdi: number) => {
    setToothData(d => { const n = { ...d }; delete n[fdi]; return n; });
    toast.info(`Diente #${fdi} restablecido`);
  }, []);

  const handleSave  = () => toast.success('Odontograma guardado');
  const handleReset = () => { setToothData({}); setModalFdi(null); toast.info('Restablecido'); };

  const condCount = Object.keys(toothData).length;

  return (
    <div className="p-6 space-y-5">

      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/patients/${id}`)}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Odontograma</h1>
            <p className="text-sm text-gray-400 mt-0.5">Ana García Martínez · FDI</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" />Restablecer
          </button>
          <button onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-[#0066CC] text-white rounded-xl hover:bg-[#0052A3] transition-colors">
            <Save className="w-3.5 h-3.5" />Guardar
          </button>
        </div>
      </div>

      {/* chart card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arcada Superior</span>
          <span className="text-xs text-gray-400">
            {condCount} diente{condCount !== 1 ? 's' : ''} con condición · <span className="text-blue-500">Haz clic en un diente para editarlo</span>
          </span>
        </div>

        <svg viewBox="0 0 620 510" className="w-full select-none" style={{ maxHeight: 400 }}>
          <defs>
            <filter id="ts" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#8BAAEE" floodOpacity="0.28" />
            </filter>
          </defs>
          <ellipse cx={310} cy={72}  rx={198} ry={112} fill="none" stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 5" />
          <ellipse cx={310} cy={428} rx={198} ry={112} fill="none" stroke="#E2E8F0" strokeWidth={1} strokeDasharray="4 5" />
          <line x1={310} y1={193} x2={310} y2={317} stroke="#E2E8F0" strokeWidth={1} strokeDasharray="3 4" />
          {[
            [125, 36, 'Q1 · Sup. Derecha'  ],[495, 36, 'Q2 · Sup. Izquierda'],
            [125, 490,'Q4 · Inf. Derecha'  ],[495, 490,'Q3 · Inf. Izquierda'],
          ].map(([x, y, label]) => (
            <text key={String(label)} x={Number(x)} y={Number(y)} textAnchor="middle"
              fontSize={8.5} fill="#CBD5E1" fontFamily="sans-serif">{label}</text>
          ))}

          <g filter="url(#ts)">
            {UPPER_FDI.map((fdi, i) => (
              <ArchTooth key={fdi} fdi={fdi} pos={UPPER_POS[i]}
                condition={toothData[fdi]} selected={modalFdi === fdi} onClick={openModal} />
            ))}
          </g>
          <g filter="url(#ts)">
            {LOWER_FDI.map((fdi, i) => (
              <ArchTooth key={fdi} fdi={fdi} pos={LOWER_POS[i]}
                condition={toothData[fdi]} selected={modalFdi === fdi} onClick={openModal} />
            ))}
          </g>
        </svg>

        <div className="text-center mt-0.5 mb-3">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Arcada Inferior</span>
        </div>

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

      {/* history */}
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

      {/* modal */}
      {modalFdi !== null && (
        <ToothModal
          fdi={modalFdi}
          condition={toothData[modalFdi]}
          onSave={saveTooth}
          onClear={clearTooth}
          onClose={closeModal}
        />
      )}
    </div>
  );
}