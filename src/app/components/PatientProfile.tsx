import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ChevronLeft, User, Phone, Mail, MapPin, Calendar, Activity,
  FileText, DollarSign, Edit, Save, X, Download, Printer,
  Clock, AlertCircle, CreditCard, Stethoscope, Plus,
  CheckCircle2, Heart, Shield
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────
interface Patient {
  id: number; name: string; age: number; phone: string; email: string;
  address: string; birthDate: string; cedula: string; insurance: string;
  policyNumber: string; emergencyContact: string; emergencyPhone: string;
  allergies: string; medicalConditions: string; medications: string;
  bloodType: string; status: 'active' | 'inactive' | 'overdue';
  registrationDate: string; lastVisit: Date; nextAppointment: Date | null; balance: number;
}

interface Appointment {
  id: number; date: Date; time: string; treatment: string; doctor: string;
  status: 'completed' | 'scheduled' | 'cancelled'; notes?: string;
}

interface Treatment {
  id: number; date: string; tooth: string; treatment: string;
  doctor: string; cost: number; paid: number; status: 'completed' | 'pending';
}

// ─── Status config ────────────────────────────────────────────────
const PATIENT_STATUS: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
  active: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-700/50',
    dot: 'bg-emerald-500',
    label: 'Activo',
  },
  inactive: {
    bg: 'bg-gray-50 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    dot: 'bg-gray-400',
    label: 'Inactivo',
  },
  overdue: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-700/50',
    dot: 'bg-red-500',
    label: 'Moroso',
  },
  completed: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-700/50',
    dot: 'bg-emerald-500',
    label: 'Completado',
  },
  scheduled: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-700/50',
    dot: 'bg-blue-500',
    label: 'Agendado',
  },
  cancelled: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-700/50',
    dot: 'bg-red-500',
    label: 'Cancelado',
  },
  pending: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-700/50',
    dot: 'bg-amber-500',
    label: 'Pendiente',
  },
};

const StatusBadge = ({ status }: { status: string }) => {
  const c = PATIENT_STATUS[status] ?? PATIENT_STATUS.inactive;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
      {label}
    </p>
    {children}
  </div>
);

const inputCls = (editing: boolean) =>
  `w-full px-3.5 py-2.5 text-sm border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] ${
    editing
      ? 'border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100'
      : 'border-transparent bg-gray-50 text-gray-700 cursor-default dark:bg-gray-800 dark:text-gray-300'
  }`;

