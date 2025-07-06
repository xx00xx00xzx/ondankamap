import json
import pandas as pd
from prophet import Prophet

# データ読み込み
with open('src/data/tokyo_temperature_data.json', encoding='utf-8') as f:
    data = json.load(f)
df = pd.DataFrame(data)

# 年平均気温の推移
annual = df.groupby('year').agg({
    'max_temp': 'mean',
    'min_temp': 'mean'
}).reset_index()
annual['avg_temp'] = (annual['max_temp'] + annual['min_temp']) / 2

# Prophet用データ整形（最高気温平均）
df_annual = pd.DataFrame({
    'ds': pd.to_datetime(annual['year'], format='%Y'),
    'y': annual['max_temp']
})

# 年平均気温予測
model_annual = Prophet(yearly_seasonality=False, daily_seasonality=False, weekly_seasonality=False)
model_annual.fit(df_annual)
future_annual = model_annual.make_future_dataframe(periods=100, freq='Y')
forecast_annual = model_annual.predict(future_annual)

# 年平均気温: 実測＋予測
annual_result = {}
for _, row in forecast_annual.iterrows():
    year = row['ds'].year
    annual_result[str(year)] = float(row['yhat'])

# 月ごとの年次推移（各月ごとにProphet）
monthly_result = {}
for month in range(1, 13):
    month_df = df[df['month'] == month]
    monthly = month_df.groupby('year').agg({
        'max_temp': 'mean',
        'min_temp': 'mean'
    }).reset_index()
    monthly['avg_temp'] = (monthly['max_temp'] + monthly['min_temp']) / 2
    df_month = pd.DataFrame({
        'ds': pd.to_datetime(monthly['year'], format='%Y'),
        'y': monthly['max_temp']
    })
    if len(df_month) < 5:
        monthly_result[str(month)] = {}
        continue
    model_month = Prophet(yearly_seasonality=False, daily_seasonality=False, weekly_seasonality=False)
    model_month.fit(df_month)
    future_month = model_month.make_future_dataframe(periods=100, freq='Y')
    forecast_month = model_month.predict(future_month)
    month_dict = {}
    for _, row in forecast_month.iterrows():
        year = row['ds'].year
        month_dict[str(year)] = float(row['yhat'])
    monthly_result[str(month)] = month_dict

# JSON出力
with open('src/data/prophet_annual_forecast.json', 'w', encoding='utf-8') as f:
    json.dump(annual_result, f, ensure_ascii=False, indent=2)
with open('src/data/prophet_monthly_forecast.json', 'w', encoding='utf-8') as f:
    json.dump(monthly_result, f, ensure_ascii=False, indent=2)

print('Prophetによる年平均・月平均気温の100年予測を出力しました') 