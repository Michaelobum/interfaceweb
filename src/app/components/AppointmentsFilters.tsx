import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export function Dashboard() {
  const stats = [
    {
      title: 'Citas Hoy',
      value: '12',
      change: '+8%',
      trend: 'up',
      icon: Calendar,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Pacientes Atendidos',
      value: '8',
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Ingresos del Día',
      value: '$2,450',
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Tasa de Ocupación',
      value: '85%',
      change: '-3%',
      trend: 'down',
      icon: TrendingUp,
      color: 'bg-orange-50 text-orange-600',
    },
  ];

  const upcomingAppointments = [
    { id: 1, time: '09:00', patient: 'Ana García', doctor: 'Dr. Sánchez', type: 'Limpieza', status: 'confirmed' },
    { id: 2, time: '10:30', patient: 'Carlos López', doctor: 'Dra. Martínez', type: 'Ortodoncia', status: 'confirmed' },
    { id: 3, time: '11:00', patient: 'María Rodríguez', doctor: 'Dr. Sánchez', type: 'Extracción', status: 'pending' },
    { id: 4, time: '14:00', patient: 'José Hernández', doctor: 'Dr. Torres', type: 'Endodoncia', status: 'confirmed' },
    { id: 5, time: '15:30', patient: 'Laura Pérez', doctor: 'Dra. Martínez', type: 'Consulta', status: 'pending' },
  ];

  const revenueData = [
    { month: 'Ene', revenue: 12000 },
    { month: 'Feb', revenue: 19000 },
    { month: 'Mar', revenue: 15000 },
    { month: 'Abr', revenue: 22000 },
    { month: 'May', revenue: 28000 },
    { month: 'Jun', revenue: 25000 },
  ];

  const treatmentData = [
    { name: 'Limpiezas', value: 35, color: '#0066CC' },
    { name: 'Ortodoncia', value: 25, color: '#10B981' },
    { name: 'Endodoncia', value: 20, color: '#F59E0B' },
    { name: 'Implantes', value: 15, color: '#EF4444' },
    { name: 'Otros', value: 5, color: '#6B7280' },
  ];

  const alerts = [
    { id: 1, type: 'warning', message: '3 pacientes con pagos pendientes', time: 'Hace 2 horas' },
    { id: 2, type: 'info', message: 'Recordatorio: Mantenimiento de equipos programado para mañana', time: 'Hace 4 horas' },
    { id: 3, type: 'success', message: 'Nuevo paciente registrado: Pedro Jiménez', time: 'Hace 1 día' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Bienvenido de nuevo, aquí está el resumen de hoy</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.title}</p>
                  <p className="text-3xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                  <div className={`flex items-center gap-1 mt-2 text-sm ${
                    stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendIcon className="w-4 h-4" />
                    <span>{stat.change} vs mes anterior</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-semibold text-gray-900">Ingresos Mensuales</h3>
              <p className="text-sm text-gray-500 mt-1">Últimos 6 meses</p>
            </div>
            <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
              <option>2026</option>
              <option>2025</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#0066CC" strokeWidth={3} dot={{ fill: '#0066CC', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Treatment Distribution */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-6">Distribución de Tratamientos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={treatmentData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {treatmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {treatmentData.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Appointments */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-900">Próximas Citas</h3>
            <a href="/appointments" className="text-sm text-[#0066CC] hover:underline">Ver todas</a>
          </div>
          <div className="space-y-3">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-[#0066CC]">{appointment.time.split(':')[0]}</div>
                    <div className="text-xs text-gray-500">{appointment.time.split(':')[1]}</div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{appointment.patient}</p>
                  <p className="text-sm text-gray-500">{appointment.type} • {appointment.doctor}</p>
                </div>
                <div>
                  {appointment.status === 'confirmed' ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs">
                      <CheckCircle2 className="w-3 h-3" />
                      Confirmada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-xs">
                      <Clock className="w-3 h-3" />
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-6">Alertas y Notificaciones</h3>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
                  alert.type === 'warning' ? 'bg-yellow-50 text-yellow-600' :
                  alert.type === 'success' ? 'bg-green-50 text-green-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}