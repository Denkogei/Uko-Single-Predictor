import { useState } from 'react';
import axios from 'axios';
import { PredictorForm, ResultCard } from './components/predictor';

// Configure axios defaults
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Define API base URL
  const API_BASE_URL = import.meta.env.VITE_API_URL || 
    (import.meta.env.MODE === 'development' ? '/api' : 'https://uko-single-predictor.onrender.com/api');

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Making request to:', `${API_BASE_URL}/predict`); // Debug log
      
      const response = await axios.post(
        `${API_BASE_URL}/predict`,
        formData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: false
        }
      );

      if (!response.data || typeof response.data.percentage === 'undefined') {
        throw new Error('Invalid server response format');
      }

      setResult({
        percentage: response.data.percentage,
        status: response.data.status || `You are ${response.data.percentage}% single`,
        message: response.data.message || "No additional message provided",
        zodiac: response.data.zodiac,
        tribe: response.data.tribe || "Unknown"
      });

    } catch (err) {
      let errorMessage = 'Failed to process your request';
      
      // Enhanced error handling
      if (err.response) {
        // Server responded with error status
        if (err.response.status === 0) {
          errorMessage = 'CORS Error: Request blocked. Please try again later.';
        } else if (err.response.status === 404) {
          errorMessage = 'API endpoint not found';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server is currently unavailable';
        } else {
          errorMessage = err.response.data?.error || 
                        err.response.data?.message || 
                        `Server error (${err.response.status})`;
        }
      } else if (err.request) {
        // No response received
        if (err.code === 'ECONNABORTED') {
          errorMessage = 'Request timeout - server took too long to respond';
        } else if (err.code === 'ERR_NETWORK') {
          errorMessage = 'Network error - please check your connection';
        } else {
          errorMessage = 'No response received from server';
        }
      } else {
        // Setup error
        errorMessage = err.message || 'Request configuration error';
      }

      setError(errorMessage);
      console.error('API Error Details:', {
        error: err,
        config: err.config,
        response: err.response,
        request: err.request
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
            {error.includes('CORS') && (
              <div className="mt-2 text-sm">
                <p>If this persists, try:</p>
                <ul className="list-disc pl-5">
                  <li>Refreshing the page</li>
                  <li>Clearing browser cache</li>
                  <li>Trying a different browser</li>
                </ul>
              </div>
            )}
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
