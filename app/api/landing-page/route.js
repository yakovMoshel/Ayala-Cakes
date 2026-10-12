import { NextResponse } from 'next/server';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { createLandingPage, listLandingPages } from '@/server/BL/landingPageService';
import { verifyAdminSession } from '@/server/functions/verifyAdminSession';
import { fieldsErrorResponse } from '@/server/functions/uniqueSlug';
import { serializeData } from '@/utils/serialization';

export async function GET() {
    const auth = await verifyAdminSession();
    if (!auth.ok) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
    }

    try {
        await connectToMongo();
        const pages = await listLandingPages();
        return NextResponse.json({ success: true, data: serializeData(pages) });
    } catch (error) {
        console.error('Landing page list failed:', error);
        return NextResponse.json({ success: false, error: 'Request failed' }, { status: 500 });
    }
}

export async function POST(req) {
    const auth = await verifyAdminSession();
    if (!auth.ok) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: auth.status });
    }

    try {
        const body = await req.json();
        const result = await createLandingPage(body);
        if (!result.ok) {
            return NextResponse.json(fieldsErrorResponse(result.fields), { status: 400 });
        }
        return NextResponse.json({ success: true, data: serializeData(result.page) });
    } catch (error) {
        console.error('Landing page create failed:', error);
        if (error?.code === 11000) {
            return NextResponse.json(
                fieldsErrorResponse({ slug: 'הכתובת כבר בשימוש. בחרו כתובת אחרת.' }),
                { status: 400 }
            );
        }
        return NextResponse.json({ success: false, error: 'Request failed' }, { status: 500 });
    }
}
