"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { WeatherForecast } from "@/types/temperature";
import temperatureData from "@/data/tokyo_temperature_data.json";
import { TemperatureData } from "@/types/temperature";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Title,
} from "chart.js";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip, Title);

// weather.tsukumijima.net API URL（東京:130010）
const API_URL = "https://weather.tsukumijima.net/api/forecast/city/130010";

// メモリキャッシュ
let forecastCache: WeatherForecast[] | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 60 * 60 * 1000; // 1時間

// MM-DD抽出関数（ゼロ埋め対応）
function getMMDDfromDateStr(dateStr: string): string {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const m = parts[1].padStart(2, "0");
  const d = parts[2].padStart(2, "0");
  return `${m}-${d}`;
}

// 天気名→アイコン変換関数（livedoor/気象庁API仕様）
function getWeatherInfo(telop: string): { label: string; icon: string } {
  if (telop.includes("晴")) return { label: telop, icon: "晴" };
  if (telop.includes("曇")) return { label: telop, icon: "曇" };
  if (telop.includes("雨")) return { label: telop, icon: "雨" };
  if (telop.includes("雪")) return { label: telop, icon: "雪" };
  return { label: telop, icon: "天気" };
}

// weather.tsukumijima.net API forecast型
type TsukumiForecast = {
  date: string;
  temperature: {
    min: { celsius: string | null } | null;
    max: { celsius: string | null } | null;
  };
  telop: string;
};

