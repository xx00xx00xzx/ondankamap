import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// データベースファイルのパス
const DB_PATH = path.join(process.cwd(), 'data', 'weather_forecast.db');

// データベース接続を取得
export async function getDatabase(): Promise<Database> {
  return open({
    filename: DB_PATH,
    driver: sqlite3.Database
  });
}

// データベースの初期化
export async function initDatabase() {
  const db = await getDatabase();
  
  // 天気予報テーブルの作成
  await db.exec(`
    CREATE TABLE IF NOT EXISTS weather_forecasts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      saved_date DATE NOT NULL,
      forecast_date DATE NOT NULL,
      date_label TEXT,
      telop TEXT,
      max_temp REAL,
      min_temp REAL,
      is_tropical_night BOOLEAN DEFAULT 0,
      chance_of_rain_00_06 TEXT,
      chance_of_rain_06_12 TEXT,
      chance_of_rain_12_18 TEXT,
      chance_of_rain_18_24 TEXT,
      weather_detail TEXT,
      wind TEXT,
      wave TEXT,
      image_url TEXT,
      raw_data TEXT
    )
  `);
  
  // インデックスの作成
  await db.exec(`
    CREATE INDEX IF NOT EXISTS idx_saved_date ON weather_forecasts(saved_date);
    CREATE INDEX IF NOT EXISTS idx_forecast_date ON weather_forecasts(forecast_date);
  `);
  
  await db.close();
}

// 天気予報データの型
export interface WeatherForecastRecord {
  id?: number;
  saved_at?: string;
  saved_date: string;
  forecast_date: string;
  date_label?: string;
  telop?: string;
  max_temp?: number | null;
  min_temp?: number | null;
  is_tropical_night?: boolean;
  chance_of_rain_00_06?: string;
  chance_of_rain_06_12?: string;
  chance_of_rain_12_18?: string;
  chance_of_rain_18_24?: string;
  weather_detail?: string;
  wind?: string;
  wave?: string;
  image_url?: string;
  raw_data?: string;
}