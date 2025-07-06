import { NextResponse } from 'next/server';
import { fetchAndSaveWeatherForecast } from '@/lib/weather-fetcher';

export async function POST() {
  try {
    const result = await fetchAndSaveWeatherForecast();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Weather forecast saved for ${result.savedDate}`
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in weather fetch API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch and save weather data' },
      { status: 500 }
    );
  }
}