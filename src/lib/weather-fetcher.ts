import { getDatabase, initDatabase, WeatherForecastRecord } from './db';
import { format } from 'date-fns';

const API_URL = "https://weather.tsukumijima.net/api/forecast/city/130010";

// APIから天気予報を取得してDBに保存
export async function fetchAndSaveWeatherForecast() {
  console.log('Starting weather forecast fetch...');
  
  try {
    // データベースの初期化
    await initDatabase();
    
    // APIからデータを取得
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const data = await response.json();
    const savedDate = format(new Date(), 'yyyy-MM-dd');
    
    // データベースに接続
    const db = await getDatabase();
    
    // 既存の同日データを削除（重複を避けるため）
    await db.run('DELETE FROM weather_forecasts WHERE saved_date = ?', savedDate);
    
    // 各予報日のデータを保存
    for (const forecast of data.forecasts || []) {
      const minTemp = forecast.temperature?.min?.celsius ? Number(forecast.temperature.min.celsius) : null;
      
      const record: WeatherForecastRecord = {
        saved_date: savedDate,
        forecast_date: forecast.date,
        date_label: forecast.dateLabel,
        telop: forecast.telop,
        max_temp: forecast.temperature?.max?.celsius ? Number(forecast.temperature.max.celsius) : null,
        min_temp: minTemp,
        is_tropical_night: minTemp !== null ? minTemp >= 25 : false,
        chance_of_rain_00_06: forecast.chanceOfRain?.T00_06,
        chance_of_rain_06_12: forecast.chanceOfRain?.T06_12,
        chance_of_rain_12_18: forecast.chanceOfRain?.T12_18,
        chance_of_rain_18_24: forecast.chanceOfRain?.T18_24,
        weather_detail: forecast.detail?.weather,
        wind: forecast.detail?.wind,
        wave: forecast.detail?.wave,
        image_url: forecast.image?.url,
        raw_data: JSON.stringify(forecast)
      };
      
      await db.run(
        `INSERT INTO weather_forecasts (
          saved_date, forecast_date, date_label, telop,
          max_temp, min_temp, is_tropical_night,
          chance_of_rain_00_06, chance_of_rain_06_12,
          chance_of_rain_12_18, chance_of_rain_18_24,
          weather_detail, wind, wave, image_url, raw_data
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          record.saved_date,
          record.forecast_date,
          record.date_label,
          record.telop,
          record.max_temp,
          record.min_temp,
          record.is_tropical_night,
          record.chance_of_rain_00_06,
          record.chance_of_rain_06_12,
          record.chance_of_rain_12_18,
          record.chance_of_rain_18_24,
          record.weather_detail,
          record.wind,
          record.wave,
          record.image_url,
          record.raw_data
        ]
      );
    }
    
    await db.close();
    console.log(`Weather forecast saved successfully for ${savedDate}`);
    return { success: true, savedDate };
  } catch (error) {
    console.error('Error fetching and saving weather forecast:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// 保存されたデータを取得
export async function getSavedWeatherForecasts(date?: string) {
  const db = await getDatabase();
  
  try {
    if (date) {
      // 特定の日付のデータを取得
      const forecasts = await db.all(
        'SELECT * FROM weather_forecasts WHERE saved_date = ? ORDER BY forecast_date',
        date
      );
      return forecasts;
    } else {
      // 最新のデータを取得
      const latestDate = await db.get(
        'SELECT MAX(saved_date) as latest_date FROM weather_forecasts'
      );
      
      if (latestDate?.latest_date) {
        const forecasts = await db.all(
          'SELECT * FROM weather_forecasts WHERE saved_date = ? ORDER BY forecast_date',
          latestDate.latest_date
        );
        return forecasts;
      }
      
      return [];
    }
  } finally {
    await db.close();
  }
}

// 保存済みの日付一覧を取得
export async function getSavedDates() {
  const db = await getDatabase();
  
  try {
    const dates = await db.all(
      'SELECT DISTINCT saved_date FROM weather_forecasts ORDER BY saved_date DESC'
    );
    return dates.map(d => d.saved_date);
  } finally {
    await db.close();
  }
}