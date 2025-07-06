import json
from datetime import datetime, timedelta
from collections import defaultdict, Counter

# JSONファイルを読み込み
with open('tokyo_temperature_data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# 日付をdatetime型に変換
for item in data:
    item['datetime'] = datetime.strptime(item['date'], '%Y/%m/%d')

print("=== 東京気温データ分析レポート ===")
dates = [item['datetime'] for item in data]
print(f"データ期間: {min(dates)} から {max(dates)}")
print(f"総データ数: {len(data)}件")
print()

# 1. 年の範囲確認
print("1. 年の範囲分析")
years = sorted(list(set(item['year'] for item in data)))
print(f"データ年範囲: {min(years)} - {max(years)}")
print(f"含まれる年数: {len(years)}年")

# 1936年から2024年までの期待される年と実際の年を比較
expected_years = set(range(1936, 2025))
actual_years = set(years)
missing_years = expected_years - actual_years
extra_years = actual_years - expected_years

print(f"期待される年範囲: 1936-2024 ({len(expected_years)}年)")
print(f"欠損年: {sorted(missing_years) if missing_years else 'なし'}")
print(f"追加年: {sorted(extra_years) if extra_years else 'なし'}")
print()

# 2. 各年のデータ数確認
print("2. 年別データ数分析")
year_counts = Counter(item['year'] for item in data)
print("年別データ数:")

incomplete_years = []
for year in sorted(year_counts.keys()):
    count = year_counts[year]
    # うるう年の判定
    is_leap = (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)
    expected_days = 366 if is_leap else 365
    
    if count < expected_days:
        incomplete_years.append((year, count, expected_days))
    
    # 最初の10年と最後の10年、および不完全な年を表示
    if year <= 1945 or year >= 2015 or count < expected_days:
        print(f"  {year}: {count}日 (期待値: {expected_days}日) {'⚠️' if count < expected_days else '✓'}")

print(f"\n不完全な年の数: {len(incomplete_years)}")
if incomplete_years:
    print("不完全な年の詳細:")
    for year, count, expected in incomplete_years:
        missing_days = expected - count
        print(f"  {year}: {count}/{expected}日 ({missing_days}日不足)")
print()

# 3. 日付の連続性確認
print("3. 日付の連続性分析")
sorted_data = sorted(data, key=lambda x: x['datetime'])
dates = [item['datetime'] for item in sorted_data]

# 欠損日を検出
missing_dates = []
for i in range(len(dates) - 1):
    current_date = dates[i]
    next_date = dates[i + 1]
    expected_next = current_date + timedelta(days=1)
    
    if next_date != expected_next:
        # 欠損期間を計算
        missing_start = expected_next
        missing_end = next_date - timedelta(days=1)
        missing_dates.append((missing_start, missing_end))

print(f"欠損期間の数: {len(missing_dates)}")
if missing_dates:
    print("欠損期間の詳細:")
    for start, end in missing_dates[:10]:  # 最初の10件を表示
        days = (end - start).days + 1
        print(f"  {start.strftime('%Y/%m/%d')} - {end.strftime('%Y/%m/%d')} ({days}日)")
    if len(missing_dates) > 10:
        print(f"  ... および他{len(missing_dates) - 10}件")
print()

# 4. 温度データの欠損確認
print("4. 温度データの欠損確認")
null_max_temp = sum(1 for item in data if item['max_temp'] is None)
null_min_temp = sum(1 for item in data if item['min_temp'] is None)
print(f"最高気温の欠損数: {null_max_temp}")
print(f"最低気温の欠損数: {null_min_temp}")

# 異常値の確認
valid_max_temps = [item['max_temp'] for item in data if item['max_temp'] is not None]
valid_min_temps = [item['min_temp'] for item in data if item['min_temp'] is not None]

print("\n異常値の確認:")
print(f"最高気温の範囲: {min(valid_max_temps):.1f}°C - {max(valid_max_temps):.1f}°C")
print(f"最低気温の範囲: {min(valid_min_temps):.1f}°C - {max(valid_min_temps):.1f}°C")

# 最高気温が最低気温より低い異常なデータ
invalid_temp = []
for item in data:
    if (item['max_temp'] is not None and item['min_temp'] is not None and 
        item['max_temp'] < item['min_temp']):
        invalid_temp.append(item)

print(f"最高気温 < 最低気温の異常データ: {len(invalid_temp)}件")
if len(invalid_temp) > 0:
    print("異常データの例:")
    for item in invalid_temp[:5]:
        print(f"  {item['date']}: 最高{item['max_temp']}°C, 最低{item['min_temp']}°C")
print()

# 5. 月別データ分布
print("5. 月別データ分布")
month_counts = Counter(item['month'] for item in data)
print("月別データ数:")
for month in range(1, 13):
    count = month_counts.get(month, 0)
    print(f"  {month:2d}月: {count:5d}件")
print()

# 6. 年次集計の実行とテスト
print("6. 年次集計テスト")

def aggregateAnnualData(data_list):
    """年次集計関数のテスト"""
    annual_data = defaultdict(lambda: {'total_max': 0, 'total_min': 0, 'count': 0})
    
    for item in data_list:
        if item.get('max_temp') is not None and item.get('min_temp') is not None:
            year = item['year']
            annual_data[year]['total_max'] += item['max_temp']
            annual_data[year]['total_min'] += item['min_temp']
            annual_data[year]['count'] += 1
    
    # 平均を計算
    result = {}
    for year, values in annual_data.items():
        if values['count'] > 0:
            result[year] = {
                'year': year,
                'avg_max_temp': values['total_max'] / values['count'],
                'avg_min_temp': values['total_min'] / values['count'],
                'data_count': values['count']
            }
    
    return result

# 年次集計を実行
annual_result = aggregateAnnualData(data)
print(f"年次集計結果の年数: {len(annual_result)}")

# 年次集計で欠損している年を確認
aggregated_years = set(annual_result.keys())
original_years = set(years)
missing_in_aggregation = original_years - aggregated_years

print(f"元データの年数: {len(original_years)}")
print(f"集計結果の年数: {len(aggregated_years)}")
print(f"集計で欠損した年: {sorted(missing_in_aggregation) if missing_in_aggregation else 'なし'}")

# 各年の集計データ数を確認
print("\n年次集計データ数の確認（データ数が少ない年）:")
for year in sorted(annual_result.keys()):
    count = annual_result[year]['data_count']
    if count < 300:  # 300日未満の年を表示
        print(f"  {year}: {count}日")

print()

# 7. グラフの空白原因の特定
print("7. グラフの空白原因分析")
print("グラフで線が途切れる原因:")
print("- 日付データの欠損")
print("- 温度データの欠損（null値）")
print("- 年次集計時のデータ不足")

# 年次データの連続性確認
annual_years = sorted(annual_result.keys())
print(f"\n年次データの連続性:")
print(f"最初の年: {annual_years[0]}")
print(f"最後の年: {annual_years[-1]}")

# 連続していない年を検出
missing_years_in_series = []
for i in range(len(annual_years) - 1):
    current_year = annual_years[i]
    next_year = annual_years[i + 1]
    if next_year != current_year + 1:
        for missing_year in range(current_year + 1, next_year):
            missing_years_in_series.append(missing_year)

print(f"年次データで欠損している年: {missing_years_in_series if missing_years_in_series else 'なし'}")
print()

# 8. 対処方法の提案
print("8. 対処方法の提案")
print("=" * 50)
print("【欠損データの対処方法】")
print("1. 日付欠損の対処:")
print("   - 気象庁の公式データで補完")
print("   - 線形補間または移動平均による推定")
print("   - 欠損期間をグラフで明示")
print()
print("2. 温度データ欠損の対処:")
print("   - 前後の日付の平均値で補完")
print("   - 同じ時期の過去データの平均値を使用")
print("   - 欠損値を除外して年次集計")
print()
print("3. 年次集計の改善:")
print("   - 最小データ数の閾値を設定（例：300日以上）")
print("   - 不完全な年を除外またはフラグ付け")
print("   - 補間方法を明示")
print()
print("4. グラフ表示の改善:")
print("   - 欠損部分を破線で表示")
print("   - データ品質の注釈を追加")
print("   - 信頼区間の表示")

# 最終統計サマリー
print("\n" + "=" * 50)
print("【分析サマリー】")
print(f"• 総データ期間: {min(dates).strftime('%Y/%m/%d')} - {max(dates).strftime('%Y/%m/%d')}")
print(f"• 総データ数: {len(data):,}件")
print(f"• 年数: {len(years)}年")
print(f"• 不完全な年: {len(incomplete_years)}年")
print(f"• 欠損期間: {len(missing_dates)}箇所")
print(f"• 温度データ欠損: 最高{null_max_temp}件、最低{null_min_temp}件")
print(f"• 年次集計可能年数: {len(annual_result)}年")