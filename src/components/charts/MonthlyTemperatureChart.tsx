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
import { MonthlyData } from '@/types/temperature';

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

interface MonthlyTemperatureChartProps {
  data: MonthlyData[];
}

export default function MonthlyTemperatureChart({ data }: MonthlyTemperatureChartProps) {
  const chartData = {
    labels: data.map(item => item.month_name),
    datasets: [
      {
        label: '月平均最高気温',
        data: data.map(item => item.avg_max_temp),
        borderColor: '#2563eb',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointBackgroundColor: '#2563eb',
        pointBorderColor: '#2563eb',
        pointBorderWidth: 0,
        fill: false,
      },
      {
        label: '月平均最低気温',
        data: data.map(item => item.avg_min_temp),
        borderColor: '#22c55e',
        backgroundColor: 'transparent',
        borderWidth: 2,
        tension: 0,
        pointRadius: 2,
        pointHoverRadius: 4,
        pointBackgroundColor: '#22c55e',
        pointBorderColor: '#22c55e',
        pointBorderWidth: 0,
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
            return `${context[0].label}`;
          },
          label: function(context) {
            const value = context.parsed.y.toFixed(1);
            return `${context.dataset.label}: ${value}℃`;
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
    <div className="w-full h-[400px] p-4">
      <Line data={chartData} options={options} />
    </div>
  );
}