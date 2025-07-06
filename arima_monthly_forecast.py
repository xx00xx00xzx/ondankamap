import json
import pandas as pd
from statsmodels.tsa.arima.model import ARIMA

# データ読み込み
with open('src/data/tokyo_temperature_data.json', encoding='utf-8') as f:
    data = json.load(f)

df = pd.DataFrame(data)

# 予測対象年
future_years = [2030, 2040, 2050]

# 月ごとにARIMAで予測
result = {}
for month in range(1, 13):
    month_df = df[df['month'] == month]
    # 年ごとに平均最高気温を集計
    yearly = month_df.groupby('year')['max_temp'].mean().sort_index()
    try:
        if len(yearly) == 0:
            result[str(month)] = {}
            continue
        model = ARIMA(yearly, order=(1,1,1))
        fit = model.fit()
        last_year_raw = yearly.index.max()
        if hasattr(last_year_raw, 'year'):
            last_year = int(getattr(last_year_raw, 'year'))
        else:
            last_year = int(str(last_year_raw))
        steps = max(future_years) - last_year
        forecast_dict = {}
        if steps == 0:
            # 予測不要、実測値のみ返す
            all_years = {str(y): float(t) for y, t in zip(yearly.index, yearly.values)}
            result[str(month)] = all_years
            continue
        if steps > 0:
            forecast = fit.forecast(steps=steps)
            forecast_years = list(range(last_year+1, max(future_years)+1))
            forecast_dict = {str(y): float(forecast[i]) for i, y in enumerate(forecast_years)}
        # 実測値も含めてまとめる
        all_years = {str(y): float(t) for y, t in zip(yearly.index, yearly.values)}
        all_years.update(forecast_dict)
        result[str(month)] = all_years
    except Exception as e:
        print(f"month={month} error: {e}")
        result[str(month)] = {"error": str(e)}

# JSONで保存
with open('src/data/arima_monthly_max_forecast.json', 'w', encoding='utf-8') as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print('ARIMA月別最高気温予測を出力しました') 