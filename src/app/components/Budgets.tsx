import React, { useState } from 'react';
import {
  Plus, Search, Download, Eye, Edit, Trash2,
  CheckCircle2, Clock, XCircle, FileDown, FileSpreadsheet,
  Share2, Calendar, ChevronRight, FileText, User, Hash,
  Printer, TrendingUp, ArrowUpRight, X
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

const STATUS_CONFIG = {
  pending:     { label: 'Pendiente',  bg: 'bg-amber-50',   text: 'text-amber-700',   border: 'border-amber-200',   dot: 'bg-amber-400',   icon: Clock },
  approved:    { label: 'Aprobado',   bg: 'bg-blue-50',    text: 'text-blue-700',    border: 'border-blue-200',    dot: 'bg-blue-500',    icon: CheckCircle2 },
  in_progress: { label: 'En Proceso', bg: 'bg-purple-50',  text: 'text-purple-700',  border: 'border-purple-200',  dot: 'bg-purple-500',  icon: Clock },
  completed:   { label: 'Finalizado', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle2 },
  rejected:    { label: 'Rechazado',  bg: 'bg-red-50',     text: 'text-red-700',     border: 'border-red-200',     dot: 'bg-red-500',     icon: XCircle },
};

export function Budgets() {
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: 1, description: '', quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const budgets: Budget[] = [
    {
      id: 1, patient: 'Ana García Martínez', date: new Date(2026, 1, 20), status: 'approved',
      items: [
        { id: 1, description: 'Limpieza dental profunda', quantity: 1, unitPrice: 80, total: 80 },
        { id: 2, description: 'Blanqueamiento dental', quantity: 1, unitPrice: 350, total: 350 },
      ],
      total: 430, doctor: 'Dr. Sánchez',
    },
    {
      id: 2, patient: 'Carlos López Fernández', date: new Date(2026, 1, 18), status: 'in_progress',
      items: [
        { id: 1, description: 'Ortodoncia completa (24 meses)', quantity: 1, unitPrice: 3500, total: 3500 },
        { id: 2, description: 'Consultas mensuales', quantity: 24, unitPrice: 50, total: 1200 },
      ],
      total: 4700, doctor: 'Dra. Martínez',
    },
    {
      id: 3, patient: 'María Rodríguez Sanz', date: new Date(2026, 1, 15), status: 'pending',
      items: [
        { id: 1, description: 'Extracción molar compleja', quantity: 1, unitPrice: 200, total: 200 },
        { id: 2, description: 'Radiografía panorámica', quantity: 1, unitPrice: 45, total: 45 },
        { id: 3, description: 'Medicación post-operatoria', quantity: 1, unitPrice: 30, total: 30 },
      ],
      total: 275, doctor: 'Dr. Torres',
    },
    {
      id: 4, patient: 'José Hernández García', date: new Date(2026, 1, 10), status: 'completed',
      items: [
        { id: 1, description: 'Endodoncia molar', quantity: 1, unitPrice: 400, total: 400 },
        { id: 2, description: 'Corona de porcelana', quantity: 1, unitPrice: 600, total: 600 },
      ],
      total: 1000, doctor: 'Dr. Sánchez',
    },
  ];

  const totalAmount    = budgets.reduce((s, b) => s + b.total, 0);
  const approvedAmount = budgets.filter(b => b.status === 'approved' || b.status === 'completed').reduce((s, b) => s + b.total, 0);
  const pendingCount   = budgets.filter(b => b.status === 'pending').length;
  const inProgressCount = budgets.filter(b => b.status === 'in_progress').length;
  const approvedPct    = totalAmount > 0 ? Math.round((approvedAmount / totalAmount) * 100) : 0;

  const filteredBudgets = budgets.filter(b => {
    const q = searchTerm.toLowerCase();
    return (b.patient.toLowerCase().includes(q) || b.id.toString().padStart(4, '0').includes(q))
      && (statusFilter === 'all' || b.status === statusFilter);
  });

  const StatusBadge = ({ status }: { status: Budget['status'] }) => {
    const c = STATUS_CONFIG[status];
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    );
  };

  const addBudgetItem = () => {
    const newId = Math.max(...budgetItems.map(i => i.id), 0) + 1;
    setBudgetItems([...budgetItems, { id: newId, description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  };
  const removeBudgetItem = (id: number) => setBudgetItems(budgetItems.filter(i => i.id !== id));
  const updateBudgetItem = (id: number, field: keyof BudgetItem, value: number | string) => {
    setBudgetItems(budgetItems.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'unitPrice') updated.total = (updated.quantity as number) * (updated.unitPrice as number);
      return updated;
    }));
  };
  const calculateTotal = () => budgetItems.reduce((s, i) => s + i.total, 0);

  const clinicInfo  = { name: 'DentalCare Pro', address: 'Av. Amazonas N24-03, 170135 Quito', phone: '+593 2 234 5678', email: 'info@dentalcarepro.com', website: 'www.dentalcarepro.com', taxId: 'B-12345678' };
  const patientInfo = { phone: '+593 98 765 4321', email: 'paciente@email.com', address: 'Av. Naciones Unidas E3-33, Quito' };

  // ── DETAIL VIEW ────────────────────────────────────────────────
  if (selectedBudget) {
    return (
      <div className="min-h-screen bg-gray-50/60">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-5">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <button
                onClick={() => setSelectedBudget(null)}
                className="text-sm text-[#0066CC] hover:underline mb-2 flex items-center gap-1.5 font-medium"
              >
                &larr; Volver a presupuestos
              </button>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                  Presupuesto #{selectedBudget.id.toString().padStart(4, '0')}
                </h1>
                <StatusBadge status={selectedBudget.status} />
              </div>
              <p className="text-sm text-gray-500 mt-1">{selectedBudget.patient}</p>
            </div>
            <div className="relative shrink-0">
              <button
                onClick={() => setShowExportMenu(!showExportMenu)}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              {showExportMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-xl z-10 overflow-hidden">
                  {[
                    { icon: FileDown, label: 'Descargar PDF', action: () => { downloadBudgetPDF(selectedBudget, patientInfo, clinicInfo); toast.success('PDF descargado'); } },
                    { icon: FileSpreadsheet, label: 'Exportar CSV', action: () => { exportBudgetToCSV(selectedBudget); toast.success('CSV exportado'); } },
                    { icon: Printer, label: 'Imprimir', action: () => { printBudgetPDF(selectedBudget, patientInfo, clinicInfo); toast.success('Abriendo impresión...'); } },
                    { icon: Share2, label: 'Compartir enlace', action: () => { navigator.clipboard.writeText(window.location.href); toast.success('Enlace copiado'); } },
                  ].map(({ icon: Icon, label, action }) => (
                    <button
                      key={label}
                      onClick={() => { action(); setShowExportMenu(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Icon className="w-4 h-4 text-gray-400" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Info card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-6">

            {/* Patient + Budget info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" /> Paciente
                </p>
                <p className="font-semibold text-gray-900">{selectedBudget.patient}</p>
                <p className="text-sm text-gray-500 mt-1">Teléfono: +593 98 765 4321</p>
                <p className="text-sm text-gray-500">Email: paciente@email.com</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" /> Presupuesto
                </p>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Fecha</span>
                    <span className="font-medium text-gray-800">{format(selectedBudget.date, 'dd MMM yyyy', { locale: es })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Odontólogo</span>
                    <span className="font-medium text-gray-800">{selectedBudget.doctor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">N° Presupuesto</span>
                    <span className="font-bold text-[#0066CC]">#{selectedBudget.id.toString().padStart(4, '0')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Items */}
            <div>
              <p className="text-sm font-bold text-gray-800 mb-3">Detalle de Tratamientos</p>
              <div className="hidden md:block border border-gray-100 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Descripción</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Cant.</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">P. Unit.</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {selectedBudget.items.map(item => (
                      <tr key={item.id}>
                        <td className="px-4 py-3 text-sm text-gray-800">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 text-center">{item.quantity}</td>
                        <td className="px-4 py-3 text-sm text-gray-800 text-right">${item.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900 text-right">${item.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="md:hidden space-y-2">
                {selectedBudget.items.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-xl p-3.5">
                    <p className="text-sm font-medium text-gray-900 mb-2">{item.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div>
                        <p className="text-gray-400 mb-0.5">Cant.</p>
                        <p className="font-semibold text-gray-800">{item.quantity}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">P. Unit.</p>
                        <p className="font-semibold text-gray-800">${item.unitPrice.toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">Total</p>
                        <p className="font-bold text-gray-900">${item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-800">${selectedBudget.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">IVA (21%)</span>
                <span className="font-medium text-gray-800">${(selectedBudget.total * 0.21).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-2 border-t border-blue-100">
                <span className="text-gray-900">Total</span>
                <span className="text-[#0066CC] text-lg">${(selectedBudget.total * 1.21).toFixed(2)}</span>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-700">
              <span className="font-semibold">Nota:</span> Este presupuesto tiene una validez de 30 días desde la fecha de emisión. Los precios incluyen materiales y mano de obra.
            </div>
          </div>

          {/* Pending actions */}
          {selectedBudget.status === 'pending' && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm font-bold text-gray-800 mb-3">Acciones</p>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <button className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-colors">
                  Aprobar
                </button>
                <button className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
                  Editar
                </button>
                <button className="flex-1 px-4 py-2.5 border border-red-200 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-50 transition-colors">
                  Rechazar
                </button>
              </div>
            </div>
          )}
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
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Presupuestos</h1>
            <p className="text-sm text-gray-500 mt-0.5">Planes de tratamiento y propuestas</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052A3] active:scale-95 transition-all shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Nuevo Presupuesto
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="col-span-2 lg:col-span-1 bg-[#0066CC] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -right-2 -bottom-6 w-20 h-20 bg-white/5 rounded-full" />
            <p className="text-sm font-medium text-blue-100 mb-1">Total Presupuestado</p>
            <p className="text-3xl font-bold">${totalAmount.toFixed(0)}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-200">
              <div className="flex-1 bg-white/20 rounded-full h-1.5">
                <div className="bg-white rounded-full h-1.5 transition-all" style={{ width: `${approvedPct}%` }} />
              </div>
              <span>{approvedPct}% aprobado</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 style={{ width: 18, height: 18 }} className="text-blue-600" />
              </div>
              <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                {budgets.filter(b => b.status === 'approved').length} aprob.
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">Aprobados</p>
            <p className="text-xl font-bold text-gray-900">{budgets.filter(b => b.status === 'approved').length}/{budgets.length}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock style={{ width: 18, height: 18 }} className="text-amber-500" />
              </div>
              <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                {pendingCount} pend.
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">Pendientes</p>
            <p className="text-xl font-bold text-amber-600">{pendingCount}</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-purple-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-purple-50 rounded-xl flex items-center justify-center">
                <TrendingUp style={{ width: 18, height: 18 }} className="text-purple-600" />
              </div>
              <span className="text-xs font-medium text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />activos
              </span>
            </div>
            <p className="text-xs text-gray-500 mb-0.5">En Proceso</p>
            <p className="text-xl font-bold text-purple-600">{inProgressCount}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar paciente o N° presupuesto..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: 'all', label: 'Todos' },
                { key: 'pending', label: 'Pendientes' },
                { key: 'approved', label: 'Aprobados' },
                { key: 'in_progress', label: 'En Proceso' },
                { key: 'completed', label: 'Finalizados' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === key
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

        {/* Budget List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">N°</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Paciente</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Fecha</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Odontólogo</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredBudgets.map(budget => (
                  <tr
                    key={budget.id}
                    onClick={() => setSelectedBudget(budget)}
                    className="group hover:bg-blue-50/40 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-[#0066CC]">#{budget.id.toString().padStart(4, '0')}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {budget.patient.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-gray-800">{budget.patient}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell">
                      {format(budget.date, 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 hidden lg:table-cell">{budget.doctor}</td>
                    <td className="px-5 py-4"><StatusBadge status={budget.status} /></td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900">${budget.total.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={e => { e.stopPropagation(); setSelectedBudget(budget); }} className="p-2 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-[#0066CC] transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={e => e.stopPropagation()} className="p-2 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-[#0066CC] transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={e => e.stopPropagation()} className="p-2 rounded-lg hover:bg-blue-100 text-gray-400 hover:text-[#0066CC] transition-colors">
                          <Download className="w-4 h-4" />
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
            {filteredBudgets.map(budget => (
              <div
                key={budget.id}
                onClick={() => setSelectedBudget(budget)}
                className="p-4 hover:bg-gray-50/80 active:bg-gray-100 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {budget.patient.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{budget.patient}</p>
                      <p className="text-xs text-[#0066CC] font-medium">#{budget.id.toString().padStart(4, '0')}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge status={budget.status} />
                    <span className="text-base font-bold text-gray-900">${budget.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(budget.date, 'dd/MM/yyyy', { locale: es })}
                    </span>
                    <span>{budget.doctor}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={e => e.stopPropagation()} className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors">
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBudgets.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No se encontraron presupuestos</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL — NUEVO PRESUPUESTO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:rounded-2xl sm:max-w-3xl flex flex-col shadow-2xl" style={{ maxHeight: '95vh' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900">Nuevo Presupuesto</h2>
                <p className="text-xs text-gray-400">Completa el plan de tratamiento</p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Paciente *</label>
                  <select className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all">
                    <option value="">Seleccionar paciente...</option>
                    <option>Ana García Martínez</option>
                    <option>Carlos López Fernández</option>
                    <option>María Rodríguez Sanz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Odontólogo *</label>
                  <select className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all">
                    <option value="">Seleccionar...</option>
                    <option>Dr. Sánchez</option>
                    <option>Dra. Martínez</option>
                    <option>Dr. Torres</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800">Tratamientos</p>
                  <button onClick={addBudgetItem} className="text-xs font-semibold text-[#0066CC] hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>
                <div className="space-y-3">
                  {budgetItems.map(item => (
                    <div key={item.id} className="bg-gray-50 rounded-xl p-3.5 space-y-3">
                      <input
                        type="text"
                        placeholder="Descripción del tratamiento"
                        value={item.description}
                        onChange={e => updateBudgetItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all"
                      />
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Cant.</label>
                          <input type="number" value={item.quantity} min="1" onChange={e => updateBudgetItem(item.id, 'quantity', parseInt(e.target.value) || 0)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Precio</label>
                          <input type="number" value={item.unitPrice} min="0" step="0.01" onChange={e => updateBudgetItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 mb-1">Total</label>
                          <span className="block px-3 py-2 text-sm font-bold text-gray-900">${item.total.toFixed(2)}</span>
                        </div>
                        {budgetItems.length > 1 && (
                          <button onClick={() => removeBudgetItem(item.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-gray-800">${calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">IVA (21%)</span>
                  <span className="font-medium text-gray-800">${(calculateTotal() * 0.21).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-blue-100">
                  <span className="text-gray-900">Total</span>
                  <span className="text-[#0066CC] text-lg">${(calculateTotal() * 1.21).toFixed(2)}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Notas (opcional)</label>
                <textarea rows={3} placeholder="Observaciones o condiciones del presupuesto..." className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all resize-none" />
              </div>
            </div>

            <div className="px-5 py-4 border-t border-gray-100 flex flex-col-reverse sm:flex-row gap-2.5 shrink-0">
              <button onClick={() => setShowModal(false)} className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={() => { toast.success('Presupuesto creado correctamente'); setShowModal(false); }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052A3] transition-colors"
              >
                <FileText className="w-4 h-4" />
                Crear Presupuesto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}