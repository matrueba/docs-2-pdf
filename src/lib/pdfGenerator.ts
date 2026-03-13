import jsPDF from "jspdf";
import * as XLSX from "xlsx";
import html2canvas from "html2canvas";
import type { PDFPage } from "pdf-lib";
import { PDFDocument } from "pdf-lib";

type PageTracker = { added: boolean };

/**
 * Agrega una imagen a un documento jsPDF
 */
async function processImage(file: File, pdf: jsPDF, tracker: PageTracker, pageWidth: number, pageHeight: number): Promise<void> {
    if (tracker.added) pdf.addPage();
    tracker.added = true;

    const src = URL.createObjectURL(file);
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

    const extension = file.name.toLowerCase().endsWith(".png") ? "PNG" : "JPEG";
    pdf.addImage(img, extension, x, y, finalWidth, finalHeight);
    URL.revokeObjectURL(src);
}

async function docxToPdf(docx: File): Promise<Uint8Array> {
    const formData = new FormData();
    formData.append("file", docx);

    const response = await fetch("/api/docx-to-pdf", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to export PDF from DOCX");
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

async function xlsxToPdf(xlsx: File): Promise<Uint8Array> {
    const formData = new FormData();
    formData.append("file", xlsx);

    const response = await fetch("/api/xlsx-to-pdf", {
        method: "POST",
        body: formData,
    });

    if (!response.ok) {
        throw new Error("Failed to export PDF from XLSX");
    }

    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

/**
 * Transforma un documento XLSX en un String HTML
 */
async function getXlsxHtml(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const html = XLSX.utils.sheet_to_html(sheet);
    return `<div style="padding: 40px;">
        <style>
            table { border-collapse: collapse; width: 100%; font-family: sans-serif; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; }
        </style>
        ${html}
    </div>`;
}

/**
 * Renderiza el código HTML a una imagen Canvas y la divide en páginas para insertarla en jsPDF
 */
async function renderHtmlToPdf(htmlContent: string, container: HTMLElement, pdf: jsPDF, tracker: PageTracker, pageWidth: number, pageHeight: number): Promise<void> {
    container.innerHTML = htmlContent;

    const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        logging: false
    });

    container.innerHTML = "";

    const imgData = canvas.toDataURL("image/jpeg", 0.95);
    const pdfCanvasHeight = (canvas.height * pageWidth) / canvas.width;

    let heightLeft = pdfCanvasHeight;
    let position = 0;

    while (heightLeft > 0) {
        if (tracker.added) pdf.addPage();
        tracker.added = true;

        pdf.addImage(imgData, "JPEG", 0, position, pageWidth, pdfCanvasHeight);

        heightLeft -= pageHeight;
        position -= pageHeight;
    }
}

/**
 * Convierte un arreglo continuo de imágenes y documentos en un arraglo de bytes de un documento jsPDF
 */
async function processNonPdfToBytes(nonPdfFiles: File[]): Promise<Uint8Array | null> {
    if (nonPdfFiles.length === 0) return null;

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Contenedor oculto necesario para transformar HTML a Canvas
    const container = document.createElement("div");
    container.style.position = "absolute";
    container.style.left = "-9999px";
    container.style.top = "0";
    container.style.width = "800px";
    container.style.backgroundColor = "white";
    container.style.color = "black";
    document.body.appendChild(container);

    const tracker: PageTracker = { added: false };

    for (let i = 0; i < nonPdfFiles.length; i++) {
        const file = nonPdfFiles[i];
        const t = file.name.toLowerCase();

        try {
            if (t.endsWith(".png") || t.endsWith(".jpg") || t.endsWith(".jpeg") || file.type.startsWith("image/")) {
                await processImage(file, pdf, tracker, pageWidth, pageHeight);
            } else if (t.endsWith(".xlsx")) {
                const html = await getXlsxHtml(file);
                await renderHtmlToPdf(html, container, pdf, tracker, pageWidth, pageHeight);
            }
        } catch (error) {
            console.error(`Error processing ${file.name}:`, error);
        }
    }

    document.body.removeChild(container);
    return new Uint8Array(pdf.output("arraybuffer"));
}

/**
 * Función principal: Genera y descarga un PDF a partir de un array de archivos (Imágenes, DOCX, XLSX, y PDFs previos).
 */
export async function generatePDFFromFiles(files: File[], fileName: string): Promise<void> {

    const finalPdfDoc = await PDFDocument.create();
    let currentNonPdfGroup: File[] = [];

    // Helper para procesar por grupos continuos evitando pérdida del orden
    const flushNonPdfGroup = async () => {
        if (currentNonPdfGroup.length === 0) return;

        const nonPdfBytes = await processNonPdfToBytes(currentNonPdfGroup);
        if (nonPdfBytes) {
            const tempPdfDoc = await PDFDocument.load(nonPdfBytes);
            const copiedPages = await finalPdfDoc.copyPages(tempPdfDoc, tempPdfDoc.getPageIndices());
            copiedPages.forEach((page: PDFPage) => finalPdfDoc.addPage(page));
        }
        currentNonPdfGroup = [];
    };

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
            await flushNonPdfGroup();
            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfToMerge = await PDFDocument.load(arrayBuffer);
                const copiedPages = await finalPdfDoc.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
                copiedPages.forEach((page: PDFPage) => finalPdfDoc.addPage(page));
            } catch (error) {
                console.error(`Error merging PDF ${file.name}:`, error);
            }
        } else if (file.name.toLowerCase().endsWith(".docx")) {
            await flushNonPdfGroup();
            try {
                const pdfBytes = await docxToPdf(file);
                const pdfToMerge = await PDFDocument.load(pdfBytes);
                const copiedPages = await finalPdfDoc.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
                copiedPages.forEach((page: PDFPage) => finalPdfDoc.addPage(page));
            } catch (error) {
                console.error(`Error converting DOCX to PDF ${file.name}:`, error);
            }
        } else if (file.name.toLowerCase().endsWith(".xlsx")) {
            await flushNonPdfGroup();
            try {
                const pdfBytes = await xlsxToPdf(file);
                const pdfToMerge = await PDFDocument.load(pdfBytes);
                const copiedPages = await finalPdfDoc.copyPages(pdfToMerge, pdfToMerge.getPageIndices());
                copiedPages.forEach((page: PDFPage) => finalPdfDoc.addPage(page));
            } catch (error) {
                console.error(`Error converting XLSX to PDF ${file.name}:`, error);
            }
        } else {
            currentNonPdfGroup.push(file);
        }
    }

    await flushNonPdfGroup();

    // Iniciar la descarga del archivo combinado final
    const finalName = fileName.trim() === "" ? "documento" : fileName;
    const pdfBytes = await finalPdfDoc.save();

    const blob = new Blob([pdfBytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${finalName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}
