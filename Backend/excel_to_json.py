# convert_excel_to_json.py

import pandas as pd
import json
import os

# --- НАСТРОЙКИ
# 1. Путь к Excel файлу
excel_file_path = 'Backend/Data/TOPS.xlsx'
# 2. Имя для выходного JSON файла
json_file_path = 'Backend/Data/TOPSBooks.json'
# ------------------------------------------------

# Чтение Excel-файла (указать путь и имя листа при необходимости)
df = pd.read_excel(excel_file_path, sheet_name=1)  # 0 — первый лист

# Сохранение в JSON с русскими символами
with open(json_file_path, 'w', encoding='utf-8') as f:
    df.to_json(f, orient='records', force_ascii=False, indent=4, date_format='iso')