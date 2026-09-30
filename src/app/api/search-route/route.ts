import { NextRequest, NextResponse } from 'next/server';
import { findTrainsBetweenStations } from '@/services/railwayApi';
import { POPULAR_TRAINS } from '@/data/trainData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';

  if (!from || !to) {
    return NextResponse.json({ success: false, error: 'From and To parameters are required' }, { status: 400 });
  }

  const matching = findTrainsBetweenStations(from, to);

  // If no direct trains in dataset, return closest popular trains or fallback
  const results = matching.length > 0 ? matching : POPULAR_TRAINS.slice(0, 3);

  return NextResponse.json({
    success: true,
    data: results,
    isDirect: matching.length > 0,
  });
}
