// app/api/upload/route.js
import { NextResponse } from "next/server";
import { uploadImageBuffer } from "@/server/functions/uploadImageBuffer.mjs";
import { verifyAdminSession } from "@/server/functions/verifyAdminSession";
import { sanitizePublicIdBasename } from "@/utils/cloudinaryPublicId";
import { buildCloudinaryContext } from "@/utils/cloudinaryContext";

export async function POST(req) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const filename = formData.get('filename');
    const alt = formData.get('alt');
    const sanitizedFilename = filename ? sanitizePublicIdBasename(String(filename)) : '';
    const uploadContext = buildCloudinaryContext(alt ? String(alt) : '');
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await uploadImageBuffer(buffer, {
      filename: sanitizedFilename,
      context: uploadContext,
    });

    return NextResponse.json({ url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}