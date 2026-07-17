import { jsPDF } from 'jspdf';

const CATEGORY_COLORS = {
  Music: [236, 72, 153],
  Tech: [59, 130, 246],
  Sports: [16, 185, 129],
  Business: [245, 158, 11],
  Art: [139, 92, 246],
  Other: [107, 114, 128],
};

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


export const generateEventPass = async (ticket) => {
  const { ticketId, bookingDate, status, user, event } = ticket;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const accentColor = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other;

  // ── Background ──
  doc.setFillColor(243, 244, 246);
  doc.rect(0, 0, pageW, pageH, 'F');

  // ── Top accent bar ──
  doc.setFillColor(...accentColor);
  doc.rect(0, 0, pageW, 3, 'F');

  // ── Card background ──
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 12, pageW - 30, pageH - 24, 6, 6, 'F');

  // ── Card border ──
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.5);
  doc.roundedRect(15, 12, pageW - 30, pageH - 24, 6, 6, 'S');

  // ── EventHub brand header ──
  doc.setFillColor(...accentColor);
  doc.rect(15, 12, pageW - 30, 18, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('EVENTHUB', pageW / 2, 24, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255, 0.8);
  doc.text('YOUR OFFICIAL EVENT PASS', pageW / 2, 29, { align: 'center' });

  // ── EVENT PASS label ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(17, 24, 39);
  doc.text('EVENT PASS', pageW / 2, 46, { align: 'center' });

  // ── Try to load and embed event image ──
  let imageLoaded = false;
  if (event.image) {
    try {
      const imageUrl = `http://localhost:5000${event.image}`;
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      });
      const imgX = pageW / 2 - 45;
      doc.addImage(base64, 'JPEG', imgX, 52, 90, 55, undefined, 'MEDIUM');
      // Image border
      doc.setDrawColor(...accentColor);
      doc.setLineWidth(0.5);
      doc.rect(imgX, 52, 90, 55, 'S');
      imageLoaded = true;
    } catch {
      imageLoaded = false;
    }
  }

  // ── If no image, show placeholder ──
  if (!imageLoaded) {
    doc.setFillColor(243, 244, 246);
    doc.rect(pageW / 2 - 45, 52, 90, 55, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text('No Event Image', pageW / 2, 82, { align: 'center' });
  }

  // ── Category badge ──
  const badgeY = 114;
  doc.setFillColor(...accentColor);
  doc.roundedRect(pageW / 2 - 20, badgeY - 5, 40, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(event.category.toUpperCase(), pageW / 2, badgeY, { align: 'center' });

  // ── Divider ──
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.3);
  doc.line(25, 126, pageW - 25, 126);

  // ── Event title ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(17, 24, 39);
  const titleLines = doc.splitTextToSize(event.title, pageW - 50);
  doc.text(titleLines, pageW / 2, 134, { align: 'center' });

  const afterTitleY = 134 + titleLines.length * 7;

  // ── Details section ──
  const detailsStartY = afterTitleY + 6;
  const leftCol = 28;
  const rightCol = pageW / 2 + 5;
  const labelColor = accentColor;
  const valueColor = [31, 41, 55];

  const drawDetail = (label, value, x, y) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(...labelColor);
    doc.text(label, x, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...valueColor);
    const lines = doc.splitTextToSize(value || 'N/A', (pageW / 2) - 20);
    doc.text(lines, x, y + 5);
    return y + 5 + lines.length * 5;
  };

  let leftY = detailsStartY;
  let rightY = detailsStartY;

  leftY = drawDetail('ATTENDEE NAME', user.name, leftCol, leftY) + 4;
  rightY = drawDetail('EMAIL', user.email, rightCol, rightY) + 4;

  leftY = drawDetail('DATE', formatDate(event.date), leftCol, leftY) + 4;
  rightY = drawDetail('TIME', 'Time will be initiated soon', rightCol, rightY) + 4;

  leftY = drawDetail('VENUE', event.location, leftCol, leftY) + 4;
  rightY = drawDetail('CATEGORY', event.category, rightCol, rightY) + 4;

  if (user.phoneNumber) {
    leftY = drawDetail('PHONE', user.phoneNumber, leftCol, leftY) + 4;
  }

  const afterDetailsY = Math.max(leftY, rightY) + 4;

  // ── Divider ──
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.3);
  doc.line(25, afterDetailsY, pageW - 25, afterDetailsY);

  // ── Ticket ID section ──
  const ticketSectionY = afterDetailsY + 8;
  doc.setFillColor(249, 250, 251);
  doc.roundedRect(25, ticketSectionY - 4, pageW - 50, 20, 3, 3, 'F');
  doc.setDrawColor(...accentColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(25, ticketSectionY - 4, pageW - 50, 20, 3, 3, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...accentColor);
  doc.text('TICKET ID', pageW / 2, ticketSectionY + 2, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(17, 24, 39);
  doc.text(ticketId, pageW / 2, ticketSectionY + 10, { align: 'center' });

  // ── Booking date + Status ──
  const bottomInfoY = ticketSectionY + 26;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text(
    `Booked on: ${new Date(bookingDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
    pageW / 2,
    bottomInfoY,
    { align: 'center' }
  );

  // ── Status badge ──
  const statusY = bottomInfoY + 8;
  const statusColor = status === 'CONFIRMED' ? [16, 185, 129] : [239, 68, 68];
  doc.setFillColor(...statusColor);
  doc.roundedRect(pageW / 2 - 18, statusY - 5, 36, 9, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(status, pageW / 2, statusY + 1, { align: 'center' });

  // ── Bottom bar ──
  doc.setFillColor(...accentColor);
  doc.rect(15, pageH - 18, pageW - 30, 6, 'F');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('This pass is non-transferable. Present at the venue entrance.', pageW / 2, pageH - 13.5, { align: 'center' });

  // ── Footer ──
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(156, 163, 175);
  doc.text('Generated by EventHub • eventhub.app', pageW / 2, pageH - 6, { align: 'center' });

  // ── Save ──
  doc.save(`EventPass-${ticketId}.pdf`);
};