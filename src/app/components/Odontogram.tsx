import React, { useState, useRef } from 'react';
import { ChevronLeft, Save, RotateCcw, Info, Printer, ClipboardList, X, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ─── Types ───────────────────────────────────────────────────────────────────
type Surface = 'top' | 'bottom' | 'left' | 'right' | 'center';
type StatusKey = 'healthy' | 'cavity' | 'filled' | 'extracted' | 'implant' | 'endodontics' | 'crown' | 'bridge';

interface ToothSurfaces { top: StatusKey; bottom: StatusKey; left: StatusKey; right: StatusKey; center: StatusKey; }
interface ToothData { id: number; surfaces: ToothSurfaces; note: string; }

// ─── Config ──────────────────────────────────────────────────────────────────
const STATUS_LIST: { value: StatusKey; label: string; color: string; text: string }[] = [
  { value: 'healthy',     label: 'Sano',       color: '#F9FAFB', text: '#6B7280' },
  { value: 'cavity',      label: 'Caries',     color: '#7C2D12', text: '#FFFFFF' },
  { value: 'filled',      label: 'Restaurado', color: '#3B82F6', text: '#FFFFFF' },
  { value: 'extracted',   label: 'Extracción', color: '#EF4444', text: '#FFFFFF' },
  { value: 'implant',     label: 'Implante',   color: '#10B981', text: '#FFFFFF' },
  { value: 'endodontics', label: 'Endodoncia', color: '#F59E0B', text: '#FFFFFF' },
  { value: 'crown',       label: 'Corona',     color: '#8B5CF6', text: '#FFFFFF' },
  { value: 'bridge',      label: 'Puente',     color: '#EC4899', text: '#FFFFFF' },
];
const STATUS_MAP = Object.fromEntries(STATUS_LIST.map(s => [s.value, s])) as Record<StatusKey, typeof STATUS_LIST[0]>;
const defaultSurfaces = (): ToothSurfaces => ({ top: 'healthy', bottom: 'healthy', left: 'healthy', right: 'healthy', center: 'healthy' });

const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT  = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_LEFT  = [31, 32, 33, 34, 35, 36, 37, 38];

const historyRecords = [
  { date: '2026-02-20', tooth: '16', treatment: 'Restauración',  doctor: 'Dr. Sánchez',   status: 'filled'      as StatusKey },
  { date: '2025-11-10', tooth: '26', treatment: 'Endodoncia',    doctor: 'Dr. Torres',    status: 'endodontics' as StatusKey },
  { date: '2025-08-15', tooth: '36', treatment: 'Extracción',    doctor: 'Dra. Martínez', status: 'extracted'   as StatusKey },
];

const SURFACE_NAMES: Record<Surface, string> = { top: 'Mesial', bottom: 'Distal', left: 'Bucal', right: 'Lingual', center: 'Oclusal' };
const SURFACE_ABBR:  Record<Surface, string> = { top: 'M', bottom: 'D', left: 'B', right: 'L', center: 'O' };

// ─── ToothCell ────────────────────────────────────────────────────────────────
function ToothCell({ toothId, data, isSelected, isUpper, size, onClick, onSurfaceClick }: {
  toothId: number; data?: ToothData; isSelected: boolean; isUpper: boolean;
  size: number; onClick: () => void; onSurfaceClick: (s: Surface) => void;
}) {
  const s = data?.surfaces ?? defaultSurfaces();
  const sc = (k: Surface) => STATUS_MAP[s[k]].color;
  const sb = (k: Surface) => s[k] === 'healthy' ? '#D1D5DB' : STATUS_MAP[s[k]].color;
  const hasTreatment = Object.values(s).some(v => v !== 'healthy');
  const b = 'absolute cursor-pointer transition-opacity hover:opacity-75 active:opacity-60';

  return (
    <div className="flex flex-col items-center" style={{ gap: 2 }}>
      {isUpper && (
        <span style={{ fontSize: 9, fontWeight: 700, color: isSelected ? '#0066CC' : '#9CA3AF', lineHeight: 1 }}>{toothId}</span>
      )}
      <div
        className="relative transition-transform"
        style={{
          width: size, height: size,
          transform: isSelected ? 'scale(1.15)' : 'scale(1)',
          filter: isSelected ? 'drop-shadow(0 0 5px rgba(0,102,204,0.55))' : 'none',
        }}
        onClick={onClick}
      >
        {isSelected && <div className="absolute rounded-sm border-2 border-dashed border-blue-500 pointer-events-none" style={{ inset: -2, zIndex: 10 }} />}

        {/* Top */}
        <div className={b} style={{ left: '25%', right: '25%', top: 0, height: '25%', backgroundColor: sc('top'), border: `1px solid ${sb('top')}`, borderBottom: 'none' }}
          onClick={e => { e.stopPropagation(); onSurfaceClick('top'); }} />
        {/* Bottom */}
        <div className={b} style={{ left: '25%', right: '25%', bottom: 0, height: '25%', backgroundColor: sc('bottom'), border: `1px solid ${sb('bottom')}`, borderTop: 'none' }}
          onClick={e => { e.stopPropagation(); onSurfaceClick('bottom'); }} />
        {/* Left */}
        <div className={b} style={{ top: '25%', bottom: '25%', left: 0, width: '25%', backgroundColor: sc('left'), border: `1px solid ${sb('left')}`, borderRight: 'none' }}
          onClick={e => { e.stopPropagation(); onSurfaceClick('left'); }} />
        {/* Right */}
        <div className={b} style={{ top: '25%', bottom: '25%', right: 0, width: '25%', backgroundColor: sc('right'), border: `1px solid ${sb('right')}`, borderLeft: 'none' }}
          onClick={e => { e.stopPropagation(); onSurfaceClick('right'); }} />
        {/* Center */}
        <div className={b} style={{ left: '25%', right: '25%', top: '25%', bottom: '25%', backgroundColor: sc('center'), border: `1px solid ${sb('center')}` }}
          onClick={e => { e.stopPropagation(); onSurfaceClick('center'); }} />

        {hasTreatment && !isSelected && (
          <div style={{ position: 'absolute', top: -3, right: -3, width: 6, height: 6, borderRadius: '50%', backgroundColor: '#0066CC', zIndex: 11 }} />
        )}
      </div>
      {!isUpper && (
        <span style={{ fontSize: 9, fontWeight: 700, color: isSelected ? '#0066CC' : '#9CA3AF', lineHeight: 1 }}>{toothId}</span>
      )}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Odontogram() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [selectedTooth, setSelectedTooth]   = useState<number | null>(null);
  const [toothData, setToothData]           = useState<Record<number, ToothData>>({});
  const [selectedStatus, setSelectedStatus] = useState<StatusKey>('cavity');
  const [activeSurface, setActiveSurface]   = useState<Surface | null>(null);
  const [noteText, setNoteText]             = useState('');
  const [sheetOpen, setSheetOpen]           = useState(false);

  const applyToSurface = (toothId: number, surface: Surface, status: StatusKey) => {
    setToothData(prev => {
      const existing = prev[toothId] ?? { id: toothId, surfaces: defaultSurfaces(), note: '' };
      return { ...prev, [toothId]: { ...existing, surfaces: { ...existing.surfaces, [surface]: status } } };
    });
  };

  const handleSurfaceClick = (toothId: number, surface: Surface) => {
    setSelectedTooth(toothId);
    setActiveSurface(surface);
    setNoteText(toothData[toothId]?.note ?? '');
    applyToSurface(toothId, surface, selectedStatus);
    setSheetOpen(true);
  };

  const handleToothClick = (toothId: number) => {
    const next = selectedTooth === toothId ? null : toothId;
    setSelectedTooth(next);
    setActiveSurface(null);
    setNoteText(toothData[toothId]?.note ?? '');
    if (next !== null) setSheetOpen(true);
    else setSheetOpen(false);
  };

  const applyToAll = () => {
    if (!selectedTooth) return;
    setToothData(prev => ({
      ...prev,
      [selectedTooth]: {
        id: selectedTooth,
        surfaces: { top: selectedStatus, bottom: selectedStatus, left: selectedStatus, right: selectedStatus, center: selectedStatus },
        note: noteText,
      },
    }));
    toast.success(`Estado aplicado a todas las superficies del #${selectedTooth}`);
  };

  const saveNote = () => {
    if (!selectedTooth) return;
    setToothData(prev => ({
      ...prev,
      [selectedTooth]: { ...(prev[selectedTooth] ?? { id: selectedTooth, surfaces: defaultSurfaces() }), note: noteText },
    }));
    toast.success('Nota guardada');
  };

  const handleSave  = () => toast.success('Odontograma guardado correctamente');
  const handleReset = () => { setToothData({}); setSelectedTooth(null); setNoteText(''); setSheetOpen(false); toast.info('Odontograma restablecido'); };

  const treated    = Object.values(toothData).flatMap(t => Object.values(t.surfaces)).filter(s => s !== 'healthy').length;
  const totalTeeth = Object.keys(toothData).length;
  const selectedToothData = selectedTooth ? toothData[selectedTooth] : null;

  // Tooth size: smaller on mobile, larger on desktop (handled via CSS variable trick using inline style)
  const TOOTH_SIZE = 36; // px — fixed, arch scrolls horizontally on mobile

  const renderArch = (rows: number[][], isUpper: boolean) => (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {rows.map((row, ri) => (
        <React.Fragment key={ri}>
          {ri > 0 && <div style={{ width: 1, height: 32, backgroundColor: '#E5E7EB', flexShrink: 0 }} />}
          <div className="flex" style={{ gap: 4 }}>
            {row.map(toothId => (
              <ToothCell
                key={toothId}
                toothId={toothId}
                data={toothData[toothId]}
                isSelected={selectedTooth === toothId}
                isUpper={isUpper}
                size={TOOTH_SIZE}
                onClick={() => handleToothClick(toothId)}
                onSurfaceClick={surface => handleSurfaceClick(toothId, surface)}
              />
            ))}
          </div>
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">

        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={() => navigate(`/patients/${id}`)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors shrink-0">
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Odontograma</h1>
              <p className="text-xs sm:text-sm text-gray-400 truncate">Ana García Martínez · FDI</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={handleReset} className="p-2 sm:px-3.5 sm:py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={() => toast.info('Imprimiendo...')} className="hidden sm:flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button onClick={handleSave} className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052A3] active:scale-95 transition-all shadow-sm shadow-blue-200">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Guardar</span>
            </button>
          </div>
        </div>

        {/* ── Stats ────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-3 sm:px-4 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <ClipboardList style={{ width: 15, height: 15 }} className="text-[#0066CC]" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">Dientes tratados</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{totalTeeth} <span className="text-xs font-normal text-gray-400">/ 32</span></p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-3 sm:px-4 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber-50 rounded-xl flex items-center justify-center shrink-0">
              <Info style={{ width: 15, height: 15 }} className="text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-gray-400 truncate">Superficies</p>
              <p className="text-base sm:text-lg font-bold text-gray-900">{treated} <span className="text-xs font-normal text-gray-400">/ 160</span></p>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-3 sm:px-4 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <Save style={{ width: 15, height: 15 }} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-400">Última actualización</p>
              <p className="text-sm font-bold text-gray-900">20 feb 2026</p>
            </div>
          </div>
        </div>

        {/* ── Status Picker (mobile: horizontal scroll; desktop: hidden here, shown in sidebar) ── */}
        <div className="lg:hidden bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Estado a aplicar</p>
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
            {STATUS_LIST.map(s => (
              <button
                key={s.value}
                onClick={() => setSelectedStatus(s.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all ${
                  selectedStatus === s.value ? 'ring-2 ring-[#0066CC] border-[#0066CC] bg-blue-50' : 'border-gray-200 bg-gray-50'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-sm shrink-0 border" style={{ backgroundColor: s.color, borderColor: s.value === 'healthy' ? '#D1D5DB' : s.color }} />
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Main layout ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Odontogram canvas */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-gray-400">
                <span className="font-semibold text-gray-600">Toca una superficie</span> del diente para marcarla
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 shrink-0">
                <div className="w-2 h-2 bg-[#0066CC] rounded-full" />
                tratado
              </div>
            </div>

            {/* Arch container — scrolls horizontally on mobile */}
            <div className="overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
              <div style={{ minWidth: 480 }}>
                {/* Upper */}
                <div className="mb-1">
                  <div className="text-center mb-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Arcada Superior</span>
                  </div>
                  {renderArch([UPPER_RIGHT, UPPER_LEFT], true)}
                </div>

                {/* Midline */}
                <div className="flex items-center gap-3 my-3">
                  <div className="flex-1 border-t-2 border-dashed border-gray-200" />
                  <span className="text-[9px] font-semibold text-gray-300 uppercase tracking-wider shrink-0">Línea media</span>
                  <div className="flex-1 border-t-2 border-dashed border-gray-200" />
                </div>

                {/* Lower */}
                <div className="mt-1">
                  {renderArch([LOWER_RIGHT, LOWER_LEFT], false)}
                  <div className="text-center mt-2">
                    <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Arcada Inferior</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-5 pt-4 border-t border-gray-100">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Leyenda</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {STATUS_LIST.map(s => (
                  <div key={s.value} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-sm border" style={{ backgroundColor: s.color, borderColor: s.value === 'healthy' ? '#D1D5DB' : s.color }} />
                    <span className="text-xs text-gray-500">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Control Panel */}
          <div className="hidden lg:flex flex-col gap-4">
            {/* Status picker */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Estado a aplicar</p>
              <div className="grid grid-cols-2 gap-2">
                {STATUS_LIST.map(s => (
                  <button key={s.value} onClick={() => setSelectedStatus(s.value)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
                      selectedStatus === s.value ? 'ring-2 ring-[#0066CC] border-[#0066CC] bg-blue-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-sm shrink-0 border" style={{ backgroundColor: s.color, borderColor: s.value === 'healthy' ? '#D1D5DB' : s.color }} />
                    <span className="text-gray-700 truncate">{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected tooth panel */}
            {selectedTooth ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Diente seleccionado</p>
                  <button onClick={() => { setSelectedTooth(null); setSheetOpen(false); }} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#0066CC] rounded-2xl flex items-center justify-center text-white text-lg font-bold shrink-0">{selectedTooth}</div>
                  <div className="text-sm text-gray-500">
                    {activeSurface && <p>Superficie: <span className="font-semibold text-gray-800">{SURFACE_NAMES[activeSurface]}</span></p>}
                    <p className="text-xs text-gray-400 mt-0.5">Aplicar: <span className="font-semibold text-gray-700">{STATUS_MAP[selectedStatus].label}</span></p>
                  </div>
                </div>

                {/* Mini surface map */}
                {selectedToothData && (
                  <div>
                    <p className="text-[10px] text-gray-400 mb-1.5">Superficies actuales:</p>
                    <div className="grid grid-cols-3 gap-1">
                      {(['top','center','bottom','left','','right'] as const).map((pos, i) => {
                        if (pos === '') return <div key={i} />;
                        const st = selectedToothData.surfaces[pos as Surface];
                        return (
                          <div key={pos} className="rounded-lg p-1 text-center text-[10px] font-bold cursor-pointer hover:opacity-75 transition-opacity"
                            style={{ backgroundColor: STATUS_MAP[st].color, color: STATUS_MAP[st].text, border: `1px solid ${st === 'healthy' ? '#D1D5DB' : STATUS_MAP[st].color}` }}
                            onClick={() => handleSurfaceClick(selectedTooth, pos as Surface)}>
                            {SURFACE_ABBR[pos as Surface]}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[9px] text-gray-300 mt-1 px-0.5">
                      <span>M</span><span>D</span><span>B</span><span>L</span><span>O</span>
                    </div>
                  </div>
                )}

                <button onClick={applyToAll} className="w-full py-2.5 text-xs font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                  Aplicar a todas las superficies
                </button>

                <div>
                  <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notas</label>
                  <textarea rows={3} value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Observaciones del diente..."
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all resize-none" />
                  <button onClick={saveNote} className="mt-2 w-full py-2 text-xs font-semibold bg-[#0066CC] text-white rounded-xl hover:bg-[#0052A3] transition-colors">
                    Guardar nota
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                    <Info className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-sm text-gray-400 font-medium">Selecciona un diente</p>
                  <p className="text-xs text-gray-300 mt-1">Toca cualquier superficie</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── History ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800">Historial de Tratamientos</h3>
          </div>
          {/* Desktop */}
          <div className="hidden sm:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Diente', 'Tratamiento', 'Doctor', 'Estado', 'Fecha'].map((h, i) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {historyRecords.map((r, i) => {
                  const st = STATUS_MAP[r.status];
                  return (
                    <tr key={i} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="w-9 h-9 bg-[#0066CC] rounded-xl flex items-center justify-center text-white text-sm font-bold">{r.tooth}</div>
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-900">{r.treatment}</td>
                      <td className="px-5 py-4 text-sm text-gray-500">{r.doctor}</td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: st.color + '25', color: st.color === '#F9FAFB' ? '#6B7280' : st.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.color === '#F9FAFB' ? '#9CA3AF' : st.color }} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-sm text-gray-400">
                        {format(new Date(r.date), 'dd MMM yyyy', { locale: es })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mobile */}
          <div className="sm:hidden divide-y divide-gray-50">
            {historyRecords.map((r, i) => {
              const st = STATUS_MAP[r.status];
              return (
                <div key={i} className="px-4 py-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#0066CC] rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0">{r.tooth}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{r.treatment}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{r.doctor} · {format(new Date(r.date), 'dd/MM/yyyy')}</p>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold shrink-0"
                    style={{ backgroundColor: st.color + '25', color: st.color === '#F9FAFB' ? '#6B7280' : st.color }}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* ── Mobile Bottom Sheet: tooth detail ───────────────── */}
      {sheetOpen && selectedTooth && (
        <div className="lg:hidden fixed inset-0 z-40" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl"
            style={{ maxHeight: '75vh', overflowY: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-200 rounded-full" />
            </div>

            <div className="px-5 pb-6 pt-2 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-[#0066CC] rounded-2xl flex items-center justify-center text-white font-bold text-lg">{selectedTooth}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Diente #{selectedTooth}</p>
                    {activeSurface && <p className="text-xs text-gray-400">Superficie: {SURFACE_NAMES[activeSurface]}</p>}
                  </div>
                </div>
                <button onClick={() => { setSheetOpen(false); setSelectedTooth(null); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>

              {/* Surface map */}
              {selectedToothData && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Superficies actuales</p>
                  <div className="grid grid-cols-3 gap-2" style={{ maxWidth: 180, margin: '0 auto' }}>
                    {(['top','center','bottom','left','','right'] as const).map((pos, i) => {
                      if (pos === '') return <div key={i} />;
                      const st = selectedToothData.surfaces[pos as Surface];
                      return (
                        <div key={pos} className="rounded-xl p-2 text-center text-xs font-bold cursor-pointer hover:opacity-75 transition-opacity"
                          style={{ backgroundColor: STATUS_MAP[st].color, color: STATUS_MAP[st].text, border: `1.5px solid ${st === 'healthy' ? '#D1D5DB' : STATUS_MAP[st].color}` }}
                          onClick={() => handleSurfaceClick(selectedTooth, pos as Surface)}>
                          {SURFACE_ABBR[pos as Surface]}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <button onClick={applyToAll} className="w-full py-3 text-sm font-semibold bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors">
                Aplicar "{STATUS_MAP[selectedStatus].label}" a todas las superficies
              </button>

              {/* Note */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Notas</label>
                <textarea rows={3} value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Observaciones del diente..."
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 resize-none" />
                <button onClick={() => { saveNote(); setSheetOpen(false); }}
                  className="mt-2 w-full py-3 text-sm font-semibold bg-[#0066CC] text-white rounded-xl hover:bg-[#0052A3] transition-colors">
                  Guardar nota
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}