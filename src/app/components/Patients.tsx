import React, { useState } from 'react';
import {
  Search, Plus, Phone, Mail, MapPin, Calendar,
  FileText, DollarSign, Edit, Trash2, Download,
  Activity, ChevronRight, Users, AlertCircle,
  CheckCircle2, Clock, X, UserX, Heart, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router';

interface Patient {
  id: number;
  name: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  status: 'active' | 'inactive' | 'overdue';
  lastVisit: Date;
  nextAppointment: Date | null;
  balance: number;
}

const STATUS_CONFIG = {
  active:   { label: 'Activo',   bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  inactive: { label: 'Inactivo', bg: 'bg-gray-50',    text: 'text-gray-500',    border: 'border-gray-200',    dot: 'bg-gray-400'    },
  overdue:  { label: 'Moroso',   bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500'     },
};

const medicalHistory = [
  { date: '2026-02-20', treatment: 'Limpieza dental', doctor: 'Dr. Sánchez', notes: 'Sin complicaciones' },
  { date: '2025-11-15', treatment: 'Revisión de ortodoncia', doctor: 'Dra. Martínez', notes: 'Ajuste de brackets' },
  { date: '2025-08-10', treatment: 'Empaste molar inferior', doctor: 'Dr. Sánchez', notes: 'Caries tratada' },
  { date: '2025-05-03', treatment: 'Limpieza profunda', doctor: 'Dr. Torres', notes: 'Higiene mejorada' },
];

const paymentHistory = [
  { date: '2026-02-20', concept: 'Limpieza dental', amount: 80, method: 'Tarjeta', status: 'paid' },
  { date: '2025-11-15', concept: 'Revisión ortodoncia', amount: 120, method: 'Efectivo', status: 'paid' },
  { date: '2025-08-10', concept: 'Empaste', amount: 150, method: 'Transferencia', status: 'paid' },
  { date: '2025-05-03', concept: 'Limpieza profunda', amount: 100, method: 'Tarjeta', status: 'paid' },
];

export function Patients() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '', age: '', phone: '', email: '', address: '',
    bloodType: '', allergies: '', conditions: '', insurance: '',
    doctor: '', notes: '',
  });

  const patients: Patient[] = [
    { id: 1, name: 'Ana García Martínez', age: 32, phone: '+593 98 765 4321', email: 'ana.garcia@email.com', address: 'Av. Amazonas N24-03, Quito', status: 'active', lastVisit: new Date(2026, 1, 20), nextAppointment: new Date(2026, 2, 15), balance: 0 },
    { id: 2, name: 'Carlos López Fernández', age: 45, phone: '+593 99 234 5678', email: 'carlos.lopez@email.com', address: 'Calle Sucre 4-78, Cuenca', status: 'active', lastVisit: new Date(2026, 1, 18), nextAppointment: new Date(2026, 2, 22), balance: 150 },
    { id: 3, name: 'María Rodríguez Sanz', age: 28, phone: '+593 98 345 6789', email: 'maria.rodriguez@email.com', address: 'Av. 9 de Octubre 123, Guayaquil', status: 'overdue', lastVisit: new Date(2025, 11, 10), nextAppointment: null, balance: 450 },
    { id: 4, name: 'José Hernández García', age: 55, phone: '+593 99 456 7890', email: 'jose.hernandez@email.com', address: 'Calle García Moreno 56, Quito', status: 'active', lastVisit: new Date(2026, 1, 25), nextAppointment: new Date(2026, 2, 10), balance: 0 },
    { id: 5, name: 'Laura Pérez Muñoz', age: 38, phone: '+593 98 567 8901', email: 'laura.perez@email.com', address: 'Av. Eloy Alfaro 890, Quito', status: 'active', lastVisit: new Date(2026, 1, 22), nextAppointment: new Date(2026, 3, 5), balance: 75 },
  ];

  const totalPatients  = patients.length;
  const activeCount    = patients.filter(p => p.status === 'active').length;
  const overdueCount   = patients.filter(p => p.status === 'overdue').length;
  const totalBalance   = patients.reduce((s, p) => s + p.balance, 0);

  const filteredPatients = patients.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || p.phone.includes(q) || p.email.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const StatusBadge = ({ status }: { status: Patient['status'] }) => {
    const c = STATUS_CONFIG[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    );
  };

  const Avatar = ({ name, size = 'md' }: { name: string; size?: 'sm' | 'md' | 'lg' }) => {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
    const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-20 h-20 text-2xl' };
    const radius = { sm: 'rounded-full', md: 'rounded-xl', lg: 'rounded-2xl' };
    return (
      <div className={`${sizes[size]} ${radius[size]} bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold shrink-0`}>
        {initials}
      </div>
    );
  };

  // ── DETAIL VIEW ────────────────────────────────────────────────
  if (selectedPatient) {
    return (
      <div className="min-h-screen bg-gray-50/60">
        <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <button
                onClick={() => setSelectedPatient(null)}
                className="text-sm text-[#0066CC] hover:underline mb-2 flex items-center gap-1.5 font-medium"
              >
                &larr; Volver a pacientes
              </button>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Perfil del Paciente</h1>
              <p className="text-sm text-gray-500 mt-0.5">Información clínica y financiera</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => navigate(`/patients/${selectedPatient.id}/odontogram`)}
                className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Activity className="w-4 h-4" />
                Odontograma
              </button>
              <button className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                <Edit className="w-4 h-4" />
                Editar
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052A3] transition-colors shadow-sm shadow-blue-200">
                <FileText className="w-4 h-4" />
                Crear Presupuesto
              </button>
            </div>
          </div>

          {/* Profile card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-2xl font-bold shrink-0">
                {selectedPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedPatient.name}</h2>
                    <p className="text-sm text-gray-400 mt-0.5">{selectedPatient.age} años · Paciente desde 2024</p>
                  </div>
                  <StatusBadge status={selectedPatient.status} />
                </div>
                <div className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3 text-sm text-gray-500">
                  <a href={`tel:${selectedPatient.phone}`} className="flex items-center gap-2 hover:text-[#0066CC] transition-colors">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {selectedPatient.phone}
                  </a>
                  <a href={`mailto:${selectedPatient.email}`} className="flex items-center gap-2 hover:text-[#0066CC] transition-colors">
                    <Mail className="w-4 h-4 text-gray-400" />
                    {selectedPatient.email}
                  </a>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {selectedPatient.address}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Calendar style={{ width: 16, height: 16 }} className="text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-0.5">Última Visita</p>
              <p className="text-sm font-bold text-gray-900">{format(selectedPatient.lastVisit, 'dd MMM yyyy', { locale: es })}</p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Calendar style={{ width: 16, height: 16 }} className="text-emerald-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-0.5">Próxima Cita</p>
              <p className="text-sm font-bold text-gray-900">
                {selectedPatient.nextAppointment
                  ? format(selectedPatient.nextAppointment, 'dd MMM yyyy', { locale: es })
                  : 'Sin programar'}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-purple-50 rounded-xl flex items-center justify-center">
                  <FileText style={{ width: 16, height: 16 }} className="text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-0.5">Tratamientos</p>
              <p className="text-sm font-bold text-gray-900">12</p>
            </div>
            <div className={`bg-white rounded-2xl p-4 border shadow-sm ${selectedPatient.balance > 0 ? 'border-red-100' : 'border-gray-100'}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedPatient.balance > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                  <DollarSign style={{ width: 16, height: 16 }} className={selectedPatient.balance > 0 ? 'text-red-500' : 'text-emerald-600'} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-0.5">Saldo Pendiente</p>
              <p className={`text-sm font-bold ${selectedPatient.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {selectedPatient.balance > 0 ? `$${selectedPatient.balance}` : 'Al día'}
              </p>
            </div>
          </div>

          {/* Medical + Payments */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Medical History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Historial Clínico</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {medicalHistory.map((record, i) => (
                  <div key={i} className="px-5 py-4 flex items-start gap-4">
                    <div className="text-center shrink-0">
                      <p className="text-xs font-bold text-[#0066CC]">{format(new Date(record.date), 'dd', { locale: es })}</p>
                      <p className="text-xs text-gray-400">{format(new Date(record.date), 'MMM', { locale: es })}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{record.treatment}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{record.doctor}</p>
                      <p className="text-xs text-gray-400 mt-0.5 italic">{record.notes}</p>
                    </div>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors shrink-0">
                      <Download className="w-3.5 h-3.5 text-gray-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment History */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-800">Historial de Pagos</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {paymentHistory.map((payment, i) => (
                  <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{payment.concept}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {format(new Date(payment.date), 'dd MMM yyyy', { locale: es })} · {payment.method}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">${payment.amount}</p>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Pagado</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Información Médica Adicional</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: AlertCircle, label: 'Alergias', value: 'Penicilina, Látex', color: 'text-red-500 bg-red-50' },
                { icon: Heart, label: 'Grupo Sanguíneo', value: 'O+', color: 'text-pink-500 bg-pink-50' },
                { icon: FileText, label: 'Condiciones Médicas', value: 'Hipertensión controlada', color: 'text-amber-500 bg-amber-50' },
                { icon: Shield, label: 'Seguro Dental', value: 'Sanitas · Póliza #12345678', color: 'text-blue-500 bg-blue-50' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-start gap-3 bg-gray-50 rounded-xl p-4">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                    <Icon style={{ width: 15, height: 15 }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    );
  }

  // ── LIST VIEW ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50/60">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Pacientes</h1>
            <p className="text-sm text-gray-500 mt-0.5">Gestión de expedientes clínicos</p>
          </div>
          <button
            onClick={() => setShowNewPatientModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052A3] active:scale-95 transition-all shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Nuevo Paciente
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="col-span-2 lg:col-span-1 bg-[#0066CC] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -right-2 -bottom-6 w-20 h-20 bg-white/5 rounded-full" />
            <p className="text-sm font-medium text-blue-100 mb-1">Total Pacientes</p>
            <p className="text-3xl font-bold">{totalPatients}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-200">
              <div className="flex-1 bg-white/20 rounded-full h-1.5">
                <div className="bg-white rounded-full h-1.5" style={{ width: `${Math.round((activeCount / totalPatients) * 100)}%` }} />
              </div>
              <span>{Math.round((activeCount / totalPatients) * 100)}% activos</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 style={{ width: 18, height: 18 }} className="text-emerald-600" />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{activeCount} pac.</span>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">Activos</p>
            <p className="text-xl font-bold text-gray-900">{activeCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-red-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertCircle style={{ width: 18, height: 18 }} className="text-red-500" />
              </div>
              <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{overdueCount} moroso</span>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">Morosos</p>
            <p className="text-xl font-bold text-red-600">{overdueCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-amber-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <DollarSign style={{ width: 18, height: 18 }} className="text-amber-500" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">Saldo Total</p>
            <p className="text-xl font-bold text-amber-600">${totalBalance}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o email…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'active', label: 'Activos' },
                { key: 'overdue', label: 'Morosos' },
                { key: 'inactive', label: 'Inactivos' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setFilterStatus(key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    filterStatus === key
                      ? 'bg-[#0066CC] text-white shadow-sm'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Patient List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Paciente</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Contacto</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Última Visita</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Próxima Cita</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Saldo</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredPatients.map(patient => (
                  <tr
                    key={patient.id}
                    onClick={() => navigate(`/patients/${patient.id}`)}
                    className="group hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {patient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{patient.name}</p>
                          <p className="text-xs text-gray-400">{patient.age} años</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-700">{patient.phone}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{patient.email}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {format(patient.lastVisit, 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-5 py-4 text-sm hidden lg:table-cell">
                      {patient.nextAppointment
                        ? <span className="text-gray-700">{format(patient.nextAppointment, 'dd MMM yyyy', { locale: es })}</span>
                        : <span className="text-gray-400 italic">Sin programar</span>}
                    </td>
                    <td className="px-5 py-4"><StatusBadge status={patient.status} /></td>
                    <td className="px-5 py-4 text-right">
                      <span className={`text-sm font-bold ${patient.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {patient.balance > 0 ? `$${patient.balance}` : 'Al día'}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); navigate(`/patients/${patient.id}`); }} className="p-2 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-[#0066CC] transition-colors">
                          <FileText className="w-4 h-4" />
                        </button>
                        <button onClick={e => e.stopPropagation()} className="p-2 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-[#0066CC] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={e => e.stopPropagation()} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-50">
            {filteredPatients.map(patient => (
              <div
                key={patient.id}
                onClick={() => navigate(`/patients/${patient.id}`)}
                className="p-4 hover:bg-gray-50/80 active:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {patient.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{patient.name}</p>
                      <p className="text-xs text-gray-400">{patient.age} años</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge status={patient.status} />
                    <span className={`text-sm font-bold ${patient.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                      {patient.balance > 0 ? `$${patient.balance}` : 'Al día'}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-end justify-between">
                  <div className="space-y-1 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      {patient.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      Última visita: {format(patient.lastVisit, 'dd/MM/yyyy', { locale: es })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredPatients.length === 0 && (
            <div className="py-16 text-center">
              <Users className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No se encontraron pacientes</p>
            </div>
          )}
        </div>

      </div>

      {/* MODAL — NUEVO PACIENTE */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-2xl flex flex-col shadow-2xl" style={{ maxHeight: '95vh' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900">Nuevo Paciente</h2>
                <p className="text-xs text-gray-400">Completa los datos del expediente</p>
              </div>
              <button
                onClick={() => setShowNewPatientModal(false)}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

              {/* Datos personales */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Datos Personales</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre completo *</label>
                    <input
                      type="text"
                      placeholder="Ej: Ana García Martínez"
                      value={newPatient.name}
                      onChange={e => setNewPatient({ ...newPatient, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Edad *</label>
                    <input
                      type="number"
                      placeholder="Ej: 35"
                      min="0"
                      max="120"
                      value={newPatient.age}
                      onChange={e => setNewPatient({ ...newPatient, age: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Odontólogo asignado</label>
                    <select
                      value={newPatient.doctor}
                      onChange={e => setNewPatient({ ...newPatient, doctor: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                    >
                      <option value="">Seleccionar…</option>
                      <option>Dr. Sánchez</option>
                      <option>Dra. Martínez</option>
                      <option>Dr. Torres</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contacto */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contacto</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Teléfono *</label>
                    <input
                      type="tel"
                      placeholder="+593 98 765 4321"
                      value={newPatient.phone}
                      onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
                    <input
                      type="email"
                      placeholder="paciente@email.com"
                      value={newPatient.email}
                      onChange={e => setNewPatient({ ...newPatient, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Dirección</label>
                    <input
                      type="text"
                      placeholder="Calle, número, ciudad"
                      value={newPatient.address}
                      onChange={e => setNewPatient({ ...newPatient, address: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Info médica */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Información Médica</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Grupo sanguíneo</label>
                    <select
                      value={newPatient.bloodType}
                      onChange={e => setNewPatient({ ...newPatient, bloodType: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                    >
                      <option value="">Seleccionar…</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Seguro dental</label>
                    <input
                      type="text"
                      placeholder="Ej: Sanitas · Póliza #12345"
                      value={newPatient.insurance}
                      onChange={e => setNewPatient({ ...newPatient, insurance: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Alergias</label>
                    <input
                      type="text"
                      placeholder="Ej: Penicilina, Látex"
                      value={newPatient.allergies}
                      onChange={e => setNewPatient({ ...newPatient, allergies: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Condiciones médicas</label>
                    <input
                      type="text"
                      placeholder="Ej: Hipertensión controlada"
                      value={newPatient.conditions}
                      onChange={e => setNewPatient({ ...newPatient, conditions: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1.5">Notas adicionales</label>
                    <textarea
                      rows={3}
                      placeholder="Observaciones relevantes para el expediente…"
                      value={newPatient.notes}
                      onChange={e => setNewPatient({ ...newPatient, notes: e.target.value })}
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-2.5 shrink-0">
              <button
                onClick={() => setShowNewPatientModal(false)}
                className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  setShowNewPatientModal(false);
                  setNewPatient({ name: '', age: '', phone: '', email: '', address: '', bloodType: '', allergies: '', conditions: '', insurance: '', doctor: '', notes: '' });
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052A3] transition-colors"
              >
                <Users className="w-4 h-4" />
                Crear Paciente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}