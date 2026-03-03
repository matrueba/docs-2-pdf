export const dictionaries = {
    en: {
        heroTitlePart1: "Image to ",
        heroTitlePart2: "PDF",
        heroSubtitle: "Upload your images or select a folder and convert them into a PDF document instantly.",
        dropzoneTitle: "Drag and drop your images here",
        dropzoneDesc: "You can drop multiple files or entire folders. We will sort them automatically.",
        selectImages: "Select Images",
        selectFolder: "Select Folder",
        clearAll: "Clear All",
        createPdf: "Create PDF",
        selectedImagesTitle: "Selected Images",
        fileLabel: "file",
        filesLabel: "files",
        addBtn: "Add",
        namePdfTitle: "Name your PDF",
        namePdfDesc: "The .pdf extension will be added automatically.",
        filenamePlaceholder: "document",
        cancelBtn: "Cancel",
        generatePdfBtn: "Generate PDF",
        errorGenerating: "There was an error generating the PDF."
    },
    es: {
        heroTitlePart1: "Escáner a ",
        heroTitlePart2: "PDF",
        heroSubtitle: "Sube tus imágenes o selecciona una carpeta y conviértelas en un documento PDF al instante.",
        dropzoneTitle: "Arrastra y suelta tus imágenes aquí",
        dropzoneDesc: "Puedes soltar varios archivos o carpetas completas. Los ordenaremos automáticamente.",
        selectImages: "Seleccionar imágenes",
        selectFolder: "Seleccionar Carpeta",
        clearAll: "Limpiar todo",
        createPdf: "Crear PDF",
        selectedImagesTitle: "Imágenes seleccionadas",
        fileLabel: "archivo",
        filesLabel: "archivos",
        addBtn: "Añadir",
        namePdfTitle: "Nombra tu PDF",
        namePdfDesc: "La extensión .pdf se añadirá automáticamente.",
        filenamePlaceholder: "documento",
        cancelBtn: "Cancelar",
        generatePdfBtn: "Generar PDF",
        errorGenerating: "Hubo un error al generar el PDF."
    }
};

export type Language = keyof typeof dictionaries;
export type Dictionary = typeof dictionaries.en;
