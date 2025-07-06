'use client';

import { Line } from 'react-chartjs-2';
import { TemperatureData } from '@/types/temperature';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  Plugin,
  ChartEvent,
  ActiveElement,
  TooltipItem,
  ScriptableScaleContext,
  Scale
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface YearComparisonChartProps {
  data: TemperatureData[];
  selectedYear: number;
  comparisonMode: '30years' | '145years';
  selectedMonth?: number | null;
  onMonthClick?: (month: number | null) => void;
}

export default function YearComparisonChart({ data, selectedYear, comparisonMode, selectedMonth, onMonthClick }: YearComparisonChartProps) {
  // 選択された年のデータを取得（月別フィルターがある場合は適用）
  let yearData = data.filter(d => d.year === selectedYear);
  if (selectedMonth !== null && selectedMonth !== undefined) {
    yearData = yearData.filter(d => d.month === selectedMonth);
  }
  yearData = yearData.sort((a, b) => {
    if (a.month !== b.month) return a.month - b.month;
    return a.day - b.day;
  });
  
  // モードに応じてデータ期間を決定
  const normalPeriodData = comparisonMode === '30years' 
    ? data.filter(d => d.year >= 1995 && d.year <= 2024)
    : data; // 145年間の全データ
  
  const normalValues: { [key: string]: { values: number[]; mean: number; stdDev: number } } = {};
  
  // 日付ごとにデータを集計
  normalPeriodData.forEach(d => {
    const monthDay = `${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
    if (!normalValues[monthDay]) {
      normalValues[monthDay] = { values: [], mean: 0, stdDev: 0 };
    }
    normalValues[monthDay].values.push(d.max_temp);
  });
  
  // 平年値（平均）と標準偏差を計算
  const averageNormalValues: { [key: string]: number } = {};
  const standardDeviations: { [key: string]: number } = {};
  
  Object.keys(normalValues).forEach(key => {
    const values = normalValues[key].values;
    if (values.length > 0) {
      // 平均を計算
      const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
      averageNormalValues[key] = mean;
      
      // 標準偏差を計算
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      standardDeviations[key] = stdDev;
      
      normalValues[key].mean = mean;
      normalValues[key].stdDev = stdDev;
    }
  });
  
  // モードに応じた表示用ラベル
  const periodLabel = comparisonMode === '30years' ? '1995-2024年平均' : '1880-2024年平均';
  const yearMaxTemps = yearData.map(d => d.max_temp);
  const normalMaxTemps = yearData.map(d => {
    const monthDay = `${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
    return averageNormalValues[monthDay] || 0;
  });
  
  // 7日移動平均を計算
  const movingAverage7 = yearMaxTemps.map((temp, index) => {
    const start = Math.max(0, index - 3);
    const end = Math.min(yearMaxTemps.length, index + 4);
    const slice = yearMaxTemps.slice(start, end);
    return slice.reduce((sum, val) => sum + val, 0) / slice.length;
  });
  
  // 気温差を計算
  const tempDifferences = yearData.map((d, i) => {
    const normal = normalMaxTemps[i];
    return normal !== 0 ? d.max_temp - normal : null;
  });
  
  const chartData = {
    datasets: [
      {
        label: `${selectedYear}年の最高気温`,
        data: yearMaxTemps.map((temp, index) => ({ x: index, y: temp })),
        borderColor: 'rgba(239, 68, 68, 0.4)',
        backgroundColor: 'rgba(239, 68, 68, 0.05)',
        borderWidth: 1,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
      {
        label: `平年値（${periodLabel}）`,
        data: normalMaxTemps.map((temp, index) => ({ x: index, y: temp })),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
      {
        label: '7日移動平均',
        data: movingAverage7.map((temp, index) => ({ x: index, y: temp })),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
    ],
  };

  // 月の境界線と背景色を計算
  const monthBoundaries: number[] = [];
  const monthRanges: { start: number; end: number; month: number }[] = [];
  const monthCenters: { position: number; month: number }[] = [];
  let currentMonth = 0;
  let monthStart = 0;
  
  yearData.forEach((d, index) => {
    if (d.month !== currentMonth) {
      if (currentMonth !== 0) {
        monthBoundaries.push(index - 0.5);
        const monthEnd = index - 1;
        const centerPos = Math.floor((monthStart + monthEnd) / 2);
        monthRanges.push({ start: monthStart, end: monthEnd, month: currentMonth });
        monthCenters.push({ position: centerPos, month: currentMonth });
      }
      currentMonth = d.month;
      monthStart = index;
    }
  });
  // 最後の月を追加
  if (yearData.length > 0) {
    const monthEnd = yearData.length - 1;
    const centerPos = Math.floor((monthStart + monthEnd) / 2);
    monthRanges.push({ start: monthStart, end: monthEnd, month: currentMonth });
    monthCenters.push({ position: centerPos, month: currentMonth });
  }

  // パステルカラーの配列（12ヶ月分）- より薄く
  const pastelColors = [
    'rgba(255, 182, 193, 0.1)', // 1月 - ライトピンク
    'rgba(221, 160, 221, 0.1)', // 2月 - プラム
    'rgba(173, 216, 230, 0.1)', // 3月 - ライトブルー
    'rgba(144, 238, 144, 0.1)', // 4月 - ライトグリーン
    'rgba(255, 255, 224, 0.1)', // 5月 - ライトイエロー
    'rgba(255, 218, 185, 0.1)', // 6月 - ピーチパフ
    'rgba(255, 192, 203, 0.1)', // 7月 - ピンク
    'rgba(255, 160, 122, 0.1)', // 8月 - ライトサーモン
    'rgba(255, 228, 181, 0.1)', // 9月 - モカシン
    'rgba(255, 215, 0, 0.1)',   // 10月 - ゴールド
    'rgba(218, 165, 32, 0.1)',  // 11月 - ゴールデンロッド
    'rgba(176, 224, 230, 0.1)', // 12月 - パウダーブルー
  ];

  // 月ごとの背景色を描画するプラグイン
  const monthBackgroundPlugin: Plugin<'line'> = {
    id: 'monthBackground',
    beforeDraw: (chart: ChartJS<'line'>) => {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales.x || !scales.y) return;

      ctx.save();
      monthRanges.forEach(range => {
        const startX = scales.x.getPixelForValue(range.start);
        const endX = scales.x.getPixelForValue(range.end);
        const color = pastelColors[(range.month - 1) % 12];
        
        ctx.fillStyle = color;
        ctx.fillRect(startX, chartArea.top, endX - startX, chartArea.height);
      });
      ctx.restore();
    }
  };

  // グラフクリックハンドラー
  const handleChartClick = (event: ChartEvent, activeElements: ActiveElement[], chart: ChartJS<'line'>) => {
    if (!onMonthClick || selectedMonth !== null) return;
    
    try {
      // クリック位置を取得
      const rect = chart.canvas.getBoundingClientRect();
      const nativeEvent = event.native as MouseEvent;
      const x = nativeEvent ? nativeEvent.clientX - rect.left : 0;
      
      // X軸スケールからデータインデックスを計算
      const dataX = chart.scales.x.getValueForPixel(x);
      const dataIndex = Math.round(dataX || 0);
      
      console.log('Click position:', x, 'Data index:', dataIndex, 'Year data length:', yearData.length);
      
      if (dataIndex >= 0 && dataIndex < yearData.length) {
        const clickedMonth = yearData[dataIndex].month;
        console.log('Clicked month:', clickedMonth);
        onMonthClick(clickedMonth);
      }
    } catch (error) {
      console.error('Chart click error:', error);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    onHover: (event: ChartEvent, activeElements: ActiveElement[], chart: ChartJS<'line'>) => {
      if (selectedMonth === null && onMonthClick) {
        chart.canvas.style.cursor = 'pointer';
      } else {
        chart.canvas.style.cursor = 'default';
      }
    },
    onClick: handleChartClick,
    elements: {
      point: {
        radius: 0,
        hoverRadius: 3,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 14,
          },
          padding: 20,
        },
      },
      title: {
        display: true,
        text: selectedMonth 
          ? `${selectedYear}年${selectedMonth}月の最高気温と平年値の比較（${periodLabel}基準）`
          : `${selectedYear}年の最高気温と平年値の比較（${periodLabel}基準）`,
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: TooltipItem<'line'>) => {
            if (context.datasetIndex === 0 && context.dataIndex < tempDifferences.length) {
              const diff = tempDifferences[context.dataIndex];
              if (diff !== null) {
                const sign = diff > 0 ? '+' : '';
                return `平年差: ${sign}${diff.toFixed(1)}°C`;
              }
            }
            return '';
          },
        },
      },
    },
    scales: {
      x: {
        type: 'linear' as const,
        min: 0,
        max: yearData.length - 1,
        grid: {
          display: true,
          color: (context: ScriptableScaleContext) => {
            // 月の境界線のみ表示
            const index = context.tick?.value;
            if (typeof index === 'number' && monthBoundaries.includes(index)) {
              return 'rgba(0, 0, 0, 0.3)';
            }
            return 'transparent'; // 通常のグリッド線は非表示
          },
          lineWidth: (context: ScriptableScaleContext) => {
            const index = context.tick?.value;
            if (typeof index === 'number' && monthBoundaries.includes(index)) {
              return 2;
            }
            return 0; // 通常のグリッド線の太さを0に
          },
        },
        ticks: {
          font: {
            size: 12,
          },
          callback: function(value: string | number) {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;
            if (selectedMonth !== null && selectedMonth !== undefined) {
              // 月別表示の場合は日付を表示
              const index = Math.floor(numValue);
              if (index >= 0 && index < yearData.length) {
                const d = yearData[index];
                return `${d.day}日`;
              }
              return '';
            } else {
              // 年間表示の場合は月ラベル
              const index = Math.floor(numValue);
              const monthCenter = monthCenters.find(mc => mc.position === index);
              if (monthCenter) {
                return `${monthCenter.month}月`;
              }
              return '';
            }
          },
          autoSkip: selectedMonth !== null && selectedMonth !== undefined ? true : false,
          includeBounds: false,
        },
        // 月の中心位置に明示的にtickを配置（年間表示の場合のみ）
        afterBuildTicks: selectedMonth === null || selectedMonth === undefined ? function(scale: Scale) {
          const scaleWithTicks = scale as Scale & { ticks: Array<{ value: number; label: string }> };
          scaleWithTicks.ticks = monthCenters.map(mc => ({
            value: mc.position,
            label: `${mc.month}月`
          }));
        } : undefined,
      },
      y: {
        min: selectedMonth !== null && selectedMonth !== undefined ? undefined : -5,
        max: selectedMonth !== null && selectedMonth !== undefined ? undefined : 45,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: string | number) {
            return value + '°C';
          },
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: '気温（°C）',
          font: {
            size: 14,
          },
        },
      },
    },
  };

  // 平均気温差を計算
  const validDifferences = tempDifferences.filter(d => d !== null) as number[];
  const avgDifference = validDifferences.length > 0 
    ? validDifferences.reduce((sum, d) => sum + d, 0) / validDifferences.length 
    : 0;

  // 平年値との比較統計を計算（標準偏差ベース）
  const comparisonStats = {
    above: 0,         // 平年値を上回った日数
    below: 0,         // 平年値を下回った日数
    equal: 0,         // 平年値と同じ日数
    aboveHigh: 0,     // 2σ以上高い日数
    belowLow: 0,      // 2σ以上低い日数
    total: 0          // 比較対象の総日数
  };

  // 猛暑日・真夏日の統計
  const temperatureStats = {
    extremeHot: 0,    // 猛暑日（35°C以上）
    veryHot: 0,       // 真夏日（30°C以上）
    hotSummer: 0,     // 夏日（25°C以上）
    total: yearData.length
  };

  yearData.forEach((d) => {
    // 気温基準の統計
    if (d.max_temp >= 35) {
      temperatureStats.extremeHot++;
    } else if (d.max_temp >= 30) {
      temperatureStats.veryHot++;
    } else if (d.max_temp >= 25) {
      temperatureStats.hotSummer++;
    }

    // 平年値との比較統計
    const monthDay = `${String(d.month).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`;
    const normalMean = averageNormalValues[monthDay];
    const normalStdDev = standardDeviations[monthDay];
    
    if (normalMean !== undefined && normalStdDev !== undefined) {
      comparisonStats.total++;
      const diff = d.max_temp - normalMean;
      
      if (Math.abs(diff) < 0.1) {
        comparisonStats.equal++;
      } else if (diff > 0) {
        comparisonStats.above++;
        // 2σ以上高い場合
        if (diff >= 2 * normalStdDev) {
          comparisonStats.aboveHigh++;
        }
      } else {
        comparisonStats.below++;
        // 2σ以上低い場合
        if (diff <= -2 * normalStdDev) {
          comparisonStats.belowLow++;
        }
      }
    }
  });

  // 最高気温TOP3を計算
  const top3HighestTemps = yearData
    .map(d => ({
      date: `${d.month}/${d.day}`,
      temp: d.max_temp,
      month: d.month,
      day: d.day
    }))
    .sort((a, b) => b.temp - a.temp)
    .slice(0, 3);

  return (
    <div className="w-full">
      {/* 月選択の状態表示とリセットボタン */}
      {selectedMonth && onMonthClick && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm text-blue-700 font-medium">
                {selectedMonth}月の詳細表示中
              </span>
              <span className="ml-2 text-xs text-blue-600">
                （年間表示に戻るには下のボタンをクリック）
              </span>
            </div>
            <button
              onClick={() => onMonthClick(null)}
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition-colors"
            >
              年間表示に戻る
            </button>
          </div>
        </div>
      )}
      
      {/* 年間表示の場合のヒント */}
      {!selectedMonth && onMonthClick && (
        <div className="mb-4 p-2 bg-gray-50 rounded border border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            グラフの月別エリアをクリックすると、その月の詳細な日別データを表示できます
          </p>
        </div>
      )}
      
      <div className="h-[400px] md:h-[500px] mb-4">
        <Line data={chartData} options={options} plugins={[monthBackgroundPlugin]} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {/* 平均気温差 */}
        <div className="md:col-span-3 text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">平均気温差</p>
          <p className="text-sm text-gray-600">
            <span className={`font-bold text-2xl ${avgDifference > 0 ? 'text-red-600' : 'text-blue-600'}`}>
              {avgDifference > 0 ? '+' : ''}{avgDifference.toFixed(2)}°C
            </span>
          </p>
          {avgDifference > 2 && (
            <p className="text-xs text-red-600 mt-1 font-semibold">
              異常高温年
            </p>
          )}
        </div>

        {/* 平年値との比較統計 */}
        <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2 text-center">平年値との比較</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-red-600">上回った日:</span>
              <span className="font-semibold">{comparisonStats.above}日 ({((comparisonStats.above / comparisonStats.total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-600">下回った日:</span>
              <span className="font-semibold">{comparisonStats.below}日 ({((comparisonStats.below / comparisonStats.total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">同じだった日:</span>
              <span className="font-semibold">{comparisonStats.equal}日 ({((comparisonStats.equal / comparisonStats.total) * 100).toFixed(1)}%)</span>
            </div>
            <div className="border-t pt-1 mt-2 space-y-1">
              <div className="flex justify-between">
                <span className="text-red-700 font-bold">2σ以上高い:</span>
                <span className="font-semibold text-red-700">{comparisonStats.aboveHigh}日 ({((comparisonStats.aboveHigh / comparisonStats.total) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700 font-bold">2σ以上低い:</span>
                <span className="font-semibold text-blue-700">{comparisonStats.belowLow}日 ({((comparisonStats.belowLow / comparisonStats.total) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* 猛暑日・真夏日統計 */}
        <div className="md:col-span-1 p-4 bg-orange-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2 text-center">気温基準日数</p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-red-700 font-bold">猛暑日:</span>
              <span className="font-semibold text-red-700">{temperatureStats.extremeHot}日</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600 font-bold">真夏日:</span>
              <span className="font-semibold text-orange-600">{temperatureStats.veryHot}日</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">夏日:</span>
              <span className="font-semibold text-yellow-600">{temperatureStats.hotSummer}日</span>
            </div>
            <div className="border-t pt-1 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-700">総日数:</span>
                <span className="font-semibold">{temperatureStats.total}日</span>
              </div>
            </div>
          </div>
        </div>

        {/* 最高気温TOP3 */}
        <div className="md:col-span-1 p-4 bg-red-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2 text-center">最高気温TOP3</p>
          <div className="space-y-1 text-xs">
            {top3HighestTemps.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-700">{index + 1}位 {item.date}:</span>
                <span className="font-semibold text-red-600">{item.temp.toFixed(1)}°C</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}