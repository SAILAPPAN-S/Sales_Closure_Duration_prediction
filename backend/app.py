from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import pandas as pd
import os

app = Flask(__name__)

# Enable CORS for frontend communication
CORS(app, resources={r"/api/*": {"origins": "*"}})
CORS(app)

# Load the pre-trained model and scaler
MODEL_PATH = 'sales_closure_model.pkl'
SCALER_PATH = 'sales_scaler.pkl'

# Check if model files exist
if not os.path.exists(MODEL_PATH) or not os.path.exists(SCALER_PATH):
    raise FileNotFoundError("Model or scaler files not found. Please ensure sales_closure_model.pkl and sales_scaler.pkl exist.")

model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)

# Define the feature names as used in the model
FEATURE_NAMES = ['proposal_delay_days', 'follow_up_count', 'deal_size', 'follow_up_frequency']


def predict_closure_raw(first_contact_date, proposal_date, follow_up_count, deal_size):
    """
    Real CRM input → Auto-feature engineering → Model prediction
    
    Args:
        first_contact_date: str, date in format 'YYYY-MM-DD'
        proposal_date: str, date in format 'YYYY-MM-DD'
        follow_up_count: int, number of follow-ups
        deal_size: float, deal value in dollars
    
    Returns:
        dict with prediction results
    """
    try:
        # Step 1: Calculate proposal_delay_days AUTOMATICALLY
        first_contact = pd.to_datetime(first_contact_date)
        proposal = pd.to_datetime(proposal_date)
        proposal_delay_days = (proposal - first_contact).days
        
        # Validate proposal_delay_days is non-negative
        if proposal_delay_days < 0:
            raise ValueError("Proposal date cannot be before first contact date")
        
        # Step 2: Calculate follow_up_frequency (follow_ups / proposal_delay)
        if proposal_delay_days == 0:
            follow_up_frequency = 0
        else:
            follow_up_frequency = follow_up_count / proposal_delay_days
        
        # Step 3: Model prediction (your trained scaler + model)
        X_new = scaler.transform([[
            proposal_delay_days, 
            follow_up_count, 
            deal_size, 
            follow_up_frequency
        ]])
        
        predicted_days = model.predict(X_new)[0]
        
        # Determine category
        if predicted_days < 30:
            category = 'Fast (<30d)'
        elif predicted_days < 90:
            category = 'Medium (30-90d)'
        else:
            category = 'Slow (>90d)'
        
        # Calculate expected closure date
        expected_closure_date = first_contact + pd.Timedelta(days=round(predicted_days))
        
        return {
            'proposal_delay_days': proposal_delay_days,
            'follow_up_count': follow_up_count,
            'deal_size': deal_size,
            'follow_up_frequency': round(follow_up_frequency, 2),
            'predicted_closure_days': round(predicted_days, 2),
            'category': category,
            'expected_closure_date': expected_closure_date.strftime('%Y-%m-%d')
        }
    except Exception as e:
        raise ValueError(f"Prediction calculation failed: {str(e)}")


@app.route('/predict', methods=['POST'])
def predict():
    """
    Predict sales closure duration from raw CRM data.
    
    Expected JSON input:
    {
        "first_contact_date": "2026-03-01",
        "proposal_date": "2026-03-06",
        "follow_up_count": 3,
        "deal_size": 50000
    }
    """
    try:
        # Get JSON data from request
        data = request.get_json()
        
        # Validate that all required fields are present
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        required_fields = ['first_contact_date', 'proposal_date', 'follow_up_count', 'deal_size']
        missing_fields = [f for f in required_fields if f not in data]
        if missing_fields:
            return jsonify({'error': f'Missing required fields: {missing_fields}'}), 400
        
        # Call the prediction function
        prediction_result = predict_closure_raw(
            first_contact_date=data['first_contact_date'],
            proposal_date=data['proposal_date'],
            follow_up_count=int(data['follow_up_count']),
            deal_size=float(data['deal_size'])
        )
        
        return jsonify(prediction_result), 200
    
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': f'Prediction failed: {str(e)}'}), 500


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({
        'status': 'healthy',
        'model_loaded': True,
        'scaler_loaded': True
    }), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
