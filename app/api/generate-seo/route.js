import { NextResponse } from 'next/server';
import {
  generateProductSEO,
  generatePostSEO,
  generateFullBlogPost,
  generateSlug,
} from '@/server/BL/geminiService';
import { verifyAdminSession } from '@/server/functions/verifyAdminSession';
import { isRateLimited, getClientIp } from '@/utils/rateLimit';

// Full blog = 2 Gemini calls; default Vercel limit (~10s) causes 504.
export const maxDuration = 60;

export async function POST(request) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: auth.status });
  }

  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'חסרים פרמטרים נדרשים' },
        { status: 400 }
      );
    }

    const clientIp = getClientIp(request);
    const isFullBlog = type === 'post-full';
    const rateKey = `generate-seo:${isFullBlog ? 'full' : 'seo'}:${clientIp}`;
    const rateLimit = isFullBlog
      ? { windowMs: 60 * 1000, max: 2 }
      : { windowMs: 60 * 1000, max: 5 };

    if (isRateLimited(rateKey, rateLimit)) {
      return NextResponse.json(
        {
          error: isFullBlog
            ? 'יותר מדי בקשות ליצירת פוסט מלא — נסו שוב בעוד דקה'
            : 'יותר מדי בקשות — נסו שוב בעוד דקה',
        },
        { status: 429 }
      );
    }

    let result;

    switch (type) {
      case 'product':
        result = await generateProductSEO(data);
        break;
      case 'post':
        result = await generatePostSEO(data);
        break;
      case 'post-full': {
        if (!data.topic?.trim()) {
          return NextResponse.json(
            { error: 'נושא הפוסט נדרש ליצירת פוסט מלא' },
            { status: 400 }
          );
        }
        result = await generateFullBlogPost(data);
        break;
      }
      case 'slug':
        result = { slug: await generateSlug(data.title) };
        break;
      default:
        return NextResponse.json(
          { error: 'סוג לא נתמך' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in generate-seo API:', error);
    return NextResponse.json(
      { error: error.message || 'שגיאה בשרת' },
      { status: 500 }
    );
  }
}
