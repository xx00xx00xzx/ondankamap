#!/usr/bin/env python3
"""
data-9.csvを含めて東京の気温データを最終統合するスクリプト
1890年から2024年までの135年間の完全データセットを作成
"""
import csv
import json
import os
from datetime import datetime

def parse_csv_file(filename):
    """CSVファイルを解析してデータを抽出"""
    data = []
    
    with open(filename, 'r', encoding='utf-8') as file:
        lines = file.readlines()
        
        # データ行を探す（ヘッダー行をスキップ）
        data_start = 0
        for i, line in enumerate(lines):
            if line.strip().startswith('年月日'):
                data_start = i + 3  # ヘッダー行と空行をスキップ
                break
        
        for line_num, line in enumerate(lines[data_start:], data_start + 1):
            line = line.strip()
            if not line:
                continue
                
            parts = line.split(',')
            if len(parts) < 4:
                continue
                
            try:
                # 日付解析
                date_str = parts[0]
                if not date_str or date_str == '':
                    continue
                    
                # 気温データ解析
                max_temp_str = parts[1]
                min_temp_str = parts[3] if len(parts) > 3 else parts[3]
                
                # 均質番号がある場合は位置を調整
                if len(parts) > 5:
                    min_temp_str = parts[4]
                
                # 欠損値チェック（空文字列の場合はスキップ）
                if max_temp_str == '' or min_temp_str == '':
                    print(f"欠損値スキップ {filename}:{line_num}: {date_str}")
                    continue
                
                max_temp = float(max_temp_str)
                min_temp = float(min_temp_str)
                
                # 日付パース
                date_obj = datetime.strptime(date_str, '%Y/%m/%d')
                
                data.append({
                    'date': date_str,
                    'year': date_obj.year,
                    'month': date_obj.month,
                    'day': date_obj.day,
                    'max_temp': max_temp,
                    'min_temp': min_temp
                })
                
            except (ValueError, IndexError) as e:
                print(f"エラー {filename}:{line_num}: {line.strip()}")
                continue
    
    return data

def main():
    # 処理するファイルのリスト（古い順）
    files = [
        'data-9-utf8.csv',  # 1890-1905年（最古）
        'data-7-utf8.csv',  # 1920-1935年6月
        'data-6-utf8.csv',  # 1935年10月-1950
        'data-5-utf8.csv',  # 1950-1965
        'data-4.csv',       # 1965-1980
        'data-3.csv',       # 1980-1995
        'data-2.csv',       # 1995-2010
        'data-utf8.csv'     # 2010-2025
    ]
    
    all_data = []
    
    for filename in files:
        if os.path.exists(filename):
            print(f"処理中: {filename}")
            file_data = parse_csv_file(filename)
            all_data.extend(file_data)
            print(f"  {len(file_data)} レコード追加")
        else:
            print(f"ファイルが見つかりません: {filename}")
    
    # 日付順にソート
    all_data.sort(key=lambda x: x['date'])
    
    # 1890-2024年の範囲でフィルタリング
    filtered_data = []
    for record in all_data:
        year = record['year']
        if 1890 <= year <= 2024:
            filtered_data.append(record)
    
    # 重複除去（同じ日付のデータがある場合）
    unique_data = {}
    duplicate_count = 0
    for record in filtered_data:
        date_key = record['date']
        if date_key not in unique_data:
            unique_data[date_key] = record
        else:
            # 既存データと新データを比較（新しいファイルを優先）
            duplicate_count += 1
            unique_data[date_key] = record
    
    # 最終データを日付順にソート
    final_data = list(unique_data.values())
    final_data.sort(key=lambda x: x['date'])
    
    # JSONファイルに出力
    output_file = 'tokyo_temperature_data_1890-2024.json'
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    
    print(f"\n最終統合完了!")
    print(f"出力ファイル: {output_file}")
    print(f"総レコード数: {len(final_data)}")
    print(f"重複削除: {duplicate_count}件")
    
    if final_data:
        print(f"期間: {final_data[0]['date']} ～ {final_data[-1]['date']}")
        
        # 年ごとのデータ数を確認
        year_counts = {}
        for record in final_data:
            year = record['year']
            year_counts[year] = year_counts.get(year, 0) + 1
        
        total_years = len(year_counts)
        start_year = min(year_counts.keys())
        end_year = max(year_counts.keys())
        
        print(f"年数: {total_years}年間 ({start_year}-{end_year})")
        print(f"最初の年: {start_year}年 ({year_counts[start_year]}日)")
        print(f"最後の年: {end_year}年 ({year_counts[end_year]}日)")
        
        # データの空白期間を確認
        missing_years = []
        for year in range(start_year, end_year + 1):
            if year not in year_counts:
                missing_years.append(year)
        
        if missing_years:
            print(f"データ欠損年: {len(missing_years)}年間")
            print(f"欠損年範囲: {missing_years[0]}-{missing_years[-1]}" if len(missing_years) > 1 else f"欠損年: {missing_years[0]}")
        else:
            print("データ欠損年: なし（完全連続）")

if __name__ == "__main__":
    main()