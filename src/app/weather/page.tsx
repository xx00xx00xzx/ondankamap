"use client";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import Link from "next/link";
import temperatureData from "@/data/tokyo_temperature_data.json";
import { TemperatureData } from "@/types/temperature";

// weather.tsukumijima.net API URL（東京:130010）
const API_URL = "https://weather.tsukumijima.net/api/forecast/city/130010";

// 天気名→アイコン変換関数
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
  detail: {
    weather: string | null;
    wind: string | null;
    wave: string | null;
  };
  chanceOfRain: {
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

// APIレスポンスの型
type WeatherApiResponse = {
  title: string;
  link: string;
  description: {
    text: string;
  };
  forecasts: TsukumiForecast[];
  copyright: {
    title: string;
    link: string;
    image: {
      title: string;
      link: string;
      url: string;
    };
    provider: {
      link: string;
      name: string;
      note: string;
    }[];
  };
};

function getMMDDfromDateStr(dateStr: string): string {
  const parts = dateStr.split("/");
  if (parts.length !== 3) return "";
  const m = parts[1].padStart(2, "0");
  const d = parts[2].padStart(2, "0");
  return `${m}-${d}`;
}

export default function WeatherPage() {
  const [forecast, setForecast] = useState<TsukumiForecast[] | null>(null);
  const [apiData, setApiData] = useState<WeatherApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const rawData = temperatureData as TemperatureData[];

  useEffect(() => {
    async function fetchForecast() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("APIリクエスト失敗");
        const data: WeatherApiResponse = await res.json();
        setApiData(data);
        setForecast(data.forecasts || []);
      } catch {
        setError("天気予報データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    }
    fetchForecast();
  }, []);

  // 過去データ処理
  const historicalByDate: Record<string, TemperatureData[]> = {};
  for (const d of rawData) {
    const md = getMMDDfromDateStr(d.date);
    if (!historicalByDate[md]) historicalByDate[md] = [];
    historicalByDate[md].push(d);
  }

  const getHistoricalData = (date: string) => {
    const md = date.slice(5, 7) + "-" + date.slice(8, 10);
    const records = historicalByDate[md] || [];
    const avgMax = records.length ? records.reduce((sum, d) => sum + d.max_temp, 0) / records.length : null;
    const avgMin = records.length ? records.reduce((sum, d) => sum + d.min_temp, 0) / records.length : null;
    return { avgMax, avgMin, count: records.length };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">天気予報データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-blue-600 hover:underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2" style={{fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif"}}>
            東京3日間天気予報
          </h1>
          <p className="text-gray-600 mb-4">詳細な天気情報と過去データとの比較</p>
          <Link href="/" className="inline-block bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors">
            トップページに戻る
          </Link>
        </header>

        {/* 天気予報カード */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {forecast?.map((dayForecast) => {
            const info = getWeatherInfo(dayForecast.telop || "");
            const dateObj = parseISO(dayForecast.date.replace(/\//g, "-"));
            const dow = format(dateObj, "EEEE", { locale: ja });
            const mmdd = format(dateObj, "MM月dd日");
            const historical = getHistoricalData(dayForecast.date);
            
            // 気温の取得
            const maxTemp = dayForecast.temperature?.max?.celsius ? Number(dayForecast.temperature.max.celsius) : null;
            const minTemp = dayForecast.temperature?.min?.celsius ? Number(dayForecast.temperature.min.celsius) : null;
            
            // 温度差を計算
            const maxTempDiff = maxTemp !== null && historical.avgMax !== null 
              ? maxTemp - historical.avgMax : null;
            const minTempDiff = minTemp !== null && historical.avgMin !== null 
              ? minTemp - historical.avgMin : null;

            // 異常温度の判定
            const isAbnormalMax = maxTempDiff !== null && maxTempDiff >= 2;
            const isAbnormalMin = minTempDiff !== null && minTempDiff >= 2;
            
            // 気温基準のラベル
            let tempLabel = "";
            let tempLabelColor = "";
            if (maxTemp !== null) {
              if (maxTemp >= 35) {
                tempLabel = "猛暑日";
                tempLabelColor = "bg-red-500 text-white";
              } else if (maxTemp >= 30) {
                tempLabel = "真夏日";
                tempLabelColor = "bg-orange-400 text-white";
              } else if (maxTemp >= 25) {
                tempLabel = "夏日";
                tempLabelColor = "bg-yellow-300 text-gray-800";
              } else if (maxTemp <= 0) {
                tempLabel = "真冬日";
                tempLabelColor = "bg-blue-500 text-white";
              } else if (minTemp !== null && minTemp <= 0) {
                tempLabel = "冬日";
                tempLabelColor = "bg-blue-300 text-gray-800";
              }
            }

            return (
              <div key={dayForecast.date} className="bg-white rounded-3xl shadow-xl p-6 relative">
                {/* 気温基準ラベル */}
                {tempLabel && (
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-bold ${tempLabelColor}`}>
                    {tempLabel}
                  </div>
                )}

                {/* 日付と曜日 */}
                <div className="text-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-800 mb-1">{mmdd}</h2>
                  <p className="text-lg text-gray-600">{dow}</p>
                </div>

                {/* 天気画像と説明 */}
                <div className="text-center mb-6">
                  <div className="mb-2">
                    <img 
                      src={dayForecast.image.url} 
                      alt={dayForecast.image.title}
                      width={80}
                      height={60}
                      className="mx-auto"
                    />
                  </div>
                  <p className="text-lg font-semibold text-gray-700">{info.label}</p>
                </div>

                {/* 気温情報 */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">最高気温</span>
                    <span className={`text-2xl font-bold ${
                      maxTemp !== null && maxTemp >= 35 ? "text-red-600" :
                      maxTemp !== null && maxTemp >= 30 ? "text-orange-500" :
                      maxTemp !== null && maxTemp >= 25 ? "text-yellow-600" :
                      "text-orange-500"
                    }`}>
                      {maxTemp !== null ? `${maxTemp.toFixed(0)}°C` : "-"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">最低気温</span>
                    <span className="text-2xl font-bold text-blue-500">
                      {minTemp !== null ? `${minTemp.toFixed(0)}°C` : "-"}
                    </span>
                  </div>
                </div>


                {/* 降水確率 */}
                {dayForecast.chanceOfRain && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">降水確率</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-50 rounded p-2 text-center">
                        <div className="text-xs text-gray-600">0-6時</div>
                        <div className="font-bold text-blue-600">{dayForecast.chanceOfRain.T00_06}</div>
                      </div>
                      <div className="bg-blue-50 rounded p-2 text-center">
                        <div className="text-xs text-gray-600">6-12時</div>
                        <div className="font-bold text-blue-600">{dayForecast.chanceOfRain.T06_12}</div>
                      </div>
                      <div className="bg-blue-50 rounded p-2 text-center">
                        <div className="text-xs text-gray-600">12-18時</div>
                        <div className="font-bold text-blue-600">{dayForecast.chanceOfRain.T12_18}</div>
                      </div>
                      <div className="bg-blue-50 rounded p-2 text-center">
                        <div className="text-xs text-gray-600">18-24時</div>
                        <div className="font-bold text-blue-600">{dayForecast.chanceOfRain.T18_24}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 過去データとの比較 */}
                <div className="border-t pt-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">過去データとの比較</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>過去平均最高気温</span>
                      <span>{historical.avgMax !== null ? `${historical.avgMax.toFixed(1)}°C` : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>過去平均最低気温</span>
                      <span>{historical.avgMin !== null ? `${historical.avgMin.toFixed(1)}°C` : "-"}</span>
                    </div>
                    {maxTempDiff !== null && (
                      <div className="flex justify-between">
                        <span>最高気温差</span>
                        <span className={isAbnormalMax ? "text-red-600 font-bold" : "text-gray-600"}>
                          {maxTempDiff > 0 ? "+" : ""}{maxTempDiff.toFixed(1)}°C
                        </span>
                      </div>
                    )}
                    {minTempDiff !== null && (
                      <div className="flex justify-between">
                        <span>最低気温差</span>
                        <span className={isAbnormalMin ? "text-red-600 font-bold" : "text-gray-600"}>
                          {minTempDiff > 0 ? "+" : ""}{minTempDiff.toFixed(1)}°C
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>過去データ数</span>
                      <span>{historical.count}件</span>
                    </div>
                  </div>
                </div>

                {/* 温暖化警告 */}
                {(isAbnormalMax || isAbnormalMin) && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 font-semibold">
                      過去平均より2°C以上高い気温が予測されています
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* コピーライト情報 */}
        {apiData?.copyright && (
          <div className="mt-8 p-6 bg-white rounded-lg shadow text-center">
            <div className="mb-4">
              <a href={apiData.copyright.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {apiData.copyright.title}
              </a>
            </div>
            {apiData.copyright.provider?.map((provider, index) => (
              <div key={index} className="text-sm text-gray-600">
                <a href={provider.link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  {provider.name}
                </a>
                <p className="mt-1">{provider.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}