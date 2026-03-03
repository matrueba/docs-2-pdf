"use client";

import { useState, useRef } from "react";
import { generatePDFFromImages } from "@/lib/pdfGenerator";
import { UploadCloud, FolderUp, FileImage, Trash2, FileOutput, Loader2, Plus, Download } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Dashboard() {
    const { t } = useLanguage();
    const [images, setImages] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [showNameDialog, setShowNameDialog] = useState(false);
    const [pdfName, setPdfName] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const processFiles = (fileList: FileList | File[]) => {
        const validFiles = Array.from(fileList).filter(file => file.type === "image/png" || file.name.toLowerCase().endsWith(".png"));
        validFiles.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));
        setImages(prev => {
            const newFiles = [...prev, ...validFiles];
            const uniqueFiles = newFiles.filter((file, index, self) =>
                index === self.findIndex((f) => f.name === file.name && f.size === file.size)
            );
            return uniqueFiles;
        });
    };

    const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
    const onDragLeave = () => setIsDragging(false);
    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) processFiles(e.dataTransfer.files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) processFiles(e.target.files);
        if (fileInputRef.current) fileInputRef.current.value = "";
        if (folderInputRef.current) folderInputRef.current.value = "";
    };

    const removeImage = (indexToRemove: number) => setImages(images.filter((_, index) => index !== indexToRemove));
    const clearAll = () => setImages([]);

    const generatePDF = async () => {
        if (images.length === 0) return;
        setIsGenerating(true);
        try {
            await generatePDFFromImages(images, pdfName || t.filenamePlaceholder);
            setShowNameDialog(false);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert(t.errorGenerating);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="flex flex-col items-center w-full max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">

            {/* Hero Header */}
            <div className="text-center space-y-4 animate-float-in">
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1]">
                    {t.heroTitlePart1}
                    <span className="bg-gradient-to-r from-indigo-600 via-purple-500 to-violet-500 bg-clip-text text-transparent">
                        {t.heroTitlePart2}
                    </span>
                </h1>
                <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
                    {t.heroSubtitle}
                </p>
            </div>

            {/* Drop Zone Card */}
            <div
                className="w-full glass-card"
                style={{ animationDelay: '100ms' }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
            >
                <div className={`drop-zone p-10 md:p-14 flex flex-col items-center justify-center text-center min-h-[300px] ${isDragging ? 'dragging' : ''}`}>
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                        <UploadCloud className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">
                        {t.dropzoneTitle}
                    </h3>
                    <p className="text-slate-500 mb-8 max-w-md text-[15px]">
                        {t.dropzoneDesc}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-5">
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="btn-primary"
                        >
                            <FileImage className="w-5 h-5" />
                            {t.selectImages}
                        </button>

                        <button
                            onClick={() => folderInputRef.current?.click()}
                            className="btn-secondary"
                        >
                            <FolderUp className="w-5 h-5" />
                            {t.selectFolder}
                        </button>
                    </div>

                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" multiple accept="image/png" />
                    {/* @ts-ignore */}
                    <input type="file" ref={folderInputRef} onChange={handleFileSelect} className="hidden" webkitdirectory="true" directory="true" multiple />
                </div>
            </div>

            {/* Selected Images Section */}
            {images.length > 0 && (
                <div className="w-full animate-float-in">
                    {/* Action buttons */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <button onClick={clearAll} className="btn-danger-ghost">
                            <Trash2 className="w-4 h-4" />
                            {t.clearAll}
                        </button>
                        <button onClick={() => setShowNameDialog(true)} className="btn-dark">
                            <FileOutput className="w-4 h-4" />
                            {t.createPdf}
                        </button>
                    </div>
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-6">
                        <FileImage className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-xl font-bold text-slate-800">{t.selectedImagesTitle}</h2>
                        <span className="text-sm text-slate-500">({images.length} {images.length === 1 ? t.fileLabel : t.filesLabel})</span>
                    </div>

                    {/* Image Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4">
                        {images.map((img, idx) => (
                            <div key={`${img.name}-${idx}`} className="group relative aspect-square img-card">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={URL.createObjectURL(img)}
                                    alt={img.name}
                                    className="w-full h-full object-cover"
                                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-4">
                                    <span className="text-xs text-white font-medium truncate w-full text-center mb-3">{img.name}</span>
                                    <button
                                        onClick={() => removeImage(idx)}
                                        className="p-2 bg-white/90 hover:bg-red-500 hover:text-white text-slate-700 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-110"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="absolute top-2.5 left-2.5 badge bg-white/95 text-slate-700 shadow-sm">
                                    {idx + 1}
                                </div>
                            </div>
                        ))}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 hover:border-indigo-400 hover:text-indigo-500 hover:bg-indigo-50/50 transition-all duration-300 cursor-pointer"
                        >
                            <Plus className="w-7 h-7 mb-1.5" />
                            <span className="text-sm font-semibold">{t.addBtn}</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Name Dialog Modal */}
            {showNameDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center modal-overlay p-4 animate-scale-in">
                    <div className="modal-card p-8 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
                                <FileOutput className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">{t.namePdfTitle}</h3>
                        </div>
                        <p className="text-slate-500 text-sm mb-6 ml-[52px]">
                            {t.namePdfDesc}
                        </p>

                        <div className="flex flex-col space-y-5">
                            <input
                                type="text"
                                value={pdfName}
                                onChange={(e) => setPdfName(e.target.value)}
                                placeholder={t.filenamePlaceholder}
                                className="input-elegant"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !isGenerating) generatePDF();
                                    if (e.key === "Escape") setShowNameDialog(false);
                                }}
                            />

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowNameDialog(false)}
                                    disabled={isGenerating}
                                    className="btn-secondary !py-3 !px-5"
                                >
                                    {t.cancelBtn}
                                </button>
                                <button
                                    onClick={generatePDF}
                                    disabled={isGenerating}
                                    className="btn-primary !py-3 min-w-[140px]"
                                >
                                    {isGenerating ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5" />
                                            {t.generatePdfBtn}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
