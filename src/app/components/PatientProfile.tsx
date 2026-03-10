import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  ChevronLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  FileText,
  DollarSign,
  Edit,
  Save,
  X,
  Download,
  Printer,
  Clock,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Stethoscope,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';

interface Patient {
  id: number;
  name: string;
  age: number;
  phone: string;
  email: string;
  address: string;
  birthDate: string;
  dni: string;
  insurance: string;
  policyNumber: string;
  emergencyContact: string;
  emergencyPhone: string;
  allergies: string;
  medicalConditions: string;
  medications: string;
  bloodType: string;
  status: 'active' | 'inactive' | 'overdue';
  registrationDate: string;
  lastVisit: Date;
  nextAppointment: Date | null;
  balance: number;
}

interface Appointment {
  id: number;
  date: Date;
  time: string;
  treatment: string;
  doctor: string;
  status: 'completed' | 'scheduled' | 'cancelled';
  notes?: string;
}

interface Treatment {
  id: number;
  date: string;
  tooth: string;
  treatment: string;
  doctor: string;
  cost: number;
  paid: number;
  status: 'completed' | 'pending';
}

export function PatientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'general' | 'medical' | 'appointments' | 'treatments' | 'payments' | 'documents'>('general');
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - En producción vendría de la API
  const [patient, setPatient] = useState<Patient>({
    id: 1,
    name: 'Ana García Martínez',
    age: 32,
    phone: '+34 612 345 678',
    email: 'ana.garcia@email.com',
    address: 'Calle Mayor 123, 28013 Madrid',
    birthDate: '1994-03-15',
    dni: '12345678A',
    insurance: 'Sanitas',
    policyNumber: 'SAN-2024-12345',
    emergencyContact: 'Carlos García (Hermano)',
    emergencyPhone: '+34 600 123 456',
    allergies: 'Penicilina, Látex',
    medicalConditions: 'Hipertensión controlada',
    medications: 'Enalapril 10mg (1 vez al día)',
    bloodType: 'A+',
    status: 'active',
    registrationDate: '2023-01-15',
    lastVisit: new Date(2026, 1, 20),
    nextAppointment: new Date(2026, 2, 15),
    balance: 350
  });

  const appointments: Appointment[] = [
    {
      id: 1,
      date: new Date(2026, 2, 15),
      time: '10:00',
      treatment: 'Revisión y limpieza',
      doctor: 'Dr. Roberto Sánchez',
      status: 'scheduled',
    },
    {
      id: 2,
      date: new Date(2026, 1, 20),
      time: '15:30',
      treatment: 'Endodoncia molar 16',
      doctor: 'Dr. Roberto Sánchez',
      status: 'completed',
      notes: 'Tratamiento completado satisfactoriamente'
    },
    {
      id: 3,
      date: new Date(2026, 0, 10),
      time: '11:00',
      treatment: 'Ortodoncia - Ajuste',
      doctor: 'Dra. Carmen Torres',
      status: 'completed'
    },
  ];

  const treatments: Treatment[] = [
    {
      id: 1,
      date: '2026-02-20',
      tooth: '16',
      treatment: 'Endodoncia',
      doctor: 'Dr. Roberto Sánchez',
      cost: 450,
      paid: 450,
      status: 'completed'
    },
    {
      id: 2,
      date: '2026-01-10',
      tooth: '26',
      treatment: 'Restauración composite',
      doctor: 'Dr. Roberto Sánchez',
      cost: 120,
      paid: 70,
      status: 'pending'
    },
    {
      id: 3,
      date: '2025-12-05',
      tooth: '36',
      treatment: 'Limpieza dental',
      doctor: 'Dra. Carmen Torres',
      cost: 60,
      paid: 60,
      status: 'completed'
    },
  ];

  const payments = [
    { id: 1, date: '2026-02-20', amount: 450, method: 'Tarjeta', concept: 'Endodoncia molar 16', invoice: 'F-2026-023' },
    { id: 2, date: '2026-01-15', amount: 70, method: 'Efectivo', concept: 'Pago parcial restauración', invoice: 'F-2026-012' },
    { id: 3, date: '2025-12-05', amount: 60, method: 'Transferencia', concept: 'Limpieza dental', invoice: 'F-2025-089' },
  ];

  const documents = [
    { id: 1, name: 'Consentimiento informado - Endodoncia.pdf', date: '2026-02-20', type: 'Consentimiento', size: '245 KB' },
    { id: 2, name: 'Radiografía periapical 16.jpg', date: '2026-02-18', type: 'Radiografía', size: '1.2 MB' },
    { id: 3, name: 'Presupuesto tratamiento completo.pdf', date: '2026-01-05', type: 'Presupuesto', size: '180 KB' },
    { id: 4, name: 'Historia clínica inicial.pdf', date: '2023-01-15', type: 'Historia', size: '320 KB' },
  ];

  const handleSave = () => {
    setIsEditing(false);
    toast.success('Información del paciente actualizada');
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      overdue: 'bg-red-100 text-red-800',
      completed: 'bg-green-100 text-green-800',
      scheduled: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      overdue: 'Mora',
      completed: 'Completado',
      scheduled: 'Agendado',
      cancelled: 'Cancelado',
      pending: 'Pendiente'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const tabs = [
    { id: 'general', label: 'Información General', icon: User },
    { id: 'medical', label: 'Historia Médica', icon: Stethoscope },
    { id: 'appointments', label: 'Citas', icon: Calendar },
    { id: 'treatments', label: 'Tratamientos', icon: Activity },
    { id: 'payments', label: 'Pagos', icon: CreditCard },
    { id: 'documents', label: 'Documentos', icon: FileText },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-gray-900">{patient.name}</h1>
              {getStatusBadge(patient.status)}
            </div>
            <p className="text-gray-500 mt-1">
              {patient.age} años • DNI: {patient.dni} • Paciente desde {format(new Date(patient.registrationDate), 'd MMM yyyy', { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/patients/${id}/odontogram`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Ver Odontograma
          </button>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052a3] transition-colors"
              >
                <Save className="w-4 h-4" />
                Guardar
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052a3] transition-colors"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Última Visita</p>
              <p className="font-semibold text-gray-900">
                {format(patient.lastVisit, 'd MMM yyyy', { locale: es })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Próxima Cita</p>
              <p className="font-semibold text-gray-900">
                {patient.nextAppointment
                  ? format(patient.nextAppointment, 'd MMM yyyy', { locale: es })
                  : 'Sin agendar'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tratamientos</p>
              <p className="font-semibold text-gray-900">{treatments.length} realizados</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-lg ${patient.balance > 0 ? 'bg-red-100' : 'bg-green-100'}`}>
              <DollarSign className={`w-5 h-5 ${patient.balance > 0 ? 'text-red-600' : 'text-green-600'}`} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Saldo Pendiente</p>
              <p className={`font-semibold ${patient.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                €{patient.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-[#0066CC] border-b-2 border-[#0066CC]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {/* General Information Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={patient.name}
                      onChange={(e) => setPatient({ ...patient, name: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de nacimiento
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={patient.birthDate}
                      onChange={(e) => setPatient({ ...patient, birthDate: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    DNI/NIE
                  </label>
                  <input
                    type="text"
                    value={patient.dni}
                    onChange={(e) => setPatient({ ...patient, dni: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={patient.phone}
                      onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={patient.email}
                      onChange={(e) => setPatient({ ...patient, email: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={patient.address}
                      onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seguro médico
                  </label>
                  <input
                    type="text"
                    value={patient.insurance}
                    onChange={(e) => setPatient({ ...patient, insurance: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de póliza
                  </label>
                  <input
                    type="text"
                    value={patient.policyNumber}
                    onChange={(e) => setPatient({ ...patient, policyNumber: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Contacto de emergencia
                  </label>
                  <input
                    type="text"
                    value={patient.emergencyContact}
                    onChange={(e) => setPatient({ ...patient, emergencyContact: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono de emergencia
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={patient.emergencyPhone}
                      onChange={(e) => setPatient({ ...patient, emergencyPhone: e.target.value })}
                      disabled={!isEditing}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Medical History Tab */}
          {activeTab === 'medical' && (
            <div className="space-y-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-900">Información Médica Sensible</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    Asegúrate de mantener esta información actualizada y confidencial.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alergias
                  </label>
                  <textarea
                    value={patient.allergies}
                    onChange={(e) => setPatient({ ...patient, allergies: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50 resize-none"
                    placeholder="Ej: Penicilina, Látex, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Condiciones médicas
                  </label>
                  <textarea
                    value={patient.medicalConditions}
                    onChange={(e) => setPatient({ ...patient, medicalConditions: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50 resize-none"
                    placeholder="Ej: Diabetes, Hipertensión, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Medicación actual
                  </label>
                  <textarea
                    value={patient.medications}
                    onChange={(e) => setPatient({ ...patient, medications: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50 resize-none"
                    placeholder="Ej: Aspirina 100mg (1 vez al día)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Grupo sanguíneo
                  </label>
                  <select
                    value={patient.bloodType}
                    onChange={(e) => setPatient({ ...patient, bloodType: e.target.value })}
                    disabled={!isEditing}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent disabled:bg-gray-50"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Historial de Citas</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052a3] transition-colors">
                  <Calendar className="w-4 h-4" />
                  Nueva Cita
                </button>
              </div>

              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg hover:border-[#0066CC] transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{appointment.treatment}</h4>
                        <p className="text-sm text-gray-600">
                          {format(appointment.date, "d 'de' MMMM yyyy", { locale: es })} • {appointment.time}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(appointment.status)}
                  </div>
                  <div className="ml-11">
                    <p className="text-sm text-gray-600">Doctor: {appointment.doctor}</p>
                    {appointment.notes && (
                      <p className="text-sm text-gray-500 mt-1 italic">{appointment.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Treatments Tab */}
          {activeTab === 'treatments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Historial de Tratamientos</h3>
                <button
                  onClick={() => navigate(`/patients/${id}/odontogram`)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052a3] transition-colors"
                >
                  <Activity className="w-4 h-4" />
                  Ver Odontograma
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Diente</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Tratamiento</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Doctor</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Costo</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Pagado</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {treatments.map((treatment) => (
                      <tr key={treatment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {format(new Date(treatment.date), 'd MMM yyyy', { locale: es })}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded font-medium text-sm">
                            {treatment.tooth}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{treatment.treatment}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{treatment.doctor}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">€{treatment.cost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 text-right">€{treatment.paid.toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          {getStatusBadge(treatment.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Historial de Pagos</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052a3] transition-colors">
                  <CreditCard className="w-4 h-4" />
                  Registrar Pago
                </button>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700">Saldo Pendiente</p>
                    <p className="text-2xl font-bold text-blue-900">€{patient.balance.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-700">Total Pagado</p>
                    <p className="text-xl font-semibold text-blue-900">
                      €{payments.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Concepto</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Método</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Factura</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Monto</th>
                      <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {format(new Date(payment.date), 'd MMM yyyy', { locale: es })}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{payment.concept}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{payment.method}</td>
                        <td className="px-4 py-3 text-sm text-blue-600 font-mono">{payment.invoice}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 font-semibold text-right">
                          €{payment.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button className="p-2 text-gray-600 hover:text-[#0066CC] transition-colors">
                            <Download className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-900">Documentos del Paciente</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052a3] transition-colors">
                  <Plus className="w-4 h-4" />
                  Subir Documento
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-[#0066CC] transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                        <p className="text-sm text-gray-600">
                          {doc.type} • {doc.size} • {format(new Date(doc.date), 'd MMM yyyy', { locale: es })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-600 hover:text-[#0066CC] transition-colors">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-gray-600 hover:text-[#0066CC] transition-colors">
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
