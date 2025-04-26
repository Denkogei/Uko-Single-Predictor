import { useState } from 'react';
import axios from 'axios';
import { PredictorForm, ResultCard } from './components/predictor';

function App() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post('/api/predict', formData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 
              err.response?.data?.message || 
              err.message || 
              'Something went wrong!');
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
            {error}
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