import json
import random
from typing import List, Dict, Any, Tuple, Optional

# Загрузка данных из JSON

def load_json(filename: str) -> dict:
    with open(filename, 'r', encoding='utf-8') as f:
        return json.load(f)

def load_paylines(path: str) -> List[Dict[str, Any]]:
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)

# Генерация сетки символов

def generate_grid(symbols: List[Dict[str, Any]], rows: int = 3, cols: int = 5) -> List[List[str]]:
    total_weight = sum(s['weight'] for s in symbols)
    grid = []
    for row in range(rows):
        grid_row = []
        for col in range(cols):
            rand = random.uniform(0, total_weight)
            current_weight = 0
            selected_symbol = None
            for s in symbols:
                current_weight += s['weight']
                if rand <= current_weight:
                    selected_symbol = s['symbol']
                    break
            grid_row.append(selected_symbol)
        grid.append(grid_row)
    return grid

# Проверка совпадения шаблона (с учетом джокера)
def match_pattern(symbols: List[str], pattern: List[str]) -> bool:
    if len(symbols) != len(pattern):
        return False
    for i in range(len(symbols)):
        if pattern[i] != "*" and symbols[i] != pattern[i]:
            return False
    return True

# Проверка выигрыша по линии
def check_win_on_line(symbols_on_line: List[str], bet: int, paytable: List[Dict[str, Any]]) -> Tuple[float, Optional[List[str]]]:
    for payout_info in paytable:
        pattern = payout_info['pattern']
        if match_pattern(symbols_on_line, pattern):
            base_payout = payout_info['payout']
            win_amount = base_payout * bet / 10
            return win_amount, pattern
    return 0, None

# Проверка выигрышей по всем линиям
def check_all_wins(grid: List[List[str]], bet: int, paytable: List[Dict[str, Any]], paylines: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    wins = []
    for line_index, payline in enumerate(paylines):
        symbols_on_line = [grid[row][col] for row, col in payline["positions"]]
        win_amount, matched_pattern = check_win_on_line(symbols_on_line, bet, paytable)
        if win_amount > 0:
            wins.append({
                "line_index": line_index,
                "line_name": payline["name"],
                "pattern": matched_pattern,
                "amount": win_amount,
                "positions": payline["positions"]
            })
    return wins 