export default function WeekPage() {
  // 週間予報データの状態
  const [forecast, setForecast] = useState<WeatherForecast[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 過去データ（JSON）
  const rawData = temperatureData as TemperatureData[];

  // 今年の週の日付リスト
  const weekDates = forecast?.map(f => f.date) ?? [];

  // 過去データから同じ日付の年ごとの気温リストを作成
  // 例: { "07-06": [2020年, 2021年, ...] }
  const historicalByDate: Record<string, TemperatureData[]> = {};
  for (const d of rawData) {
    const md = getMMDDfromDateStr(d.date); // 修正: ゼロ埋め対応
    if (!historicalByDate[md]) historicalByDate[md] = [];
    historicalByDate[md].push(d);
  }

  // 週間予報日付ごとに、過去の年の平均気温を算出
  const historicalAverages = weekDates.map(date => {
    const md = date.slice(5, 7) + "-" + date.slice(8, 10); // "YYYY-MM-DD"→"MM-DD"
    const records = historicalByDate[md] || [];
    const avgMax = records.length ? records.reduce((sum, d) => sum + d.max_temp, 0) / records.length : null;
    const avgMin = records.length ? records.reduce((sum, d) => sum + d.min_temp, 0) / records.length : null;
    return { date, avgMax, avgMin };
  });

  // グラフ用データ整形（雛形）
  const chartData = weekDates.map((date, i) => ({
    date,
    forecastMax: forecast ? forecast[i].max_temp : null,
    forecastMin: forecast ? forecast[i].min_temp : null,
    historicalMax: historicalAverages[i]?.avgMax,
    historicalMin: historicalAverages[i]?.avgMin,
    telop: forecast ? forecast[i].telop : "",
    isTropicalNight: forecast ? forecast[i].is_tropical_night : false
  }));

  // デバッグ: chartDataの中身を出力
  console.log("[WeekPage] chartData", chartData);

  // weather.tsukumijima.net APIからデータ取得（雛形）
  useEffect(() => {
    async function fetchForecast() {
      setLoading(true);
      setError(null);
      if (forecastCache && cacheTimestamp && Date.now() - cacheTimestamp < CACHE_DURATION) {
        setForecast(forecastCache);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("APIリクエスト失敗");
        const data = await res.json();
        // livedoor/気象庁APIのforecasts配列をWeatherForecast型に変換
        const forecasts: WeatherForecast[] = (data.forecasts || []).map((f: TsukumiForecast) => {
          const minTemp = f.temperature && f.temperature.min && f.temperature.min.celsius !== null ? Number(f.temperature.min.celsius) : null;
          return {
            date: f.date,
            max_temp: f.temperature && f.temperature.max && f.temperature.max.celsius !== null ? Number(f.temperature.max.celsius) : null,
            min_temp: minTemp,
            weather_code: 0,
            temp_anomaly_max: 0,
            temp_anomaly_min: 0,
            telop: f.telop ?? "",
            is_tropical_night: minTemp !== null ? minTemp >= 25 : false,
          };
        });
        forecastCache = forecasts;
        cacheTimestamp = Date.now();
        setForecast(forecasts);
      } catch {
        setError("天気予報データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchForecast();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">3日間天気予報と過去比較</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            weather.tsukumijima.net APIによる「今日・明日・明後日」の3日間予報と、過去同日の気温データを比較します。
          </p>
          <p className="text-sm text-gray-400 mt-2">※このAPIは3日分（今日・明日・明後日）のみ取得可能です。週間全体の予報ではありません。</p>
        </header>
        <div className="mb-8 text-center">
          <Link href="/" className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors">
            年次分析に戻る
          </Link>
        </div>
        <section className="bg-white rounded-xl shadow-lg p-6 min-h-[300px]">
          {loading ? (
            <div className="text-center text-gray-500">週間予報データを取得中...</div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : forecast && forecast.length > 0 ? (
            <div>
              {/* テレビの週間天気予報風カード表示 */}
              <div className="flex flex-row justify-between gap-2 md:gap-4 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 w-full bg-white/90 border-b border-gray-100 rounded-2xl shadow-none">
                {chartData.map((d, i) => {
                  const info = getWeatherInfo(chartData[i].telop || "不明");
                  // 曜日取得
                  const dateObj = parseISO(d.date.replace(/\//g, "-"));
                  const dow = format(dateObj, "E", { locale: ja });
                  const mmdd = format(dateObj, "MM/dd");
                  
                  // 気温基準ラベルの判定
                  let dayTempLabel = "";
                  let dayTempLabelColor = "";
                  
                  if (d.forecastMax !== null) {
                    if (d.forecastMax >= 35) {
                      dayTempLabel = "猛暑日";
                      dayTempLabelColor = "bg-red-500 text-white";
                    } else if (d.forecastMax >= 30) {
                      dayTempLabel = "真夏日";
                      dayTempLabelColor = "bg-orange-400 text-white";
                    } else if (d.forecastMax >= 25) {
                      dayTempLabel = "夏日";
                      dayTempLabelColor = "bg-yellow-300 text-gray-800";
                    }
                  }
                  
                  return (
                    <div
                      key={d.date}
                      className="relative flex flex-col items-center justify-between py-4 px-2 w-[60px] md:w-full min-w-[60px] md:min-w-0 select-none"
                      style={{ flex: "1 1 0%" }}
                    >
                      {/* 気温基準ラベル（左上） */}
                      {dayTempLabel && (
                        <span className={`absolute top-1 left-1 text-xs font-bold rounded px-1 py-0.5 ${dayTempLabelColor} z-10 shadow-sm`}>{dayTempLabel}</span>
                      )}
                      {/* 熱帯夜ラベル（右上） */}
                      {d.isTropicalNight && (
                        <span className="absolute top-1 right-1 text-xs font-bold rounded px-1 py-0.5 bg-purple-500 text-white z-10 shadow-sm">熱帯夜</span>
                      )}
                      {/* 日付＋曜日 */}
                      <span className="text-xs md:text-sm font-semibold text-gray-600 mb-1 tracking-wide">{mmdd} ({dow})</span>
                      {/* 天気アイコン */}
                      <span className="text-3xl md:text-4xl mb-1 drop-shadow-sm">{info.icon}</span>
                      {/* 最高気温 */}
                      <span className="text-lg md:text-xl font-bold text-orange-500 leading-tight mb-0.5">{d.forecastMax !== null ? `${d.forecastMax.toFixed(0)}°` : "-"}</span>
                      {/* 最低気温 */}
                      <span className={`text-base md:text-lg font-semibold leading-tight mb-1 ${d.isTropicalNight ? 'text-purple-500 font-bold' : 'text-blue-500'}`}>{d.forecastMin !== null ? `${d.forecastMin.toFixed(0)}°` : "-"}</span>
                      {/* 過去平均・差分 */}
                      <div className="flex flex-col items-center text-[10px] md:text-xs text-gray-400 mt-1">
                        <span>過去:{d.historicalMax !== null ? `${d.historicalMax.toFixed(0)}°` : "-"}/{d.historicalMin !== null ? `${d.historicalMin.toFixed(0)}°` : "-"}</span>
                        <span>差分:{d.forecastMax !== null && d.historicalMax !== null ? `+${(d.forecastMax - d.historicalMax).toFixed(1)}°` : ""}/{d.forecastMin !== null && d.historicalMin !== null ? `+${(d.forecastMin - d.historicalMin).toFixed(1)}°` : ""}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">データがありません</div>
          )}
        </section>
      </div>
    </div>
  );
} 