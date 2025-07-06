import { TemperatureData, AnnualData, MonthlyData, MonthlyYearlyData, DailyData } from '@/types/temperature';

/**
 * 欠損年データの補間処理
 */
function fillMissingYears(data: AnnualData[]): AnnualData[] {
  if (data.length === 0) return data;
  
  const sortedData = data.sort((a, b) => a.year - b.year);
  const startYear = sortedData[0].year;
  const endYear = sortedData[sortedData.length - 1].year;
  const filledData: AnnualData[] = [];
  
  for (let year = startYear; year <= endYear; year++) {
    const existingData = sortedData.find(d => d.year === year);
    if (existingData) {
      filledData.push(existingData);
    } else {
      // 線形補間で欠損年のデータを推定
      const prevData = filledData[filledData.length - 1];
      const nextData = sortedData.find(d => d.year > year);
      
      if (prevData && nextData) {
        const yearDiff = nextData.year - prevData.year;
        const ratio = (year - prevData.year) / yearDiff;
        
        filledData.push({
          year,
          avg_max_temp: Math.round((prevData.avg_max_temp + (nextData.avg_max_temp - prevData.avg_max_temp) * ratio) * 10) / 10,
          avg_min_temp: Math.round((prevData.avg_min_temp + (nextData.avg_min_temp - prevData.avg_min_temp) * ratio) * 10) / 10,
          temp_diff: Math.round(((prevData.avg_max_temp + (nextData.avg_max_temp - prevData.avg_max_temp) * ratio) - 
                                (prevData.avg_min_temp + (nextData.avg_min_temp - prevData.avg_min_temp) * ratio)) * 10) / 10
        });
      }
    }
  }
  
  return filledData;
}

/**
 * 年次データの集計処理
 */
export function aggregateAnnualData(data: TemperatureData[]): AnnualData[] {
  const yearlyData = new Map<number, { maxTemps: number[]; minTemps: number[] }>();
  
  data.forEach(record => {
    if (!yearlyData.has(record.year)) {
      yearlyData.set(record.year, { maxTemps: [], minTemps: [] });
    }
    
    const yearData = yearlyData.get(record.year)!;
    yearData.maxTemps.push(record.max_temp);
    yearData.minTemps.push(record.min_temp);
  });
  
  const result: AnnualData[] = [];
  
  yearlyData.forEach((temps, year) => {
    const avgMaxTemp = temps.maxTemps.reduce((sum, temp) => sum + temp, 0) / temps.maxTemps.length;
    const avgMinTemp = temps.minTemps.reduce((sum, temp) => sum + temp, 0) / temps.minTemps.length;
    
    result.push({
      year,
      avg_max_temp: Math.round(avgMaxTemp * 10) / 10,
      avg_min_temp: Math.round(avgMinTemp * 10) / 10,
      temp_diff: Math.round((avgMaxTemp - avgMinTemp) * 10) / 10
    });
  });
  
  const sortedResult = result.sort((a, b) => a.year - b.year);
  return fillMissingYears(sortedResult);
}

/**
 * 月次データの集計処理（1-12月の平均）
 */
export function aggregateMonthlyData(data: TemperatureData[]): MonthlyData[] {
  const monthlyData = new Map<number, { maxTemps: number[]; minTemps: number[] }>();
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  
  data.forEach(record => {
    if (!monthlyData.has(record.month)) {
      monthlyData.set(record.month, { maxTemps: [], minTemps: [] });
    }
    
    const monthData = monthlyData.get(record.month)!;
    monthData.maxTemps.push(record.max_temp);
    monthData.minTemps.push(record.min_temp);
  });
  
  const result: MonthlyData[] = [];
  
  monthlyData.forEach((temps, month) => {
    const avgMaxTemp = temps.maxTemps.reduce((sum, temp) => sum + temp, 0) / temps.maxTemps.length;
    const avgMinTemp = temps.minTemps.reduce((sum, temp) => sum + temp, 0) / temps.minTemps.length;
    
    result.push({
      month,
      month_name: monthNames[month - 1],
      avg_max_temp: Math.round(avgMaxTemp * 10) / 10,
      avg_min_temp: Math.round(avgMinTemp * 10) / 10,
      temp_diff: Math.round((avgMaxTemp - avgMinTemp) * 10) / 10
    });
  });
  
  return result.sort((a, b) => a.month - b.month);
}

