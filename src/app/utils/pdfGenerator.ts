import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  status: string;
  items: BudgetItem[];
  total: number;
  doctor: string;
}

interface PatientInfo {
  phone: string;
  email: string;
  address?: string;
}

interface ClinicInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  taxId?: string;
}

export const generateBudgetPDF = (
  budget: Budget,
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

  // Header - Clinic Info
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');

  // Clinic Name
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(clinicInfo.name, 15, 20);

  // Clinic Details
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(clinicInfo.address, 15, 28);
  doc.text(`Tel: ${clinicInfo.phone} | Email: ${clinicInfo.email}`, 15, 33);

  // Document Title
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  yPosition = 55;
  doc.text('PRESUPUESTO', 15, yPosition);

  // Budget Number and Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  const budgetNumber = `#${budget.id.toString().padStart(4, '0')}`;
  const dateText = format(budget.date, "dd 'de' MMMM 'de' yyyy", { locale: es });
  
  const rightMargin = pageWidth - 15;
  doc.text(`Presupuesto Nº: ${budgetNumber}`, rightMargin, 55, { align: 'right' });
  doc.text(`Fecha: ${dateText}`, rightMargin, 61, { align: 'right' });

  // Separator Line
  yPosition = 70;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(15, yPosition, pageWidth - 15, yPosition);

  // Patient Information
  yPosition = 80;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('DATOS DEL PACIENTE', 15, yPosition);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  yPosition += 8;
  doc.text(`Nombre: ${budget.patient}`, 15, yPosition);
  yPosition += 6;
  doc.text(`Teléfono: ${patientInfo.phone}`, 15, yPosition);
  yPosition += 6;
  doc.text(`Email: ${patientInfo.email}`, 15, yPosition);

  // Doctor Information
  yPosition = 80;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('ODONTÓLOGO RESPONSABLE', pageWidth / 2 + 10, yPosition);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  yPosition += 8;
  doc.text(`Dr./Dra.: ${budget.doctor}`, pageWidth / 2 + 10, yPosition);
  yPosition += 6;
  doc.text('Colegiado: 28/28/12345', pageWidth / 2 + 10, yPosition);

  // Items Table
  yPosition = 115;
  
  const tableData = budget.items.map(item => [
    item.description,
    item.quantity.toString(),
    `$${item.unitPrice.toFixed(2)}`,
    `$${item.total.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [['Descripción del Tratamiento', 'Cant.', 'Precio Unit.', 'Total']],
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
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
    },
    alternateRowStyles: {
      fillColor: lightGrayColor
    },
    margin: { left: 15, right: 15 }
  });

  // Get Y position after table
  const finalY = (doc as any).lastAutoTable.finalY || yPosition + 50;

  // Totals Section
  const totalsX = pageWidth - 80;
  let totalsY = finalY + 10;

  // Subtotal
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...grayColor);
  doc.text('Subtotal:', totalsX, totalsY);
  doc.text(`$${budget.total.toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

  // IVA
  totalsY += 7;
  const iva = budget.total * 0.21;
  doc.text('IVA (21%):', totalsX, totalsY);
  doc.text(`$${iva.toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

  // Line separator
  totalsY += 5;
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.3);
  doc.line(totalsX, totalsY, pageWidth - 15, totalsY);

  // Total
  totalsY += 8;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('TOTAL:', totalsX, totalsY);
  doc.setFontSize(16);
  doc.text(`$${(budget.total * 1.21).toFixed(2)}`, pageWidth - 15, totalsY, { align: 'right' });

  // Notes Section
  totalsY += 15;
  if (totalsY + 30 < pageHeight - 20) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('NOTAS Y CONDICIONES:', 15, totalsY);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    totalsY += 6;
    doc.text('• Este presupuesto tiene una validez de 30 días desde la fecha de emisión.', 15, totalsY);
    totalsY += 5;
    doc.text('• Los precios incluyen materiales y mano de obra profesional.', 15, totalsY);
    totalsY += 5;
    doc.text('• Consulte disponibilidad de planes de financiación sin intereses.', 15, totalsY);
    totalsY += 5;
    doc.text('• Para cualquier duda, no dude en contactarnos.', 15, totalsY);
  }

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

  // Page numbers
  doc.setFontSize(8);
  doc.text(
    `Página 1 de 1`,
    pageWidth - 15,
    footerY,
    { align: 'right' }
  );

  return doc;
};

export const downloadBudgetPDF = (
  budget: Budget,
  patientInfo: PatientInfo,
  clinicInfo: ClinicInfo
) => {
  const doc = generateBudgetPDF(budget, patientInfo, clinicInfo);
  const fileName = `Presupuesto_${budget.id.toString().padStart(4, '0')}_${budget.patient.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
};

export const printBudgetPDF = (
  budget: Budget,
  patientInfo: PatientInfo,
  clinicInfo: ClinicInfo
) => {
  const doc = generateBudgetPDF(budget, patientInfo, clinicInfo);
  doc.autoPrint();
  window.open(doc.output('bloburl'), '_blank');
};

// Export to CSV
export const exportBudgetToCSV = (budget: Budget) => {
  const headers = ['Descripción', 'Cantidad', 'Precio Unitario', 'Total'];
  const rows = budget.items.map(item => [
    item.description,
    item.quantity,
    item.unitPrice.toFixed(2),
    item.total.toFixed(2)
  ]);

  // Add totals
  rows.push(['', '', '', '']);
  rows.push(['Subtotal', '', '', budget.total.toFixed(2)]);
  rows.push(['IVA (21%)', '', '', (budget.total * 0.21).toFixed(2)]);
  rows.push(['TOTAL', '', '', (budget.total * 1.21).toFixed(2)]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `Presupuesto_${budget.id.toString().padStart(4, '0')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
