# Sales Closure Prediction

A full-stack machine learning application that predicts the probability of sales deal closure based on CRM data. The system uses a trained ML model to analyze proposal delays, follow-up patterns, and deal sizes to provide actionable insights for sales teams.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)

## ✨ Features

- **Real-time Predictions**: Get instant sales closure probability predictions
- **Automatic Feature Engineering**: Calculates proposal delays automatically from dates
- **Interactive Web Interface**: User-friendly React frontend for easy data input
- **RESTful API**: Flask-based backend with CORS support
- **ML-Powered**: Uses scikit-learn trained models for accurate predictions
- **Data Validation**: Built-in validation for input parameters

## 🛠 Tech Stack

### Backend
- **Python 3.x**
- **Flask 3.0.0** - Web framework
- **Flask-CORS 4.0.0** - Cross-origin resource sharing
- **scikit-learn 1.5.1** - Machine learning
- **pandas 2.2.2** - Data manipulation
- **numpy 1.26.4** - Numerical computing
- **joblib 1.4.2** - Model serialization

### Frontend
- **React 19.2.0** - UI framework
- **Vite 7.3.1** - Build tool and dev server
- **ESLint** - Code linting

## 📁 Project Structure

```
Sales_Closure_Prediction/
├── backend/
│   ├── app.py                          # Flask API server
│   ├── dataset.py                      # Dataset generation and processing
│   ├── model.ipynb                     # Model training notebook
│   ├── requirements.txt                # Python dependencies
│   ├── sales_closure_model.pkl         # Trained ML model
│   ├── sales_scaler.pkl                # Feature scaler
│   ├── sales_closure_dataset.csv       # Training dataset
│   └── sales_closure_synthetic.csv     # Synthetic data
├── frontend/
│   ├── src/
│   │   ├── App.jsx                     # Main React component
│   │   ├── main.jsx                    # Entry point
│   │   └── assets/                     # Static assets
│   ├── public/                         # Public assets
│   ├── package.json                    # Node.js dependencies
│   ├── vite.config.js                  # Vite configuration
│   └── index.html                      # HTML template
├── README.md                           # This file
└── .gitignore                          # Git ignore rules
```

## 📦 Prerequisites

- **Python** 3.8 or higher
- **Node.js** 16.x or higher
- **npm** or **yarn**
- **pip** (Python package manager)

## 🚀 Installation

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment (recommended):
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Ensure model files exist:
   - `sales_closure_model.pkl`
   - `sales_scaler.pkl`
   
   If not present, run the `model.ipynb` notebook to train the model.

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install Node.js dependencies:
```bash
npm install
```

## 🎯 Usage

### Running the Backend

1. Navigate to the backend directory:
```bash
cd backend
```

2. Start the Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Running the Frontend

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Building for Production

Frontend:
```bash
cd frontend
npm run build
```

The build output will be in the `frontend/dist` directory.

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Health Check
```http
GET /
```

**Response:**
```json
{
  "message": "Sales Closure Prediction API is running",
  "endpoints": ["/api/predict_raw"]
}
```

#### Predict Sales Closure

```http
POST /api/predict_raw
```

**Request Body:**
```json
{
  "first_contact_date": "2024-01-01",
  "proposal_date": "2024-01-15",
  "follow_up_count": 5,
  "deal_size": 50000
}
```

**Response:**
```json
{
  "closure_probability": 0.85,
  "confidence": "high",
  "features_used": {
    "proposal_delay_days": 14,
    "follow_up_count": 5,
    "deal_size": 50000,
    "follow_up_frequency": 2.8
  },
  "recommendation": "Strong likelihood of closure"
}
```

**Error Response:**
```json
{
  "error": "Error message description"
}
```