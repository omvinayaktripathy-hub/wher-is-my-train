import { NextRequest, NextResponse } from 'next/server';
import { fetchLiveTrainStatus } from '@/services/railwayApi';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const trainNo = searchParams.get('trainNo') || '22436';

  const data = await fetchLiveTrainStatus(trainNo);
  if (!data) {
    return NextResponse.json({ success: false, error: 'Train not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data });
}
