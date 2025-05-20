from flask import Blueprint, jsonify
from engine.slot_machine import load_json

paytable_api = Blueprint('paytable_api', __name__)

paytable_data = load_json('paytable.json')

@paytable_api.route('/paytable', methods=['GET'])
def get_paytable():
    return jsonify(paytable_data) 