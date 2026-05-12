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
    const overwrite = searchParams.get("overwrite") === "true";

    if (!filename) {
      return new NextResponse("Filename is required", { status: 400 });
    }

    try {
      const blob = await put(filename, req.body!, {
        access: "public",
        addRandomSuffix: false,
        allowOverwrite: overwrite,
      });

      return NextResponse.json(blob);
    } catch (error: any) {
      if (error.message?.includes("already exists") && !overwrite) {
        return new NextResponse("ALREADY_EXISTS", { status: 409 });
      }
      throw error;
    }
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

