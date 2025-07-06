"use client";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import temperatureData from "@/data/tokyo_temperature_data.json";
import { TemperatureData, WeatherForecast } from "@/types/temperature";
import WeatherDetailModal from "./WeatherDetailModal";

// weather.tsukumijima.net API URL（東京:130010）
const API_URL = "https://weather.tsukumijima.net/api/forecast/city/130010";

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
  dateLabel: string;
  temperature: {
    min: { celsius: string | null } | null;
    max: { celsius: string | null } | null;
  };
  telop: string;
  detail?: {
    weather: string | null;
    wind: string | null;
    wave: string | null;
  };
  chanceOfRain?: {
    T00_06: string;
    T06_12: string;
    T12_18: string;
    T18_24: string;
  };
  image: {
    title: string;
    url: string;
    width: number;
    height: number;
  };
};

function getMMDDfromDateStr(dateStr: string): string {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const m = parts[1].padStart(2, "0");
  const d = parts[2].padStart(2, "0");
  return `${m}-${d}`;
}

export default function WeekWeatherSection() {
  const [forecast, setForecast] = useState<WeatherForecast[] | null>(null);
  const [rawApiData, setRawApiData] = useState<TsukumiForecast[] | null>(null);
  const [, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const rawData = temperatureData as TemperatureData[];
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(null);

  useEffect(() => {
    async function fetchForecast() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("APIリクエスト失敗");
        const data = await res.json();
        setRawApiData(data.forecasts || []);
        
        // livedoor/気象庁APIのforecasts配列をWeatherForecast型に変換
        const forecasts: WeatherForecast[] = (data.forecasts || []).map((f: TsukumiForecast) => {
          const minTemp = f.temperature && f.temperature.min && f.temperature.min.celsius ? Number(f.temperature.min.celsius) : null;
          return {
            date: f.date,
            max_temp: f.temperature && f.temperature.max && f.temperature.max.celsius ? Number(f.temperature.max.celsius) : null,
            min_temp: minTemp,
            weather_code: 0,
            temp_anomaly_max: 0,
            temp_anomaly_min: 0,
            telop: f.telop ?? "",
            is_tropical_night: minTemp !== null ? minTemp >= 25 : false,
          };
        });
        setForecast(forecasts);
      } catch {
        setError("天気予報データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchForecast();
  }, []);

  // 過去データ処理
  const weekDates = forecast?.map(f => f.date) ?? [];
  const historicalByDate: Record<string, TemperatureData[]> = {};
  for (const d of rawData) {
    const md = getMMDDfromDateStr(d.date);
    if (!historicalByDate[md]) historicalByDate[md] = [];
    historicalByDate[md].push(d);
  }
  const historicalAverages = weekDates.map(date => {
    const md = date.slice(5, 7) + "-" + date.slice(8, 10);
    const records = historicalByDate[md] || [];
    const avgMax = records.length ? records.reduce((sum, d) => sum + d.max_temp, 0) / records.length : null;
    const avgMin = records.length ? records.reduce((sum, d) => sum + d.min_temp, 0) / records.length : null;
    return { date, avgMax, avgMin, count: records.length };
  });
  const chartData = weekDates.map((date, i) => ({
    date,
    forecastMax: forecast ? forecast[i].max_temp : null,
    forecastMin: forecast ? forecast[i].min_temp : null,
    historicalMax: historicalAverages[i]?.avgMax,
    historicalMin: historicalAverages[i]?.avgMin,
    telop: forecast ? forecast[i].telop : ""
  }));
  // 使用されていない月平均の計算を削除

  return (
    <section className="mb-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">東京・3日間天気予報</h2>
      <p className="text-sm text-gray-400 mb-2">※このAPIは3日分（今日・明日・明後日）のみ取得可能です。週間全体の予報ではありません。</p>
      <div className="flex flex-row justify-between gap-2 md:gap-4 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 w-full bg-gradient-to-r from-orange-50 via-yellow-50 to-red-100 border-b border-red-200 rounded-2xl shadow-none">
        {chartData.map((d, i) => {
          const info = getWeatherInfo(d.telop || "不明");
          const dateObj = parseISO(d.date.replace(/\//g, "-"));
          const dow = format(dateObj, "E", { locale: ja });
          const mmdd = format(dateObj, "MM/dd");
          // 温暖化強調: 異常値判定
          const isAbnormalMax = d.historicalMax !== null && d.forecastMax !== null && d.forecastMax - d.historicalMax >= 2;
          const isAbnormalMin = d.historicalMin !== null && d.forecastMin !== null && d.forecastMin - d.historicalMin >= 2;
          const isHeat = d.forecastMax !== null && d.forecastMax >= 35;
          // --- 追加: 気温基準ラベル ---
          let dayTempLabel = "";
          let dayTempLabelColor = "";
          const isTropicalNight = forecast && forecast[i] && forecast[i].is_tropical_night;
          
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
              onClick={() => setSelectedDayIndex(i)}
              className={
                `relative flex flex-col items-center justify-between py-5 px-3 w-[80px] md:w-full min-w-[80px] md:min-w-0 select-none transition-all duration-300 rounded-2xl shadow-lg cursor-pointer hover:scale-105 ` +
                (d.forecastMax !== null && d.forecastMax >= 35 ? "bg-gradient-to-b from-red-200 via-orange-100 to-white border-2 border-red-500" :
                 d.forecastMax !== null && d.forecastMax >= 30 ? "bg-gradient-to-b from-orange-200 via-yellow-100 to-white border-2 border-orange-400" :
                 d.forecastMax !== null && d.forecastMax >= 25 ? "bg-gradient-to-b from-yellow-100 via-yellow-50 to-white border-2 border-yellow-300" :
                 (isAbnormalMax || isHeat ? "bg-gradient-to-b from-yellow-200 via-orange-100 to-white border-2 border-yellow-400" : "bg-gradient-to-b from-white via-blue-50 to-green-50 border border-gray-200"))
              }
              style={{ flex: "1 1 0%" }}
            >
              {/* 気温基準ラベル（左上・やや大きめ） */}
              {dayTempLabel && (
                <span className={`absolute top-2 left-2 text-xs font-bold rounded px-2 py-1 ${dayTempLabelColor} z-10 shadow-sm`}>{dayTempLabel}</span>
              )}
              {/* 熱帯夜ラベル（右上） */}
              {isTropicalNight && (
                <span className="absolute top-2 right-2 text-xs font-bold rounded px-2 py-1 bg-purple-500 text-white z-10 shadow-sm">熱帯夜</span>
              )}
              {/* 日付＋曜日 */}
              <span className="text-sm md:text-base font-bold text-gray-700 mb-2 tracking-widest" style={{fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif", letterSpacing: "0.12em"}}>{mmdd} ({dow})</span>
              {/* 天気画像 */}
              <div className="mb-2">
                {rawApiData && rawApiData[i] ? (
                  <img 
                    src={rawApiData[i].image.url} 
                    alt={rawApiData[i].image.title}
                    width={60}
                    height={45}
                    className="mx-auto drop-shadow-lg"
                  />
                ) : (
                  <span className="text-4xl md:text-5xl drop-shadow-lg" style={{fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif"}}>{info.icon}</span>
                )}
              </div>
              {/* 最高気温 */}
              <span className={
                `text-xl md:text-2xl font-extrabold leading-tight mb-1 transition-colors duration-300 ` +
                (d.forecastMax !== null && d.forecastMax >= 35 ? "text-red-600 animate-pulse" :
                 d.forecastMax !== null && d.forecastMax >= 30 ? "text-orange-500 animate-pulse" :
                 d.forecastMax !== null && d.forecastMax >= 25 ? "text-yellow-500" :
                 (isAbnormalMax || isHeat ? "text-yellow-600 animate-pulse" : "text-orange-500"))
              } style={{fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif"}}>
                {d.forecastMax !== null ? `${d.forecastMax.toFixed(0)}°` : "-"}
              </span>
              {/* 最低気温 */}
              <span className={
                `text-lg md:text-xl font-semibold leading-tight mb-2 transition-colors duration-300 ` +
                (isAbnormalMin ? "text-blue-400" : "text-blue-500")
              } style={{fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif"}}>
                {d.forecastMin !== null ? `${d.forecastMin.toFixed(0)}°` : "-"}
              </span>
              <div className="flex flex-col items-center text-[11px] md:text-xs text-gray-500 mt-1">
                <span>過去:{d.historicalMax !== null ? `${d.historicalMax.toFixed(0)}°` : "-"}/{d.historicalMin !== null ? `${d.historicalMin.toFixed(0)}°` : "-"}</span>
                <span className={
                  (isAbnormalMax || isAbnormalMin ? "text-yellow-600 font-bold" : "")
                }>
                  差分:{d.forecastMax !== null && d.historicalMax !== null ? `+${(d.forecastMax - d.historicalMax).toFixed(1)}°` : ""}/{d.forecastMin !== null && d.historicalMin !== null ? `+${(d.forecastMin - d.historicalMin).toFixed(1)}°` : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* 天気詳細モーダル */}
      {selectedDayIndex !== null && rawApiData && rawApiData[selectedDayIndex] && (
        <WeatherDetailModal
          isOpen={true}
          onClose={() => setSelectedDayIndex(null)}
          forecast={{
            ...rawApiData[selectedDayIndex],
            detail: rawApiData[selectedDayIndex].detail || { weather: null, wind: null, wave: null },
            chanceOfRain: rawApiData[selectedDayIndex].chanceOfRain || {
              T00_06: "--%",
              T06_12: "--%", 
              T12_18: "--%",
              T18_24: "--%"
            },
            image: rawApiData[selectedDayIndex].image || { title: "", url: "" }
          }}
          historicalData={historicalAverages[selectedDayIndex] || { avgMax: null, avgMin: null, count: 0 }}
        />
      )}
    </section>
  );
} 