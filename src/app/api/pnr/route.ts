import { NextRequest, NextResponse } from 'next/server';
import { fetchPnrStatus } from '@/services/railwayApi';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pnr = searchParams.get('pnr');

  if (!pnr || !/^\d{10}$/.test(pnr)) {
    return NextResponse.json({ success: false, error: 'Invalid 10-digit PNR' }, { status: 400 });
  }

  const data = await fetchPnrStatus(pnr);
  if (!data) {
    return NextResponse.json({ success: false, error: 'PNR not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}
