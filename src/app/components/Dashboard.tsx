import React, { useState } from 'react';
import {
  Users, Calendar, DollarSign, TrendingUp, Clock,
  CheckCircle2, ArrowUpRight, ArrowDownRight,
  AlertTriangle, Info, Sparkles, Activity, MoreHorizontal,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';

const initials = (name: string) =>
  name.split(' ').slice(0, 2).map((n) => n[0]).join('');

/* Chart tooltip — theme aware */
const CustomTooltip = ({ active, payload, label, dark }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-xl shadow-xl px-4 py-3 border text-sm ${
      dark
        ? 'bg-gray-800 border-gray-700 text-white'
        : 'bg-white border-gray-100 text-gray-900'
    }`}>
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="font-semibold">${payload[0].value.toLocaleString()}</p>
    </div>
  );
};

export function Dashboard() {
  const { isDark } = useTheme();
  const [selectedYear, setSelectedYear] = useState('2026');

  const today = new Date();
  const dateStr = today.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
  const dateFormatted = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const stats = [
    { title: 'Citas Hoy',          value: '12',    change: '+8%',  trend: 'up',   icon: Calendar,   gradient: 'from-blue-500 to-blue-600',    lightBg: 'bg-blue-50 dark:bg-blue-900/30',    textColor: 'text-blue-600 dark:text-blue-400',    ring: 'ring-blue-100 dark:ring-blue-800/40' },
    { title: 'Pacientes Atendidos', value: '8',     change: '+12%', trend: 'up',   icon: Users,      gradient: 'from-emerald-500 to-emerald-600', lightBg: 'bg-emerald-50 dark:bg-emerald-900/30', textColor: 'text-emerald-600 dark:text-emerald-400', ring: 'ring-emerald-100 dark:ring-emerald-800/40' },
    { title: 'Ingresos del Día',    value: '$2,450', change: '+23%', trend: 'up',  icon: DollarSign, gradient: 'from-violet-500 to-violet-600',  lightBg: 'bg-violet-50 dark:bg-violet-900/30',  textColor: 'text-violet-600 dark:text-violet-400',  ring: 'ring-violet-100 dark:ring-violet-800/40' },
    { title: 'Tasa de Ocupación',   value: '85%',   change: '-3%',  trend: 'down', icon: TrendingUp, gradient: 'from-orange-500 to-orange-600',  lightBg: 'bg-orange-50 dark:bg-orange-900/30',  textColor: 'text-orange-600 dark:text-orange-400',  ring: 'ring-orange-100 dark:ring-orange-800/40' },
  ];

  const appointments = [
    { id: 1, time: '09:00', patient: 'Ana García',       doctor: 'Dr. Sánchez',   type: 'Limpieza',    status: 'confirmed' },
    { id: 2, time: '10:30', patient: 'Carlos López',     doctor: 'Dra. Martínez', type: 'Ortodoncia',  status: 'confirmed' },
    { id: 3, time: '11:00', patient: 'María Rodríguez',  doctor: 'Dr. Sánchez',   type: 'Extracción',  status: 'pending'   },
    { id: 4, time: '14:00', patient: 'José Hernández',   doctor: 'Dr. Torres',    type: 'Endodoncia',  status: 'confirmed' },
    { id: 5, time: '15:30', patient: 'Laura Pérez',      doctor: 'Dra. Martínez', type: 'Consulta',    status: 'pending'   },
  ];

  const avatarColors = [
    'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300',
    'bg-violet-100 dark:bg-violet-900/50 text-violet-700 dark:text-violet-300',
    'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
    'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300',
    'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
  ];

  const revenueData = [
    { month: 'Ene', revenue: 12000 }, { month: 'Feb', revenue: 19000 },
    { month: 'Mar', revenue: 15000 }, { month: 'Abr', revenue: 22000 },
    { month: 'May', revenue: 28000 }, { month: 'Jun', revenue: 25000 },
  ];

  const treatmentData = [
    { name: 'Limpiezas',  value: 35, color: '#0066CC' },
    { name: 'Ortodoncia', value: 25, color: '#8B5CF6' },
    { name: 'Endodoncia', value: 20, color: '#10B981' },
    { name: 'Implantes',  value: 15, color: '#F59E0B' },
    { name: 'Otros',      value: 5,  color: '#94A3B8' },
  ];

  const alerts = [
    { id: 1, icon: AlertTriangle, message: '3 pacientes con pagos pendientes',                  time: 'Hace 2 horas', bg: 'bg-amber-50 dark:bg-amber-900/20',   border: 'border-amber-100 dark:border-amber-800/40',   icon_c: 'text-amber-500' },
    { id: 2, icon: Info,          message: 'Mantenimiento de equipos programado para mañana',   time: 'Hace 4 horas', bg: 'bg-blue-50 dark:bg-blue-900/20',     border: 'border-blue-100 dark:border-blue-800/40',     icon_c: 'text-blue-500'  },
    { id: 3, icon: CheckCircle2,  message: 'Nuevo paciente registrado: Pedro Jiménez',          time: 'Hace 1 día',   bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-100 dark:border-emerald-800/40', icon_c: 'text-emerald-500' },
  ];

  const gridStroke   = isDark ? '#374151' : '#f1f5f9';
  const tickFill     = isDark ? '#6b7280' : '#94a3b8';

  /* reusable card class */
  const card = 'bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 space-y-6 transition-colors duration-200">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-[#0066CC]" />
            <span className="text-xs font-medium text-[#0066CC] uppercase tracking-widest">Clínica Dental</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
            Buenos días, Dr. Sánchez 👋
          </h1>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5 capitalize">{dateFormatted}</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={index} className={`${card} rounded-2xl p-5 hover:shadow-md transition-all duration-200`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${stat.lightBg} ring-4 ${stat.ring} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <div className={`flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-full ${
                  stat.trend === 'up'
                    ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400'
                }`}>
                  <TrendIcon className="w-3 h-3" />
                  {stat.change}
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{stat.value}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{stat.title}</p>
              <div className="mt-4 h-1 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r ${stat.gradient}`}
                  style={{ width: `${60 + index * 10}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Revenue */}
        <div className={`${card} lg:col-span-2 rounded-2xl p-6`}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">Ingresos Mensuales</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Últimos 6 meses
              </p>
            </div>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}
              className="px-3 py-1.5 border border-gray-200 dark:border-gray-700
                         bg-gray-50 dark:bg-gray-800
                         text-gray-600 dark:text-gray-300
                         rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 cursor-pointer">
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>

          {/* KPI strip */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Total YTD', val: '$121K' },
              { label: 'Mejor mes', val: 'Mayo'  },
              { label: 'Promedio',  val: '$20.2K' },
            ].map(kpi => (
              <div key={kpi.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-400 dark:text-gray-500">{kpi.label}</p>
                <p className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-0.5">{kpi.val}</p>
              </div>
            ))}
          </div>

          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0066CC" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#0066CC" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: tickFill, fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip content={<CustomTooltip dark={isDark} />} />
              <Area type="monotone" dataKey="revenue" stroke="#0066CC" strokeWidth={2.5}
                fill="url(#rg)"
                dot={{ fill: '#0066CC', r: 4, strokeWidth: 2, stroke: isDark ? '#111827' : '#fff' }}
                activeDot={{ r: 6, fill: '#0066CC', stroke: isDark ? '#111827' : '#fff', strokeWidth: 2 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Treatments Pie */}
        <div className={`${card} rounded-2xl p-6 flex flex-col`}>
          <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-1">Tratamientos</h3>
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">Distribución del período</p>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={treatmentData} cx="50%" cy="50%"
                innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value" strokeWidth={0}>
                {treatmentData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={(v: number) => [`${v}%`, '']}
                contentStyle={{
                  borderRadius: '12px',
                  border: isDark ? '1px solid #374151' : '1px solid #f1f5f9',
                  background: isDark ? '#1f2937' : '#fff',
                  color: isDark ? '#f9fafb' : '#111827',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-auto pt-4 space-y-2.5">
            {treatmentData.map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${item.value}%`, backgroundColor: item.color }} />
                  </div>
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 w-8 text-right">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Upcoming Appointments */}
        <div className={`${card} lg:col-span-2 rounded-2xl overflow-hidden`}>
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50 dark:border-gray-800">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">Próximas Citas</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Hoy · {appointments.length} citas programadas
              </p>
            </div>
            <a href="/appointments"
              className="text-xs font-semibold text-[#0066CC] hover:text-blue-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30">
              Ver todas →
            </a>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {appointments.map((appt, i) => (
              <div key={appt.id}
                className="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors group">
                <div className="flex-shrink-0 w-14 text-center">
                  <span className="text-xs font-bold text-[#0066CC] bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-lg block">
                    {appt.time}
                  </span>
                </div>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center ${avatarColors[i % avatarColors.length]}`}>
                  {initials(appt.patient)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{appt.patient}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{appt.type} · {appt.doctor}</p>
                </div>
                <div className="flex-shrink-0">
                  {appt.status === 'confirmed'
                    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Confirmada
                      </span>
                    : <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium">
                        <Clock className="w-3 h-3" /> Pendiente
                      </span>}
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 dark:text-gray-600 hover:text-gray-500 dark:hover:text-gray-400">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* Alerts */}
          <div className={`${card} rounded-2xl p-5 flex-1`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">Notificaciones</h3>
              <span className="text-xs bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400 font-semibold px-2 py-0.5 rounded-full">
                {alerts.length} nuevas
              </span>
            </div>
            <div className="space-y-3">
              {alerts.map(alert => {
                const Icon = alert.icon;
                return (
                  <div key={alert.id} className={`flex gap-3 p-3 rounded-xl border ${alert.bg} ${alert.border}`}>
                    <div className={`flex-shrink-0 mt-0.5 ${alert.icon_c}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed">{alert.message}</p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">{alert.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Occupation widget — always blue gradient, no dark override needed */}
          <div className="bg-gradient-to-br from-[#0066CC] to-[#004fa3] rounded-2xl p-5 text-white shadow-lg shadow-blue-900/30">
            <p className="text-xs font-semibold text-blue-200 uppercase tracking-widest mb-3">Ocupación hoy</p>
            <p className="text-4xl font-extrabold tabular-nums">85%</p>
            <p className="text-blue-200 text-xs mt-1">10 de 12 cupos utilizados</p>
            <div className="mt-4 flex gap-1">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-full ${i < 10 ? 'bg-white' : 'bg-white/20'}`} />
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-blue-200">2 cupos disponibles</span>
              <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full">+15% vs ayer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}