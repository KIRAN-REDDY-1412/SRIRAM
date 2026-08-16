const { jsPDF } = require('jspdf');

function testPdf() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 15;

  const drawWatermark = () => {
    doc.saveGraphicsState();
    try {
      doc.setGState(new doc.GState({ opacity: 0.12 }));
    } catch (e) {}
    doc.setFont('times', 'bold');
    doc.setFontSize(15);
    doc.setTextColor(160, 175, 195);
    doc.text('A.M.REDDY MEMORIAL COLLEGE OF PHARMACY', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      baseline: 'middle',
      angle: 45
    });
    doc.restoreGraphicsState();
  };

  const drawPageFooter = (pageNum, totalPages) => {
    doc.saveGraphicsState();
    const footerY = pageHeight - 12;
    const textY = pageHeight - 6.5;

    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.25);
    doc.line(marginX, footerY, pageWidth - marginX, footerY);

    doc.setFont('times', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);

    doc.text('A.M.REDDY MEMORIAL COLLEGE OF PHARMACY', marginX, textY, { align: 'left' });
    doc.text('Official Approved Clinical Document • Aug 16, 2026', pageWidth / 2, textY, { align: 'center' });
    doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - marginX, textY, { align: 'right' });
    doc.restoreGraphicsState();
  };

  // Page 1
  drawWatermark();
  doc.text('Page 1 Content', 20, 50);

  // Page 2
  doc.addPage();
  drawWatermark();
  doc.text('Page 2 Content', 20, 50);

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFooter(i, totalPages);
  }

  const pdfOutput = doc.output('arraybuffer');
  console.log('✅ PDF generated successfully! Byte size:', pdfOutput.byteLength, 'Total Pages:', totalPages);
}

testPdf();
