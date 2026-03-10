import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  status: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod?: string;
  notes?: string;
}

interface PatientInfo {
  phone: string;
  email: string;
  address?: string;
  taxId?: string;
}

interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  taxId?: string;
}

export const generateInvoicePDF = (
  invoice: Invoice,
  patientInfo: PatientInfo,
  clinicInfo: ClinicInfo
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  let yPosition = 20;

  // Colors
  const primaryColor: [number, number, number] = [0, 102, 204]; // #0066CC
  const grayColor: [number, number, number] = [107, 114, 128];
  const lightGrayColor: [number, number, number] = [243, 244, 246];
  const greenColor: [number, number, number] = [34, 197, 94];

  // Header - Clinic Info
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 45, 'F');

  // Clinic Name and Logo
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(26);
  doc.setFont('helvetica', 'bold');
  doc.text(clinicInfo.name, 15, 20);

  // FACTURA Badge
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(pageWidth - 60, 12, 45, 16, 3, 3, 'F');
  doc.setTextColor(...primaryColor);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA', pageWidth - 37.5, 22, { align: 'center' });

  // Clinic Details
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(clinicInfo.address, 15, 30);
  doc.text(`Tel: ${clinicInfo.phone} | Email: ${clinicInfo.email}`, 15, 35);
  if (clinicInfo.taxId) {
    doc.text(`CIF: ${clinicInfo.taxId}`, 15, 40);
  }

  // Invoice Number and Dates
  yPosition = 60;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Factura:', 15, yPosition);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNumber, 40, yPosition);

  yPosition += 7;
  doc.setTextColor(...grayColor);
  doc.setFontSize(10);
  doc.text(`Fecha de emisión: ${format(invoice.date, "dd/MM/yyyy")}`, 15, yPosition);

  yPosition += 6;
  doc.text(`Fecha de vencimiento: ${format(invoice.dueDate, "dd/MM/yyyy")}`, 15, yPosition);

  // Patient Information Box
  const boxY = 55;
  const boxWidth = 85;
  const boxHeight = 30;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(pageWidth - boxWidth - 15, boxY, boxWidth, boxHeight, 2, 2);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('FACTURADO A:', pageWidth - boxWidth - 10, boxY + 7);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(invoice.patient, pageWidth - boxWidth - 10, boxY + 14);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  let lineY = boxY + 19;
  if (patientInfo.taxId) {
    doc.text(`NIF/CIF: ${patientInfo.taxId}`, pageWidth - boxWidth - 10, lineY);
    lineY += 5;
  }
  if (patientInfo.address) {
    const addressLines = doc.splitTextToSize(patientInfo.address, boxWidth - 10);
    doc.text(addressLines, pageWidth - boxWidth - 10, lineY);
  }

  // Items Table
  yPosition = 95;
  
  const tableData = invoice.items.map(item => {
    const itemSubtotal = item.quantity * item.unitPrice;
    const itemTax = itemSubtotal * (item.tax / 100);
    return [
      item.description,
      item.quantity.toString(),
      `$${item.unitPrice.toFixed(2)}`,
      `${item.tax}%`,
      `$${item.total.toFixed(2)}`
    ];
  });

  autoTable(doc, {
    startY: yPosition,
    head: [['Descripción', 'Cant.', 'Precio Unit.', 'IVA', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'left'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0]
    },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 20, halign: 'center' },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: lightGrayColor
    },
    margin: { left: 15, right: 15 }
  });

  // Get Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;

  // Totals Section - Right aligned
  const totalsX = pageWidth - 80;
  let totalsY = finalY + 15;

  // Totals Box
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(totalsX - 5, totalsY - 5, 65, 35, 2, 2);

  // Subtotal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Base imponible:', totalsX, totalsY);
  doc.text(`$${invoice.subtotal.toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

  // Tax
  totalsY += 7;
  doc.text('IVA:', totalsX, totalsY);
  doc.text(`$${invoice.tax.toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

  // Line separator
  totalsY += 5;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(totalsX, totalsY, pageWidth - 15, totalsY);

  // Total
  totalsY += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL:', totalsX, totalsY);
  doc.setFontSize(16);
  doc.text(`$${invoice.total.toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

  // Payment Status Badge (if paid)
  if (invoice.status === 'paid') {
    totalsY += 10;
    doc.setFillColor(...greenColor);
    doc.roundedRect(totalsX, totalsY - 5, 60, 10, 2, 2, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('✓ PAGADA', totalsX + 30, totalsY + 1, { align: 'center' });
  }

  // Payment Method
  totalsY = finalY + 15;
  if (invoice.paymentMethod) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    doc.text('Método de pago:', 15, totalsY);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(invoice.paymentMethod, 15, totalsY + 5);
  }

  // Notes Section
  totalsY = finalY + 55;
  if (invoice.notes && totalsY + 25 < pageHeight - 30) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('OBSERVACIONES:', 15, totalsY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - 30);
    doc.text(notesLines, 15, totalsY + 6);
    totalsY += 6 + (notesLines.length * 5);
  }

  // Payment conditions
  totalsY = Math.max(totalsY + 10, pageHeight - 60);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('CONDICIONES DE PAGO:', 15, totalsY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  totalsY += 4;
  doc.text('• Los servicios prestados están sujetos a las condiciones generales de la clínica.', 15, totalsY);
  totalsY += 4;
  doc.text('• En caso de impago, se aplicarán los intereses legales correspondientes.', 15, totalsY);
  totalsY += 4;
  doc.text('• Para cualquier reclamación, contactar en un plazo máximo de 15 días.', 15, totalsY);

  // Footer
  const footerY = pageHeight - 20;
  doc.setDrawColor(...grayColor);
  doc.setLineWidth(0.3);
  doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(...grayColor);
  doc.text(
    'Gracias por confiar en DentalCare Pro para su salud dental',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Page numbers and website
  doc.setFontSize(8);
  doc.text('Página 1 de 1', pageWidth - 15, footerY, { align: 'right' });
  if (clinicInfo.website) {
    doc.text(clinicInfo.website, 15, footerY);
  }

  // Watermark if not paid
  if (invoice.status === 'pending' || invoice.status === 'overdue') {
    doc.setFontSize(60);
    doc.setTextColor(200, 200, 200);
    doc.setFont('helvetica', 'bold');
    const watermarkText = invoice.status === 'overdue' ? 'VENCIDA' : 'PENDIENTE';
    doc.text(
      watermarkText,
      pageWidth / 2,
      pageHeight / 2,
      { align: 'center', angle: 45 }
    );
  }

  return doc;
};

export const downloadInvoicePDF = (
  invoice: Invoice,
  patientInfo: PatientInfo,
  clinicInfo: ClinicInfo
) => {
  const doc = generateInvoicePDF(invoice, patientInfo, clinicInfo);
  const fileName = `Factura_${invoice.invoiceNumber.replace(/\//g, '-')}_${invoice.patient.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};

export const printInvoicePDF = (
  invoice: Invoice,
  patientInfo: PatientInfo,
  clinicInfo: ClinicInfo
) => {
  const doc = generateInvoicePDF(invoice, patientInfo, clinicInfo);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};
