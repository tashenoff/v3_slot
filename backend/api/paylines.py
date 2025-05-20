from flask import Blueprint, jsonify
from engine.slot_machine import load_paylines

paylines_api = Blueprint('paylines_api', __name__)

paylines = load_paylines('paylines.json')

@paylines_api.route('/paylines', methods=['GET'])
def get_paylines():
    return jsonify({
        "paylines": paylines,
        "count": len(paylines)
    }) 