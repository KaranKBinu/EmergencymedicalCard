import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import fs from "fs/promises";
import path from "path";

export interface NoteAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export interface NoteData {
  noteId: string;
  content: string;
  attachments: NoteAttachment[];
  password?: string | null;
  isLocked?: boolean;
  updatedAt: string;
}

const LOCAL_STORAGE_DIR = path.join(process.cwd(), ".next", "emergency-notepad-store");

function sanitizeNoteId(id?: string | null): string {
  if (!id || typeof id !== "string") return "default";
  return id.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 64) || "default";
}

function getLocalFilePath(noteId: string): string {
  return path.join(LOCAL_STORAGE_DIR, `note-${noteId}.json`);
}

async function readLocalFallback(noteId: string): Promise<NoteData> {
  try {
    const filePath = getLocalFilePath(noteId);
    const data = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(data);
    return {
      noteId,
      content: parsed.content || "",
      attachments: Array.isArray(parsed.attachments) ? parsed.attachments : [],
      password: parsed.password || null,
      isLocked: Boolean(parsed.isLocked && parsed.password),
      updatedAt: parsed.updatedAt || new Date().toISOString(),
    };
  } catch {
    return {
      noteId,
      content: "",
      attachments: [],
      password: null,
      isLocked: false,
      updatedAt: new Date().toISOString(),
    };
  }
}

async function writeLocalFallback(note: NoteData) {
  try {
    await fs.mkdir(LOCAL_STORAGE_DIR, { recursive: true });
    const filePath = getLocalFilePath(note.noteId);
    await fs.writeFile(filePath, JSON.stringify(note), "utf-8");
  } catch (err) {
    console.error("Local fallback write failed:", err);
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const noteId = sanitizeNoteId(searchParams.get("noteId"));
    const reqPassword = searchParams.get("password") || "";

    let noteData: NoteData = await readLocalFallback(noteId);

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const res = await fetch(`https://blob.vercel-storage.com/emergency-notepad-${noteId}.json`, {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          noteData = {
            noteId,
            content: data.content || "",
            attachments: Array.isArray(data.attachments) ? data.attachments : [],
            password: data.password || null,
            isLocked: Boolean(data.isLocked && data.password),
            updatedAt: data.updatedAt || new Date().toISOString(),
          };
        }
      } catch {
        // Fallback to local
      }
    }

    // If note is locked and request doesn't match password, redact sensitive fields
    if (noteData.isLocked && noteData.password) {
      if (reqPassword !== noteData.password) {
        return NextResponse.json({
          noteId,
          isLocked: true,
          hasPassword: true,
          content: "",
          attachments: [],
          updatedAt: noteData.updatedAt,
        });
      }
    }

    return NextResponse.json({
      ...noteData,
      isLocked: Boolean(noteData.isLocked && noteData.password),
      hasPassword: Boolean(noteData.password),
    });
  } catch (error) {
    console.error("[EMERGENCY_NOTEPAD_GET]", error);
    return NextResponse.json({
      noteId: "default",
      content: "",
      attachments: [],
      isLocked: false,
      updatedAt: new Date().toISOString(),
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const noteId = sanitizeNoteId(body.noteId);
    const content = typeof body.content === "string" ? body.content : "";
    const attachments = Array.isArray(body.attachments) ? body.attachments : [];
    const password = typeof body.password === "string" ? body.password : null;
    const isLocked = Boolean(body.isLocked && password);

    const noteData: NoteData = {
      noteId,
      content,
      attachments,
      password: password || null,
      isLocked,
      updatedAt: new Date().toISOString(),
    };

    await writeLocalFallback(noteData);

    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        const blob = await put(`emergency-notepad-${noteId}.json`, JSON.stringify(noteData), {
          access: "public",
          addRandomSuffix: false,
        });
        return NextResponse.json({
          noteId,
          content,
          attachments,
          isLocked,
          hasPassword: Boolean(password),
          updatedAt: noteData.updatedAt,
          url: blob.url,
          syncedToCloud: true,
        });
      } catch (blobError) {
        console.warn("Vercel blob put failed, using local cloud fallback:", blobError);
      }
    }

    return NextResponse.json({
      noteId,
      content,
      attachments,
      isLocked,
      hasPassword: Boolean(password),
      updatedAt: noteData.updatedAt,
      syncedToCloud: false,
    });
  } catch (error) {
    console.error("[EMERGENCY_NOTEPAD_POST]", error);
    return NextResponse.json({ error: "Failed to sync note" }, { status: 500 });
  }
}
