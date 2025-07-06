import cron from 'node-cron';
import { fetchAndSaveWeatherForecast } from '../lib/weather-fetcher';

// 毎日午前1時に実行
const task = cron.schedule('0 1 * * *', async () => {
  console.log('Running weather forecast cron job at', new Date().toISOString());
  const result = await fetchAndSaveWeatherForecast();
  console.log('Cron job result:', result);
}, {
  timezone: "Asia/Tokyo"
});

// 手動実行用の関数
export async function runWeatherCron() {
  console.log('Manually running weather forecast fetch...');
  const result = await fetchAndSaveWeatherForecast();
  console.log('Manual run result:', result);
  return result;
}

// プロセス終了時にcronジョブを停止
process.on('SIGTERM', () => {
  console.log('Stopping cron job...');
  task.stop();
  process.exit(0);
});

console.log('Weather forecast cron job scheduled for 1:00 AM JST daily');