from flask import Blueprint, request, jsonify
from engine.slot_machine import load_json, load_paylines, generate_grid, check_win_on_line
import time
from collections import Counter

auto_spin_api = Blueprint('auto_spin_api', __name__)

symbols_data = load_json('symbols.json')
paytable_data = load_json('paytable.json')
paylines = load_paylines('paylines.json')

@auto_spin_api.route('/auto_spin', methods=['POST'])
def auto_spin():
    data = request.json
    count = data.get('count', 1000)
    bet = data.get('bet', 10)
    active_lines = data.get('active_lines', [0, 1, 2, 3, 4])

    if bet not in [10, 50, 100]:
        return jsonify({'error': 'Invalid bet amount'}), 400

    if count <= 0 or count > 10000:
        return jsonify({'error': 'Count must be between 1 and 10000'}), 400

    if not active_lines:
        return jsonify({'error': 'No active lines selected'}), 400

    for line_idx in active_lines:
        if line_idx < 0 or line_idx >= len(paylines):
            return jsonify({'error': f'Invalid line index: {line_idx}'}), 400

    start_time = time.time()
    bet_per_spin = bet * len(active_lines)
    total_bet = bet_per_spin * count
    total_win = 0
    win_count = 0
    win_patterns = []
    win_by_lines = {i: 0 for i in active_lines}
    win_by_symbols = {}

    for _ in range(count):
        grid = generate_grid(symbols_data['symbols'])
        spin_wins = []
        for line_index in active_lines:
            payline = paylines[line_index]
            symbols_on_line = [grid[row][col] for row, col in payline["positions"]]
            win_amount, matched_pattern = check_win_on_line(symbols_on_line, bet, paytable_data['payouts'])
            if win_amount > 0:
                spin_wins.append({
                    "line_index": line_index,
                    "pattern": matched_pattern,
                    "amount": win_amount
                })
                win_by_lines[line_index] += 1
                pattern_key = "".join(matched_pattern) if matched_pattern else ""
                if pattern_key not in win_by_symbols:
                    win_by_symbols[pattern_key] = {
                        "pattern": matched_pattern,
                        "count": 0,
                        "total_win": 0
                    }
                win_by_symbols[pattern_key]["count"] += 1
                win_by_symbols[pattern_key]["total_win"] += win_amount
                win_patterns.append(pattern_key)
        spin_win = sum(win["amount"] for win in spin_wins)
        total_win += spin_win
        if spin_win > 0:
            win_count += 1

    rtp = (total_win / total_bet) * 100 if total_bet > 0 else 0
    pattern_counter = Counter(win_patterns)
    top_patterns = pattern_counter.most_common(5)
    duration = time.time() - start_time

    result = {
        'spins': count,
        'bet': bet,
        'active_lines': active_lines,
        'lines_count': len(active_lines),
        'bet_per_spin': bet_per_spin,
        'total_bet': total_bet,
        'total_win': total_win,
        'win_count': win_count,
        'win_rate': (win_count / count) * 100 if count > 0 else 0,
        'rtp': rtp,
        'duration_seconds': duration,
        'win_by_lines': [
            {
                'line_index': line_idx,
                'line_name': paylines[line_idx]["name"],
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