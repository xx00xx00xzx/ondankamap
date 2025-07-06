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

interface TropicalNightsChartProps {
  data: TemperatureData[];
}

interface YearlyTropicalNightsStats {
  year: number;
  tropicalNights: number;    // 熱帯夜（最低気温25°C以上）
}

export default function TropicalNightsChart({ data }: TropicalNightsChartProps) {
  // 年ごとの熱帯夜日数の統計を計算
  const yearlyStats: YearlyTropicalNightsStats[] = [];
  const years = Array.from(new Set(data.map(d => d.year))).sort();
  
  years.forEach(year => {
    const yearData = data.filter(d => d.year === year);
    let tropicalNights = 0;
    
    yearData.forEach(d => {
      if (d.min_temp >= 25) {
        tropicalNights++;
      }
    });
    
    yearlyStats.push({
      year,
      tropicalNights
    });
  });

  // 10年移動平均を計算
  const movingAverage10 = yearlyStats.map((_, index) => {
    const start = Math.max(0, index - 4);
    const end = Math.min(yearlyStats.length, index + 6);
    const slice = yearlyStats.slice(start, end);
    return slice.reduce((sum, stat) => sum + stat.tropicalNights, 0) / slice.length;
  });

  const chartData = {
    labels: years,
    datasets: [
      {
        label: '熱帯夜（最低気温25°C以上）',
        data: yearlyStats.map(stat => stat.tropicalNights),
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.8)',
        borderWidth: 1,
        fill: true,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
      {
        label: '10年移動平均',
        data: movingAverage10,
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'transparent',
        borderWidth: 3,
        fill: false,
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
        text: '熱帯夜の年次推移（1880-2024年）',
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
              return `年間熱帯夜日数: ${yearData.tropicalNights}日`;
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
    tropicalNights: meijiYears.length ? meijiYears.reduce((sum, s) => sum + s.tropicalNights, 0) / meijiYears.length : 0,
  };
  
  const showaAvg = {
    tropicalNights: showaYears.length ? showaYears.reduce((sum, s) => sum + s.tropicalNights, 0) / showaYears.length : 0,
  };
  
  const heiseiAvg = {
    tropicalNights: heiseiYears.length ? heiseiYears.reduce((sum, s) => sum + s.tropicalNights, 0) / heiseiYears.length : 0,
  };
  
  const reiwaAvg = {
    tropicalNights: reiwaYears.length ? reiwaYears.reduce((sum, s) => sum + s.tropicalNights, 0) / reiwaYears.length : 0,
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
              <span className="text-purple-700">熱帯夜:</span>
              <span className="font-semibold">{meijiAvg.tropicalNights.toFixed(1)}日/年</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-green-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">昭和（1926-1989年）</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-700">熱帯夜:</span>
              <span className="font-semibold">{showaAvg.tropicalNights.toFixed(1)}日/年</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">平成（1989-2019年）</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-700">熱帯夜:</span>
              <span className="font-semibold">{heiseiAvg.tropicalNights.toFixed(1)}日/年</span>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-red-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">令和（2019年〜）</h3>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-purple-700">熱帯夜:</span>
              <span className="font-semibold">{reiwaAvg.tropicalNights.toFixed(1)}日/年</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* 変化の説明 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>年号別の変化:</strong> 
          熱帯夜は明治から令和にかけて<span className="text-purple-600 font-semibold">
          +{(reiwaAvg.tropicalNights - meijiAvg.tropicalNights).toFixed(1)}日/年
          </span>増加。
          10年移動平均で長期的な増加傾向が明確に確認でき、平成以降の増加が特に顕著です。
          都市化とヒートアイランド現象により、夜間の気温低下が抑制されています。
        </p>
      </div>
    </div>
  );
}