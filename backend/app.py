from flask import Flask
from flask_cors import CORS
from api import spin_api, auto_spin_api, paytable_api, paylines_api, test_api

app = Flask(__name__)
CORS(app, resources={
    r"/*": {
        "origins": ["http://localhost:3000"],
        "methods": ["POST", "GET", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

app.register_blueprint(spin_api)
app.register_blueprint(auto_spin_api)
app.register_blueprint(paytable_api)
app.register_blueprint(paylines_api)
app.register_blueprint(test_api)

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000) 