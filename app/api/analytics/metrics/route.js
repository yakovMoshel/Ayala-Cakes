import { NextResponse } from 'next/server';
import { connectToMongo } from '@/server/DL/connectToMongo';
import { verifyAdminSession } from '@/server/functions/verifyAdminSession';
import { getAdminMetrics } from '@/server/BL/metricsService';

export async function GET(request) {
  const auth = await verifyAdminSession();
  if (!auth.ok) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: auth.status }
    );
  }

  const range = new URL(request.url).searchParams.get('range') || 'all';

  try {
    await connectToMongo();
    const data = await getAdminMetrics(range);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error?.code === 'INVALID_RANGE') {
      return NextResponse.json(
        { success: false, error: 'טווח זמן לא תקין' },
        { status: 400 }
      );
    }
    console.error('[analytics/metrics]', error?.code || error?.name, error?.message);
    return NextResponse.json(
      { success: false, error: 'טעינת המדדים נכשלה' },
      { status: 500 }
    );
  }
}
