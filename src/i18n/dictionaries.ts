export const dictionaries = {
    en: {
        heroTitlePart1: "Docs to ",
        heroTitlePart2: "PDF",
        heroSubtitle: "Upload your documents or select a folder and convert them into a PDF document instantly.",
        dropzoneTitle: "Drag and drop your documents here",
        dropzoneDesc: "You can drop multiple files or entire folders. We will sort them automatically.",
        selectImages: "Select Documents",
        selectFolder: "Select Folder",
        clearAll: "Clear All",
        createPdf: "Create PDF",
        selectedImagesTitle: "Selected Documents",
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
        heroTitlePart1: "Docs a ",
        heroTitlePart2: "PDF",
        heroSubtitle: "Sube tus documentos o selecciona una carpeta y conviértelos en un documento PDF al instante.",
        dropzoneTitle: "Arrastra y suelta tus documentos aquí",
        dropzoneDesc: "Puedes soltar varios archivos o carpetas completas. Los ordenaremos automáticamente.",
        selectImages: "Seleccionar documentos",
        selectFolder: "Seleccionar Carpeta",
        clearAll: "Limpiar todo",
        createPdf: "Crear PDF",
        selectedImagesTitle: "Documentos seleccionados",
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
