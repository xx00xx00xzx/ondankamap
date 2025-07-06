'use client';

import { useState } from 'react';

interface ChartControlsProps {
  showTrendLine: boolean;
  onTrendLineToggle: (show: boolean) => void;
  trendLineStyle: 'solid' | 'dashed';
  onTrendLineStyleChange: (style: 'solid' | 'dashed') => void;
  yearRange: [number, number];
  onYearRangeChange: (range: [number, number]) => void;
  availableYears: [number, number];
}

export default function ChartControls({
  showTrendLine,
  onTrendLineToggle,
  trendLineStyle,
  onTrendLineStyleChange,
  yearRange,
  onYearRangeChange,
  availableYears,
}: ChartControlsProps) {
  const [tempRange, setTempRange] = useState(yearRange);

  const handleRangeChange = (index: number, value: number) => {
    const newRange: [number, number] = [...tempRange];
    newRange[index] = value;
    setTempRange(newRange);
    
    // 有効な範囲かチェック
    if (newRange[0] <= newRange[1]) {
      onYearRangeChange(newRange);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50 rounded-lg mb-4">
      {/* トレンドライン表示切り替え */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="trendLine"
            checked={showTrendLine}
            onChange={(e) => onTrendLineToggle(e.target.checked)}
            className="w-4 h-4 text-amber-600 bg-gray-100 border-gray-300 rounded focus:ring-amber-500"
          />
          <label htmlFor="trendLine" className="text-sm font-medium text-gray-700">
            温暖化トレンドライン
          </label>
        </div>
        
        {/* トレンドライン スタイル選択 */}
        {showTrendLine && (
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-600">スタイル:</span>
            <select
              value={trendLineStyle}
              onChange={(e) => onTrendLineStyleChange(e.target.value as 'solid' | 'dashed')}
              className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            >
              <option value="solid">実線</option>
              <option value="dashed">破線</option>
            </select>
          </div>
        )}
      </div>

      {/* 年範囲設定 */}
      <div className="flex items-center space-x-4">
        <label className="text-sm font-medium text-gray-700">表示期間:</label>
        
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={tempRange[0]}
            min={availableYears[0]}
            max={availableYears[1]}
            onChange={(e) => handleRangeChange(0, parseInt(e.target.value))}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-gray-500">年 〜</span>
          <input
            type="number"
            value={tempRange[1]}
            min={availableYears[0]}
            max={availableYears[1]}
            onChange={(e) => handleRangeChange(1, parseInt(e.target.value))}
            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-gray-500">年</span>
        </div>

        {/* プリセットボタン */}
        <div className="flex space-x-1">
          <button
            onClick={() => {
              const newRange: [number, number] = [availableYears[1] - 29, availableYears[1]];
              setTempRange(newRange);
              onYearRangeChange(newRange);
            }}
            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            直近30年
          </button>
          <button
            onClick={() => {
              const newRange: [number, number] = [availableYears[1] - 49, availableYears[1]];
              setTempRange(newRange);
              onYearRangeChange(newRange);
            }}
            className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
          >
            直近50年
          </button>
          <button
            onClick={() => {
              const newRange: [number, number] = availableYears;
              setTempRange(newRange);
              onYearRangeChange(newRange);
            }}
            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
          >
            全期間
          </button>
        </div>
      </div>
    </div>
  );
}