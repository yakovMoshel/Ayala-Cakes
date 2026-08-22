// app/api/upload/route.js
import { NextResponse } from "next/server";
import cloudinary from "@/utils/cloudinary";
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
    const folder = process.env.CLOUDINARY_UPLOAD_FOLDER || "ayala-media";
    const sanitizedFilename = filename ? sanitizePublicIdBasename(String(filename)) : '';
    const uploadContext = buildCloudinaryContext(alt ? String(alt) : '');
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // המרת הקובץ לבאפר
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // העלאה ל-Cloudinary עם אופטימיזציה ברירת מחדל
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          ...(sanitizedFilename
            ? { public_id: `${folder}/${sanitizedFilename}`, use_filename: false, unique_filename: false }
            : { folder, use_filename: true, unique_filename: true }),
          format: "webp", // המרה ל-WEBP כבר בעלאה
          quality: "auto", // דחיסה חכמה
          transformation: [
            { width: 2000, crop: "limit" } // מגביל רוחב מירבי כדי לשמור על משקל
          ],
          ...(uploadContext ? { context: uploadContext } : {}),
          overwrite: false,
        },
        (error, result) => {
          if (error) reject(error);
          resolve(result);
        }
      ).end(buffer);
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