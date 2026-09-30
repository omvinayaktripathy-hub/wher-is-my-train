import { NextRequest, NextResponse } from 'next/server';
import { findTrainsBetweenStations, calculateTrainFares, fetchLiveTrainStatus } from '@/services/railwayApi';
import { POPULAR_TRAINS } from '@/data/trainData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  const trainNo = searchParams.get('trainNo') || '';
  const quota = searchParams.get('quota') || 'GENERAL';

  if (trainNo) {
    const train = await fetchLiveTrainStatus(trainNo);
    const fares = calculateTrainFares(train, quota);
    return NextResponse.json({ success: true, data: [fares] });
  }

  if (from && to) {
    let trains = findTrainsBetweenStations(from, to);
    if (trains.length === 0) {
      trains = [POPULAR_TRAINS[5], POPULAR_TRAINS[0]]; // fallback to popular (e.g. 12835 and 22436)
    }

    const results = trains.map((t) => calculateTrainFares(t, quota));
    return NextResponse.json({ success: true, data: results });
  }

  // Default to popular trains
  const results = POPULAR_TRAINS.slice(0, 3).map((t) => calculateTrainFares(t, quota));
  return NextResponse.json({ success: true, data: results });
}
