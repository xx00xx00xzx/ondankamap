# Cursor Rules for ondankamap

## Project Overview
- Tokyo temperature visualization web app using Next.js 14, TypeScript, Chart.js.
- Visualizes Tokyo's temperature data (1880–2024) to show global warming trends.
- Interactive charts and real-time weather comparison.

## Development Commands
- `npm run dev`: Start development server (http://localhost:3000)
- `npm run build`: Production build
- `npm run lint`: Run ESLint
- `npm run type-check`: TypeScript validation

## Architecture & Data Flow
- Historical temperature data (CSV, 1935–2025) is processed and converted to JSON.
- Users can view:
  - Annual average temperatures (global warming visualization)
  - Monthly average comparisons
  - Current week weather forecast vs. historical data
- Open-Meteo API integration for real-time weather.

## Data Structure
- CSV files: 9 files (1880–2024), various encodings (Shift-JIS, UTF-8)
- Data format: Date, Max Temp, Min Temp, quality info
- Processing: CSV → JSON, aggregated by year/month
- TypeScript interface:
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

## Page Routes
- `/`: Main page (annual temperature trends)
- `/month`: Monthly temperature analysis
- `/week`: Current week forecast vs. historical data

## API Endpoints
- Open-Meteo API for Tokyo weather:
  `https://api.open-meteo.com/v1/forecast?latitude=35.681236&longitude=139.767125&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=Asia%2FTokyo`

## Important Files
- `/data/`: CSV and JSON temperature data
- `/lib/data-processor.ts`: Data conversion/aggregation utilities
- `/components/charts/`: Chart components
- `/types/temperature.ts`: TypeScript interfaces

## Design Patterns
- Static data processing: CSV → JSON for fast loading
- Type safety: Use TypeScript interfaces, avoid `any`/`unknown`
- Component architecture: Chart.js + React
- Responsive/mobile-first design
- Color coding for temperature anomalies (+2°C = red)

## UI Framework
- Tailwind CSS for styling
- Chart.js for visualizations
- Responsive, mobile-optimized

## Environment Setup
- No env vars needed for basic use
- For future API keys: `.env.local` with `WEATHER_API_KEY`

## Development Guidelines
### Data Processing
- Handle encoding: data-5.csv, data-6.csv are Shift-JIS (convert to UTF-8)
- Data spans 1935–2025, daily max/min, quality flags
- Ensure data integrity (quality flag 8)

### Implementation Priority
1. Annual max/min temperature graphs
2. Current week forecast (API integration)
3. Monthly average visualization
4. Historical anomaly analysis

### Task Management & Communication
- Use TodoWrite tool for tasks with 3+ steps or multiple operations
- Execute independent processes concurrently
- Notify task completion on macOS: `osascript -e 'display notification "${TASK_DESCRIPTION} is complete" with title "ondankamap_dev"'`
- Think in English, respond in Japanese (for Claude)
- No unnecessary spaces in Japanese

### Code Quality
- Always run lint and type-check after changes
- Test solutions when possible; check README/codebase for test approach
- Use proper typing for temperature data
- Handle CSV encoding issues

### Documentation
- JSDoc/docstrings: English
- Code comments (implementation reasoning): Japanese
- No emojis in documentation

### Workflow
- Convert CSV to JSON before visualization
- Use Chart.js with TypeScript for charts
- Integrate Open-Meteo API for weather
- Ensure mobile readability

## Special Notes
1. **Encoding**: Convert Shift-JIS CSVs to UTF-8
2. **Data Integrity**: Consider quality flags for reliability
3. **Performance**: Pre-calculate aggregates for 90+ years of data
4. **API Limits**: Cache Open-Meteo API responses appropriately
5. **Responsive Design**: Ensure charts are mobile-friendly 