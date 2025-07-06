'use client';

import { TemperatureData } from '@/types/temperature';
import { useState } from 'react';

interface TemperatureRankingsProps {
  data: TemperatureData[];
}

interface YearlyStats {
  year: number;
  avgMaxTemp: number;
  avgMinTemp: number;
  extremeHotDays: number;
  tropicalNights: number;
  tempRange: number;
  deviation: number;
}

interface DailyRecord {
  date: string;
  year: number;
  month: number;
  day: number;
  temp: number;
}

export default function TemperatureRankings({ data }: TemperatureRankingsProps) {
  const [activeTab, setActiveTab] = useState<'yearly' | 'daily' | 'monthly' | 'anomaly'>('yearly');
  
  // 年別統計を計算
  const yearlyStats: YearlyStats[] = [];
  const years = Array.from(new Set(data.map(d => d.year))).sort();
  
  // 全期間の平均値を計算
  const overallAvgMax = data.reduce((sum, d) => sum + d.max_temp, 0) / data.length;
  
  years.forEach(year => {
    const yearData = data.filter(d => d.year === year);
    const avgMaxTemp = yearData.reduce((sum, d) => sum + d.max_temp, 0) / yearData.length;
    const avgMinTemp = yearData.reduce((sum, d) => sum + d.min_temp, 0) / yearData.length;
    const extremeHotDays = yearData.filter(d => d.max_temp >= 35).length;
    const tropicalNights = yearData.filter(d => d.min_temp >= 25).length;
    const tempRange = avgMaxTemp - avgMinTemp;
    const deviation = Math.abs(avgMaxTemp - overallAvgMax);
    
    yearlyStats.push({
      year,
      avgMaxTemp,
      avgMinTemp,
      extremeHotDays,
      tropicalNights,
      tempRange,
      deviation
    });
  });
  
  // 日別最高・最低気温記録
  const dailyMaxRecords: DailyRecord[] = data
    .map(d => ({
      date: `${d.year}年${d.month}月${d.day}日`,
      year: d.year,
      month: d.month,
      day: d.day,
      temp: d.max_temp
    }))
    .sort((a, b) => b.temp - a.temp)
    .slice(0, 10);
    
  const dailyMinRecords: DailyRecord[] = data
    .map(d => ({
      date: `${d.year}年${d.month}月${d.day}日`,
      year: d.year,
      month: d.month,
      day: d.day,
      temp: d.min_temp
    }))
    .sort((a, b) => a.temp - b.temp)
    .slice(0, 10);
  
  // 月別最高・最低気温記録
  const monthlyMaxRecords: { [month: number]: DailyRecord[] } = {};
  const monthlyMinRecords: { [month: number]: DailyRecord[] } = {};
  
  for (let month = 1; month <= 12; month++) {
    const monthData = data.filter(d => d.month === month);
    
    monthlyMaxRecords[month] = monthData
      .map(d => ({
        date: `${d.year}年${d.month}月${d.day}日`,
        year: d.year,
        month: d.month,
        day: d.day,
        temp: d.max_temp
      }))
      .sort((a, b) => b.temp - a.temp)
      .slice(0, 5);
      
    monthlyMinRecords[month] = monthData
      .map(d => ({
        date: `${d.year}年${d.month}月${d.day}日`,
        year: d.year,
        month: d.month,
        day: d.day,
        temp: d.min_temp
      }))
      .sort((a, b) => a.temp - b.temp)
      .slice(0, 5);
  }
  
  const tabs = [
    { id: 'yearly', label: '年別ランキング' },
    { id: 'daily', label: '日別記録' },
    { id: 'monthly', label: '月別記録' },
    { id: 'anomaly', label: '異常年' }
  ];

  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 tracking-wide" 
          style={{fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif"}}>
        歴代記録ランキング
      </h2>
      <p className="text-gray-600 mb-6">145年間の気温データから見る歴史的記録</p>
      
      {/* タブ */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      {/* 年別ランキング */}
      {activeTab === 'yearly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 猛暑日最多年 */}
          <div className="bg-red-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">猛暑日最多年TOP10</h3>
            <div className="space-y-2">
              {yearlyStats
                .sort((a, b) => b.extremeHotDays - a.extremeHotDays)
                .slice(0, 10)
                .map((stat, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{index + 1}位 {stat.year}年</span>
                    <span className="font-semibold text-red-600">{stat.extremeHotDays}日</span>
                  </div>
                ))}
            </div>
          </div>
          
          {/* 熱帯夜最多年 */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">熱帯夜最多年TOP10</h3>
            <div className="space-y-2">
              {yearlyStats
                .sort((a, b) => b.tropicalNights - a.tropicalNights)
                .slice(0, 10)
                .map((stat, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{index + 1}位 {stat.year}年</span>
                    <span className="font-semibold text-purple-600">{stat.tropicalNights}日</span>
                  </div>
                ))}
            </div>
          </div>
          
          {/* 年平均最高気温 */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">年平均最高気温TOP10</h3>
            <div className="space-y-2">
              {yearlyStats
                .sort((a, b) => b.avgMaxTemp - a.avgMaxTemp)
                .slice(0, 10)
                .map((stat, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{index + 1}位 {stat.year}年</span>
                    <span className="font-semibold text-orange-600">{stat.avgMaxTemp.toFixed(1)}°C</span>
                  </div>
                ))}
            </div>
          </div>
          
          {/* 年平均最低気温 */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-3">年平均最低気温TOP10</h3>
            <div className="space-y-2">
              {yearlyStats
                .sort((a, b) => b.avgMinTemp - a.avgMinTemp)
                .slice(0, 10)
                .map((stat, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">{index + 1}位 {stat.year}年</span>
                    <span className="font-semibold text-blue-600">{stat.avgMinTemp.toFixed(1)}°C</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 日別記録 */}
      {activeTab === 'daily' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 歴代最高気温 */}
          <div className="bg-red-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">歴代最高気温TOP10</h3>
            <div className="space-y-3">
              {dailyMaxRecords.map((record, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">{index + 1}位</span>
                    <span className="ml-2 text-sm text-gray-600">{record.date}</span>
                  </div>
                  <span className="text-xl font-bold text-red-600">{record.temp.toFixed(1)}°C</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* 歴代最低気温 */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">歴代最低気温TOP10</h3>
            <div className="space-y-3">
              {dailyMinRecords.map((record, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <span className="text-sm font-semibold text-gray-700">{index + 1}位</span>
                    <span className="ml-2 text-sm text-gray-600">{record.date}</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{record.temp.toFixed(1)}°C</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* 月別記録 */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
              <div key={month} className="bg-white border rounded-lg p-4">
                <h3 className="text-base font-bold text-gray-700 mb-3">{month}月の記録</h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* 最高気温 */}
                  <div className="bg-red-50 rounded p-3">
                    <h4 className="text-xs font-semibold text-red-700 mb-2">最高気温TOP5</h4>
                    <div className="space-y-1">
                      {monthlyMaxRecords[month].map((record, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-600">{record.year}年</span>
                          <span className="font-semibold text-red-600">{record.temp.toFixed(1)}°C</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* 最低気温 */}
                  <div className="bg-blue-50 rounded p-3">
                    <h4 className="text-xs font-semibold text-blue-700 mb-2">最低気温TOP5</h4>
                    <div className="space-y-1">
                      {monthlyMinRecords[month].map((record, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="text-gray-600">{record.year}年</span>
                          <span className="font-semibold text-blue-600">{record.temp.toFixed(1)}°C</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* 異常年ランキング */}
      {activeTab === 'anomaly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 平年値からの乖離が大きい年 */}
          <div className="bg-yellow-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">平年値からの乖離TOP10</h3>
            <div className="space-y-3">
              {yearlyStats
                .sort((a, b) => b.deviation - a.deviation)
                .slice(0, 10)
                .map((stat, index) => {
                  const diff = stat.avgMaxTemp - overallAvgMax;
                  return (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <span className="text-sm font-semibold text-gray-700">{index + 1}位</span>
                        <span className="ml-2 text-sm text-gray-600">{stat.year}年</span>
                      </div>
                      <span className={`text-base font-bold ${diff > 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {diff > 0 ? '+' : ''}{diff.toFixed(2)}°C
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
          
          {/* 気温差（日較差）が大きい年 */}
          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-700 mb-4">年間気温差TOP10</h3>
            <div className="space-y-3">
              {yearlyStats
                .sort((a, b) => b.tempRange - a.tempRange)
                .slice(0, 10)
                .map((stat, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div>
                      <span className="text-sm font-semibold text-gray-700">{index + 1}位</span>
                      <span className="ml-2 text-sm text-gray-600">{stat.year}年</span>
                    </div>
                    <span className="text-base font-bold text-green-600">{stat.tempRange.toFixed(1)}°C</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}