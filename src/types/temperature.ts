/**
 * 気温データの型定義
 */
export interface TemperatureData {
  date: string;
  year: number;
  month: number;
  day: number;
  max_temp: number;
  min_temp: number;
}

/**
 * 年次集計データ
 */
export interface AnnualData {
  year: number;
  avg_max_temp: number;
  avg_min_temp: number;
  temp_diff: number;
}

/**
 * 月次集計データ
 */
export interface MonthlyData {
  month: number;
  month_name: string;
  avg_max_temp: number;
  avg_min_temp: number;
  temp_diff: number;
}

/**
 * 月別年次推移データ
 */
export interface MonthlyYearlyData {
  year: number;
  month: number;
  month_name: string;
  avg_max_temp: number;
  avg_min_temp: number;
  temp_diff: number;
}

/**
 * 日別集計データ（365日分）
 */
export interface DailyData {
  day_of_year: number;
  month: number;
  day: number;
  date_label: string;
  avg_max_temp: number;
  avg_min_temp: number;
  temp_diff: number;
}

/**
 * 天気予報データ（Open-Meteo API）
 */
export interface WeatherForecast {
  date: string;
  max_temp: number;
  min_temp: number;
  weather_code: number;
  temp_anomaly_max: number;
  temp_anomaly_min: number;
  telop?: string; // 天気名（livedoor/気象庁API用）
  is_tropical_night?: boolean; // 熱帯夜判定（最低気温25度以上）
}