"use client";

import { useEffect, useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trash2, FileText, Table } from "lucide-react";

interface SortableImageCardProps {
    item: { id: string; file: File };
    index: number;
    removeImage: (id: string) => void;
}

export function SortableImageCard({ item, index, removeImage }: SortableImageCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 2 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    const img = item.file;
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (img.type.startsWith("image/") || img.name.match(/\.(png|jpe?g)$/i)) {
            const url = URL.createObjectURL(img);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreview(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [img]);

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="group relative aspect-square img-card cursor-grab active:cursor-grabbing hover:z-10 bg-white"
        >
            {preview ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                    src={preview}
                    alt={img.name}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                />
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 rounded-2xl p-4 pointer-events-none">
                    {img.name.toLowerCase().endsWith('.docx') ? (
                        <FileText className="w-12 h-12 text-blue-500 mb-2" />
                    ) : img.type === "application/pdf" || img.name.toLowerCase().endsWith('.pdf') ? (
                        <FileText className="w-12 h-12 text-red-500 mb-2" />
                    ) : (
                        <Table className="w-12 h-12 text-green-500 mb-2" />
                    )}
                    <span className="text-xs font-semibold text-slate-500">{img.name.split('.').pop()?.toUpperCase()}</span>
                </div>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-4 pointer-events-none">
                <span className="text-xs text-white font-medium truncate w-full text-center mb-8 pointer-events-none">{img.name}</span>
            </div>

            <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                    e.stopPropagation();
                    removeImage(item.id);
                }}
                className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 bg-white/90 hover:bg-red-500 hover:text-white text-slate-700 rounded-xl transition-all duration-200 shadow-lg transform hover:scale-110 opacity-0 group-hover:opacity-100 z-10"
            >
                <Trash2 className="w-4 h-4" />
            </button>

            <div className="absolute top-2.5 left-2.5 badge bg-white/95 text-slate-700 shadow-sm pointer-events-none">
                {index + 1}
            </div>
        </div>
    );
}
