import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import * as libre from "libreoffice-convert";
import { promisify } from "util";

const convertWithOptionsAsync = promisify(libre.convertWithOptions);

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const inputBuffer = Buffer.from(arrayBuffer);

        // Generate a random ID for the filename to prevent any conflicts
        const originalName = file.name || "document.xlsx";
        const ext = originalName.includes(".") ? originalName.substring(originalName.lastIndexOf('.')) : '.xlsx';
        const randomName = `${Math.random().toString(36).substring(2, 15)}${ext}`;

        // Convert xlsx to pdf
        const outputBuffer = await convertWithOptionsAsync(
            inputBuffer,
            ".pdf",
            undefined,
            { fileName: randomName }
        );

        return new NextResponse(new Uint8Array(outputBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
            },
        });
    } catch (error) {
        console.error("Error converting XLSX to PDF:", error);
        return NextResponse.json(
            { error: "Error converting document" },
            { status: 500 }
        );
    }
}
