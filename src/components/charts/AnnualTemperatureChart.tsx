'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { AnnualData } from '@/types/temperature';
import prophetAnnualJson from '@/data/prophet_annual_forecast.json';
import { useState } from 'react';

// Chart.jsの要素を登録
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface AnnualTemperatureChartProps {
  data: AnnualData[];
  showTrendLine?: boolean;
  trendLineStyle?: 'solid' | 'dashed';
}

export default function AnnualTemperatureChart({ 
  data
}: AnnualTemperatureChartProps) {
  const [showProphet, setShowProphet] = useState(true);

  // 温暖化トレンドライン計算（将来的に使用予定）
  // const calculateTrendLine = (annualData: AnnualData[]) => {
  //   const n = annualData.length;
  //   const sumX = annualData.reduce((sum, item) => sum + item.year, 0);
  //   const sumY = annualData.reduce((sum, item) => sum + item.avg_max_temp, 0);
  //   const sumXY = annualData.reduce((sum, item) => sum + item.year * item.avg_max_temp, 0);
  //   const sumXX = annualData.reduce((sum, item) => sum + item.year * item.year, 0);
  //   
  //   const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  //   const intercept = (sumY - slope * sumX) / n;
  //   
  //   return annualData.map(item => slope * item.year + intercept);
  // };

  const labels = data.map(d => d.year.toString());
  const maxTemps = data.map(d => d.avg_max_temp);
  const minTemps = data.map(d => d.avg_min_temp);
  // Prophet予測値（年平均）
  const prophetAnnual = prophetAnnualJson as Record<string, number>;
  const prophetYears = Object.keys(prophetAnnual).map(Number).sort((a, b) => a - b);
  const prophetValues = prophetYears.map(y => prophetAnnual[y.toString()]);

  const chartData = {
    labels,
    datasets: [
      {
        label: "年平均最高気温",
        data: maxTemps,
        borderColor: "#f87171",
        backgroundColor: "#fca5a5",
        tension: 0.3,
        fill: false,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: "年平均最低気温",
        data: minTemps,
        borderColor: "#60a5fa",
        backgroundColor: "#93c5fd",
        tension: 0.3,
        fill: false,
        pointRadius: 2,
        borderWidth: 2,
      },
      ...(showProphet ? [{
        label: "Prophet予測（年平均気温）",
        data: prophetValues,
        borderColor: "#a855f7",
        backgroundColor: "#c4b5fd",
        borderDash: [6, 4],
        tension: 0.3,
        fill: false,
        pointRadius: 0,
        borderWidth: 2,
        spanGaps: true,
        // Prophet予測は年数が多いのでx軸ラベルとズレないよう注意
      }] : []),
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold',
        },
        bodyFont: {
          size: 13,
        },
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: function(context) {
            return `${context[0].label}年`;
          },
          label: function(context) {
            const value = context.parsed.y.toFixed(1);
            const datasetLabel = context.dataset.label;
            return `${datasetLabel}: ${value}℃`;
          },
          afterBody: function(context) {
            if (context.length === 2) {
              const maxTemp = context.find(c => c.dataset.label?.includes('最高'))?.parsed.y;
              const minTemp = context.find(c => c.dataset.label?.includes('最低'))?.parsed.y;
              if (maxTemp && minTemp) {
                const diff = (maxTemp - minTemp).toFixed(1);
                return `気温差: ${diff}℃`;
              }
            }
            return [];
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: false,
        },
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 15,
          font: {
            size: 12,
          },
          color: '#4b5563',
        },
        border: {
          display: true,
          color: '#9ca3af',
          width: 1,
        },
      },
      y: {
        display: true,
        title: {
          display: false,
        },
        grid: {
          color: '#e5e7eb',
          drawOnChartArea: true,
          lineWidth: 1,
        },
        ticks: {
          stepSize: 5,
          font: {
            size: 12,
          },
          color: '#4b5563',
        },
        border: {
          display: true,
          color: '#9ca3af',
          width: 1,
        },
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      line: {
        spanGaps: true,
      },
    },
  };

  // チェックボックスUI
  const prophetToggle = (
    <label className="ml-4 text-sm text-purple-700 font-semibold cursor-pointer select-none">
      <input
        type="checkbox"
        checked={showProphet}
        onChange={e => setShowProphet(e.target.checked)}
        className="mr-1 accent-purple-500"
      />
      Prophet予測を表示
    </label>
  );

  return (
    <div className="w-full h-[400px]">
      <div className="flex items-center mb-2">
        {prophetToggle}
      </div>
      <Line data={chartData} options={options} />
    </div>
  );
}