import React from 'react';
import { X, Calendar, User, Stethoscope, Clock } from 'lucide-react';

interface AppointmentsFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    status: string[];
    doctor: string;
    dateFrom: string;
    dateTo: string;
    timeSlot: string;
  };
  onFilterChange: (filters: any) => void;
}

export function AppointmentsFilters({ isOpen, onClose, filters, onFilterChange }: AppointmentsFiltersProps) {
  if (!isOpen) return null;

  const statusOptions = [
    { value: 'confirmed', label: 'Confirmada', color: 'green' },
    { value: 'pending', label: 'Pendiente', color: 'yellow' },
    { value: 'cancelled', label: 'Cancelada', color: 'red' },
    { value: 'completed', label: 'Atendida', color: 'blue' },
  ];

  const doctors = [
    'Todos los doctores',
    'Dr. Roberto Sánchez',
    'Dra. Carmen Torres',
    'Dra. María Martínez',
    'Dr. Luis Torres'
  ];

  const timeSlots = [
    'Cualquier hora',
    'Mañana (8:00 - 12:00)',
    'Mediodía (12:00 - 14:00)',
    'Tarde (14:00 - 18:00)',
    'Noche (18:00 - 20:00)'
  ];

  const handleStatusToggle = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFilterChange({ ...filters, status: newStatus });
  };

  const handleReset = () => {
    onFilterChange({
      status: [],
      doctor: '',
      dateFrom: '',
      dateTo: '',
      timeSlot: ''
    });
  };

  const handleApply = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Filtros Avanzados</h2>
            <p className="text-sm text-gray-500 mt-1">Personaliza la vista de tus citas</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-6 space-y-6">
          {/* Status Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4" />
              Estado de la Cita
            </label>
            <div className="grid grid-cols-2 gap-3">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => handleStatusToggle(status.value)}
                  className={`p-3 border-2 rounded-lg text-left transition-all ${
                    filters.status.includes(status.value)
                      ? `border-${status.color}-500 bg-${status.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-${status.color}-500`}></div>
                    <span className="font-medium text-gray-900">{status.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Doctor Filter */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Stethoscope className="w-4 h-4" />
              Profesional
            </label>
            <select
              value={filters.doctor}
              onChange={(e) => onFilterChange({ ...filters, doctor: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
            >
              {doctors.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4" />
              Rango de Fechas
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Desde</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Hasta</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Time Slot */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4" />
              Franja Horaria
            </label>
            <select
              value={filters.timeSlot}
              onChange={(e) => onFilterChange({ ...filters, timeSlot: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
            >
              {timeSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-between gap-3">
          <button
            onClick={handleReset}
            className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
          >
            Restablecer
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              className="px-6 py-2.5 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052a3] transition-colors font-medium"
            >
              Aplicar Filtros
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
