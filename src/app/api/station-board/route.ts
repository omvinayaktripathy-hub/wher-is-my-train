import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveStationBoard } from '@/services/railwayApi';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const stationCode = searchParams.get('stationCode') || 'NDLS';

  const data = await fetchLiveStationBoard(stationCode);
  return NextResponse.json({ success: true, data });
}
