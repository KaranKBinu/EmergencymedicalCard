import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return new NextResponse("Filename is required", { status: 400 });
    }

    // addRandomSuffix: true ensures unique URLs so different users uploading
    // files with the same name never collide in blob storage.
    const blob = await put(filename, req.body!, {
      access: "public",
      addRandomSuffix: true,
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error("[UPLOAD_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
      return new NextResponse("URL is required", { status: 400 });
    }

    await del(url);
    return new NextResponse("Deleted", { status: 200 });
  } catch (error) {
    console.error("[UPLOAD_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}


