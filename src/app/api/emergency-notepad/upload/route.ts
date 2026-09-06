import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

function sanitizeNoteId(id?: string | null): string {
  if (!id || typeof id !== "string") return "default";
  return id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "default";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const rawNoteId = formData.get("noteId") as string | null;
    const noteId = sanitizeNoteId(rawNoteId);

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name;
    const fileType = file.type || "application/octet-stream";
    const fileSize = file.size;

    // Try Vercel Blob Storage first if token available
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`notepad-files/${noteId}/${Date.now()}-${filename}`, file, {
          access: "public",
          addRandomSuffix: true,
        });

        return NextResponse.json({
          id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: filename,
          url: blob.url,
          size: fileSize,
          type: fileType,
          uploadedAt: new Date().toISOString(),
        });
      } catch (blobErr) {
        console.warn("Vercel Blob upload failed, falling back to data URL:", blobErr);
      }
    }

    // Fallback: Convert file to Data URL if no blob token
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Data = buffer.toString("base64");
    const dataUrl = `data:${fileType};base64,${base64Data}`;

    return NextResponse.json({
      id: `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: filename,
      url: dataUrl,
      size: fileSize,
      type: fileType,
      uploadedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[EMERGENCY_NOTEPAD_UPLOAD_POST]", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
