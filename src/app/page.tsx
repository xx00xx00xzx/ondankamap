'use client';

import { Suspense, useState, useMemo } from 'react';
import AnnualTemperatureChart from '@/components/charts/AnnualTemperatureChart';
import TemperatureDifferenceChart from '@/components/charts/TemperatureDifferenceChart';
import ChartControls from '@/components/charts/ChartControls';
import { aggregateAnnualData } from '@/lib/data-processor';
import { TemperatureData } from '@/types/temperature';
import temperatureData from '@/data/tokyo_temperature_data.json';
import WeekWeatherSection from "@/components/WeekWeatherSection";
import MonthlyYearlyTrendChart from '@/components/charts/MonthlyYearlyTrendChart';
import Head from "next/head";
import YearComparisonSection from "@/components/YearComparisonSection";
import HotDaysChart from "@/components/charts/HotDaysChart";
import TropicalNightsChart from "@/components/charts/TropicalNightsChart";
import TemperatureRankings from "@/components/charts/TemperatureRankings";

export default function Home() {
  // JSONデータを型付きで取得
  const rawData = temperatureData as TemperatureData[];
  
  // 年次データに集計
  const allAnnualData = aggregateAnnualData(rawData);
  
  // コントロール用のstate
  const [showTrendLine, setShowTrendLine] = useState(true);
  const [trendLineStyle, setTrendLineStyle] = useState<'solid' | 'dashed'>('solid');
  const [yearRange, setYearRange] = useState<[number, number]>([1880, 2024]);
  
  // 表示用データをフィルタリング
  const annualData = useMemo(() => {
    return allAnnualData.filter(data => 
      data.year >= yearRange[0] && data.year <= yearRange[1]
    );
  }, [allAnnualData, yearRange]);
  
  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700;900&family=Noto+Sans+JP:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-100 p-0 md:p-8">
        <div className="max-w-7xl mx-auto px-2 md:px-8">
          {/* SEO最適化されたヒーロータイトル */}
          <header className="text-center my-16 md:my-20">
            <h1
              className="text-5xl md:text-7xl font-extrabold tracking-widest mb-4 drop-shadow-lg animate-fadein"
              style={{
                fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif",
                letterSpacing: "0.18em",
                background: "linear-gradient(90deg, #f87171 0%, #fbbf24 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              東京温暖化グラフ
            </h1>
            <div className="flex justify-center items-center gap-2 mb-3">
              <span className="inline-block w-10 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
              <span className="inline-block w-10 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
              <span className="inline-block w-10 h-1.5 rounded-full bg-yellow-400 animate-pulse"></span>
            </div>
            <p
              className="text-lg md:text-2xl text-gray-500 font-light tracking-wide mb-2 animate-fadein"
              style={{ fontFamily: "'Noto Sans JP', 'Montserrat', sans-serif" }}
            >
              1880-2024年の気温推移と未来予測を、<br className='hidden md:inline'/>グラフィックで直感的に。
            </p>
            <p className="text-base md:text-lg text-gray-400 font-light mt-2 animate-fadein-slow">データで見る東京の温暖化。145年の歴史と未来を一目で。</p>
          </header>
          {/* 現在の天気予報と過去データ比較 */}
          <section className="mb-14" aria-labelledby="weather-forecast">
            <div className="rounded-3xl shadow-xl bg-gradient-to-r from-red-100 via-orange-50 to-yellow-100 border border-red-100 p-4 md:p-8">
              <WeekWeatherSection />
            </div>
          </section>
          
          {/* 年別気温比較分析 */}
          <section className="mb-14" aria-labelledby="year-comparison">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-blue-100">
              <YearComparisonSection data={rawData} />
            </div>
          </section>
          
          {/* 猛暑日・真夏日・夏日の長期トレンド */}
          <section className="mb-14" aria-labelledby="hot-days-trend">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-red-100">
              <HotDaysChart data={rawData} />
            </div>
          </section>
          
          {/* 熱帯夜の増加傾向分析 */}
          <section className="mb-14" aria-labelledby="tropical-nights-trend">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-purple-100">
              <TropicalNightsChart data={rawData} />
            </div>
          </section>
          
          {/* 月別気温の年次変化パターン */}
          <section className="mb-14" aria-labelledby="monthly-trends">
            <div className="rounded-3xl shadow-xl bg-gradient-to-r from-orange-100 via-yellow-50 to-red-50 border border-orange-100 p-4 md:p-8">
              <MonthlyYearlyTrendChart />
            </div>
          </section>
          
          {/* 145年間の年平均気温推移 */}
          <section className="mb-14" aria-labelledby="annual-temperature-trend">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-orange-100">
              <h2 id="annual-temperature-trend" className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 tracking-wide" style={{fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif"}}>年平均気温の推移</h2>
              <p className="text-gray-600 mb-4">東京の年平均最高気温と最低気温の長期的な変化を可視化</p>
              <ChartControls
                showTrendLine={showTrendLine}
                onTrendLineToggle={setShowTrendLine}
                trendLineStyle={trendLineStyle}
                onTrendLineStyleChange={setTrendLineStyle}
                yearRange={yearRange}
                onYearRangeChange={setYearRange}
                availableYears={[1880, 2024]}
              />
              <Suspense fallback={<div className="h-[500px] flex items-center justify-center">グラフを読み込み中...</div>}>
                <AnnualTemperatureChart data={annualData} showTrendLine={showTrendLine} trendLineStyle={trendLineStyle} />
              </Suspense>
            </div>
          </section>
          
          {/* 年間気温変動幅の分析 */}
          <section className="mb-14" aria-labelledby="temperature-range-analysis">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-yellow-200">
              <h2 id="temperature-range-analysis" className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 tracking-wide" style={{fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif"}}>年間気温差グラフ</h2>
              <p className="text-gray-600 mb-4">年ごとの最高・最低気温の差を可視化</p>
              <TemperatureDifferenceChart data={annualData} />
            </div>
          </section>
          
          {/* 東京気温の歴代記録集 */}
          <section className="mb-14" aria-labelledby="temperature-records">
            <div className="bg-white rounded-3xl shadow-xl p-6 md:p-10 border border-amber-100">
              <TemperatureRankings data={rawData} />
            </div>
          </section>
          
          {/* 気象庁データ出典表記 */}
          <footer className="mt-8 mb-4 text-center">
            <div className="max-w-2xl mx-auto">
              <p className="text-[10px] text-gray-400 leading-tight">
                出典：気象庁ホームページ（
                <a 
                  href="https://www.data.jma.go.jp/obd/stats/etrn/index.php" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-gray-500 underline"
                >
                  https://www.data.jma.go.jp/obd/stats/etrn/index.php
                </a>
                ）を加工して作成
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}