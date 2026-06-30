import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export async function htmlToPdfBase64(htmlContent: string): Promise<string | null> {
  try {
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    Object.assign(container.style, {
      position: 'absolute', left: '-9999px', top: '0',
      width: '794px', background: '#fff',
    });
    document.body.appendChild(container);

    const canvas = await html2canvas(container, { scale: 2, useCORS: true, logging: false });
    document.body.removeChild(container);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgW = 210;
    const imgH = (canvas.height * imgW) / canvas.width;
    let y = 0;
    const pageH = 297;
    while (y < imgH) {
      if (y > 0) pdf.addPage();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, -y, imgW, imgH);
      y += pageH;
    }
    return pdf.output('datauristring').split(',')[1];
  } catch (err) {
    console.warn('htmlToPdfBase64:', err);
    return null;
  }
}
