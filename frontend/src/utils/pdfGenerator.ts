import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateSignedPDF = async (signatureImage: string, userData?: { name?: string; date?: string; document?: string }) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;

  let yPosition = margin;

  // Título
  doc.setFontSize(20);
  doc.setFont('Helvetica', 'bold');
  doc.text('DOCUMENTO FIRMADO', margin, yPosition);
  yPosition += 15;

  // Línea separadora
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  // Información del documento
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'normal');

  doc.text('Información del Documento:', margin, yPosition);
  yPosition += 8;

  // Datos del usuario
  if (userData?.name) {
    doc.text(`Firmante: ${userData.name}`, margin + 5, yPosition);
    yPosition += 8;
  }

  if (userData?.document) {
    doc.text(`Documento: ${userData.document}`, margin + 5, yPosition);
    yPosition += 8;
  }

  const currentDate = userData?.date || new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  doc.text(`Fecha: ${currentDate}`, margin + 5, yPosition);
  yPosition += 12;

  // Contenido del documento simulado
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);

  const contentText = `Este documento certifica que la firma que aparece a continuación ha sido realizada electrónicamente por el firmante. La firma digital representa el consentimiento y aprobación del contenido de este documento.

Todos los términos y condiciones han sido revisados y aceptados por el firmante. Este documento tiene validez legal y constituye un contrato vinculante entre las partes.`;

  const splitText = doc.splitTextToSize(contentText, contentWidth - 10);
  doc.text(splitText, margin + 5, yPosition);

  yPosition += splitText.length * 5 + 10;

  // Espacio para la firma
  doc.setFontSize(11);
  doc.setFont('Helvetica', 'bold');
  doc.text('Firma del Firmante:', margin, yPosition);
  yPosition += 10;

  // Agregar imagen de la firma
  try {
    const imgWidth = 60;
    const imgHeight = 40;
    doc.addImage(signatureImage, 'PNG', margin, yPosition, imgWidth, imgHeight);
    yPosition += imgHeight + 10;
  } catch (error) {
    console.error('Error al agregar firma:', error);
  }

  // Línea para firma manuscrita (fallback)
  doc.line(margin, yPosition, margin + 60, yPosition);

  // Pie de página
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(128, 128, 128);
  doc.text(`Documento generado automáticamente - ${new Date().toLocaleString('es-ES')}`, margin, pageHeight - margin);

  // Descargar PDF
  const fileName = `documento-firmado-${Date.now()}.pdf`;
  doc.save(fileName);

  return fileName;
};
