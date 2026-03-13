import React, { useState } from 'react';
import {
  format, addDays, startOfWeek, addMonths, subMonths,
  isSameDay, addWeeks, subWeeks, startOfDay, parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ChevronLeft, ChevronRight, Plus, Search, Calendar as CalendarIcon,
  Clock, User, Stethoscope, X, Save, CheckCircle2, AlertCircle,
  XCircle, List, LayoutGrid, Bell
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Appointment {
  id: number;
  date: Date;
  time: string;
  duration: number;
  patient: string;
  doctor: string;
  treatment: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  phone?: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG = {
  confirmed: { label: 'Confirmada', bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700/50', dot: 'bg-emerald-500', bar: 'bg-emerald-400', icon: CheckCircle2 },
  pending:   { label: 'Pendiente',  bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-700 dark:text-amber-300',     border: 'border-amber-200 dark:border-amber-700/50',     dot: 'bg-amber-400',   bar: 'bg-amber-400',   icon: AlertCircle  },
  cancelled: { label: 'Cancelada',  bg: 'bg-red-50 dark:bg-red-900/20',         text: 'text-red-700 dark:text-red-300',         border: 'border-red-200 dark:border-red-700/50',         dot: 'bg-red-400',     bar: 'bg-red-400',     icon: XCircle      },
  completed: { label: 'Atendida',   bg: 'bg-blue-50 dark:bg-blue-900/30',       text: 'text-blue-700 dark:text-blue-300',       border: 'border-blue-200 dark:border-blue-700/50',       dot: 'bg-blue-400',    bar: 'bg-blue-500',    icon: CheckCircle2 },
} as const;

const HOURS = Array.from({ length: 11 }, (_, i) => i + 8); // 8:00–18:00

const TODAY = new Date();

// Seed appointments spread across the current week
function seedAppointments(): Appointment[] {
  const weekStart = startOfWeek(TODAY, { weekStartsOn: 1 });
  return [
    { id: 1,  date: addDays(weekStart, 0), time: '09:00', duration: 60,  patient: 'Ana García',       doctor: 'Dr. Sánchez',   treatment: 'Limpieza dental',        status: 'confirmed', phone: '+593 98 765 4321' },
    { id: 2,  date: addDays(weekStart, 0), time: '10:30', duration: 90,  patient: 'Carlos López',     doctor: 'Dra. Martínez', treatment: 'Revisión de ortodoncia', status: 'confirmed', phone: '+593 99 234 5678' },
    { id: 3,  date: addDays(weekStart, 1), time: '09:00', duration: 45,  patient: 'María Rodríguez',  doctor: 'Dr. Sánchez',   treatment: 'Extracción molar',       status: 'pending',   phone: '+593 98 345 6789' },
    { id: 4,  date: addDays(weekStart, 1), time: '14:00', duration: 120, patient: 'José Hernández',   doctor: 'Dr. Torres',    treatment: 'Endodoncia',             status: 'confirmed', phone: '+593 99 456 7890' },
    { id: 5,  date: addDays(weekStart, 2), time: '11:00', duration: 30,  patient: 'Laura Pérez',      doctor: 'Dra. Martínez', treatment: 'Consulta inicial',       status: 'pending',   phone: '+593 98 567 8901' },
    { id: 6,  date: addDays(weekStart, 2), time: '15:30', duration: 60,  patient: 'Pedro Jiménez',    doctor: 'Dr. Sánchez',   treatment: 'Colocación de corona',   status: 'completed', phone: '+593 99 678 9012' },
    { id: 7,  date: addDays(weekStart, 3), time: '10:00', duration: 60,  patient: 'Sofía Castro',     doctor: 'Dr. Torres',    treatment: 'Implante dental',        status: 'confirmed', phone: '+593 98 789 0123' },
    { id: 8,  date: addDays(weekStart, 3), time: '16:00', duration: 45,  patient: 'Diego Morales',    doctor: 'Dr. Sánchez',   treatment: 'Blanqueamiento',         status: 'cancelled', phone: '+593 99 890 1234' },
    { id: 9,  date: addDays(weekStart, 4), time: '09:30', duration: 90,  patient: 'Valeria Ruiz',     doctor: 'Dra. Martínez', treatment: 'Ortodoncia – ajuste',    status: 'confirmed', phone: '+593 98 901 2345' },
    { id: 10, date: addDays(weekStart, 4), time: '14:30', duration: 60,  patient: 'Andrés Vega',      doctor: 'Dr. Torres',    treatment: 'Revisión general',       status: 'pending',   phone: '+593 99 012 3456' },
  ];
}

const inputCls = 'w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500';
const labelCls = 'block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 dark:text-gray-500';

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: keyof typeof STATUS_CFG }) => {
  const c = STATUS_CFG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

// ─── CalendarBlock ────────────────────────────────────────────────────────────
const CalendarBlock = ({ apt, compact = false }: { apt: Appointment; compact?: boolean }) => {
  const c = STATUS_CFG[apt.status];
  const topPct = (parseInt(apt.time.split(':')[1]) / 60) * 100;
  const heightPx = (apt.duration / 60) * 80;
  return (
    <div
      className={`absolute left-1 right-1 rounded-xl border-l-[3px] overflow-hidden cursor-pointer hover:shadow-md transition-shadow z-10`}
      style={{
        top: `${topPct}%`,
        height: `${Math.max(heightPx - 4, 24)}px`,
        backgroundColor: c.bg.replace('bg-', '').includes('50')
          ? `color-mix(in srgb, white 85%, ${c.dot.replace('bg-', '')})`
          : '#F0F9FF',
        background: apt.status === 'confirmed' ? '#F0FDF4'
          : apt.status === 'pending' ? '#FFFBEB'
          : apt.status === 'cancelled' ? '#FEF2F2'
          : '#EFF6FF',
        borderLeftColor: apt.status === 'confirmed' ? '#34D399'
          : apt.status === 'pending' ? '#FBBF24'
          : apt.status === 'cancelled' ? '#F87171'
          : '#60A5FA',
      }}
    >
      <div className="px-1.5 py-1">
        <p className="text-[10px] font-bold text-gray-500 leading-tight">{apt.time}</p>
        {!compact && <p className="text-xs font-semibold text-gray-800 truncate leading-tight mt-0.5">{apt.patient}</p>}
        {!compact && heightPx > 40 && <p className="text-[10px] text-gray-500 truncate leading-tight">{apt.treatment}</p>}
      </div>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export function Appointments() {
  const [currentDate, setCurrentDate] = useState(TODAY);
  const [view, setView] = useState<'week' | 'day' | 'list'>('week');
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);

  const [appointments] = useState<Appointment[]>(seedAppointments());

  const [newApt, setNewApt] = useState({
    patient: '', doctor: '', treatment: '', date: '', time: '', duration: '60', notes: '', reminder: true,
  });

  // ── Derived ──
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const todayApts = appointments.filter(a => isSameDay(a.date, currentDate));
  const weekApts  = appointments.filter(a => weekDays.some(d => isSameDay(a.date, d)));

  const filteredList = appointments
    .filter(a => {
      const q = searchTerm.toLowerCase();
      const matchQ = !q || a.patient.toLowerCase().includes(q) || a.treatment.toLowerCase().includes(q) || a.doctor.toLowerCase().includes(q);
      const matchS = filterStatus === 'all' || a.status === filterStatus;
      return matchQ && matchS;
    })
    .sort((a, b) => a.date.getTime() - b.date.getTime() || a.time.localeCompare(b.time));

  const stats = {
    total:     weekApts.length,
    confirmed: weekApts.filter(a => a.status === 'confirmed').length,
    pending:   weekApts.filter(a => a.status === 'pending').length,
    cancelled: weekApts.filter(a => a.status === 'cancelled').length,
  };

  const aptsForDay   = (d: Date) => appointments.filter(a => isSameDay(a.date, d));
  const aptsAtHour   = (d: Date, h: number) => aptsForDay(d).filter(a => parseInt(a.time.split(':')[0]) === h);

  const prevPeriod = () => view === 'day' ? setCurrentDate(d => addDays(d, -1)) : setCurrentDate(d => subWeeks(d, 1));
  const nextPeriod = () => view === 'day' ? setCurrentDate(d => addDays(d, 1))  : setCurrentDate(d => addWeeks(d, 1));

  const handleSave = () => { setShowModal(false); toast.success('Cita creada correctamente'); };

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-4">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Citas</h1>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">Agenda y programación de pacientes</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052A3] active:scale-95 transition-all shadow-sm shadow-blue-200">
            <Plus className="w-4 h-4" /> Nueva Cita
          </button>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="col-span-2 sm:col-span-1 bg-[#0066CC] rounded-2xl p-4 text-white relative overflow-hidden">
            <div className="absolute -right-3 -top-3 w-16 h-16 bg-white/10 rounded-full" />
            <div className="absolute -right-1 -bottom-4 w-12 h-12 bg-white/5 rounded-full" />
            <p className="text-sm font-medium text-blue-100">Esta semana</p>
            <p className="text-3xl font-bold mt-1">{stats.total}</p>
            <p className="text-xs text-blue-200 mt-1">citas programadas</p>
          </div>
          {([
            { key: 'confirmed', label: 'Confirmadas', val: stats.confirmed, cls: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-gray-100 dark:border-gray-800' },
            { key: 'pending',   label: 'Pendientes',  val: stats.pending,   cls: 'text-amber-500',   bg: 'bg-amber-50 dark:bg-amber-900/20',     border: 'border-amber-100 dark:border-amber-800/40' },
            { key: 'cancelled', label: 'Canceladas',  val: stats.cancelled, cls: 'text-red-500',     bg: 'bg-red-50 dark:bg-red-900/20',         border: 'border-red-100' },
          ] as const).map(({ key, label, val, cls, bg, border }) => (
            <div key={key} className={`bg-white dark:bg-gray-900 rounded-2xl p-4 border ${border} shadow-sm`}>
              <div className={`w-8 h-8 ${bg} rounded-xl flex items-center justify-center mb-2`}>
                <span className={`text-xs font-bold ${cls}`}>{val}</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500">{label}</p>
              <p className={`text-xl font-bold mt-0.5 ${cls}`}>{val}</p>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3">

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Buscar paciente, tratamiento o doctor…"
                value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status pills */}
              {(['all', 'confirmed', 'pending', 'cancelled', 'completed'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    filterStatus === s ? 'bg-[#0066CC] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}>
                  {s === 'all' ? 'Todas' : STATUS_CFG[s as keyof typeof STATUS_CFG].label}
                </button>
              ))}

              {/* View toggle */}
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-xl ml-auto sm:ml-0">
                {([
                  { id: 'week', icon: LayoutGrid, label: 'Semana' },
                  { id: 'day',  icon: CalendarIcon, label: 'Día'    },
                  { id: 'list', icon: List,          label: 'Lista'  },
                ] as const).map(({ id, icon: Icon, label }) => (
                  <button key={id} onClick={() => setView(id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      view === id ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    }`}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Calendar Navigation ── */}
        {view !== 'list' && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={prevPeriod} className="p-2 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
                <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm px-4 py-2 min-w-[180px] text-center">
                <span className="text-sm font-bold text-gray-800 dark:text-gray-100 capitalize">
                  {view === 'week'
                    ? `${format(weekStart, 'd MMM', { locale: es })} – ${format(addDays(weekStart, 6), 'd MMM yyyy', { locale: es })}`
                    : format(currentDate, "EEEE d 'de' MMMM", { locale: es })}
                </span>
              </div>
              <button onClick={nextPeriod} className="p-2 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all">
                <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>
            </div>
            <button onClick={() => setCurrentDate(TODAY)}
              className="px-3 py-1.5 text-xs font-semibold text-[#0066CC] bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-800/40 rounded-xl hover:bg-blue-100 transition-colors">
              Hoy
            </button>
          </div>
        )}

        {/* ── WEEK VIEW ── */}
        {view === 'week' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <div style={{ minWidth: 700 }}>
                {/* Day headers */}
                <div className="grid border-b border-gray-100 dark:border-gray-800" style={{ gridTemplateColumns: '56px repeat(7, 1fr)' }}>
                  <div className="bg-gray-50/60 dark:bg-gray-800/60" />
                  {weekDays.map((d, i) => {
                    const isToday = isSameDay(d, TODAY);
                    const count = aptsForDay(d).length;
                    return (
                      <div key={i} className={`p-3 text-center border-l border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-900/20 transition-colors ${isToday ? 'bg-blue-50/60 dark:bg-blue-900/20' : 'bg-gray-50/40 dark:bg-gray-800/20'}`}
                        onClick={() => { setCurrentDate(d); setView('day'); }}>
                        <p className={`text-[11px] font-semibold uppercase tracking-wider ${isToday ? 'text-[#0066CC]' : 'text-gray-400 dark:text-gray-500'}`}>
                          {format(d, 'EEE', { locale: es })}
                        </p>
                        <p className={`text-lg font-bold mt-0.5 ${isToday ? 'text-[#0066CC]' : 'text-gray-700 dark:text-gray-300'}`}>
                          {format(d, 'd')}
                        </p>
                        {count > 0 && (
                          <div className="flex justify-center gap-0.5 mt-1">
                            {Array.from({ length: Math.min(count, 3) }).map((_, j) => (
                              <span key={j} className="w-1 h-1 bg-[#0066CC] rounded-full" />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Time grid */}
                <div style={{ maxHeight: 480, overflowY: 'auto' }}>
                  {HOURS.map(hour => (
                    <div key={hour} className="grid border-b border-gray-50 dark:border-gray-800 last:border-0" style={{ gridTemplateColumns: '56px repeat(7, 1fr)', minHeight: 80 }}>
                      <div className="bg-gray-50/40 dark:bg-gray-800/40 px-2 py-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500 text-right pr-3 pt-2">
                        {String(hour).padStart(2, '0')}:00
                      </div>
                      {weekDays.map((d, di) => {
                        const apts = aptsAtHour(d, hour);
                        const isToday = isSameDay(d, TODAY);
                        return (
                          <div key={di} className={`border-l border-gray-100 dark:border-gray-800 relative ${isToday ? 'bg-blue-50/20 dark:bg-blue-900/10' : 'hover:bg-gray-50/60 dark:hover:bg-gray-800/40'} transition-colors`}
                            style={{ minHeight: 80 }}>
                            {apts.map(apt => (
                              <div key={apt.id} onClick={() => setSelectedApt(apt)} className="cursor-pointer">
                                <CalendarBlock apt={apt} />
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── DAY VIEW ── */}
        {view === 'day' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div style={{ maxHeight: 520, overflowY: 'auto' }}>
              {HOURS.map(hour => {
                const apts = aptsAtHour(currentDate, hour);
                return (
                  <div key={hour} className="flex gap-0 border-b border-gray-50 dark:border-gray-800 last:border-0" style={{ minHeight: 80 }}>
                    <div className="w-14 shrink-0 bg-gray-50/60 dark:bg-gray-800/60 px-2 pt-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500 text-right">
                      {String(hour).padStart(2, '0')}:00
                    </div>
                    <div className="flex-1 relative border-l border-gray-100 dark:border-gray-800">
                      {apts.length === 0 && (
                        <div className="absolute inset-0 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors cursor-pointer" />
                      )}
                      {apts.map(apt => (
                        <div key={apt.id} className="absolute left-2 right-2"
                          style={{ top: `${(parseInt(apt.time.split(':')[1]) / 60) * 100}%`, height: `${Math.max((apt.duration / 60) * 80 - 6, 28)}px` }}
                          onClick={() => setSelectedApt(apt)}>
                          <div className={`h-full rounded-xl border-l-4 px-3 py-1.5 cursor-pointer hover:shadow-md transition-shadow flex items-center gap-3`}
                            style={{
                              background: apt.status === 'confirmed' ? '#F0FDF4' : apt.status === 'pending' ? '#FFFBEB' : apt.status === 'cancelled' ? '#FEF2F2' : '#EFF6FF',
                              borderLeftColor: apt.status === 'confirmed' ? '#34D399' : apt.status === 'pending' ? '#FBBF24' : apt.status === 'cancelled' ? '#F87171' : '#60A5FA',
                            }}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{apt.time}</span>
                                <StatusBadge status={apt.status} />
                              </div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 truncate">{apt.patient}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{apt.treatment} · {apt.doctor}</p>
                            </div>
                            <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{apt.duration}min</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── LIST VIEW ── */}
        {view === 'list' && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* Desktop table */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {['Fecha', 'Hora', 'Paciente', 'Tratamiento', 'Doctor', 'Duración', 'Estado'].map((h, i) => (
                      <th key={h} className={`px-5 py-3.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider ${i === 6 ? 'text-center' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                  {filteredList.map(apt => (
                    <tr key={apt.id} onClick={() => setSelectedApt(apt)}
                      className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/20 cursor-pointer transition-colors">
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 capitalize">
                        {format(apt.date, "d MMM", { locale: es })}
                        {isSameDay(apt.date, TODAY) && <span className="ml-1 text-[10px] font-bold text-[#0066CC] bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded-full">Hoy</span>}
                      </td>
                      <td className="px-5 py-4 text-sm font-semibold text-gray-800 dark:text-gray-100">{apt.time}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {apt.patient.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">{apt.patient}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">{apt.treatment}</td>
                      <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400">{apt.doctor}</td>
                      <td className="px-5 py-4 text-sm text-gray-400 dark:text-gray-500">{apt.duration} min</td>
                      <td className="px-5 py-4 text-center"><StatusBadge status={apt.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-50 dark:divide-gray-800">
              {filteredList.map(apt => (
                <div key={apt.id} onClick={() => setSelectedApt(apt)}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 cursor-pointer transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                        {apt.patient.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{apt.patient}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{apt.treatment}</p>
                      </div>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                  <div className="flex items-center gap-3 mt-2.5 text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <CalendarIcon className="w-3 h-3" />
                      <span className="capitalize">{format(apt.date, "d MMM", { locale: es })}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{apt.time} · {apt.duration}min</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Stethoscope className="w-3 h-3" />
                      <span>{apt.doctor}</span>
                    </div>
                  </div>
                </div>
              ))}
              {filteredList.length === 0 && (
                <div className="py-14 text-center">
                  <CalendarIcon className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No hay citas que coincidan</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Legend ── */}
        {view !== 'list' && (
          <div className="flex flex-wrap items-center gap-4 px-1">
            <span className="text-xs text-gray-400 dark:text-gray-500 font-semibold">Estado:</span>
            {Object.entries(STATUS_CFG).map(([k, c]) => (
              <div key={k} className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${c.dot}`} />
                <span className="text-xs text-gray-500 dark:text-gray-400">{c.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Appointment Detail Sheet ── */}
      {selectedApt && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setSelectedApt(null)}>
          <div className="bg-white dark:bg-gray-900 w-full sm:max-w-md sm:rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Detalle de Cita</p>
              <button onClick={() => setSelectedApt(null)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
                  {selectedApt.patient.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div>
                  <p className="text-base font-bold text-gray-900 dark:text-white">{selectedApt.patient}</p>
                  {selectedApt.phone && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{selectedApt.phone}</p>}
                </div>
                <div className="ml-auto"><StatusBadge status={selectedApt.status} /></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: CalendarIcon, label: 'Fecha', value: format(selectedApt.date, "d 'de' MMMM yyyy", { locale: es }) },
                  { icon: Clock, label: 'Hora',         value: `${selectedApt.time} · ${selectedApt.duration} min`           },
                  { icon: Stethoscope, label: 'Doctor', value: selectedApt.doctor                                             },
                  { icon: User, label: 'Tratamiento',   value: selectedApt.treatment                                         },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Icon className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                      <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{value}</p>
                  </div>
                ))}
              </div>

              {selectedApt.notes && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl p-3">
                  <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">Notas</p>
                  <p className="text-sm text-amber-800 dark:text-amber-200">{selectedApt.notes}</p>
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancelar cita
                </button>
                <button className="flex-1 py-2.5 text-sm font-semibold bg-[#0066CC] text-white rounded-xl hover:bg-[#0052A3] transition-colors">
                  Editar cita
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── New Appointment Modal ── */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-900 w-full sm:max-w-lg sm:rounded-2xl shadow-2xl flex flex-col" style={{ maxHeight: '95vh' }}
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Nueva Cita</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">Completa los datos de la cita</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Paciente *</label>
                  <select value={newApt.patient} onChange={e => setNewApt({ ...newApt, patient: e.target.value })} className={inputCls}>
                    <option value="">Seleccionar…</option>
                    {['Ana García', 'Carlos López', 'María Rodríguez', 'José Hernández', 'Laura Pérez'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Odontólogo *</label>
                  <select value={newApt.doctor} onChange={e => setNewApt({ ...newApt, doctor: e.target.value })} className={inputCls}>
                    <option value="">Seleccionar…</option>
                    {['Dr. Roberto Sánchez', 'Dra. Carmen Torres', 'Dr. Miguel Torres'].map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className={labelCls}>Tratamiento *</label>
                <select value={newApt.treatment} onChange={e => setNewApt({ ...newApt, treatment: e.target.value })} className={inputCls}>
                  <option value="">Seleccionar…</option>
                  {['Limpieza dental', 'Revisión de ortodoncia', 'Extracción molar', 'Endodoncia', 'Consulta inicial', 'Colocación de corona', 'Implante dental', 'Blanqueamiento'].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Fecha *</label>
                  <input type="date" value={newApt.date} onChange={e => setNewApt({ ...newApt, date: e.target.value })} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Hora *</label>
                  <input type="time" value={newApt.time} onChange={e => setNewApt({ ...newApt, time: e.target.value })} className={inputCls} />
                </div>
              </div>

              <div>
                <label className={labelCls}>Duración</label>
                <div className="flex gap-2">
                  {[30, 45, 60, 90, 120].map(d => (
                    <button key={d} onClick={() => setNewApt({ ...newApt, duration: String(d) })}
                      className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        newApt.duration === String(d) ? 'bg-[#0066CC] text-white border-[#0066CC]' : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}>
                      {d}min
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className={labelCls}>Notas adicionales</label>
                <textarea rows={3} value={newApt.notes} onChange={e => setNewApt({ ...newApt, notes: e.target.value })}
                  placeholder="Observaciones relevantes para la cita…"
                  className={`${inputCls} resize-none`} />
              </div>

              <label className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-100 dark:border-blue-800/40 cursor-pointer">
                <input type="checkbox" checked={newApt.reminder} onChange={e => setNewApt({ ...newApt, reminder: e.target.checked })}
                  className="rounded accent-[#0066CC]" />
                <div>
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Enviar recordatorio al paciente</p>
                  <p className="text-xs text-blue-500">Se notificará 24h antes de la cita</p>
                </div>
                <Bell className="w-4 h-4 text-blue-400 ml-auto shrink-0" />
              </label>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col-reverse sm:flex-row gap-2.5 shrink-0">
              <button onClick={() => setShowModal(false)}
                className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancelar
              </button>
              <button onClick={handleSave}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052A3] transition-colors">
                <CalendarIcon className="w-4 h-4" /> Crear Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}