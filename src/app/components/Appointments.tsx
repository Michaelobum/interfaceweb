import React, { useState } from 'react';
import { format, addDays, startOfWeek, addMonths, subMonths, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Search, Filter, Calendar as CalendarIcon } from 'lucide-react';

interface Appointment {
  id: number;
  time: string;
  duration: number;
  patient: string;
  doctor: string;
  treatment: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
}

export function Appointments() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [showModal, setShowModal] = useState(false);

  const appointments: Appointment[] = [
    { id: 1, time: '09:00', duration: 60, patient: 'Ana García', doctor: 'Dr. Sánchez', treatment: 'Limpieza dental', status: 'confirmed' },
    { id: 2, time: '10:30', duration: 90, patient: 'Carlos López', doctor: 'Dra. Martínez', treatment: 'Revisión de ortodoncia', status: 'confirmed' },
    { id: 3, time: '11:00', duration: 45, patient: 'María Rodríguez', doctor: 'Dr. Sánchez', treatment: 'Extracción molar', status: 'pending' },
    { id: 4, time: '14:00', duration: 120, patient: 'José Hernández', doctor: 'Dr. Torres', treatment: 'Endodoncia', status: 'confirmed' },
    { id: 5, time: '15:30', duration: 30, patient: 'Laura Pérez', doctor: 'Dra. Martínez', treatment: 'Consulta inicial', status: 'pending' },
    { id: 6, time: '16:30', duration: 60, patient: 'Pedro Jiménez', doctor: 'Dr. Sánchez', treatment: 'Colocación de corona', status: 'confirmed' },
  ];

  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8:00 - 19:00

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'pending':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'completed':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Confirmada';
      case 'pending':
        return 'Pendiente';
      case 'cancelled':
        return 'Cancelada';
      case 'completed':
        return 'Atendida';
      default:
        return status;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-500 mt-1">Administra y programa las citas de tus pacientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nueva Cita
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[300px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente o tratamiento..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
              />
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  view === v
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
              </button>
            ))}
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="px-4 py-2 bg-gray-50 rounded-lg min-w-[200px] text-center">
              <span className="font-medium text-gray-900">
                {format(currentDate, "MMMM 'de' yyyy", { locale: es })}
              </span>
            </div>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Button */}
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
            Filtros
          </button>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Week Day Headers */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-4 bg-gray-50"></div>
          {Array.from({ length: 7 }, (_, i) => {
            const date = addDays(startOfWeek(currentDate, { locale: es }), i);
            return (
              <div key={i} className="p-4 bg-gray-50 text-center border-l border-gray-200">
                <div className="text-sm text-gray-500">
                  {format(date, 'EEE', { locale: es })}
                </div>
                <div className={`text-lg font-semibold mt-1 ${
                  isSameDay(date, new Date()) ? 'text-[#0066CC]' : 'text-gray-900'
                }`}>
                  {format(date, 'd')}
                </div>
              </div>
            );
          })}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-8 divide-x divide-gray-200">
          {/* Time Column */}
          <div className="bg-gray-50">
            {hours.map((hour) => (
              <div key={hour} className="h-20 px-4 py-2 border-b border-gray-200 text-sm text-gray-500">
                {`${hour}:00`}
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {Array.from({ length: 7 }, (_, dayIndex) => (
            <div key={dayIndex} className="relative">
              {hours.map((hour) => (
                <div key={hour} className="h-20 border-b border-gray-200 hover:bg-blue-50 transition-colors cursor-pointer">
                  {/* Render appointments */}
                  {dayIndex === 1 && appointments.map((apt) => {
                    const aptHour = parseInt(apt.time.split(':')[0]);
                    if (aptHour === hour) {
                      return (
                        <div
                          key={apt.id}
                          className={`absolute left-1 right-1 p-2 rounded-md border-l-4 ${getStatusColor(apt.status)}`}
                          style={{
                            top: '4px',
                            height: `${(apt.duration / 60) * 80 - 8}px`,
                          }}
                        >
                          <div className="text-xs font-medium">{apt.time}</div>
                          <div className="text-sm font-semibold mt-1 truncate">{apt.patient}</div>
                          <div className="text-xs truncate">{apt.treatment}</div>
                          <div className="text-xs mt-1 truncate">{apt.doctor}</div>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 px-4">
        <span className="text-sm text-gray-600">Estado:</span>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-300 rounded"></div>
          <span className="text-sm text-gray-600">Confirmada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-300 rounded"></div>
          <span className="text-sm text-gray-600">Pendiente</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-300 rounded"></div>
          <span className="text-sm text-gray-600">Cancelada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-300 rounded"></div>
          <span className="text-sm text-gray-600">Atendida</span>
        </div>
      </div>

      {/* Modal for New Appointment */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Nueva Cita</h2>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paciente</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                    <option>Seleccionar paciente</option>
                    <option>Ana García</option>
                    <option>Carlos López</option>
                    <option>María Rodríguez</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Odontólogo</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                    <option>Seleccionar odontólogo</option>
                    <option>Dr. Sánchez</option>
                    <option>Dra. Martínez</option>
                    <option>Dr. Torres</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fecha</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hora</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tratamiento</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                  <option>Seleccionar tratamiento</option>
                  <option>Limpieza dental</option>
                  <option>Ortodoncia</option>
                  <option>Endodoncia</option>
                  <option>Extracción</option>
                  <option>Implante</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duración (minutos)</label>
                <input
                  type="number"
                  defaultValue="60"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  placeholder="Información adicional sobre la cita..."
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="reminder" className="rounded" />
                <label htmlFor="reminder" className="text-sm text-gray-600">Enviar recordatorio al paciente</label>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors"
              >
                Crear Cita
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
