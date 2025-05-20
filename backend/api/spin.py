from flask import Blueprint, request, jsonify
from engine.slot_machine import load_json, load_paylines, generate_grid, check_win_on_line

spin_api = Blueprint('spin_api', __name__)

symbols_data = load_json('symbols.json')
paytable_data = load_json('paytable.json')
paylines = load_paylines('paylines.json')

@spin_api.route('/spin', methods=['POST'])
def spin():
    data = request.json
    bet = data.get('bet', 10)
    active_lines = data.get('active_lines', [0, 1, 2, 3, 4])

    if bet not in [10, 50, 100]:
        return jsonify({'error': 'Invalid bet amount'}), 400

    if not active_lines:
        return jsonify({'error': 'No active lines selected'}), 400

    for line_idx in active_lines:
        if line_idx < 0 or line_idx >= len(paylines):
            return jsonify({'error': f'Invalid line index: {line_idx}'}), 400

    grid = generate_grid(symbols_data['symbols'])

    wins = []
    for line_index in active_lines:
        payline = paylines[line_index]
        symbols_on_line = [grid[row][col] for row, col in payline["positions"]]
        win_amount, matched_pattern = check_win_on_line(symbols_on_line, bet, paytable_data['payouts'])
        if win_amount > 0:
            wins.append({
                "line_index": line_index,
                "line_name": payline["name"],
                "pattern": matched_pattern,
                "amount": win_amount,
                "positions": payline["positions"]
            })

    total_win = sum(win["amount"] for win in wins)
    total_bet = bet * len(active_lines)

    return jsonify({
        'grid': grid,
        'wins': wins,
        'total_win': total_win,
        'total_bet': total_bet,
        'active_lines': active_lines
    }) 