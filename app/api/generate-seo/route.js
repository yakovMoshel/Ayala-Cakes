import { NextResponse } from 'next/server';
import { generateProductSEO, generatePostSEO, generateSlug } from '@/server/BL/geminiService';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: 'חסרים פרמטרים נדרשים' },
        { status: 400 }
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
      data: result
    });

  } catch (error) {
    console.error('Error in generate-seo API:', error);
    return NextResponse.json(
      { error: error.message || 'שגיאה בשרת' },
      { status: 500 }
    );
  }
} 