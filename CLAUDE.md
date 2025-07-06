# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**ondankamap** is a Tokyo temperature visualization web application built with Next.js 14, TypeScript, and Chart.js. It visualizes Tokyo's temperature data from 1880 to 2024 (145 years of complete continuous data) spanning the entire Meiji, Taisho, Showa, Heisei, and Reiwa eras to help users understand global warming trends through interactive charts and current weather comparisons.

## Common Development Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm run lint       # Run ESLint
npm run type-check # TypeScript validation
```

## Architecture & Key Patterns

### Core Flow
1. Historical temperature data from CSV files (1935-2025) is processed and converted to JSON
2. User can view temperature trends through different time scales:
   - Annual average temperatures (global warming visualization)
   - Monthly average comparisons
   - Current week weather forecast with historical comparison
3. API integration with Open-Meteo for real-time weather data

### Data Structure
- **Historical Data**: 9 CSV files covering 1880-2024 (data-2.csv to data-10.csv, data-utf8.csv)
- **Data Format**: Date, Max Temperature, Min Temperature with quality info
- **Processing**: CSV → JSON conversion with data aggregation by year/month

### Page Routes
- `/` - Main page with annual temperature trends
- `/month` - Monthly temperature analysis
- `/week` - Current week forecast vs historical data

### API Endpoints
- Open-Meteo API for Tokyo weather forecast:
  `https://api.open-meteo.com/v1/forecast?latitude=35.681236&longitude=139.767125&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia%2FTokyo`

### Important Files
- `/data/` - CSV files with historical temperature data
- `/lib/data-processor.ts` - Data conversion and aggregation utilities
- `/components/charts/` - Chart components for temperature visualization
- `/types/temperature.ts` - TypeScript interfaces for temperature data

### Key Design Patterns
- **Static Data Processing**: CSV files converted to JSON for faster loading
- **Type Safety**: Comprehensive TypeScript interfaces for temperature data
- **Component Architecture**: Chart.js integration with React components
- **Responsive Design**: Mobile-first approach with temperature visualization

### Chart.js Integration
- Line charts for annual temperature trends
- Bar charts for monthly comparisons
- Trend lines for global warming visualization
- Color coding for temperature anomalies (+2°C = red highlighting)

### UI Framework
- Tailwind CSS for styling
- Chart.js for temperature visualizations
- Responsive design optimized for data visualization

## Environment Setup

No additional environment variables required for basic functionality.
For future API integrations, create `.env.local` with:
```
# Weather API key (if needed for premium features)
WEATHER_API_KEY=your_api_key_here
```

## Development Notes

### Data Processing
- CSV files use different encodings (Shift-JIS for data-5.csv, data-6.csv)
- Data spans 1935-2025 with daily max/min temperatures
- Quality flags and homogeneity numbers included in newer files

### Temperature Data Structure
```typescript
interface TemperatureData {
  date: string;
  maxTemp: number;
  minTemp: number;
  year: number;
  month: number;
  day: number;
}
```

### Implementation Priority
1. ★★★ Annual max/min temperature graphs
2. ★★☆ Current week forecast with API integration
3. ★☆☆ Monthly average visualization
4. ☆☆☆ Historical anomaly analysis

## Claude Development Guidelines

### Task Management & Communication Rules
- **Todo System**: Use TodoWrite tool to plan and track multi-step tasks. Create todos for complex tasks requiring 3+ steps or multiple operations.
- **Concurrent Execution**: To maximize efficiency, execute multiple independent processes concurrently, not sequentially.
- **Task Completion Notification**: Send macOS notification upon task completion using: `osascript -e 'display notification "${TASK_DESCRIPTION} is complete" with title "ondankamap_dev"'`
- **Language**: Think in English, respond in Japanese. No unnecessary spaces in Japanese.

### Code Quality Standards
- **Linting**: Always run lint and type-check commands after making changes to ensure code correctness.
- **Testing**: Verify solutions with tests when possible. Check README or search codebase for testing approach rather than assuming test framework.
- **TypeScript**: Avoid `any` or `unknown` types. Use proper typing for temperature data structures.
- **Data Processing**: Ensure proper handling of CSV encoding issues (Shift-JIS vs UTF-8).

### Documentation Standards
- **JSDoc/Docstrings**: Write in English
- **Code comments (implementation reasoning)**: Write in Japanese
- **No emojis** in any documentation

### Development Workflow
- **Data Conversion**: Process CSV files to JSON before implementing visualization
- **Chart Implementation**: Use Chart.js with TypeScript for temperature visualizations
- **API Integration**: Implement Open-Meteo API for weather forecast data
- **Mobile Optimization**: Ensure charts are readable on mobile devices

## 注意事項

1. **文字エンコーディング**: data-5.csv、data-6.csvはShift-JISエンコーディングのため、UTF-8への変換が必要
2. **データ整合性**: 品質情報フラグ（8）を考慮してデータの信頼性を確保
3. **パフォーマンス**: 90年分のデータを効率的に処理するため、必要に応じて集計データを事前計算
4. **API制限**: Open-Meteo APIの利用制限を考慮し、適切なキャッシュ戦略を実装
5. **レスポンシブデザイン**: 気温データの可視化がモバイルでも見やすくなるよう配慮