// ─── Component ────────────────────────────────────────────────────
export function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  type TabId = 'general' | 'medical' | 'appointments' | 'treatments' | 'payments' | 'documents';
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [isEditing, setIsEditing] = useState(false);

  const [patient, setPatient] = useState<Patient>({
    id: 1, name: 'Ana García Martínez', age: 32,
    phone: '+593 98 765 4321', email: 'ana.garcia@email.com',
    address: 'Av. Amazonas N24-03, Quito', birthDate: '1994-03-15',
    cedula: '1712345678', insurance: 'Salud S.A.',
    policyNumber: 'SSA-2024-12345',
    emergencyContact: 'Carlos García (Hermano)',
    emergencyPhone: '+593 98 123 4567',
    allergies: 'Penicilina, Látex',
    medicalConditions: 'Hipertensión controlada',
    medications: 'Enalapril 10mg (1 vez al día)',
    bloodType: 'A+', status: 'active',
    registrationDate: '2023-01-15',
    lastVisit: new Date(2026, 1, 20),
    nextAppointment: new Date(2026, 2, 15),
    balance: 350,
  });

  const appointments: Appointment[] = [
    { id: 1, date: new Date(2026, 2, 15), time: '10:00', treatment: 'Revisión y limpieza', doctor: 'Dr. Roberto Sánchez', status: 'scheduled' },
    { id: 2, date: new Date(2026, 1, 20), time: '15:30', treatment: 'Endodoncia molar 16', doctor: 'Dr. Roberto Sánchez', status: 'completed', notes: 'Tratamiento completado satisfactoriamente' },
    { id: 3, date: new Date(2026, 0, 10), time: '11:00', treatment: 'Ortodoncia – Ajuste', doctor: 'Dra. Carmen Torres', status: 'completed' },
  ];

  const treatments: Treatment[] = [
    { id: 1, date: '2026-02-20', tooth: '16', treatment: 'Endodoncia', doctor: 'Dr. Roberto Sánchez', cost: 450, paid: 450, status: 'completed' },
    { id: 2, date: '2026-01-10', tooth: '26', treatment: 'Restauración composite', doctor: 'Dr. Roberto Sánchez', cost: 120, paid: 70, status: 'pending' },
    { id: 3, date: '2025-12-05', tooth: '36', treatment: 'Limpieza dental', doctor: 'Dra. Carmen Torres', cost: 60, paid: 60, status: 'completed' },
  ];

  const payments = [
    { id: 1, date: '2026-02-20', amount: 450, method: 'Tarjeta',       concept: 'Endodoncia molar 16',        invoice: 'F-2026-023' },
    { id: 2, date: '2026-01-15', amount: 70,  method: 'Efectivo',      concept: 'Pago parcial restauración',  invoice: 'F-2026-012' },
    { id: 3, date: '2025-12-05', amount: 60,  method: 'Transferencia', concept: 'Limpieza dental',            invoice: 'F-2025-089' },
  ];

  const documents = [
    { id: 1, name: 'Consentimiento informado – Endodoncia.pdf', date: '2026-02-20', type: 'Consentimiento', size: '245 KB' },
    { id: 2, name: 'Radiografía periapical 16.jpg',              date: '2026-02-18', type: 'Radiografía',    size: '1.2 MB'  },
    { id: 3, name: 'Presupuesto tratamiento completo.pdf',       date: '2026-01-05', type: 'Presupuesto',    size: '180 KB'  },
    { id: 4, name: 'Historia clínica inicial.pdf',               date: '2023-01-15', type: 'Historia',       size: '320 KB'  },
  ];

  const handleSave = () => { setIsEditing(false); toast.success('Información del paciente actualizada'); };

  const tabs: { id: TabId; label: string; shortLabel: string; icon: React.ElementType }[] = [
    { id: 'general',      label: 'Información General', shortLabel: 'General',      icon: User        },
    { id: 'medical',      label: 'Historia Médica',     shortLabel: 'Médica',       icon: Stethoscope },
    { id: 'appointments', label: 'Citas',               shortLabel: 'Citas',        icon: Calendar    },
    { id: 'treatments',   label: 'Tratamientos',        shortLabel: 'Tratamientos', icon: Activity    },
    { id: 'payments',     label: 'Pagos',               shortLabel: 'Pagos',        icon: CreditCard  },
    { id: 'documents',    label: 'Documentos',          shortLabel: 'Docs',         icon: FileText    },
  ];

  const totalPaid = payments.reduce((a, p) => a + p.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <button onClick={() => navigate('/patients')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors mt-0.5 shrink-0"
                >
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{patient.name}</h1>
                <StatusBadge status={patient.status} />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {patient.age} años · Cédula: {patient.cedula} · Paciente desde {format(new Date(patient.registrationDate), 'd MMM yyyy', { locale: es })}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => navigate(`/patients/${id}/odontogram`)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Odontograma</span>
            </button>
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-2 px-3.5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <X className="w-4 h-4" /> Cancelar
                </button>
                <button onClick={handleSave}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052A3] active:scale-95 transition-all shadow-sm shadow-blue-200">
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052A3] active:scale-95 transition-all shadow-sm shadow-blue-200">
                <Edit className="w-4 h-4" /> Editar
              </button>
            )}
          </div>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
            <div className="w-8 h-8 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center mb-2">
              <Calendar style={{ width: 15, height: 15 }} className="text-blue-600" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Última Visita</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{format(patient.lastVisit, 'd MMM yyyy', { locale: es })}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center mb-2">
              <Clock style={{ width: 15, height: 15 }} className="text-emerald-600" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Próxima Cita</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
              {patient.nextAppointment ? format(patient.nextAppointment, 'd MMM yyyy', { locale: es }) : 'Sin agendar'}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
            <div className="w-8 h-8 bg-purple-50 rounded-xl dark:bg-purple-900/20 flex items-center justify-center mb-2">
              <Activity style={{ width: 15, height: 15 }} className="text-purple-600" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Tratamientos</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{treatments.length} realizados</p>
          </div>
          <div className={`bg-white rounded-2xl border shadow-sm p-4 dark:bg-gray-900 dark:border-gray-800 ${patient.balance > 0
              ? 'border-red-100 dark:border-red-800/40'
              : 'border-gray-100 dark:border-gray-800'}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-2 ${patient.balance > 0 ? 'bg-red-50 dark:bg-red-900/20' : 'bg-emerald-50 dark:bg-emerald-900/20'}`}>
              <DollarSign style={{ width: 15, height: 15 }} className={patient.balance > 0 ? 'text-red-500' : 'text-emerald-600'} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Saldo Pendiente</p>
            <p className={`text-sm font-bold mt-0.5 ${patient.balance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {patient.balance > 0 ? `$${patient.balance.toFixed(2)}` : 'Al día ✓'}
            </p>
          </div>
        </div>

        {/* ── Tabs Card ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

          {/* Tab bar */}
          <div className="border-b border-gray-100 dark:border-gray-800 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            <div className="flex min-w-max">
              {tabs.map(tab => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-3.5 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                      active ? 'text-[#0066CC] border-[#0066CC]' : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-200 dark:hover:border-gray-700'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="sm:hidden">{tab.shortLabel}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab content */}
          <div className="p-4 sm:p-6">

            {/* ── GENERAL ── */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Nombre completo', key: 'name', type: 'text', icon: User },
                    { label: 'Fecha de nacimiento', key: 'birthDate', type: 'date', icon: Calendar },
                    { label: 'Cédula de identidad', key: 'cedula', type: 'text', icon: null },
                    { label: 'Teléfono', key: 'phone', type: 'tel', icon: Phone },
                    { label: 'Email', key: 'email', type: 'email', icon: Mail },
                    { label: 'Dirección', key: 'address', type: 'text', icon: MapPin },
                    { label: 'Seguro médico', key: 'insurance', type: 'text', icon: Shield },
                    { label: 'Número de póliza', key: 'policyNumber', type: 'text', icon: null },
                    { label: 'Contacto de emergencia', key: 'emergencyContact', type: 'text', icon: User },
                    { label: 'Teléfono de emergencia', key: 'emergencyPhone', type: 'tel', icon: Phone },
                  ].map(({ label, key, type, icon: Icon }) => (
                    <Field key={key} label={label}>
                      <div className="relative">
                        {Icon && (
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
)}
                        <input type={type} value={(patient as any)[key]}
                          onChange={e => setPatient({ ...patient, [key]: e.target.value })}
                          disabled={!isEditing}
                          className={`${inputCls(isEditing)} ${Icon ? 'pl-9' : ''}`}
                        />
                      </div>
                    </Field>
                  ))}
                </div>
              </div>
            )}

            {/* ── MEDICAL ── */}
            {activeTab === 'medical' && (
              <div className="space-y-5">
                <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-2xl">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Información Médica Sensible</p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Mantén esta información actualizada y confidencial.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Grupo sanguíneo">
                    <select value={patient.bloodType} onChange={e => setPatient({ ...patient, bloodType: e.target.value })}
                      disabled={!isEditing} className={inputCls(isEditing)}>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </Field>
                  <Field label="Seguro / póliza">
                    <input type="text" value={patient.policyNumber} onChange={e => setPatient({ ...patient, policyNumber: e.target.value })}
                      disabled={!isEditing} className={inputCls(isEditing)} />
                  </Field>
                </div>

                {[
                  { label: 'Alergias', key: 'allergies', placeholder: 'Ej: Penicilina, Látex…', icon: AlertCircle, iconColor: 'text-red-400' },
                  { label: 'Condiciones médicas', key: 'medicalConditions', placeholder: 'Ej: Diabetes, Hipertensión…', icon: Heart, iconColor: 'text-pink-400' },
                  { label: 'Medicación actual', key: 'medications', placeholder: 'Ej: Aspirina 100mg (1 vez al día)', icon: Stethoscope, iconColor: 'text-blue-400' },
                ].map(({ label, key, placeholder, icon: Icon, iconColor }) => (
                  <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-4 h-4 ${iconColor}`} />
                      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</p>
                    </div>
                    <textarea rows={3} value={(patient as any)[key]}
                      onChange={e => setPatient({ ...patient, [key]: e.target.value })}
                      disabled={!isEditing} placeholder={placeholder}
                      className={`w-full px-3.5 py-2.5 text-sm border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] resize-none ${
                        isEditing
                          ? 'border-gray-200 bg-white text-gray-900 dark:border-gray-700 dark:bg-gray-700 dark:text-gray-100'
                          : 'border-transparent bg-white text-gray-700 cursor-default dark:bg-gray-700 dark:text-gray-300'
                      }`}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* ── APPOINTMENTS ── */}
            {activeTab === 'appointments' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Historial de Citas</p>
                  <button className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0066CC] text-white text-xs font-semibold rounded-xl hover:bg-[#0052A3] transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Nueva Cita
                  </button>
                </div>

                {appointments.map(apt => (
                  <div key={apt.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-800/40 hover:bg-blue-50/30 dark:hover:bg-blue-900/20  transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        apt.status === 'scheduled'
  ? 'bg-blue-50 dark:bg-blue-900/20'
  : apt.status === 'completed'
  ? 'bg-emerald-50 dark:bg-emerald-900/20'
  : 'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <Calendar style={{ width: 16, height: 16 }} className={
                          apt.status === 'scheduled' ? 'text-blue-600' : apt.status === 'completed' ? 'text-emerald-600' : 'text-red-500'
                        } />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{apt.treatment}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {format(apt.date, "d 'de' MMMM yyyy", { locale: es })} · {apt.time} · {apt.doctor}
                        </p>
                        {apt.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">"{apt.notes}"</p>}
                      </div>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                ))}
              </div>
            )}

            {/* ── TREATMENTS ── */}
            {activeTab === 'treatments' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Historial de Tratamientos</p>
                  <button onClick={() => navigate(`/patients/${id}/odontogram`)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0066CC] text-white text-xs font-semibold rounded-xl hover:bg-[#0052A3] transition-colors">
                    <Activity className="w-3.5 h-3.5" /> Ver Odontograma
                  </button>
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        {['Fecha', 'Diente', 'Tratamiento', 'Doctor', 'Costo', 'Pagado', 'Estado'].map((h, i) => (
                          <th key={h} className={`pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i >= 4 ? 'text-right' : 'text-left'} ${i === 6 ? 'text-center' : ''} pr-4`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {treatments.map(t => (
                        <tr key={t.id} className="hover:bg-gray-50/60 transition-colors dark:hover:bg-gray-800/60">
                          <td className="py-3.5 pr-4 text-sm text-gray-900 dark:text-white">{format(new Date(t.date), 'd MMM yyyy', { locale: es })}</td>
                          <td className="py-3.5 pr-4">
                            <span className="w-8 h-8 inline-flex items-center justify-center bg-[#0066CC] text-white rounded-lg text-xs font-bold">{t.tooth}</span>
                          </td>
                          <td className="py-3.5 pr-4 text-sm font-semibold text-gray-900 dark:text-white">{t.treatment}</td>
                          <td className="py-3.5 pr-4 text-sm text-gray-900 dark:text-white">{t.doctor}</td>
                          <td className="py-3.5 pr-4 text-sm text-gray-900 dark:text-white text-right">${t.cost.toFixed(2)}</td>
                          <td className="py-3.5 pr-4 text-sm text-gray-900 dark:text-white text-right">${t.paid.toFixed(2)}</td>
                          <td className="py-3.5 text-center"><StatusBadge status={t.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {treatments.map(t => (
                    <div key={t.id} className="p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 inline-flex items-center justify-center bg-[#0066CC] text-white rounded-lg text-xs font-bold shrink-0">{t.tooth}</span>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.treatment}</p>
                        </div>
                        <StatusBadge status={t.status} />
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{t.doctor} · {format(new Date(t.date), 'd MMM yyyy', { locale: es })}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs">
                        <span className="text-gray-900 dark:text-white">Costo: <strong className="text-gray-800 dark:text-gray-100">${t.cost.toFixed(2)}</strong></span>
                        <span className="text-gray-900 dark:text-white">Pagado: <strong className="text-emerald-600">${t.paid.toFixed(2)}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── PAYMENTS ── */}
            {activeTab === 'payments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Historial de Pagos</p>
                  <button className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0066CC] text-white text-xs font-semibold rounded-xl hover:bg-[#0052A3] transition-colors">
                    <CreditCard className="w-3.5 h-3.5" /> Registrar Pago
                  </button>
                </div>

                {/* Balance summary */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-800/40 rounded-2xl p-4 border border-blue-100">
                    <p className="text-xs text-blue-600 font-semibold">Saldo Pendiente</p>
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">${patient.balance.toFixed(2)}</p>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100 dark:from-emerald-900/20 dark:to-teal-900/20 dark:border-emerald-800/40">
                    <p className="text-xs text-emerald-600 font-semibold">Total Pagado</p>
                    <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 mt-1">${totalPaid.toFixed(2)}</p>
                  </div>
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr className="border-b border-gray-100 dark:border-gray-800">
                        {['Fecha', 'Concepto', 'Método', 'Factura', 'Monto', ''].map((h, i) => (
                          <th key={i} className={`pb-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${i === 4 ? 'text-right' : 'text-left'} pr-4`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {payments.map(p => (
                        <tr key={p.id} className="hover:bg-gray-50/60 transition-colors dark:hover:bg-gray-800/60">
                          <td className="py-3.5 pr-4 text-sm text-gray-900 dark:text-white">{format(new Date(p.date), 'd MMM yyyy', { locale: es })}</td>
                          <td className="py-3.5 pr-4 text-sm font-medium text-gray-900 dark:text-white">{p.concept}</td>
                          <td className="py-3.5 pr-4 text-sm text-gray-900 dark:text-white">{p.method}</td>
                          <td className="py-3.5 pr-4 text-sm font-mono text-[#0066CC]">{p.invoice}</td>
                          <td className="py-3.5 pr-4 text-sm font-bold text-gray-900 text-right dark:text-white">${p.amount.toFixed(2)}</td>
                          <td className="py-3.5 text-right">
                            <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400 hover:text-[#0066CC]">
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-3">
                  {payments.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{p.concept}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{format(new Date(p.date), 'd MMM yyyy', { locale: es })} · {p.method}</p>
                        <p className="text-xs font-mono text-[#0066CC] mt-0.5">{p.invoice}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">${p.amount.toFixed(2)}</p>
                        <button className="p-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-[#0066CC] transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── DOCUMENTS ── */}
            {activeTab === 'documents' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Documentos del Paciente</p>
                  <button className="inline-flex items-center gap-2 px-3.5 py-2 bg-[#0066CC] text-white text-xs font-semibold rounded-xl hover:bg-[#0052A3] transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Subir Documento
                  </button>
                </div>

                {documents.map(doc => {
                  const typeColors: Record<string, string> = {
                    Consentimiento: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300',
                    Radiografía: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300',
                    Presupuesto: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-300',
                    Historia: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300',
                  };
                  return (
                    <div
  key={doc.id}
  className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-blue-100 dark:hover:border-blue-800/40 hover:bg-blue-50/20 dark:hover:bg-blue-900/20 transition-colors group"
>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColors[doc.type] ?? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
                        <FileText style={{ width: 18, height: 18 }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{doc.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{doc.type} · {doc.size} · {format(new Date(doc.date), 'd MMM yyyy', { locale: es })}</p>
                      </div>
                      <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity shrink-0">
                        <button className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-gray-500 dark:text-gray-400 hover:text-[#0066CC] transition-colors">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg text-gray-500 dark:text-gray-400 hover:text-[#0066CC] transition-colors">
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}