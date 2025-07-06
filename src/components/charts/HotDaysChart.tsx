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
  Filler
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

interface HotDaysChartProps {
  data: TemperatureData[];
}

interface YearlyHotDaysStats {
  year: number;
  extremeHot: number;    // 猛暑日（35°C以上）
  veryHot: number;       // 真夏日（30°C以上35°C未満）
  hotSummer: number;     // 夏日（25°C以上30°C未満）
}

export default function HotDaysChart({ data }: HotDaysChartProps) {
  // 年ごとの猛暑日・真夏日・夏日の統計を計算
  const yearlyStats: YearlyHotDaysStats[] = [];
  const years = Array.from(new Set(data.map(d => d.year))).sort();
  
  years.forEach(year => {
    const yearData = data.filter(d => d.year === year);
    let extremeHot = 0;
    let veryHot = 0;
    let hotSummer = 0;
    
    yearData.forEach(d => {
      if (d.max_temp >= 35) {
        extremeHot++;
      } else if (d.max_temp >= 30) {
        veryHot++;
      } else if (d.max_temp >= 25) {
        hotSummer++;
      }
    });
    
    yearlyStats.push({
      year,
      extremeHot,
      veryHot,
      hotSummer
    });
  });

  const chartData = {
    labels: years,
    datasets: [
      {
        label: '猛暑日（35°C以上）',
        data: yearlyStats.map(stat => stat.extremeHot),
        borderColor: 'rgb(220, 38, 38)',
        backgroundColor: 'rgba(220, 38, 38, 0.8)',
        borderWidth: 1,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
      {
        label: '真夏日（30-35°C）',
        data: yearlyStats.map(stat => stat.veryHot),
        borderColor: 'rgb(251, 146, 60)',
        backgroundColor: 'rgba(251, 146, 60, 0.8)',
        borderWidth: 1,
        fill: '-1',
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
      {
        label: '夏日（25-30°C）',
        data: yearlyStats.map(stat => stat.hotSummer),
        borderColor: 'rgb(251, 191, 36)',
        backgroundColor: 'rgba(251, 191, 36, 0.8)',
        borderWidth: 1,
        fill: '-1',
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
          maxTicksLimit: 15,
        },
        title: {
          display: true,
          text: '年',
          font: {
            size: 14,
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          callback: function(value: string | number) {
            return value + '日';
          },
          font: {
            size: 12,
          },
        },
        title: {
          display: true,
          text: '日数',
          font: {
            size: 14,
          },
        },
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
        text: '猛暑日・真夏日・夏日の年次推移（1880-2024年）',
        font: {
          size: 18,
          weight: 'bold' as const,
        },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          afterLabel: (context: {dataIndex: number}) => {
            const yearData = yearlyStats.find(s => s.year === years[context.dataIndex]);
            if (yearData) {
              const total = yearData.extremeHot + yearData.veryHot + yearData.hotSummer;
              return `高温日合計: ${total}日`;
            }
            return '';
          },
        },
      },
    },
  };
  

  // 年号別統計サマリーを計算
  const meijiYears = yearlyStats.filter(s => s.year >= 1880 && s.year <= 1912);
  const showaYears = yearlyStats.filter(s => s.year >= 1926 && s.year <= 1989);
  const heiseiYears = yearlyStats.filter(s => s.year >= 1989 && s.year <= 2019);
  const reiwaYears = yearlyStats.filter(s => s.year >= 2019);
  
  const meijiAvg = {
    extremeHot: meijiYears.length ? meijiYears.reduce((sum, s) => sum + s.extremeHot, 0) / meijiYears.length : 0,
    veryHot: meijiYears.length ? meijiYears.reduce((sum, s) => sum + s.veryHot, 0) / meijiYears.length : 0,
    hotSummer: meijiYears.length ? meijiYears.reduce((sum, s) => sum + s.hotSummer, 0) / meijiYears.length : 0,
  };
  
  const showaAvg = {
    extremeHot: showaYears.length ? showaYears.reduce((sum, s) => sum + s.extremeHot, 0) / showaYears.length : 0,
    veryHot: showaYears.length ? showaYears.reduce((sum, s) => sum + s.veryHot, 0) / showaYears.length : 0,
    hotSummer: showaYears.length ? showaYears.reduce((sum, s) => sum + s.hotSummer, 0) / showaYears.length : 0,
  };
  
  const heiseiAvg = {
    extremeHot: heiseiYears.length ? heiseiYears.reduce((sum, s) => sum + s.extremeHot, 0) / heiseiYears.length : 0,
    veryHot: heiseiYears.length ? heiseiYears.reduce((sum, s) => sum + s.veryHot, 0) / heiseiYears.length : 0,
    hotSummer: heiseiYears.length ? heiseiYears.reduce((sum, s) => sum + s.hotSummer, 0) / heiseiYears.length : 0,
  };
  
  const reiwaAvg = {
    extremeHot: reiwaYears.length ? reiwaYears.reduce((sum, s) => sum + s.extremeHot, 0) / reiwaYears.length : 0,
    veryHot: reiwaYears.length ? reiwaYears.reduce((sum, s) => sum + s.veryHot, 0) / reiwaYears.length : 0,
    hotSummer: reiwaYears.length ? reiwaYears.reduce((sum, s) => sum + s.hotSummer, 0) / reiwaYears.length : 0,
  };

  return (
    <div className="w-full">
      <div className="h-[400px] md:h-[500px] mb-4">
        <Line data={chartData} options={options} />
      </div>
      
      {/* 年号別統計サマリー */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-purple-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">明治（1880-1912年）</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-red-700">猛暑日:</span>
              <span className="font-semibold">{meijiAvg.extremeHot.toFixed(1)}日/年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">真夏日:</span>
              <span className="font-semibold">{meijiAvg.veryHot.toFixed(1)}日/年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">夏日:</span>
              <span className="font-semibold">{meijiAvg.hotSummer.toFixed(1)}日/年</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">昭和（1926-1989年）</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-red-700">猛暑日:</span>
              <span className="font-semibold">{showaAvg.extremeHot.toFixed(1)}日/年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">真夏日:</span>
              <span className="font-semibold">{showaAvg.veryHot.toFixed(1)}日/年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">夏日:</span>
              <span className="font-semibold">{showaAvg.hotSummer.toFixed(1)}日/年</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">平成（1989-2019年）</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-red-700">猛暑日:</span>
              <span className="font-semibold">{heiseiAvg.extremeHot.toFixed(1)}日/年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">真夏日:</span>
              <span className="font-semibold">{heiseiAvg.veryHot.toFixed(1)}日/年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">夏日:</span>
              <span className="font-semibold">{heiseiAvg.hotSummer.toFixed(1)}日/年</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">令和（2019年〜）</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-red-700">猛暑日:</span>
              <span className="font-semibold">{reiwaAvg.extremeHot.toFixed(1)}日/年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-orange-600">真夏日:</span>
              <span className="font-semibold">{reiwaAvg.veryHot.toFixed(1)}日/年</span>
            </div>
            <div className="flex justify-between">
              <span className="text-yellow-600">夏日:</span>
              <span className="font-semibold">{reiwaAvg.hotSummer.toFixed(1)}日/年</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 変化の説明 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>年号別の変化:</strong> 
          猛暑日は明治から令和にかけて<span className="text-red-600 font-semibold">
          +{(reiwaAvg.extremeHot - meijiAvg.extremeHot).toFixed(1)}日/年
          </span>増加。
          平成以降、猛暑日・真夏日の増加傾向が顕著になり、令和では更に加速しています。
        </p>
      </div>
    </div>
  );
}