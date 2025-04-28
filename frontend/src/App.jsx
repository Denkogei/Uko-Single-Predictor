import { useState } from 'react';
import axios from 'axios';
import { PredictorForm, ResultCard } from './components/predictor';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Explicit API URL configuration
const API_BASE_URL = 'https://uko-single-predictor.onrender.com/api';

const handleSubmit = async (formData) => {
  setLoading(true);
  setError(null);
  
  try {
    const requestUrl = `${API_BASE_URL}/predict`;
    console.log('Final request URL:', requestUrl); // Verify this shows /api/predict

    // Add request interceptors for debugging
    axios.interceptors.request.use(config => {
      console.log('Request Config:', config);
      return config;
    });

   const response = await axios.post(
  `${API_BASE_URL}/predict`, // Now guaranteed to be /api/predict
  formData,
  {
    headers: { 'Content-Type': 'application/json' },
    timeout: 10000
  }
);

    console.log('Response:', response); // Debug response

    if (!response.data?.percentage) {
      throw new Error('Invalid server response format');
    }

    setResult({
      percentage: response.data.percentage,
      status: response.data.status || `You are ${response.data.percentage}% single`,
      message: response.data.message || "No message provided",
      zodiac: response.data.zodiac,
      tribe: response.data.tribe || "Unknown"
    });

  } catch (err) {
    console.error('Full error:', err);
    let errorMessage = 'Request failed';
    
    if (err.code === 'ERR_NETWORK') {
      errorMessage = 'Network error - server unavailable';
    } else if (err.response) {
      errorMessage = err.response.data?.message || 
                   `Server error (${err.response.status})`;
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

      setResult({
        percentage: response.data.percentage,
        status: response.data.status || `You are ${response.data.percentage}% single`,
        message: response.data.message || "No additional message provided",
        zodiac: response.data.zodiac,
        tribe: response.data.tribe || "Unknown"
      });

    } catch (err) {
      let errorMessage = 'Failed to process your request';
      
      if (err.response) {
        if (err.response.status === 0) {
          errorMessage = 'CORS Error: Request blocked. Please try again later.';
        } else if (err.response.status === 404) {
          errorMessage = 'API endpoint not found (404)';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server is currently unavailable';
        } else {
          errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
        }
      } else if (err.request) {
        errorMessage = err.code === 'ERR_NETWORK' 
          ? 'Network error - please check your connection'
          : 'No response received from server';
      } else {
        errorMessage = err.message || 'Request configuration error';
      }

      setError(errorMessage);
      console.error('API Error:', {
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
