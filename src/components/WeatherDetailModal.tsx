'use client';

import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";

interface WeatherDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  forecast: {
    date: string;
    dateLabel: string;
    telop: string;
    temperature: {
      min: { celsius: string | null } | null;
      max: { celsius: string | null } | null;
    };
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
    };
  };
  historicalData: {
    avgMax: number | null;
    avgMin: number | null;
    count: number;
  };
}

export default function WeatherDetailModal({ isOpen, onClose, forecast, historicalData }: WeatherDetailModalProps) {
  if (!isOpen) return null;

  const dateObj = parseISO(forecast.date.replace(/\//g, "-"));
  const dow = format(dateObj, "EEEE", { locale: ja });
  const mmdd = format(dateObj, "MM月dd日");
  
  // 気温の取得
  const maxTemp = forecast.temperature?.max?.celsius ? Number(forecast.temperature.max.celsius) : null;
  const minTemp = forecast.temperature?.min?.celsius ? Number(forecast.temperature.min.celsius) : null;
  
  // 温度差を計算
  const maxTempDiff = maxTemp !== null && historicalData.avgMax !== null 
    ? maxTemp - historicalData.avgMax : null;
  const minTempDiff = minTemp !== null && historicalData.avgMin !== null 
    ? minTemp - historicalData.avgMin : null;

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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl p-8 md:p-10 max-w-2xl w-full relative transform transition-all duration-200 scale-100" onClick={(e) => e.stopPropagation()}>
        {/* 閉じるボタン */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors bg-white rounded-full p-2 shadow-md hover:shadow-lg"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* ヘッダー部分 */}
        <div className="relative bg-gradient-to-r from-blue-500 to-sky-400 -mx-8 md:-mx-10 -mt-8 md:-mt-10 px-8 md:px-10 pt-10 pb-8 rounded-t-3xl mb-8">
          {/* 気温基準ラベル */}
          {tempLabel && (
            <div className={`absolute top-4 left-8 px-4 py-2 rounded-full text-sm font-bold ${tempLabelColor} shadow-lg`}>
              {tempLabel}
            </div>
          )}
          
          {/* 日付と曜日 */}
          <div className="text-center text-white">
            <h2 className="text-4xl font-bold mb-2">{mmdd}</h2>
            <p className="text-2xl opacity-90">{dow}</p>
          </div>
        </div>

        {/* メインコンテンツグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* 左側：天気と気温 */}
          <div>
            {/* 天気画像と説明 */}
            <div className="text-center mb-6 bg-white p-6 rounded-2xl shadow-md">
              <div className="mb-4">
                <img 
                  src={forecast.image.url} 
                  alt={forecast.image.title}
                  width={120}
                  height={90}
                  className="mx-auto drop-shadow-md"
                />
              </div>
              <p className="text-2xl font-bold text-gray-800 mb-2">{forecast.telop}</p>
              {forecast.detail.weather && (
                <p className="text-sm text-gray-600 leading-relaxed">{forecast.detail.weather}</p>
              )}
            </div>

            {/* 気温情報 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-6 rounded-2xl">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium text-lg">最高気温</span>
                  <span className={`text-4xl font-bold ${
                    maxTemp !== null && maxTemp >= 35 ? "text-red-600" :
                    maxTemp !== null && maxTemp >= 30 ? "text-orange-500" :
                    maxTemp !== null && maxTemp >= 25 ? "text-yellow-600" :
                    "text-orange-500"
                  }`}>
                    {maxTemp !== null ? `${maxTemp.toFixed(0)}°C` : "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-medium text-lg">最低気温</span>
                  <span className="text-4xl font-bold text-blue-500">
                    {minTemp !== null ? `${minTemp.toFixed(0)}°C` : "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 右側：詳細情報 */}
          <div className="space-y-6">
            {/* 降水確率 */}
            {forecast.chanceOfRain && (
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-2xl">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  降水確率
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-sm text-gray-600 mb-1">0-6時</div>
                    <div className="font-bold text-blue-600 text-2xl">{forecast.chanceOfRain.T00_06}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-sm text-gray-600 mb-1">6-12時</div>
                    <div className="font-bold text-blue-600 text-2xl">{forecast.chanceOfRain.T06_12}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-sm text-gray-600 mb-1">12-18時</div>
                    <div className="font-bold text-blue-600 text-2xl">{forecast.chanceOfRain.T12_18}</div>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm">
                    <div className="text-sm text-gray-600 mb-1">18-24時</div>
                    <div className="font-bold text-blue-600 text-2xl">{forecast.chanceOfRain.T18_24}</div>
                  </div>
                </div>
              </div>
            )}

            {/* 風と波 */}
            {(forecast.detail.wind || forecast.detail.wave) && (
              <div className="grid grid-cols-2 gap-4">
                {forecast.detail.wind && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5">
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <svg className="w-4 h-4 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      風
                    </div>
                    <div className="text-base font-semibold text-gray-800">{forecast.detail.wind}</div>
                  </div>
                )}
                {forecast.detail.wave && (
                  <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-5">
                    <div className="flex items-center text-sm text-gray-700 mb-2">
                      <svg className="w-4 h-4 mr-2 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                      </svg>
                      波
                    </div>
                    <div className="text-base font-semibold text-gray-800">{forecast.detail.wave}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 過去データとの比較 */}
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-3 border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center">
            <svg className="w-3 h-3 mr-1 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            過去データとの比較
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="bg-white rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-0.5">過去平均最高気温</div>
              <div className="text-lg font-bold text-orange-600">
                {historicalData.avgMax !== null ? `${historicalData.avgMax.toFixed(1)}°C` : "-"}
              </div>
              {maxTempDiff !== null && (
                <div className={`text-xs font-semibold ${isAbnormalMax ? "text-red-600" : "text-gray-600"}`}>
                  {maxTempDiff > 0 ? "+" : ""}{maxTempDiff.toFixed(1)}°C
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg p-2">
              <div className="text-xs text-gray-600 mb-0.5">過去平均最低気温</div>
              <div className="text-lg font-bold text-blue-600">
                {historicalData.avgMin !== null ? `${historicalData.avgMin.toFixed(1)}°C` : "-"}
              </div>
              {minTempDiff !== null && (
                <div className={`text-xs font-semibold ${isAbnormalMin ? "text-red-600" : "text-gray-600"}`}>
                  {minTempDiff > 0 ? "+" : ""}{minTempDiff.toFixed(1)}°C
                </div>
              )}
            </div>
          </div>
          <div className="text-xs text-gray-500 text-center">
            過去{historicalData.count}件のデータから算出
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
    </div>
  );
}