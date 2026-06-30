import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const PDF_TIMEOUT_MS = 12_000

export async function htmlToPdfBase64(htmlContent: string): Promise<string | null> {
  const timeoutPromise = new Promise<null>(resolve =>
    setTimeout(() => { console.warn('htmlToPdfBase64: timeout — email will be sent without PDF'); resolve(null) }, PDF_TIMEOUT_MS)
  )
  return Promise.race([_generatePdf(htmlContent), timeoutPromise])
}

async function _generatePdf(htmlContent: string): Promise<string | null> {
  try {
    const container = document.createElement('div');
    container.innerHTML = htmlContent;
    Object.assign(container.style, {
      position: 'absolute', left: '-9999px', top: '0',
      width: '794px', background: '#fff',
    });
    document.body.appendChild(container);

    const canvas = await html2canvas(container, { scale: 1.5, useCORS: true, logging: false });
    document.body.removeChild(container);

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgW = 210;
    const imgH = (canvas.height * imgW) / canvas.width;
    // JPEG at 85% quality — ~3-4× smaller than PNG, well within Brevo's 20MB limit
    const imgData = canvas.toDataURL('image/jpeg', 0.85);
    let y = 0;
    const pageH = 297;
    while (y < imgH) {
      if (y > 0) pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, -y, imgW, imgH);
      y += pageH;
    }
    return pdf.output('datauristring').split(',')[1];
  } catch (err) {
    console.warn('htmlToPdfBase64:', err);
    return null;
  }
}
