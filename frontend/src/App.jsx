import { useState } from 'react';
import axios from 'axios';
import { PredictorForm, ResultCard } from './components/predictor';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use absolute URL to ensure correct endpoint
  const API_URL = 'https://uko-single-predictor.onrender.com/api/predict';

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending request to:', API_URL);
      
      const response = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      // Validate response structure
      if (!response.data || typeof response.data.percentage !== 'number') {
        throw new Error('Invalid server response format');
      }

      setResult({
        percentage: response.data.percentage,
        status: response.data.status || `You are ${response.data.percentage}% single`,
        message: response.data.message || "No message provided",
        zodiac: response.data.zodiac || "Unknown",
        tribe: response.data.tribe || "Unknown"
      });

    } catch (err) {
      let errorMessage = 'Request failed';
      
      if (err.response) {
        // Server responded with error status
        errorMessage = err.response.data?.error || 
                      err.response.data?.message || 
                      `Server error (${err.response.status})`;
      } else if (err.request) {
        // No response received
        errorMessage = 'No response from server - check your connection';
      } else {
        // Request setup error
        errorMessage = err.message || 'Request configuration error';
      }

      setError(errorMessage);
      console.error('API Error:', {
        error: err,
        config: err.config,
        response: err.response
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-pink-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <h1 className="text-3xl font-bold text-center text-pink-600 mb-6">
          Uko Single? Predictor
        </h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}
        
        {!result ? (
          <PredictorForm onSubmit={handleSubmit} loading={loading} />
        ) : (
          <ResultCard result={result} onReset={handleReset} />
        )}
      </div>
    </div>
  );
}

export default App;
