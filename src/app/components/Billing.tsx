import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Download,
  Printer,
  Eye,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  DollarSign,
  TrendingUp,
  FileText,
  Calendar,
  X,
  Save,
  Trash2
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
    {
      id: 1,
      invoiceNumber: 'FAC-2026-001',
      patient: 'Ana García Martínez',
      patientId: 'PAC-001',
      date: new Date(2026, 2, 1),
      dueDate: new Date(2026, 2, 15),
      status: 'paid',
      items: [
        { id: 1, description: 'Limpieza dental profunda', quantity: 1, unitPrice: 80, tax: 21, total: 96.80 },
        { id: 2, description: 'Blanqueamiento dental', quantity: 1, unitPrice: 300, tax: 21, total: 363 }
      ],
      subtotal: 380,
      tax: 79.80,
      total: 459.80,
      paymentMethod: 'Tarjeta de crédito',
      notes: 'Pago realizado en clínica'
    },
    {
      id: 2,
      invoiceNumber: 'FAC-2026-002',
      patient: 'Carlos Rodríguez López',
      patientId: 'PAC-002',
      date: new Date(2026, 2, 3),
      dueDate: new Date(2026, 2, 17),
      status: 'pending',
      items: [
        { id: 1, description: 'Ortodoncia invisible - Cuota 1/12', quantity: 1, unitPrice: 250, tax: 21, total: 302.50 }
      ],
      subtotal: 250,
      tax: 52.50,
      total: 302.50,
      notes: 'Pago mensual de ortodoncia'
    },
    {
      id: 3,
      invoiceNumber: 'FAC-2026-003',
      patient: 'María Fernández Ruiz',
      patientId: 'PAC-003',
      date: new Date(2026, 1, 28),
      dueDate: new Date(2026, 2, 14),
      status: 'overdue',
      items: [
        { id: 1, description: 'Extracción molar', quantity: 1, unitPrice: 120, tax: 21, total: 145.20 },
        { id: 2, description: 'Radiografía panorámica', quantity: 1, unitPrice: 45, tax: 21, total: 54.45 }
      ],
      subtotal: 165,
      tax: 34.65,
      total: 199.65,
      notes: 'Recordar enviar recordatorio de pago'
    },
    {
      id: 4,
      invoiceNumber: 'FAC-2026-004',
      patient: 'Pedro Sánchez Gómez',
      patientId: 'PAC-004',
      date: new Date(2026, 2, 2),
      dueDate: new Date(2026, 2, 16),
      status: 'paid',
      items: [
        { id: 1, description: 'Implante dental', quantity: 1, unitPrice: 800, tax: 21, total: 968 },
        { id: 2, description: 'Corona de porcelana', quantity: 1, unitPrice: 450, tax: 21, total: 544.50 }
      ],
      subtotal: 1250,
      tax: 262.50,
      total: 1512.50,
      paymentMethod: 'Transferencia bancaria'
    },
    {
      id: 5,
      invoiceNumber: 'FAC-2026-005',
      patient: 'Laura Martínez Torres',
      patientId: 'PAC-005',
      date: new Date(2026, 2, 4),
      dueDate: new Date(2026, 2, 18),
      status: 'pending',
      items: [
        { id: 1, description: 'Endodoncia', quantity: 1, unitPrice: 280, tax: 21, total: 338.80 }
      ],
      subtotal: 280,
      tax: 58.80,
      total: 338.80
    }
  ];

  // Calcular métricas
  const totalInvoiced = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.total, 0);
  const totalPending = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.total, 0);
  const totalOverdue = invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.total, 0);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.patient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: Invoice['status']) => {
    const styles = {
      paid: 'bg-green-100 text-green-700',
      pending: 'bg-yellow-100 text-yellow-700',
      overdue: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-700'
    };

    const labels = {
      paid: 'Pagada',
      pending: 'Pendiente',
      overdue: 'Vencida',
      cancelled: 'Cancelada'
    };

    const icons = {
      paid: <CheckCircle2 className="w-4 h-4" />,
      pending: <Clock className="w-4 h-4" />,
      overdue: <AlertCircle className="w-4 h-4" />,
      cancelled: <X className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${styles[status]}`}>
        {icons[status]}
        {labels[status]}
      </span>
    );
  };

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: invoiceItems.length + 1,
      description: '',
      quantity: 1,
      unitPrice: 0,
      tax: 21,
      total: 0
    };
    setInvoiceItems([...invoiceItems, newItem]);
  };

  const updateInvoiceItem = (id: number, field: keyof InvoiceItem, value: any) => {
    setInvoiceItems(items =>
      items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice' || field === 'tax') {
            const subtotal = updated.quantity * updated.unitPrice;
            updated.total = subtotal * (1 + updated.tax / 100);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeInvoiceItem = (id: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(items => items.filter(item => item.id !== id));
    }
  };

  const calculateTotals = () => {
    const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = invoiceItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      return sum + (itemSubtotal * item.tax / 100);
    }, 0);
    const total = subtotal + taxAmount;
    return { subtotal, tax: taxAmount, total };
  };

  const handleDownloadPDF = (invoice: Invoice) => {
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
      address: 'Calle Ejemplo 45, Madrid',
      taxId: '12345678Z'
    };
    downloadInvoicePDF(invoice, patientInfo, clinicInfo);
    toast.success('Factura descargada correctamente');
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Facturación</h1>
        <p className="text-gray-600">Gestiona las facturas y pagos de tus pacientes</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-[#0066CC]" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Facturado</p>
          <p className="text-2xl font-bold text-gray-900">${totalInvoiced.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">Este mes</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Cobrado</p>
          <p className="text-2xl font-bold text-green-600">${totalPaid.toFixed(2)}</p>
          <p className="text-xs text-green-600 mt-2">+12% vs mes anterior</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Pendiente</p>
          <p className="text-2xl font-bold text-yellow-600">${totalPending.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">{invoices.filter(i => i.status === 'pending').length} facturas</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Vencido</p>
          <p className="text-2xl font-bold text-red-600">${totalOverdue.toFixed(2)}</p>
          <p className="text-xs text-gray-500 mt-2">{invoices.filter(i => i.status === 'overdue').length} facturas</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl p-4 mb-6 border border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por paciente o número de factura..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
          >
            <option value="all">Todos los estados</option>
            <option value="paid">Pagadas</option>
            <option value="pending">Pendientes</option>
            <option value="overdue">Vencidas</option>
            <option value="cancelled">Canceladas</option>
          </select>

          {/* New Invoice Button */}
          <button
            onClick={() => setShowNewInvoiceModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052a3] transition-colors whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Nueva Factura
          </button>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nº Factura
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Paciente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{invoice.invoiceNumber}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-gray-900">{invoice.patient}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(invoice.date, 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {format(invoice.dueDate, 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-900">${invoice.total.toFixed(2)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(invoice.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowModal(true);
                        }}
                        className="p-2 text-gray-600 hover:text-[#0066CC] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(invoice)}
                        className="p-2 text-gray-600 hover:text-[#0066CC] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Descargar PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 text-gray-600 hover:text-[#0066CC] hover:bg-gray-100 rounded-lg transition-colors"
                        title="Enviar por email"
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
      </div>

      {/* View Invoice Modal */}
      {showModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="bg-[#0066CC] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Factura {selectedInvoice.invoiceNumber}</h2>
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedInvoice.status)}
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Invoice Header Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 pb-6 border-b border-gray-200">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Información del Paciente</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Nombre:</span> {selectedInvoice.patient}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">ID:</span> {selectedInvoice.patientId}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Detalles de la Factura</h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Fecha:</span> {format(selectedInvoice.date, "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Vencimiento:</span> {format(selectedInvoice.dueDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
                  </p>
                  {selectedInvoice.paymentMethod && (
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="font-medium">Método de pago:</span> {selectedInvoice.paymentMethod}
                    </p>
                  )}
                </div>
              </div>

              {/* Items Table */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Conceptos</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Descripción</th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Cant.</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Precio Unit.</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">IVA</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedInvoice.items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-center">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">${item.unitPrice.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-gray-600 text-right">{item.tax}%</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">${item.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-full md:w-80 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-medium text-gray-900">${selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">IVA:</span>
                    <span className="font-medium text-gray-900">${selectedInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Total:</span>
                    <span className="text-[#0066CC]">${selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm">Notas</h3>
                  <p className="text-sm text-gray-600">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => handleDownloadPDF(selectedInvoice)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Download className="w-4 h-4" />
                Descargar PDF
              </button>
              <button
                className="flex items-center gap-2 px-4 py-2 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052a3] transition-colors"
              >
                <Send className="w-4 h-4" />
                Enviar por Email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Invoice Modal */}
      {showNewInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="bg-[#0066CC] text-white px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Nueva Factura</h2>
              <button
                onClick={() => setShowNewInvoiceModal(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <form className="space-y-6">
                {/* Patient and Date Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Paciente *
                    </label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent">
                      <option value="">Seleccionar paciente...</option>
                      <option value="1">Ana García Martínez</option>
                      <option value="2">Carlos Rodríguez López</option>
                      <option value="3">María Fernández Ruiz</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de emisión *
                    </label>
                    <input
                      type="date"
                      defaultValue={format(new Date(), 'yyyy-MM-dd')}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fecha de vencimiento *
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Método de pago
                    </label>
                    <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent">
                      <option value="">Seleccionar...</option>
                      <option value="cash">Efectivo</option>
                      <option value="card">Tarjeta</option>
                      <option value="transfer">Transferencia</option>
                    </select>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Conceptos</h3>
                    <button
                      type="button"
                      onClick={addInvoiceItem}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-[#0066CC] hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Agregar concepto
                    </button>
                  </div>

                  <div className="space-y-3">
                    {invoiceItems.map((item, index) => (
                      <div key={item.id} className="grid grid-cols-12 gap-3 items-start p-4 bg-gray-50 rounded-lg">
                        <div className="col-span-12 md:col-span-5">
                          <input
                            type="text"
                            placeholder="Descripción del servicio"
                            value={item.description}
                            onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <input
                            type="number"
                            placeholder="Cant."
                            value={item.quantity}
                            onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                            min="1"
                          />
                        </div>
                        <div className="col-span-4 md:col-span-2">
                          <input
                            type="number"
                            placeholder="Precio"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                            min="0"
                            step="0.01"
                          />
                        </div>
                        <div className="col-span-3 md:col-span-2">
                          <input
                            type="number"
                            placeholder="IVA %"
                            value={item.tax}
                            onChange={(e) => updateInvoiceItem(item.id, 'tax', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent text-sm"
                            min="0"
                            max="100"
                          />
                        </div>
                        <div className="col-span-1 flex items-center justify-end">
                          <button
                            type="button"
                            onClick={() => removeInvoiceItem(item.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            disabled={invoiceItems.length === 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="col-span-12 text-right">
                          <span className="text-sm font-semibold text-gray-900">
                            Total: ${item.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals Summary */}
                <div className="flex justify-end">
                  <div className="w-full md:w-80 space-y-2 p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">${calculateTotals().subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IVA:</span>
                      <span className="font-medium text-gray-900">${calculateTotals().tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-[#0066CC]">${calculateTotals().total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas (opcional)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Añade cualquier nota o comentario sobre esta factura..."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066CC] focus:border-transparent resize-none"
                  />
                </div>
              </form>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNewInvoiceModal(false)}
                className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                onClick={() => {
                  toast.success('Factura creada correctamente');
                  setShowNewInvoiceModal(false);
                }}
                className="flex items-center gap-2 px-6 py-2.5 bg-[#0066CC] text-white rounded-lg hover:bg-[#0052a3] transition-colors"
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
