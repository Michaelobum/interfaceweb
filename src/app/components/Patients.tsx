import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  DollarSign,
  ChevronLeft,
  Edit,
  Trash2,
  Download,
  Activity
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

export function Patients() {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const patients: Patient[] = [
    {
      id: 1,
      name: 'Ana García Martínez',
      age: 32,
      phone: '+34 612 345 678',
      email: 'ana.garcia@email.com',
      address: 'Calle Mayor 123, Madrid',
      status: 'active',
      lastVisit: new Date(2026, 1, 20),
      nextAppointment: new Date(2026, 2, 15),
      balance: 0,
    },
    {
      id: 2,
      name: 'Carlos López Fernández',
      age: 45,
      phone: '+34 623 456 789',
      email: 'carlos.lopez@email.com',
      address: 'Av. Constitución 45, Barcelona',
      status: 'active',
      lastVisit: new Date(2026, 1, 18),
      nextAppointment: new Date(2026, 2, 22),
      balance: 150,
    },
    {
      id: 3,
      name: 'María Rodríguez Sanz',
      age: 28,
      phone: '+34 634 567 890',
      email: 'maria.rodriguez@email.com',
      address: 'Plaza España 8, Valencia',
      status: 'overdue',
      lastVisit: new Date(2025, 11, 10),
      nextAppointment: null,
      balance: 450,
    },
    {
      id: 4,
      name: 'José Hernández García',
      age: 55,
      phone: '+34 645 678 901',
      email: 'jose.hernandez@email.com',
      address: 'Calle Alcalá 234, Madrid',
      status: 'active',
      lastVisit: new Date(2026, 1, 25),
      nextAppointment: new Date(2026, 2, 10),
      balance: 0,
    },
    {
      id: 5,
      name: 'Laura Pérez Muñoz',
      age: 38,
      phone: '+34 656 789 012',
      email: 'laura.perez@email.com',
      address: 'Gran Vía 567, Sevilla',
      status: 'active',
      lastVisit: new Date(2026, 1, 22),
      nextAppointment: new Date(2026, 3, 5),
      balance: 75,
    },
  ];

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

  const filteredPatients = patients.filter(patient => {
    if (filterStatus === 'all') return true;
    return patient.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">Activo</span>;
      case 'overdue':
        return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Moroso</span>;
      case 'inactive':
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">Inactivo</span>;
      default:
        return null;
    }
  };

  if (selectedPatient) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedPatient(null)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-gray-900">Perfil del Paciente</h1>
            <p className="text-gray-500 mt-1">Información completa y historial médico</p>
          </div>
          <button 
            onClick={() => navigate(`/patients/${selectedPatient.id}/odontogram`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Activity className="w-4 h-4" />
            Odontograma
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors">
            <FileText className="w-4 h-4" />
            Crear Presupuesto
          </button>
        </div>

        {/* Patient Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-6">
              <div className="w-24 h-24 bg-[#0066CC] rounded-full flex items-center justify-center text-white text-3xl font-semibold">
                {selectedPatient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="space-y-3">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">{selectedPatient.name}</h2>
                  <p className="text-gray-500">Paciente desde 2024</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    {selectedPatient.phone}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    {selectedPatient.email}
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    {selectedPatient.address}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right space-y-2">
              {getStatusBadge(selectedPatient.status)}
              <div className="text-sm text-gray-500">
                {selectedPatient.age} años
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Última Visita</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {format(selectedPatient.lastVisit, 'dd MMM yyyy', { locale: es })}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Próxima Cita</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">
                  {selectedPatient.nextAppointment 
                    ? format(selectedPatient.nextAppointment, 'dd MMM yyyy', { locale: es })
                    : 'No programada'
                  }
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tratamientos</p>
                <p className="text-lg font-semibold text-gray-900 mt-1">12</p>
              </div>
              <FileText className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Saldo Pendiente</p>
                <p className={`text-lg font-semibold mt-1 ${
                  selectedPatient.balance > 0 ? 'text-red-600' : 'text-green-600'
                }`}>
                  ${selectedPatient.balance}
                </p>
              </div>
              <DollarSign className={`w-8 h-8 ${
                selectedPatient.balance > 0 ? 'text-red-500' : 'text-green-500'
              }`} />
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Medical History */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Historial Clínico</h3>
            </div>
            <div className="p-6 space-y-4">
              {medicalHistory.map((record, index) => (
                <div key={index} className="flex gap-4 pb-4 border-b border-gray-100 last:border-0">
                  <div className="flex-shrink-0 w-16 text-sm text-gray-500">
                    {format(new Date(record.date), 'dd MMM', { locale: es })}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{record.treatment}</h4>
                    <p className="text-sm text-gray-600 mt-1">{record.doctor}</p>
                    <p className="text-sm text-gray-500 mt-1">{record.notes}</p>
                  </div>
                  <button className="flex-shrink-0 p-2 hover:bg-gray-100 rounded-lg">
                    <Download className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">Historial de Pagos</h3>
            </div>
            <div className="p-6 space-y-4">
              {paymentHistory.map((payment, index) => (
                <div key={index} className="flex items-center justify-between pb-4 border-b border-gray-100 last:border-0">
                  <div>
                    <h4 className="font-medium text-gray-900">{payment.concept}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {format(new Date(payment.date), 'dd MMM yyyy', { locale: es })} • {payment.method}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">${payment.amount}</p>
                    <span className="inline-block mt-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                      Pagado
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Información Adicional</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Alergias</h4>
              <p className="text-gray-600">Penicilina, Látex</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Grupo Sanguíneo</h4>
              <p className="text-gray-600">O+</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Condiciones Médicas</h4>
              <p className="text-gray-600">Hipertensión controlada</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Seguro Dental</h4>
              <p className="text-gray-600">Sanitas - Póliza #12345678</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Pacientes</h1>
          <p className="text-gray-500 mt-1">Administra la información de tus pacientes</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors">
          <Plus className="w-5 h-5" />
          Nuevo Paciente
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono o email..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'active'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus('overdue')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterStatus === 'overdue'
                  ? 'bg-[#0066CC] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Morosos
            </button>
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
            Más filtros
          </button>
        </div>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contacto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Visita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Próxima Cita
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Saldo
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPatients.map((patient) => (
                <tr 
                  key={patient.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/patients/${patient.id}`)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0066CC] rounded-full flex items-center justify-center text-white font-medium">
                        {patient.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{patient.name}</div>
                        <div className="text-sm text-gray-500">{patient.age} años</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{patient.phone}</div>
                    <div className="text-sm text-gray-500">{patient.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {format(patient.lastVisit, 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {patient.nextAppointment 
                      ? format(patient.nextAppointment, 'dd/MM/yyyy', { locale: es })
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(patient.status)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${
                      patient.balance > 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      ${patient.balance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button 
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}