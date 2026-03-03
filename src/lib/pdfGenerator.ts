import jsPDF from "jspdf";

/**
 * Genera un PDF a partir de un array de imágenes (File).
 * Cada imagen se coloca centrada en una página A4.
 */
export async function generatePDFFromImages(
    images: File[],
    fileName: string
): Promise<void> {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    for (let i = 0; i < images.length; i++) {
        if (i > 0) pdf.addPage();

        const src = URL.createObjectURL(images[i]);
        const img = new Image();
        img.src = src;
        await new Promise<void>((resolve) => {
            img.onload = () => resolve();
        });

        const ratio = Math.min(pageWidth / img.width, pageHeight / img.height);
        const finalWidth = img.width * ratio;
        const finalHeight = img.height * ratio;
        const x = (pageWidth - finalWidth) / 2;
        const y = (pageHeight - finalHeight) / 2;

        pdf.addImage(img, "PNG", x, y, finalWidth, finalHeight);
        URL.revokeObjectURL(src);
    }

    const finalName = fileName.trim() === "" ? "documento" : fileName;
    pdf.save(`${finalName}.pdf`);
}
