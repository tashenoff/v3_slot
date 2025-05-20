from flask import Blueprint, jsonify

test_api = Blueprint('test_api', __name__)
 
@test_api.route('/test', methods=['GET'])
def test():
    return jsonify({"status": "ok", "message": "API работает корректно"}) 