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

interface TemperatureDifferenceChartProps {
  data: AnnualData[];
}

export default function TemperatureDifferenceChart({ data }: TemperatureDifferenceChartProps) {
  const chartData = {
    labels: data.map(item => item.year.toString()),
    datasets: [
      {
        label: '年間気温差（最高-最低）',
        data: data.map(item => item.temp_diff),
        borderColor: '#059669',
        backgroundColor: 'rgba(5, 150, 105, 0.1)',
        borderWidth: 3,
        tension: 0,
        pointRadius: 1,
        pointHoverRadius: 3,
        pointBackgroundColor: '#059669',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        fill: true,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: '東京の年間気温差推移（1936-2024）',
        font: {
          size: 18,
        },
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
            return `気温差: ${value}℃`;
          },
          afterLabel: function(context) {
            const value = context.parsed.y;
            if (value > 30) {
              return '→ 気温差が大きい年';
            } else if (value < 25) {
              return '→ 気温差が小さい年';
            }
            return '';
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: '年',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#374151',
        },
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)',
          drawOnChartArea: true,
        },
        ticks: {
          maxTicksLimit: 20,
          font: {
            size: 11,
          },
          color: '#6b7280',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: '気温差（℃）',
          font: {
            size: 14,
            weight: 'bold',
          },
          color: '#374151',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
          drawOnChartArea: true,
        },
        ticks: {
          font: {
            size: 11,
          },
          color: '#6b7280',
        },
        min: 0,
      },
    },
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    elements: {
      line: {
        spanGaps: true, // 欠損データがあっても線を繋げる
      },
    },
  };

  return (
    <div className="w-full h-[500px] p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}