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
import { DailyData } from '@/types/temperature';

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

interface DailyTemperatureChartProps {
  data: DailyData[];
}

export default function DailyTemperatureChart({ data }: DailyTemperatureChartProps) {
  // 月の境界線用のデータを作成
  const monthBoundaries = [31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]; // 各月末の日数

  const chartData = {
    labels: data.map(item => {
      // 1日、15日のみラベル表示
      if (item.day === 1 || item.day === 15) {
        return item.date_label;
      }
      return '';
    }),
    datasets: [
      {
        label: '日平均最高気温',
        data: data.map(item => item.avg_max_temp),
        borderColor: '#2563eb',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false,
      },
      {
        label: '日平均最低気温',
        data: data.map(item => item.avg_min_temp),
        borderColor: '#22c55e',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 4,
        fill: false,
      },
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
            const dataIndex = context[0].dataIndex;
            const dayData = data[dataIndex];
            return `${dayData.month}月${dayData.day}日`;
          },
          label: function(context) {
            const value = context.parsed.y.toFixed(1);
            return `${context.dataset.label}: ${value}℃`;
          },
          afterBody: function(context) {
            if (context.length === 2) {
              const dataIndex = context[0].dataIndex;
              const dayData = data[dataIndex];
              return `気温差: ${dayData.temp_diff}℃`;
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
          display: true,
          color: (context) => {
            // 月の境界線を強調表示
            return monthBoundaries.includes(context.index) ? '#9ca3af' : '#f3f4f6';
          },
          lineWidth: (context) => {
            return monthBoundaries.includes(context.index) ? 2 : 1;
          },
        },
        ticks: {
          maxTicksLimit: 24, // 月の境界のみ表示
          font: {
            size: 10,
          },
          color: '#4b5563',
          callback: function(value, index) {
            // 月の最初の日のみラベル表示
            const dayData = data[index];
            if (dayData && dayData.day === 1) {
              return `${dayData.month}月`;
            }
            return '';
          },
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
          callback: function(value) {
            return `${value}℃`;
          },
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

  return (
    <div className="w-full h-[500px] p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}