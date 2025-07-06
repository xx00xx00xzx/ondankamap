// 手動で天気予報を取得してDBに保存するスクリプト
import { fetchAndSaveWeatherForecast } from '../src/lib/weather-fetcher.ts';

async function main() {
  console.log('Fetching weather forecast...');
  const result = await fetchAndSaveWeatherForecast();
  console.log('Result:', result);
  process.exit(result.success ? 0 : 1);
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});