import React, { useState } from 'react';
import { ChevronLeft, Save, RotateCcw, Info } from 'lucide-react';

interface ToothStatus {
  id: number;
  status: string;
  note: string;
}

const toothStatuses = [
  { value: 'healthy', label: 'Sano', color: '#FFFFFF', borderColor: '#D1D5DB' },
  { value: 'cavity', label: 'Caries', color: '#7C2D12', borderColor: '#7C2D12' },
  { value: 'filled', label: 'Restaurado', color: '#3B82F6', borderColor: '#3B82F6' },
  { value: 'extracted', label: 'Extracción', color: '#EF4444', borderColor: '#EF4444' },
  { value: 'implant', label: 'Implante', color: '#10B981', borderColor: '#10B981' },
  { value: 'endodontics', label: 'Endodoncia', color: '#F59E0B', borderColor: '#F59E0B' },
  { value: 'crown', label: 'Corona', color: '#8B5CF6', borderColor: '#8B5CF6' },
  { value: 'bridge', label: 'Puente', color: '#EC4899', borderColor: '#EC4899' },
];

export function Odontogram() {
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothData, setToothData] = useState<Record<number, ToothStatus>>({});
  const [selectedStatus, setSelectedStatus] = useState('healthy');

  // Numeración dental internacional (FDI)
  const upperTeeth = [
    [18, 17, 16, 15, 14, 13, 12, 11],
    [21, 22, 23, 24, 25, 26, 27, 28],
  ];

  const lowerTeeth = [
    [48, 47, 46, 45, 44, 43, 42, 41],
    [31, 32, 33, 34, 35, 36, 37, 38],
  ];

  const handleToothClick = (toothId: number) => {
    setSelectedTooth(toothId);
  };

  const applyStatus = () => {
    if (selectedTooth) {
      setToothData({
        ...toothData,
        [selectedTooth]: {
          id: selectedTooth,
          status: selectedStatus,
          note: '',
        },
      });
    }
  };

  const getToothColor = (toothId: number) => {
    const tooth = toothData[toothId];
    if (!tooth) return { bg: '#FFFFFF', border: '#D1D5DB' };
    
    const status = toothStatuses.find(s => s.value === tooth.status);
    return { bg: status?.color || '#FFFFFF', border: status?.borderColor || '#D1D5DB' };
  };

  const historyRecords = [
    { date: '2026-02-20', tooth: '16', treatment: 'Restauración', doctor: 'Dr. Sánchez', status: 'filled' },
    { date: '2025-11-10', tooth: '26', treatment: 'Endodoncia', doctor: 'Dr. Torres', status: 'endodontics' },
    { date: '2025-08-15', tooth: '36', treatment: 'Extracción', doctor: 'Dra. Martínez', status: 'extracted' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Odontograma</h1>
          <p className="text-gray-500 mt-1">Ana García Martínez - Registro dental completo</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <RotateCcw className="w-4 h-4" />
            Restablecer
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors">
            <Save className="w-4 h-4" />
            Guardar Cambios
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Odontogram Viewer */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-8">
          {/* Upper Teeth */}
          <div className="mb-12">
            <div className="text-center mb-4">
              <span className="text-sm font-medium text-gray-500">Arcada Superior</span>
            </div>
            
            <div className="flex justify-center gap-8">
              {/* Right Side */}
              <div className="flex gap-1">
                {upperTeeth[0].map((toothId) => {
                  const colors = getToothColor(toothId);
                  return (
                    <div key={toothId} className="flex flex-col items-center">
                      <div
                        onClick={() => handleToothClick(toothId)}
                        className={`w-12 h-16 rounded-t-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                          selectedTooth === toothId ? 'ring-4 ring-blue-300 scale-110' : ''
                        }`}
                        style={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                        }}
                      />
                      <span className="text-xs mt-1 font-medium text-gray-600">{toothId}</span>
                    </div>
                  );
                })}
              </div>

              {/* Left Side */}
              <div className="flex gap-1">
                {upperTeeth[1].map((toothId) => {
                  const colors = getToothColor(toothId);
                  return (
                    <div key={toothId} className="flex flex-col items-center">
                      <div
                        onClick={() => handleToothClick(toothId)}
                        className={`w-12 h-16 rounded-t-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                          selectedTooth === toothId ? 'ring-4 ring-blue-300 scale-110' : ''
                        }`}
                        style={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                        }}
                      />
                      <span className="text-xs mt-1 font-medium text-gray-600">{toothId}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Divider Line */}
          <div className="border-t-2 border-gray-300 my-8"></div>

          {/* Lower Teeth */}
          <div>
            <div className="flex justify-center gap-8">
              {/* Right Side */}
              <div className="flex gap-1">
                {lowerTeeth[0].map((toothId) => {
                  const colors = getToothColor(toothId);
                  return (
                    <div key={toothId} className="flex flex-col items-center">
                      <span className="text-xs mb-1 font-medium text-gray-600">{toothId}</span>
                      <div
                        onClick={() => handleToothClick(toothId)}
                        className={`w-12 h-16 rounded-b-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                          selectedTooth === toothId ? 'ring-4 ring-blue-300 scale-110' : ''
                        }`}
                        style={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Left Side */}
              <div className="flex gap-1">
                {lowerTeeth[1].map((toothId) => {
                  const colors = getToothColor(toothId);
                  return (
                    <div key={toothId} className="flex flex-col items-center">
                      <span className="text-xs mb-1 font-medium text-gray-600">{toothId}</span>
                      <div
                        onClick={() => handleToothClick(toothId)}
                        className={`w-12 h-16 rounded-b-lg border-2 cursor-pointer transition-all hover:shadow-lg ${
                          selectedTooth === toothId ? 'ring-4 ring-blue-300 scale-110' : ''
                        }`}
                        style={{
                          backgroundColor: colors.bg,
                          borderColor: colors.border,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="text-center mt-4">
              <span className="text-sm font-medium text-gray-500">Arcada Inferior</span>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Leyenda de Estados</h4>
            <div className="flex flex-wrap gap-4">
              {toothStatuses.map((status) => (
                <div key={status.value} className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded border-2"
                    style={{
                      backgroundColor: status.color,
                      borderColor: status.borderColor,
                    }}
                  />
                  <span className="text-sm text-gray-600">{status.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Control Panel */}
        <div className="space-y-6">
          {/* Status Selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Estado del Diente</h3>
            
            {selectedTooth ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    Diente seleccionado: <span className="font-semibold">#{selectedTooth}</span>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Estado
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  >
                    {toothStatuses.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnóstico / Notas
                  </label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                    placeholder="Describe el diagnóstico o tratamiento..."
                  />
                </div>

                <button
                  onClick={applyStatus}
                  className="w-full px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors"
                >
                  Aplicar Estado
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Info className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">
                  Selecciona un diente para editar su estado
                </p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
            <div className="space-y-2">
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Marcar sector completo
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Copiar al historial
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Imprimir odontograma
              </button>
              <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                Exportar a PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Historial de Cambios</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {historyRecords.map((record, index) => (
              <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-[#0066CC] rounded-lg flex items-center justify-center text-white font-semibold">
                  {record.tooth}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-gray-900">{record.treatment}</h4>
                    <span
                      className="px-2 py-1 rounded text-xs font-medium"
                      style={{
                        backgroundColor: toothStatuses.find(s => s.value === record.status)?.color + '20',
                        color: toothStatuses.find(s => s.value === record.status)?.borderColor,
                      }}
                    >
                      {toothStatuses.find(s => s.value === record.status)?.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    {record.doctor} • {record.date}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
