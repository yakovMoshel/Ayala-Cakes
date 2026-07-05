// app/api/media/delete/route.js
import { NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";

export async function POST(req) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });
  }

  try {
    const body = await req.json();
    const { public_id, publicIds } = body || {};

    const ids = Array.isArray(publicIds)
      ? publicIds.filter(Boolean)
      : public_id
      ? [public_id]
      : [];

    if (!ids.length) {
      return NextResponse.json(
        { error: "No public_id(s) provided" },
        { status: 400 }
      );
    }

    let result;
    if (ids.length === 1) {
      result = await cloudinary.uploader.destroy(ids[0], {
        resource_type: "image",
        invalidate: true,
      });
    } else {
      result = await cloudinary.api.delete_resources(ids, {
        resource_type: "image",
        type: "upload",
        invalidate: true,
      });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}


