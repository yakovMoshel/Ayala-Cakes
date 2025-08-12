// app/api/media/list/route.js
import { NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const nextCursor = searchParams.get("next_cursor") || undefined;
    const folder = searchParams.get("folder") || undefined;

    const options = {
      resource_type: "image",
      type: "upload",
      max_results: 30,
    };

    if (nextCursor) options.next_cursor = nextCursor;
    // Use prefix to scope to a folder if provided (e.g., "my-folder/")
    if (folder) options.prefix = folder.endsWith("/") ? folder : `${folder}/`;

    const result = await cloudinary.api.resources(options);

    const payload = {
      resources: result.resources.map((r) => ({
        public_id: r.public_id,
        secure_url: r.secure_url,
        format: r.format,
        bytes: r.bytes,
        width: r.width,
        height: r.height,
        created_at: r.created_at,
        folder: r.folder,
      })),
      next_cursor: result.next_cursor || null,
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("Cloudinary list error:", error);
    return NextResponse.json(
      { error: "Failed to list media" },
      { status: 500 }
    );
  }
}


