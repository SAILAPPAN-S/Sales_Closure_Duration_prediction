import { useState } from 'react'
import './App.css'

const API_BASE_URL = 'http://localhost:5000'

function App() {
  const [formData, setFormData] = useState({
    first_contact_date: '',
    proposal_date: '',
    follow_up_count: '',
    deal_size: ''
  })
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setPrediction(null)

    // Validate inputs
    if (!formData.first_contact_date || !formData.proposal_date || !formData.follow_up_count || !formData.deal_size) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    // Validate date logic
    if (new Date(formData.proposal_date) < new Date(formData.first_contact_date)) {
      setError('Proposal date must be after first contact date')
      setLoading(false)
      return
    }

    try {
      const payload = {
        first_contact_date: formData.first_contact_date,
        proposal_date: formData.proposal_date,
        follow_up_count: parseInt(formData.follow_up_count),
        deal_size: parseFloat(formData.deal_size)
      }

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get prediction')
      }

      const data = await response.json()
      setPrediction(data)
    } catch (err) {
      setError(err.message || 'Error connecting to API. Make sure the Flask server is running on http://localhost:5000')
      console.error('API error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setFormData({
      first_contact_date: '',
      proposal_date: '',
      follow_up_count: '',
      deal_size: ''
    })
    setPrediction(null)
    setError(null)
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return '--'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="app-container">
      <div className="header">
        <h1>Sales Closure Duration Predictor</h1>
        <p className="subtitle">Predict deal closure timeline from CRM data</p>
      </div>

      <div className="main-content">
        <form className="prediction-form" onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="first_contact_date">First Contact Date</label>
              <input
                type="date"
                id="first_contact_date"
                name="first_contact_date"
                value={formData.first_contact_date}
                onChange={handleInputChange}
              />
              <small>Date of initial customer contact</small>
            </div>

            <div className="form-group">
              <label htmlFor="proposal_date">Proposal Date</label>
              <input
                type="date"
                id="proposal_date"
                name="proposal_date"
                value={formData.proposal_date}
                onChange={handleInputChange}
              />
              <small>Date proposal was sent</small>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="follow_up_count">Follow-up Count</label>
              <input
                type="number"
                id="follow_up_count"
                name="follow_up_count"
                placeholder="e.g., 3"
                value={formData.follow_up_count}
                onChange={handleInputChange}
                min="0"
                step="1"
              />
              <small>Total number of follow-ups</small>
            </div>

            <div className="form-group">
              <label htmlFor="deal_size">Deal Size ($)</label>
              <input
                type="number"
                id="deal_size"
                name="deal_size"
                placeholder="e.g., 50000"
                value={formData.deal_size}
                onChange={handleInputChange}
                min="0"
                step="0.01"
              />
              <small>Deal value in dollars</small>
            </div>
          </div>

          <div className="button-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Predicting...' : 'Get Prediction'}
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleReset}>
              Clear
            </button>
          </div>
        </form>

        {error && (
          <div className="alert alert-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        {prediction && (
          <div className="results-card">
            <h2>Prediction Results</h2>
            
            <div className="results-grid">
              <div className="result-box">
                <div className="result-box-label">Predicted Duration</div>
                <div className="result-box-value">{prediction.predicted_closure_days}</div>
                <div className="result-box-unit">days</div>
              </div>

              <div className="result-box">
                <div className="result-box-label">Expected Closure</div>
                <div className="result-box-value">{formatDate(prediction.expected_closure_date)}</div>
              </div>

              <div className="result-box">
                <div className="result-box-label">Proposal Delay</div>
                <div className="result-box-value">{prediction.proposal_delay_days}</div>
                <div className="result-box-unit">days</div>
              </div>

              <div className="result-box">
                <div className="result-box-label">Follow-up Frequency</div>
                <div className="result-box-value">{prediction.follow_up_frequency}</div>
                <div className="result-box-unit">per day</div>
              </div>
            </div>

            <div className="category-box">
              <span className="category-label">Closure Category:</span>
              <span className={`category-badge ${prediction.category.toLowerCase().replace(/\s+/g, '-')}`}>
                {prediction.category}
              </span>
            </div>

            <div className="input-summary">
              <h3>Deal Summary</h3>
              <div className="summary-row">
                <span className="summary-label">First Contact:</span>
                <span className="summary-value">{formatDate(formData.first_contact_date)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Proposal Sent:</span>
                <span className="summary-value">{formatDate(formData.proposal_date)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Follow-ups:</span>
                <span className="summary-value">{prediction.follow_up_count}</span>
              </div>
              <div className="summary-row">
                <span className="summary-label">Deal Size:</span>
                <span className="summary-value">${prediction.deal_size.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
