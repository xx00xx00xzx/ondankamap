#!/usr/bin/env python3
"""
東京の気温データを1936年から2024年にフィルタリングするスクリプト
"""
import json
from datetime import datetime

def filter_temperature_data():
    # 元のJSONファイルを読み込み
    with open('src/data/tokyo_temperature_data.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 1936年から2024年のデータのみをフィルタリング
    filtered_data = []
    for record in data:
        year = record['year']
        if 1936 <= year <= 2024:
            filtered_data.append(record)
    
    # フィルタリング後のデータを新しいファイルに保存
    with open('src/data/tokyo_temperature_data_filtered.json', 'w', encoding='utf-8') as f:
        json.dump(filtered_data, f, ensure_ascii=False, indent=2)
    
    print(f"フィルタリング完了!")
    print(f"元のデータ数: {len(data)}")
    print(f"フィルタリング後: {len(filtered_data)}")
    
    if filtered_data:
        print(f"期間: {filtered_data[0]['date']} ～ {filtered_data[-1]['date']}")
        
        # 年ごとのデータ数を確認
        year_counts = {}
        for record in filtered_data:
            year = record['year']
            year_counts[year] = year_counts.get(year, 0) + 1
        
        print(f"年数: {len(year_counts)}年間")
        print(f"最初の年: {min(year_counts.keys())}年 ({year_counts[min(year_counts.keys())]}日)")
        print(f"最後の年: {max(year_counts.keys())}年 ({year_counts[max(year_counts.keys())]}日)")

if __name__ == "__main__":
    filter_temperature_data()