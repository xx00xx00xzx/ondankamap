import { NextRequest, NextResponse } from 'next/server';
import { getSavedWeatherForecasts, getSavedDates } from '@/lib/weather-fetcher';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get('date');
    const action = searchParams.get('action');
    
    // 保存済みの日付一覧を取得
    if (action === 'dates') {
      const dates = await getSavedDates();
      return NextResponse.json({ dates });
    }
    
    // 天気予報データを取得
    const forecasts = await getSavedWeatherForecasts(date || undefined);
    return NextResponse.json({ forecasts });
    
  } catch (error) {
    console.error('Error in weather API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}