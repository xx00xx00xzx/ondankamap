'use client';

import { Suspense, useState, useMemo } from 'react';
import Link from 'next/link';
import MonthlyTemperatureChart from '@/components/charts/MonthlyTemperatureChart';
import DailyTemperatureChart from '@/components/charts/DailyTemperatureChart';
import { aggregateMonthlyData, aggregateDailyData } from '@/lib/data-processor';
import { TemperatureData } from '@/types/temperature';
import temperatureData from '@/data/tokyo_temperature_data.json';

export default function MonthPage() {
  // JSONデータを型付きで取得
  const rawData = temperatureData as TemperatureData[];
  
  // 表示タイプの状態管理
  const [viewType, setViewType] = useState<'monthly' | 'daily'>('monthly');
  
  // 月別データに集計
  const monthlyData = useMemo(() => {
    return aggregateMonthlyData(rawData);
  }, [rawData]);
  
  // 日別データに集計
  const dailyData = useMemo(() => {
    return aggregateDailyData(rawData);
  }, [rawData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* ヘッダー */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            月別・日別気温分析
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            145年間のデータから算出した東京の月別・日別平均気温を可視化
          </p>
        </header>

        {/* 表示切り替えボタン */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-2 shadow-md">
            <button
              onClick={() => setViewType('monthly')}
              className={`px-6 py-2 rounded-md transition-colors ${
                viewType === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              月別平均
            </button>
            <button
              onClick={() => setViewType('daily')}
              className={`px-6 py-2 rounded-md transition-colors ${
                viewType === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              日別平均（365日）
            </button>
          </div>
        </div>

        {/* グラフ表示エリア */}
        <div className="space-y-8">
          {viewType === 'monthly' ? (
            <section className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  月別平均気温（1880-2024年の145年間平均）
                </h2>
                <p className="text-gray-600">
                  各月の最高気温と最低気温の145年間平均値を折れ線グラフで表示
                </p>
              </div>
              <Suspense fallback={<div className="h-[400px] flex items-center justify-center">グラフを読み込み中...</div>}>
                <MonthlyTemperatureChart data={monthlyData} />
              </Suspense>
            </section>
          ) : (
            <section className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  日別平均気温（1年365日の145年間平均）
                </h2>
                <p className="text-gray-600">
                  1月1日から12月31日まで各日の最高気温と最低気温の145年間平均値
                </p>
              </div>
              <Suspense fallback={<div className="h-[500px] flex items-center justify-center">グラフを読み込み中...</div>}>
                <DailyTemperatureChart data={dailyData} />
              </Suspense>
            </section>
          )}

          {/* 統計情報 */}
          <section className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {viewType === 'monthly' ? '月別' : '年間'}統計
            </h2>
            {viewType === 'monthly' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {Math.max(...monthlyData.map(d => d.avg_max_temp)).toFixed(1)}℃
                  </div>
                  <div className="text-sm text-gray-600">最高月平均最高気温</div>
                  <div className="text-xs text-gray-500">
                    {monthlyData.find(d => d.avg_max_temp === Math.max(...monthlyData.map(d => d.avg_max_temp)))?.month_name}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.min(...monthlyData.map(d => d.avg_min_temp)).toFixed(1)}℃
                  </div>
                  <div className="text-sm text-gray-600">最低月平均最低気温</div>
                  <div className="text-xs text-gray-500">
                    {monthlyData.find(d => d.avg_min_temp === Math.min(...monthlyData.map(d => d.avg_min_temp)))?.month_name}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.max(...monthlyData.map(d => d.temp_diff)).toFixed(1)}℃
                  </div>
                  <div className="text-sm text-gray-600">最大月間気温差</div>
                  <div className="text-xs text-gray-500">
                    {monthlyData.find(d => d.temp_diff === Math.max(...monthlyData.map(d => d.temp_diff)))?.month_name}
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {monthlyData.length}ヶ月
                  </div>
                  <div className="text-sm text-gray-600">データ期間</div>
                  <div className="text-xs text-gray-500">1-12月</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {Math.max(...dailyData.map(d => d.avg_max_temp)).toFixed(1)}℃
                  </div>
                  <div className="text-sm text-gray-600">最高日平均最高気温</div>
                  <div className="text-xs text-gray-500">
                    {dailyData.find(d => d.avg_max_temp === Math.max(...dailyData.map(d => d.avg_max_temp)))?.date_label}
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.min(...dailyData.map(d => d.avg_min_temp)).toFixed(1)}℃
                  </div>
                  <div className="text-sm text-gray-600">最低日平均最低気温</div>
                  <div className="text-xs text-gray-500">
                    {dailyData.find(d => d.avg_min_temp === Math.min(...dailyData.map(d => d.avg_min_temp)))?.date_label}
                  </div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.max(...dailyData.map(d => d.temp_diff)).toFixed(1)}℃
                  </div>
                  <div className="text-sm text-gray-600">最大日間気温差</div>
                  <div className="text-xs text-gray-500">
                    {dailyData.find(d => d.temp_diff === Math.max(...dailyData.map(d => d.temp_diff)))?.date_label}
                  </div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dailyData.length}日
                  </div>
                  <div className="text-sm text-gray-600">年間データ日数</div>
                  <div className="text-xs text-gray-500">365日</div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* ナビゲーション */}
        <nav className="mt-12 text-center">
          <div className="flex justify-center space-x-4">
            <Link
              href="/"
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              年次分析に戻る
            </Link>
            <Link
              href="/week"
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              今週の予報を見る
            </Link>
          </div>
        </nav>
      </div>
    </div>
  );
}