'use client';

import { useState } from 'react';
import YearComparisonChart from './charts/YearComparisonChart';
import { TemperatureData } from '@/types/temperature';

interface YearComparisonSectionProps {
  data: TemperatureData[];
}

export default function YearComparisonSection({ data }: YearComparisonSectionProps) {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear - 1); // 昨年をデフォルトに
  const [comparisonMode, setComparisonMode] = useState<'30years' | '145years'>('30years'); // デフォルトは30年
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null); // 月別フィルター
  
  // 利用可能な年のリストを取得
  const availableYears = Array.from(new Set(data.map(d => d.year))).sort((a, b) => b - a);
  
  return (
    <div className="w-full">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 tracking-wide" 
          style={{fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif"}}>
        年別気温比較
      </h2>
      <p className="text-gray-600 mb-4">特定の年の日別最高気温と平年値を比較。2σ以上は統計的に異常な値です。</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 mb-2">
            比較する年を選択:
          </label>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="block w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {availableYears.map(year => (
              <option key={year} value={year}>
                {year}年
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label htmlFor="mode-select" className="block text-sm font-medium text-gray-700 mb-2">
            平年値の基準期間:
          </label>
          <select
            id="mode-select"
            value={comparisonMode}
            onChange={(e) => setComparisonMode(e.target.value as '30years' | '145years')}
            className="block w-full px-4 py-2 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="30years">過去30年間（1995-2024年）</option>
            <option value="145years">全期間（1880-2024年）</option>
          </select>
        </div>
      </div>
      
      <YearComparisonChart 
        data={data} 
        selectedYear={selectedYear} 
        comparisonMode={comparisonMode} 
        selectedMonth={selectedMonth}
        onMonthClick={setSelectedMonth}
      />
    </div>
  );
}