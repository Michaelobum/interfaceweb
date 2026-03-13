import React, { useState } from 'react';
import {
  Plus, Search, Download, Eye, Send, CheckCircle2, Clock,
  AlertCircle, DollarSign, TrendingUp, X, Save, Trash2,
  CreditCard, Banknote, ArrowUpRight, ChevronRight, FileText,
  Calendar, User, Hash
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import { downloadInvoicePDF } from '../utils/invoiceGenerator';

interface InvoiceItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  patient: string;
  patientId: string;
  date: Date;
  dueDate: Date;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  notes?: string;
}

const STATUS_CONFIG = {
  paid:      { label: 'Pagada',    bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700/50', dot: 'bg-emerald-500', icon: CheckCircle2 },
  pending:   { label: 'Pendiente', bg: 'bg-amber-50 dark:bg-amber-900/20',     text: 'text-amber-700 dark:text-amber-300',     border: 'border-amber-200 dark:border-amber-700/50',     dot: 'bg-amber-400',   icon: Clock },
  overdue:   { label: 'Vencida',   bg: 'bg-red-50 dark:bg-red-900/20',         text: 'text-red-700 dark:text-red-300',         border: 'border-red-200 dark:border-red-700/50',         dot: 'bg-red-500',     icon: AlertCircle },
  cancelled: { label: 'Cancelada', bg: 'bg-gray-50 dark:bg-gray-800',          text: 'text-gray-500 dark:text-gray-400',       border: 'border-gray-200 dark:border-gray-700',          dot: 'bg-gray-400',    icon: X },
};

export function Billing() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showNewInvoiceModal, setShowNewInvoiceModal] = useState(false);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([
    { id: 1, description: '', quantity: 1, unitPrice: 0, tax: 21, total: 0 }
  ]);

  const invoices: Invoice[] = [
    { id: 1, invoiceNumber: 'FAC-2026-001', patient: 'Ana García Martínez', patientId: 'PAC-001', date: new Date(2026, 2, 1), dueDate: new Date(2026, 2, 15), status: 'paid', items: [{ id: 1, description: 'Limpieza dental profunda', quantity: 1, unitPrice: 80, tax: 21, total: 96.80 }, { id: 2, description: 'Blanqueamiento dental', quantity: 1, unitPrice: 300, tax: 21, total: 363 }], subtotal: 380, tax: 79.80, total: 459.80, paymentMethod: 'Tarjeta de crédito', notes: 'Pago realizado en clínica' },
    { id: 2, invoiceNumber: 'FAC-2026-002', patient: 'Carlos Rodríguez López', patientId: 'PAC-002', date: new Date(2026, 2, 3), dueDate: new Date(2026, 2, 17), status: 'pending', items: [{ id: 1, description: 'Ortodoncia invisible - Cuota 1/12', quantity: 1, unitPrice: 250, tax: 21, total: 302.50 }], subtotal: 250, tax: 52.50, total: 302.50, notes: 'Pago mensual de ortodoncia' },
    { id: 3, invoiceNumber: 'FAC-2026-003', patient: 'María Fernández Ruiz', patientId: 'PAC-003', date: new Date(2026, 1, 28), dueDate: new Date(2026, 2, 14), status: 'overdue', items: [{ id: 1, description: 'Extracción molar', quantity: 1, unitPrice: 120, tax: 21, total: 145.20 }, { id: 2, description: 'Radiografía panorámica', quantity: 1, unitPrice: 45, tax: 21, total: 54.45 }], subtotal: 165, tax: 34.65, total: 199.65, notes: 'Recordar enviar recordatorio de pago' },
    { id: 4, invoiceNumber: 'FAC-2026-004', patient: 'Pedro Sánchez Gómez', patientId: 'PAC-004', date: new Date(2026, 2, 2), dueDate: new Date(2026, 2, 16), status: 'paid', items: [{ id: 1, description: 'Implante dental', quantity: 1, unitPrice: 800, tax: 21, total: 968 }, { id: 2, description: 'Corona de porcelana', quantity: 1, unitPrice: 450, tax: 21, total: 544.50 }], subtotal: 1250, tax: 262.50, total: 1512.50, paymentMethod: 'Transferencia bancaria' },
    { id: 5, invoiceNumber: 'FAC-2026-005', patient: 'Laura Martínez Torres', patientId: 'PAC-005', date: new Date(2026, 2, 4), dueDate: new Date(2026, 2, 18), status: 'pending', items: [{ id: 1, description: 'Endodoncia', quantity: 1, unitPrice: 280, tax: 21, total: 338.80 }], subtotal: 280, tax: 58.80, total: 338.80 },
  ];

  const totalInvoiced = invoices.reduce((s, i) => s + i.total, 0);
  const totalPaid     = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.total, 0);
  const totalPending  = invoices.filter(i => i.status === 'pending').reduce((s, i) => s + i.total, 0);
  const totalOverdue  = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + i.total, 0);

  const filteredInvoices = invoices.filter(inv => {
    const q = searchTerm.toLowerCase();
    return (inv.patient.toLowerCase().includes(q) || inv.invoiceNumber.toLowerCase().includes(q))
      && (statusFilter === 'all' || inv.status === statusFilter);
  });

  const StatusBadge = ({ status }: { status: Invoice['status'] }) => {
    const c = STATUS_CONFIG[status];
    const Icon = c.icon;
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${c.bg} ${c.text} ${c.border}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
        {c.label}
      </span>
    );
  };

  const addInvoiceItem = () => setInvoiceItems(items => [...items, { id: items.length + 1, description: '', quantity: 1, unitPrice: 0, tax: 21, total: 0 }]);
  const removeInvoiceItem = (id: number) => { if (invoiceItems.length > 1) setInvoiceItems(items => items.filter(i => i.id !== id)); };
  const updateInvoiceItem = (id: number, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(items => items.map(item => {
      if (item.id !== id) return item;
      const updated = { ...item, [field]: value };
      if (['quantity', 'unitPrice', 'tax'].includes(field)) {
        const sub = updated.quantity * updated.unitPrice;
        updated.total = sub * (1 + updated.tax / 100);
      }
      return updated;
    }));
  };
  const calcTotals = () => {
    const subtotal = invoiceItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    const tax = invoiceItems.reduce((s, i) => s + i.quantity * i.unitPrice * i.tax / 100, 0);
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleDownloadPDF = (invoice: Invoice) => {
    downloadInvoicePDF(invoice, { phone: '+593 98 765 4321', email: 'paciente@email.com', address: 'Av. Naciones Unidas E3-33, Quito', taxId: '12345678Z' }, { name: 'DentalCare Pro', address: 'Av. Amazonas N24-03, 170135 Quito', phone: '+593 2 234 5678', email: 'info@dentalcarepro.com', website: 'www.dentalcarepro.com', taxId: 'B-12345678' });
    toast.success('Factura descargada correctamente');
  };

  const paidPct = totalInvoiced > 0 ? Math.round((totalPaid / totalInvoiced) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50/60 dark:bg-gray-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Facturación</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Gestión de facturas y cobros</p>
          </div>
          <button
            onClick={() => setShowNewInvoiceModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052a3] active:scale-95 transition-all shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Nueva Factura
          </button>
        </div>

        {/* ── Metric Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total */}
          <div className="col-span-2 lg:col-span-1 bg-[#0066CC] rounded-2xl p-5 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -right-2 -bottom-6 w-20 h-20 bg-white/5 rounded-full" />
            <p className="text-sm font-medium text-blue-100 mb-1">Total Facturado</p>
            <p className="text-3xl font-bold">${totalInvoiced.toFixed(0)}</p>
            <div className="mt-3 flex items-center gap-1.5 text-xs text-blue-200">
              <div className="flex-1 bg-white/20 rounded-full h-1.5">
                <div className="bg-white rounded-full h-1.5 transition-all" style={{ width: `${paidPct}%` }} />
              </div>
              <span>{paidPct}% cobrado</span>
            </div>
          </div>

          {/* Cobrado */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" style={{ width: 18, height: 18 }} />
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full flex items-center gap-0.5">
                <ArrowUpRight className="w-3 h-3" />12%
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Cobrado</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">${totalPaid.toFixed(0)}</p>
          </div>

          {/* Pendiente */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center">
                <Clock className="w-4.5 h-4.5 text-amber-500" style={{ width: 18, height: 18 }} />
              </div>
              <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {invoices.filter(i => i.status === 'pending').length} fact.
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Pendiente</p>
            <p className="text-xl font-bold text-amber-600">${totalPending.toFixed(0)}</p>
          </div>

          {/* Vencido */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-red-100 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center">
                <AlertCircle className="w-4.5 h-4.5 text-red-500" style={{ width: 18, height: 18 }} />
              </div>
              <span className="text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                {invoices.filter(i => i.status === 'overdue').length} vencida
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Vencido</p>
            <p className="text-xl font-bold text-red-600">${totalOverdue.toFixed(0)}</p>
          </div>
        </div>

        {/* ── Filters ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar paciente o N° factura…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {(['all', 'paid', 'pending', 'overdue'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === s
                      ? 'bg-[#0066CC] text-white shadow-sm'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {s === 'all' ? 'Todas' : STATUS_CONFIG[s].label + 's'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Invoice List ── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">

          {/* Desktop Table */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Factura</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Paciente</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:table-cell">Emisión</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider hidden lg:table-cell">Vencimiento</th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-5 py-3.5 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {filteredInvoices.map(invoice => (
                  <tr
                    key={invoice.id}
                    onClick={() => { setSelectedInvoice(invoice); setShowModal(true); }}
                    className="group hover:bg-blue-50/40 dark:hover:bg-blue-900/20 cursor-pointer transition-colors"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-bold text-[#0066CC]">{invoice.invoiceNumber}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {invoice.patient.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{invoice.patient}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                      {format(invoice.date, 'dd MMM yyyy', { locale: es })}
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className={`text-sm ${invoice.status === 'overdue' ? 'text-red-600 font-semibold' : 'text-gray-500 dark:text-gray-400'}`}>
                        {format(invoice.dueDate, 'dd MMM yyyy', { locale: es })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={invoice.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold text-gray-900 dark:text-white">${invoice.total.toFixed(2)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedInvoice(invoice); setShowModal(true); }}
                          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-400 hover:text-[#0066CC] transition-colors"
                          title="Ver detalle"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => { e.stopPropagation(); handleDownloadPDF(invoice); }}
                          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-400 hover:text-[#0066CC] transition-colors"
                          title="Descargar PDF"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          onClick={e => e.stopPropagation()}
                          className="p-2 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-400 hover:text-[#0066CC] transition-colors"
                          title="Enviar"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-50 dark:divide-gray-800">
            {filteredInvoices.map(invoice => (
              <div
                key={invoice.id}
                onClick={() => { setSelectedInvoice(invoice); setShowModal(true); }}
                className="p-4 hover:bg-gray-50/80 dark:hover:bg-gray-800 active:bg-gray-100 dark:active:bg-gray-700 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                      {invoice.patient.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{invoice.patient}</p>
                      <p className="text-xs text-[#0066CC] font-medium">{invoice.invoiceNumber}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <StatusBadge status={invoice.status} />
                    <span className="text-base font-bold text-gray-900 dark:text-white">${invoice.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-400 dark:text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(invoice.date, 'dd/MM/yyyy')}
                    </span>
                    <span className={`flex items-center gap-1 ${invoice.status === 'overdue' ? 'text-red-500 font-semibold' : ''}`}>
                      <Clock className="w-3.5 h-3.5" />
                      Vence {format(invoice.dueDate, 'dd/MM/yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={e => { e.stopPropagation(); handleDownloadPDF(invoice); }}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={e => e.stopPropagation()}
                      className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-colors"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-1" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredInvoices.length === 0 && (
            <div className="py-16 text-center">
              <FileText className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">No se encontraron facturas</p>
            </div>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          MODAL — VER FACTURA
      ══════════════════════════════════════════════ */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-900 w-full sm:rounded-2xl sm:max-w-2xl flex flex-col shadow-2xl" style={{ maxHeight: '95vh' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#0066CC]/10 rounded-xl flex items-center justify-center">
                  <FileText className="w-4.5 h-4.5 text-[#0066CC]" style={{ width: 18, height: 18 }} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">Factura</p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedInvoice.invoiceNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedInvoice.status} />
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors ml-1">
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

              {/* Patient + Invoice info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Paciente
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedInvoice.patient}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">ID: {selectedInvoice.patientId}</p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5" /> Detalles
                  </p>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Emisión</span>
                      <span className="font-medium text-gray-800 dark:text-gray-100">{format(selectedInvoice.date, "dd MMM yyyy", { locale: es })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Vencimiento</span>
                      <span className={`font-medium ${selectedInvoice.status === 'overdue' ? 'text-red-600' : 'text-gray-800 dark:text-gray-100'}`}>
                        {format(selectedInvoice.dueDate, "dd MMM yyyy", { locale: es })}
                      </span>
                    </div>
                    {selectedInvoice.paymentMethod && (
                      <div className="flex justify-between">
                        <span className="text-gray-500 dark:text-gray-400">Método</span>
                        <span className="font-medium text-gray-800 dark:text-gray-100">{selectedInvoice.paymentMethod}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-3">Conceptos</p>

                {/* Desktop table */}
                <div className="hidden sm:block border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Descripción</th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cant.</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">P.Unit.</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">IVA</th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                      {selectedInvoice.items.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-100 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-right">{item.tax}%</td>
                          <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white text-right">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="sm:hidden space-y-2">
                  {selectedInvoice.items.map(item => (
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5">
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{item.description}</p>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="text-center">
                          <p className="text-gray-400 dark:text-gray-500 mb-0.5">Cantidad</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">{item.quantity}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 dark:text-gray-500 mb-0.5">P. Unit.</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">${item.unitPrice.toFixed(2)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-400 dark:text-gray-500 mb-0.5">IVA</p>
                          <p className="font-semibold text-gray-800 dark:text-gray-100">{item.tax}%</p>
                        </div>
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <span className="text-xs text-gray-400 dark:text-gray-500">Total línea</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">${item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">${selectedInvoice.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">IVA (21%)</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">${selectedInvoice.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-2 border-t border-blue-100 dark:border-blue-800/40">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-[#0066CC] text-lg">${selectedInvoice.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/40 rounded-xl px-4 py-3 text-sm text-amber-700 dark:text-amber-300">
                  <span className="font-semibold">Nota:</span> {selectedInvoice.notes}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col-reverse sm:flex-row gap-2.5 shrink-0">
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
              <button
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052a3] transition-colors"
              >
                <Send className="w-4 h-4" />
                Enviar por Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════
          MODAL — NUEVA FACTURA
      ══════════════════════════════════════════════ */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white dark:bg-gray-900 w-full sm:rounded-2xl sm:max-w-3xl flex flex-col shadow-2xl" style={{ maxHeight: '95vh' }}>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 shrink-0">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white">Nueva Factura</h2>
                <p className="text-xs text-gray-400 dark:text-gray-500">Completa los datos del servicio</p>
              </div>
              <button onClick={() => setShowNewInvoiceModal(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

              {/* Patient + Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Paciente *</label>
                  <select className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    <option value="">Seleccionar paciente…</option>
                    <option>Ana García Martínez</option>
                    <option>Carlos Rodríguez López</option>
                    <option>María Fernández Ruiz</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Método de pago</label>
                  <select className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
                    <option value="">Seleccionar…</option>
                    <option>Efectivo</option>
                    <option>Tarjeta</option>
                    <option>Transferencia</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Fecha de emisión *</label>
                  <input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Fecha de vencimiento *</label>
                  <input type="date" className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
                </div>
              </div>

              {/* Items */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100">Conceptos</p>
                  <button
                    type="button"
                    onClick={addInvoiceItem}
                    className="text-xs font-semibold text-[#0066CC] hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Agregar
                  </button>
                </div>

                <div className="space-y-3">
                  {invoiceItems.map(item => (
                    <div key={item.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3.5 space-y-3">
                      <input
                        type="text"
                        placeholder="Descripción del servicio"
                        value={item.description}
                        onChange={e => updateInvoiceItem(item.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                      />
                      <div className="flex items-end gap-2">
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1">Cant.</label>
                          <input type="number" value={item.quantity} min="1" onChange={e => updateInvoiceItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1">Precio</label>
                          <input type="number" value={item.unitPrice} min="0" step="0.01" onChange={e => updateInvoiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs text-gray-400 dark:text-gray-500 mb-1">IVA %</label>
                          <input type="number" value={item.tax} min="0" max="100" onChange={e => updateInvoiceItem(item.id, 'tax', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                        </div>
                        {invoiceItems.length > 1 && (
                          <button type="button" onClick={() => removeInvoiceItem(item.id)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors self-end">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-1 border-t border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-400 dark:text-gray-500">Total línea</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">${item.total.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">${calcTotals().subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">IVA</span>
                  <span className="font-medium text-gray-800 dark:text-gray-100">${calcTotals().tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-blue-100 dark:border-blue-800/40">
                  <span className="text-gray-900 dark:text-white">Total</span>
                  <span className="text-[#0066CC] text-lg">${calcTotals().total.toFixed(2)}</span>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Notas (opcional)</label>
                <textarea rows={3} placeholder="Añade notas o comentarios sobre esta factura…" className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0066CC]/30 focus:border-[#0066CC] transition-all resize-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100" />
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-gray-100 dark:border-gray-800 flex flex-col-reverse sm:flex-row gap-2.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(false)}
                className="flex-1 sm:flex-none px-5 py-2.5 text-sm font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => { toast.success('Factura creada correctamente'); setShowNewInvoiceModal(false); }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-[#0066CC] text-white text-sm font-semibold rounded-xl hover:bg-[#0052a3] transition-colors"
              >
                <Save className="w-4 h-4" />
                Crear Factura
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}