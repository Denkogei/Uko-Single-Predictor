from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import random
import json
import os

app = Flask(__name__)

# Enable CORS with specific configuration
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://ukosinglepredictor.netlify.app"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": False,
        "max_age": 600
    }
})

# Load messages from JSON file
def load_messages():
    try:
        file_path = os.path.join('data', 'funny_quotes.json')
        with open(file_path) as f:
            return json.load(f)
    except Exception as e:
        print(f"Error loading messages: {str(e)}")
        return {"default": ["Error loading messages"]}

MESSAGES = load_messages()

# Get available tribes
def get_tribe_list():
    zodiac_signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 
                   'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
    return [tribe for tribe in MESSAGES.keys() 
            if tribe != 'default' and tribe not in zodiac_signs]

TRIBES = get_tribe_list()

# Zodiac calculation
ZODIAC_SIGNS = {
    (1, 20): "Capricorn", (2, 18): "Aquarius", (3, 20): "Pisces",
    (4, 19): "Aries", (5, 20): "Taurus", (6, 21): "Gemini",
    (7, 22): "Cancer", (8, 22): "Leo", (9, 22): "Virgo",
    (10, 23): "Libra", (11, 22): "Scorpio", (12, 21): "Sagittarius",
    (12, 31): "Capricorn"
}

def get_zodiac(dob):
    try:
        date_obj = datetime.strptime(dob, "%Y-%m-%d")
        month_day = (date_obj.month, date_obj.day)
        for (month, day), sign in ZODIAC_SIGNS.items():
            if (month_day[0] == month and month_day[1] <= day) or (month_day[0] == month - 1 and month_day[1] >= day):
                return sign
        return "Unknown"
    except ValueError:
        return "Invalid Date"

@app.route('/api/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'ready'})
        response.headers.add('Access-Control-Allow-Origin', 'https://ukosinglepredictor.netlify.app')
        response.headers.add('Access-Control-Allow-Methods', 'POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response

    try:
        data = request.get_json()
        if not data:
            return jsonify({"success": False, "error": "No JSON data received"}), 400
            
        required = ['name', 'dob', 'tribe']
        if not all(field in data for field in required):
            return jsonify({
                "success": False,
                "error": f"Missing required fields: {required}"
            }), 400
            
        if data['tribe'] not in TRIBES:
            return jsonify({
                "success": False,
                "error": "Invalid tribe selection",
                "valid_tribes": TRIBES
            }), 400
            
        # Generate result
        percentage = random.randint(40, 99)
        zodiac = get_zodiac(data['dob'])
        tribe_msgs = MESSAGES.get(data['tribe'], [])
        zodiac_msgs = MESSAGES.get(zodiac, [])
        message = random.choice(tribe_msgs + zodiac_msgs or MESSAGES['default'])
        
        result = {
            "percentage": percentage,
            "status": f"Uko {percentage}% single",
            "message": message,
            "zodiac": zodiac,
            "tribe": data['tribe']
        }

        response = jsonify({"success": True, **result})
        response.headers.add('Access-Control-Allow-Origin', 'https://ukosinglepredictor.netlify.app')
        return response
        
    except Exception as e:
        error_response = jsonify({
            "success": False,
            "error": str(e)
        })
        error_response.headers.add('Access-Control-Allow-Origin', 'https://ukosinglepredictor.netlify.app')
        return error_response, 500

@app.route('/api/tribes', methods=['GET'])
def get_tribes():
    response = jsonify({
        "success": True,
        "count": len(TRIBES),
        "tribes": TRIBES
    })
    response.headers.add('Access-Control-Allow-Origin', 'https://ukosinglepredictor.netlify.app')
    return response

@app.route('/')
def health_check():
    return jsonify({
        "status": "running",
        "endpoints": {
            "tribes": "/api/tribes",
            "predict": "/api/predict"
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
