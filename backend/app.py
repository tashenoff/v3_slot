import json
import random
import time
from collections import Counter
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Расширяем настройки CORS для более подробной конфигурации
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["POST", "GET", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Загружаем данные из JSON файлов
def load_json(filename):
    with open(filename, 'r') as f:
        return json.load(f)

# Загружаем символы и таблицу выплат
symbols_data = load_json('symbols.json')
paytable_data = load_json('paytable.json')

# Определение линий выплат
PAYLINES = [
    # Горизонтальные линии
    {"name": "Верхняя горизонталь", "positions": [(0, 0), (0, 1), (0, 2), (0, 3), (0, 4)]},
    {"name": "Средняя горизонталь", "positions": [(1, 0), (1, 1), (1, 2), (1, 3), (1, 4)]},
    {"name": "Нижняя горизонталь", "positions": [(2, 0), (2, 1), (2, 2), (2, 3), (2, 4)]},
    # Диагональные линии
    {"name": "Диагональ ↘", "positions": [(0, 0), (1, 1), (1, 2), (1, 3), (2, 4)]},
    {"name": "Диагональ ↗", "positions": [(2, 0), (1, 1), (1, 2), (1, 3), (0, 4)]}
]

@app.route('/spin', methods=['POST'])
def spin():
    data = request.json
    bet = data.get('bet', 10)  # По умолчанию ставка 10
    
    if bet not in [10, 50, 100]:
        return jsonify({'error': 'Invalid bet amount'}), 400
    
    # Создаем игровое поле 3x5 (3 строки, 5 колонок)
    grid = generate_grid()
    
    # Проверяем выигрыши по всем линиям
    wins = check_all_wins(grid, bet)
    
    # Суммируем выигрыши со всех линий
    total_win = sum(win["amount"] for win in wins)
    
    return jsonify({
        'grid': grid,
        'wins': wins,
        'total_win': total_win
    })

@app.route('/auto_spin', methods=['POST'])
def auto_spin():
    """Выполняет серию автоматических спинов и собирает статистику"""
    data = request.json
    count = data.get('count', 1000)  # По умолчанию 1000 спинов
    bet = data.get('bet', 10)  # По умолчанию ставка 10
    
    if bet not in [10, 50, 100]:
        return jsonify({'error': 'Invalid bet amount'}), 400
    
    if count <= 0 or count > 10000:  # Ограничиваем макс. количество автоспинов
        return jsonify({'error': 'Count must be between 1 and 10000'}), 400
    
    start_time = time.time()
    
    # Статистика
    total_bet = bet * count
    total_win = 0
    win_count = 0
    win_patterns = []
    win_by_lines = {i: 0 for i in range(len(PAYLINES))}
    win_by_symbols = {}
    
    # Выполняем указанное количество спинов
    for _ in range(count):
        grid = generate_grid()
        wins = check_all_wins(grid, bet)
        
        spin_win = sum(win["amount"] for win in wins)
        total_win += spin_win
        
        if spin_win > 0:
            win_count += 1
            
            for win in wins:
                line_index = win["line_index"]
                win_by_lines[line_index] += 1
                
                pattern_key = "".join(win["pattern"])
                if pattern_key not in win_by_symbols:
                    win_by_symbols[pattern_key] = {
                        "pattern": win["pattern"],
                        "count": 0,
                        "total_win": 0
                    }
                
                win_by_symbols[pattern_key]["count"] += 1
                win_by_symbols[pattern_key]["total_win"] += win["amount"]
                win_patterns.append(pattern_key)
    
    # Расчет RTP
    rtp = (total_win / total_bet) * 100 if total_bet > 0 else 0
    
    # Самые популярные шаблоны
    pattern_counter = Counter(win_patterns)
    top_patterns = pattern_counter.most_common(5)
    
    # Формируем результат
    duration = time.time() - start_time
    
    result = {
        'spins': count,
        'bet': bet,
        'total_bet': total_bet,
        'total_win': total_win,
        'win_count': win_count,
        'win_rate': (win_count / count) * 100 if count > 0 else 0,
        'rtp': rtp,
        'duration_seconds': duration,
        'win_by_lines': [
            {
                'line_index': line_idx,
                'line_name': PAYLINES[line_idx]["name"],
                'wins': win_count
            } 
            for line_idx, win_count in win_by_lines.items()
        ],
        'top_patterns': [
            {
                'pattern': pattern,
                'count': count,
                'percentage': (count / len(win_patterns)) * 100 if win_patterns else 0
            }
            for pattern, count in top_patterns
        ],
        'top_wins_by_symbol': sorted(
            [value for value in win_by_symbols.values()],
            key=lambda x: x["total_win"],
            reverse=True
        )[:5]
    }
    
    return jsonify(result)

def generate_grid():
    """Генерирует случайную сетку символов 3x5"""
    symbols = symbols_data['symbols']
    total_weight = sum(s['weight'] for s in symbols)
    
    grid = []
    for row in range(3):
        grid_row = []
        for col in range(5):
            # Выбираем символ случайно с учетом весов
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

def check_all_wins(grid, bet):
    """Проверяет выигрыши по всем линиям выплат"""
    wins = []
    
    for line_index, payline in enumerate(PAYLINES):
        symbols_on_line = [grid[row][col] for row, col in payline["positions"]]
        win_amount, matched_pattern = check_win_on_line(symbols_on_line, bet)
        
        if win_amount > 0:
            wins.append({
                "line_index": line_index,
                "line_name": payline["name"],
                "pattern": matched_pattern,
                "amount": win_amount,
                "positions": payline["positions"]
            })
    
    return wins

def check_win_on_line(symbols_on_line, bet):
    """Проверяет выигрыш по заданной линии с учетом шаблонов и джокеров"""
    for payout_info in paytable_data['payouts']:
        pattern = payout_info['pattern']
        
        # Проверяем, соответствуют ли символы шаблону (с учетом символа джокера "*")
        if match_pattern(symbols_on_line, pattern):
            # Вычисляем выигрыш пропорционально ставке
            base_payout = payout_info['payout']
            win_amount = base_payout * bet / 10  # Нормализация к ставке 10
            return win_amount, pattern
    
    return 0, None

def match_pattern(symbols, pattern):
    """Проверяет, соответствуют ли символы шаблону с учетом символа джокера "*" """
    if len(symbols) != len(pattern):
        return False
    
    for i in range(len(symbols)):
        if pattern[i] != "*" and symbols[i] != pattern[i]:
            return False
    
    return True

# Добавим тестовый маршрут для проверки соединения
@app.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "ok", "message": "API работает корректно"})

# Получение информации о линиях выплат
@app.route('/paylines', methods=['GET'])
def get_paylines():
    return jsonify({
        "paylines": PAYLINES,
        "count": len(PAYLINES)
    })

# Получение таблицы выплат
@app.route('/paytable', methods=['GET'])
def get_paytable():
    return jsonify(paytable_data)

if __name__ == '__main__':
    # Указываем адрес и порт явно
    app.run(debug=True, host='127.0.0.1', port=5000) 