/**
 * 月別年次推移データの集計処理
 */
export function aggregateMonthlyYearlyData(data: TemperatureData[], targetMonth: number): MonthlyYearlyData[] {
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const yearlyData = new Map<number, { maxTemps: number[]; minTemps: number[] }>();
  
  // 指定された月のデータのみを抽出
  data.filter(record => record.month === targetMonth).forEach(record => {
    if (!yearlyData.has(record.year)) {
      yearlyData.set(record.year, { maxTemps: [], minTemps: [] });
    }
    
    const yearData = yearlyData.get(record.year)!;
    yearData.maxTemps.push(record.max_temp);
    yearData.minTemps.push(record.min_temp);
  });
  
  const result: MonthlyYearlyData[] = [];
  
  yearlyData.forEach((temps, year) => {
    const avgMaxTemp = temps.maxTemps.reduce((sum, temp) => sum + temp, 0) / temps.maxTemps.length;
    const avgMinTemp = temps.minTemps.reduce((sum, temp) => sum + temp, 0) / temps.minTemps.length;
    
    result.push({
      year,
      month: targetMonth,
      month_name: monthNames[targetMonth - 1],
      avg_max_temp: Math.round(avgMaxTemp * 10) / 10,
      avg_min_temp: Math.round(avgMinTemp * 10) / 10,
      temp_diff: Math.round((avgMaxTemp - avgMinTemp) * 10) / 10
    });
  });
  
  return result.sort((a, b) => a.year - b.year);
}

/**
 * 日別データの集計処理（1年365日の平均）
 */
export function aggregateDailyData(data: TemperatureData[]): DailyData[] {
  const dailyData = new Map<string, { maxTemps: number[]; minTemps: number[]; month: number; day: number }>();
  
  data.forEach(record => {
    // うるう年の2月29日は除外
    if (record.month === 2 && record.day === 29) return;
    
    const key = `${record.month}-${record.day}`;
    if (!dailyData.has(key)) {
      dailyData.set(key, { maxTemps: [], minTemps: [], month: record.month, day: record.day });
    }
    
    const dayData = dailyData.get(key)!;
    dayData.maxTemps.push(record.max_temp);
    dayData.minTemps.push(record.min_temp);
  });
  
  const result: DailyData[] = [];
  let dayOfYear = 1;
  
  // 1月1日から12月31日まで順番に処理
  for (let month = 1; month <= 12; month++) {
    const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${month}-${day}`;
      const dayData = dailyData.get(key);
      
      if (dayData && dayData.maxTemps.length > 0) {
        const avgMaxTemp = dayData.maxTemps.reduce((sum, temp) => sum + temp, 0) / dayData.maxTemps.length;
        const avgMinTemp = dayData.minTemps.reduce((sum, temp) => sum + temp, 0) / dayData.minTemps.length;
        
        result.push({
          day_of_year: dayOfYear,
          month,
          day,
          date_label: `${month}/${day}`,
          avg_max_temp: Math.round(avgMaxTemp * 10) / 10,
          avg_min_temp: Math.round(avgMinTemp * 10) / 10,
          temp_diff: Math.round((avgMaxTemp - avgMinTemp) * 10) / 10
        });
      }
      
      dayOfYear++;
    }
  }
  
  return result;
}

/**
 * 特定年の月別データ取得
 */
export function getMonthlyDataForYear(data: TemperatureData[], year: number): MonthlyData[] {
  const yearData = data.filter(record => record.year === year);
  return aggregateMonthlyData(yearData);
}

/**
 * 線形回帰による温暖化トレンド計算
 */
export function calculateTrendLine(annualData: AnnualData[]): { slope: number; intercept: number } {
  const n = annualData.length;
  const sumX = annualData.reduce((sum, data) => sum + data.year, 0);
  const sumY = annualData.reduce((sum, data) => sum + data.avg_max_temp, 0);
  const sumXY = annualData.reduce((sum, data) => sum + data.year * data.avg_max_temp, 0);
  const sumXX = annualData.reduce((sum, data) => sum + data.year * data.year, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  return { slope, intercept };
}