// テスト用エンドポイント：天気予報を手動で取得
import { NextResponse } from 'next/server';
import { fetchAndSaveWeatherForecast } from '@/lib/weather-fetcher';

export async function GET() {
  try {
    const result = await fetchAndSaveWeatherForecast();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch weather', details: error },
      { status: 500 }
    );
  }
}