"use client";
import { useState, useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Legend,
  Tooltip,
  Title,
} from "chart.js";
import { aggregateMonthlyYearlyData } from "@/lib/data-processor";
import { TemperatureData } from "@/types/temperature";
import temperatureData from "@/data/tokyo_temperature_data.json";
import prophetMonthlyJson from '@/data/prophet_monthly_forecast.json';

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Legend, Tooltip, Title);

const monthNames = [
  "1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"
];

export default function MonthlyYearlyTrendChart() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const [selectedMonth, setSelectedMonth] = useState(currentMonth); // 現在の月をデフォルト
  const [showProphet, setShowProphet] = useState(true);
  const rawData = temperatureData as TemperatureData[];
  const data = useMemo(() => aggregateMonthlyYearlyData(rawData, selectedMonth), [rawData, selectedMonth]);
  // Prophet予測値（月ごと）
  const prophetMonthly = prophetMonthlyJson as Record<string, Record<string, number>>;
  const prophetMonthData = prophetMonthly[selectedMonth.toString()] || {};
  const prophetYears = Object.keys(prophetMonthData).map(Number).sort((a, b) => a - b);
  // X軸ラベルを実測＋未来年すべてに拡張
  const allYears = Array.from(new Set([...data.map(d => d.year), ...prophetYears])).sort((a, b) => a - b);
  // スライダー用: 年の範囲
  const minYear = allYears[0];
  const maxYear = allYears[allYears.length - 1];
  const defaultSliderYear = allYears.includes(2024) ? 2024 : maxYear;
  const [sliderYear, setSliderYear] = useState(defaultSliderYear);
  // スライダーで選択した年の予測値
  const selectedProphetValue = prophetMonthData[sliderYear.toString()] ?? null;
  // スライダーで選択した年までのデータのみ表示
  const displayedYears = allYears.filter(y => y <= sliderYear);
  const chartLabels = displayedYears.map(y => y.toString());
  const chartMaxTemps = displayedYears.map(y => {
    const found = data.find(d => d.year === y);
    return found ? found.avg_max_temp : null;
  });
  const chartMinTemps = displayedYears.map(y => {
    const found = data.find(d => d.year === y);
    return found ? found.avg_min_temp : null;
  });
  const chartProphetValues = displayedYears.map(y => prophetMonthData[y.toString()] ?? null);

  const chartData = {
    labels: chartLabels,
    datasets: [
      {
        label: "年ごとの月平均最高気温",
        data: chartMaxTemps,
        borderColor: "#f87171",
        backgroundColor: "#fca5a5",
        tension: 0.3,
        fill: false,
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: "年ごとの月平均最低気温",
        data: chartMinTemps,
        borderColor: "#60a5fa",
        backgroundColor: "#93c5fd",
        tension: 0.3,
        fill: false,
        pointRadius: 2,
        borderWidth: 2,
      },
      ...(showProphet ? [{
        label: "Prophet予測（月平均最高気温）",
        data: chartProphetValues,
        borderColor: "#a855f7",
        backgroundColor: "#c4b5fd",
        borderDash: [6, 4],
        tension: 0.3,
        fill: false,
        pointRadius: 0,
        borderWidth: 2,
        spanGaps: true,
      }] : []),
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top" as const },
      title: {
        display: true,
        text: `${monthNames[selectedMonth - 1]}の年ごとの平均気温推移`,
        font: { size: 18 },
      },
      tooltip: { enabled: true },
    },
    scales: {
      y: {
        title: { display: true, text: "気温 (℃)" },
        beginAtZero: false,
      },
      x: {
        title: { display: true, text: "年" },
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

  // スライダーUI
  const slider = (
    <div className="flex items-center gap-2 mt-2">
      <span className="text-gray-600 text-xs">{minYear}</span>
      <input
        type="range"
        min={minYear}
        max={maxYear}
        value={sliderYear}
        onChange={e => setSliderYear(Number(e.target.value))}
        className="w-64 accent-purple-500"
        step={1}
        list="years-tick"
      />
      <span className="text-gray-600 text-xs">{maxYear}</span>
      <span className="ml-4 text-sm font-semibold text-purple-700">{sliderYear}年 予測: {selectedProphetValue !== null ? `${selectedProphetValue.toFixed(1)}℃` : "-"}</span>
    </div>
  );

  return (
    <div className="w-full bg-white rounded-xl shadow-lg p-6 mb-12">
      <div className="mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 tracking-wide" style={{fontFamily: "'Montserrat', 'Noto Sans JP', sans-serif"}}>
          月ごとの年平均気温推移
        </h2>
        <div className="flex items-center gap-2 mt-2">
          <label htmlFor="month-select" className="text-gray-700 font-semibold">月選択:</label>
          <select
            id="month-select"
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="border rounded px-2 py-1 text-gray-700"
          >
            {monthNames.map((name, idx) => (
              <option key={idx + 1} value={idx + 1}>{name}</option>
            ))}
          </select>
          {prophetToggle}
        </div>
      </div>
      {slider}
      <Line data={chartData} options={options} />
    </div>
  );
} 