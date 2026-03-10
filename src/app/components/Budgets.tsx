import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  FileDown,
  FileSpreadsheet,
  Share2,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { downloadBudgetPDF, printBudgetPDF, exportBudgetToCSV } from '../utils/pdfGenerator';
import { toast } from 'sonner';

interface BudgetItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface Budget {
  id: number;
  patient: string;
  date: Date;
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'rejected';
  items: BudgetItem[];
  total: number;
  doctor: string;
}

export function Budgets() {
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const budgets: Budget[] = [
    {
      id: 1,
      patient: 'Ana García Martínez',
      date: new Date(2026, 1, 20),
      status: 'approved',
      items: [
        { id: 1, description: 'Limpieza dental profunda', quantity: 1, unitPrice: 80, total: 80 },
        { id: 2, description: 'Blanqueamiento dental', quantity: 1, unitPrice: 350, total: 350 },
      ],
      total: 430,
      doctor: 'Dr. Sánchez',
    },
    {
      id: 2,
      patient: 'Carlos López Fernández',
      date: new Date(2026, 1, 18),
      status: 'in_progress',
      items: [
        { id: 1, description: 'Ortodoncia completa (24 meses)', quantity: 1, unitPrice: 3500, total: 3500 },
        { id: 2, description: 'Consultas mensuales', quantity: 24, unitPrice: 50, total: 1200 },
      ],
      total: 4700,
      doctor: 'Dra. Martínez',
    },
    {
      id: 3,
      patient: 'María Rodríguez Sanz',
      date: new Date(2026, 1, 15),
      status: 'pending',
      items: [
        { id: 1, description: 'Extracción molar compleja', quantity: 1, unitPrice: 200, total: 200 },
        { id: 2, description: 'Radiografía panorámica', quantity: 1, unitPrice: 45, total: 45 },
        { id: 3, description: 'Medicación post-operatoria', quantity: 1, unitPrice: 30, total: 30 },
      ],
      total: 275,
      doctor: 'Dr. Torres',
    },
    {
      id: 4,
      patient: 'José Hernández García',
      date: new Date(2026, 1, 10),
      status: 'completed',
      items: [
        { id: 1, description: 'Endodoncia molar', quantity: 1, unitPrice: 400, total: 400 },
        { id: 2, description: 'Corona de porcelana', quantity: 1, unitPrice: 600, total: 600 },
      ],
      total: 1000,
      doctor: 'Dr. Sánchez',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
      approved: { label: 'Aprobado', color: 'bg-blue-100 text-blue-700', icon: CheckCircle2 },
      in_progress: { label: 'En Proceso', color: 'bg-purple-100 text-purple-700', icon: Clock },
      completed: { label: 'Finalizado', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
      rejected: { label: 'Rechazado', color: 'bg-red-100 text-red-700', icon: XCircle },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  const addBudgetItem = () => {
    const newId = Math.max(...budgetItems.map(item => item.id), 0) + 1;
    setBudgetItems([...budgetItems, { id: newId, description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeBudgetItem = (id: number) => {
    setBudgetItems(budgetItems.filter(item => item.id !== id));
  };

  const updateBudgetItem = (id: number, field: keyof BudgetItem, value: any) => {
    setBudgetItems(budgetItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return budgetItems.reduce((sum, item) => sum + item.total, 0);
  };

  const filteredBudgets = budgets.filter(budget => {
    const matchesSearch = budget.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      budget.id.toString().padStart(4, '0').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || budget.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (selectedBudget) {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={() => setSelectedBudget(null)}
              className="text-[#0066CC] hover:underline mb-2 flex items-center gap-2"
            >
              ← Volver a presupuestos
            </button>
            <h1 className="text-2xl font-semibold text-gray-900">
              Presupuesto #{selectedBudget.id.toString().padStart(4, '0')}
            </h1>
            <p className="text-gray-500 mt-1">{selectedBudget.patient}</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(selectedBudget.status)}
            <div className="relative">
              <button
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      const clinicInfo = {
                        name: 'DentalCare Pro',
                        address: 'Calle Mayor 123, 28013 Madrid, España',
                        phone: '+34 91 123 45 67',
                        email: 'info@dentalcarepro.com',
                        website: 'www.dentalcarepro.com',
                        taxId: 'B-12345678'
                      };
                      const patientInfo = {
                        phone: '+34 612 345 678',
                        email: 'paciente@email.com',
                        address: 'Calle Ejemplo 45, Madrid'
                      };
                      downloadBudgetPDF(selectedBudget, patientInfo, clinicInfo);
                      setShowExportMenu(false);
                      toast.success('PDF descargado correctamente');
                    }}
                  >
                    <FileDown className="w-4 h-4" />
                    Descargar PDF
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      exportBudgetToCSV(selectedBudget);
                      setShowExportMenu(false);
                      toast.success('CSV exportado correctamente');
                    }}
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Exportar a Excel (CSV)
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors border-t border-gray-100"
                    onClick={() => {
                      const clinicInfo = {
                        name: 'DentalCare Pro',
                        address: 'Calle Mayor 123, 28013 Madrid, España',
                        phone: '+34 91 123 45 67',
                        email: 'info@dentalcarepro.com',
                        website: 'www.dentalcarepro.com',
                        taxId: 'B-12345678'
                      };
                      const patientInfo = {
                        phone: '+34 612 345 678',
                        email: 'paciente@email.com',
                        address: 'Calle Ejemplo 45, Madrid'
                      };
                      printBudgetPDF(selectedBudget, patientInfo, clinicInfo);
                      setShowExportMenu(false);
                      toast.success('Abriendo vista de impresión...');
                    }}
                  >
                    <Printer className="w-4 h-4" />
                    Imprimir
                  </button>
                  <button
                    className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => {
                      // Copiar link al portapapeles
                      navigator.clipboard.writeText(window.location.href);
                      setShowExportMenu(false);
                      toast.success('Enlace copiado al portapapeles');
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir enlace
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Budget Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {/* Header Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Información del Paciente</h3>
              <div className="space-y-2">
                <p className="text-gray-900 font-medium">{selectedBudget.patient}</p>
                <p className="text-sm text-gray-600">Teléfono: +34 612 345 678</p>
                <p className="text-sm text-gray-600">Email: paciente@email.com</p>
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-4">Información del Presupuesto</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  Fecha: {format(selectedBudget.date, 'dd MMMM yyyy', { locale: es })}
                </p>
                <p className="text-sm text-gray-600">Odontólogo: {selectedBudget.doctor}</p>
                <p className="text-sm text-gray-600">Presupuesto Nº: {selectedBudget.id.toString().padStart(4, '0')}</p>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Detalle de Tratamientos</h3>
            <div className="border border-gray-200 rounded-lg overflow-hidden">

              {/* TABLA — visible solo en sm+ */}
              <table className="hidden sm:table w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {selectedBudget.items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 text-sm text-gray-900">{item.description}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-center">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-900 text-right">${item.unitPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 text-right">${item.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* CARDS — visible solo en móvil */}
              <div className="sm:hidden divide-y divide-gray-200 bg-white">
                {selectedBudget.items.map((item) => (
                  <div key={item.id} className="p-4">
                    <p className="text-sm font-medium text-gray-900">{item.description}</p>
                    <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
                      <span>Cant: <span className="font-medium text-gray-900">{item.quantity}</span></span>
                      <span>P.Unit: <span className="font-medium text-gray-900">${item.unitPrice.toFixed(2)}</span></span>
                      <span className="font-semibold text-gray-900">${item.total.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-80 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal:</span>
                <span className="text-gray-900">${selectedBudget.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">IVA (21%):</span>
                <span className="text-gray-900">${(selectedBudget.total * 0.21).toFixed(2)}</span>
              </div>
              <div className="pt-3 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900">Total:</span>
                  <span className="text-2xl font-bold text-[#0066CC]">
                    ${(selectedBudget.total * 1.21).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Notas y Observaciones</h3>
            <p className="text-sm text-gray-600">
              Este presupuesto tiene una validez de 30 días desde la fecha de emisión.
              Los precios incluyen materiales y mano de obra. Posibilidad de financiación disponible.
            </p>
          </div>
        </div>

        {/* Actions */}
        {selectedBudget.status === 'pending' && (
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Acciones del Presupuesto</h3>
            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Aprobar Presupuesto
              </button>
              <button className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Editar Presupuesto
              </button>
              <button className="flex-1 px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors">
                Rechazar Presupuesto
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Presupuestos y Tratamientos</h1>
          <p className="text-gray-500 mt-1">Gestiona los planes de tratamiento de tus pacientes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052A3] transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nuevo Presupuesto
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por paciente o número de presupuesto..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
              />
            </div>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="approved">Aprobado</option>
            <option value="in_progress">En Proceso</option>
            <option value="completed">Finalizado</option>
            <option value="rejected">Rechazado</option>
          </select>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="w-5 h-5" />
            Más filtros
          </button>
        </div>
      </div>

      {/* Budgets Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

        {/* TABLA — visible solo en md+ */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº Presupuesto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Odontólogo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBudgets.map((budget) => (
                <tr
                  key={budget.id}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setSelectedBudget(budget)}
                >
                  <td className="px-6 py-4">
                    <span className="text-sm font-medium text-gray-900">
                      #{budget.id.toString().padStart(4, '0')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{budget.patient}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 hidden lg:table-cell">
                    {format(budget.date, 'dd/MM/yyyy', { locale: es })}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">
                    {budget.doctor}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(budget.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-semibold text-gray-900">
                      ${budget.total.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => { e.stopPropagation(); setSelectedBudget(budget); }}
                      >
                        <Eye className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Edit className="w-4 h-4 text-gray-400" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CARDS — visible solo en móvil */}
        <div className="md:hidden divide-y divide-gray-200">
          {filteredBudgets.map((budget) => (
            <div
              key={budget.id}
              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedBudget(budget)}
            >
              {/* Fila superior: número + estado */}
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="font-semibold text-gray-900">
                    #{budget.id.toString().padStart(4, '0')}
                  </span>
                  <p className="text-sm text-gray-800 mt-0.5 truncate">{budget.patient}</p>
                </div>
                {getStatusBadge(budget.status)}
              </div>

              {/* Fecha + doctor + total */}
              <div className="mt-3 flex items-end justify-between text-sm text-gray-600">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                    <span>{format(budget.date, 'dd/MM/yyyy', { locale: es })}</span>
                  </div>
                  <div className="text-gray-500">{budget.doctor}</div>
                </div>
                <span className="text-lg font-bold text-gray-900">${budget.total.toFixed(2)}</span>
              </div>

              {/* Acciones */}
              <div className="mt-3 flex justify-end gap-2">
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={(e) => { e.stopPropagation(); setSelectedBudget(budget); }}
                >
                  <Eye className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Download className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* New Budget Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Crear Nuevo Presupuesto</h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Patient and Doctor Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Paciente</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]">
                    <option>Seleccionar paciente</option>
                    <option>Ana García Martínez</option>
                    <option>Carlos López Fernández</option>
                    <option>María Rodríguez Sanz</option>
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

              {/* Budget Items */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Tratamientos</label>
                  <button
                    onClick={addBudgetItem}
                    className="flex items-center gap-1 text-sm text-[#0066CC] hover:underline"
                  >
                    <Plus className="w-4 h-4" />
                    Agregar tratamiento
                  </button>
                </div>

                <div className="space-y-3">
                  {budgetItems.map((item, index) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg space-y-3">
                      {/* Descripción — fila completa */}
                      <input
                        type="text"
                        placeholder="Descripción del tratamiento"
                        value={item.description}
                        onChange={(e) => updateBudgetItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-sm"
                      />
                      {/* Cantidad + Precio + Total + Eliminar */}
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Cant.</label>
                          <input
                            type="number"
                            placeholder="1"
                            value={item.quantity}
                            onChange={(e) => updateBudgetItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Precio</label>
                          <input
                            type="number"
                            placeholder="0.00"
                            value={item.unitPrice}
                            onChange={(e) => updateBudgetItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC] text-sm"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-500 mb-1">Total</label>
                          <span className="block px-3 py-2 text-sm font-semibold text-gray-900">
                            ${item.total.toFixed(2)}
                          </span>
                        </div>
                        {budgetItems.length > 1 && (
                          <button
                            onClick={() => removeBudgetItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end">
                  <div className="w-full sm:w-80 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">${calculateTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IVA (21%):</span>
                      <span className="text-gray-900">${(calculateTotal() * 0.21).toFixed(2)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-200">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total:</span>
                        <span className="text-xl font-bold text-[#0066CC]">
                          ${(calculateTotal() * 1.21).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas y Observaciones
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0066CC]"
                  placeholder="Información adicional sobre el presupuesto..."
                ></textarea>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row justify-end gap-3">
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
                Crear Presupuesto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}