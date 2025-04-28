import React, { useState, useEffect } from 'react';
import { Button, Input } from "@/components/ui";
import Select from "@/components/ui/Select";
import axios from 'axios';

const PredictorForm = ({ onSubmit, loading: parentLoading }) => {
  const API_BASE = import.meta.env.PROD 
    ? 'https://uko-single-predictor.onrender.com/api'
    : '/api';

  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    tribe: '',
    gender: ''
  });
  const [localLoading, setLocalLoading] = useState(false);
  const [tribesLoading, setTribesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tribes, setTribes] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    dob: '',
    tribe: ''
  });

  useEffect(() => {
    const fetchTribes = async () => {
      try {
        console.log('Fetching tribes from:', `${API_BASE}/tribes`);
        const response = await axios.get(`${API_BASE}/tribes`, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (Array.isArray(response.data?.tribes)) {
          setTribes(response.data.tribes.map(tribe => ({
            value: tribe,
            label: tribe
          })));
        }
      } catch (err) {
        const errorMsg = `Failed to load tribes: ${err.message}`;
        setError(errorMsg);
        console.error('API Error Details:', {
          message: err.message,
          config: err.config,
          response: err.response?.data,
          status: err.response?.status
        });
      } finally {
        setTribesLoading(false);
      }
    };
    fetchTribes();
  }, [API_BASE]);

  const validateField = (name, value) => {
    let error = '';
    
    if (name === 'name') {
      if (!value.trim()) error = 'Full name is required';
      else if (value.trim().length < 2) error = 'Name must be at least 2 characters';
    }
    
    if (name === 'dob') {
      if (!value) error = 'Date of birth is required';
      else if (!isValidDate(value)) error = 'Invalid date format (MM/DD/YYYY)';
    }
    
    if (name === 'tribe') {
      if (!value) error = 'Please select your tribe';
    }
    
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    if (error) setError(null);
  };

  const handleSelectChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
    if (error) setError(null);
  };

  const isValidDate = (dateString) => {
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateString)) return false;
    
    const [mm, dd, yyyy] = dateString.split('/').map(Number);
    const date = new Date(yyyy, mm - 1, dd);
    
    return date.getFullYear() === yyyy && 
           date.getMonth() === mm - 1 && 
           date.getDate() === dd;
  };

  const formatDateToISO = (dateString) => {
    const [mm, dd, yyyy] = dateString.split('/');
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  };

  const validateForm = () => {
    const errors = {
      name: validateField('name', formData.name),
      dob: validateField('dob', formData.dob),
      tribe: validateField('tribe', formData.tribe)
    };
    
    setFieldErrors(errors);
    
    return !Object.values(errors).some(error => error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalLoading(true);
    setError(null);

    if (!validateForm()) {
      setLocalLoading(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        dob: formatDateToISO(formData.dob),
        tribe: formData.tribe,
        gender: formData.gender || undefined
      };

      await onSubmit(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLocalLoading(false);
    }
  };

  const isSubmitDisabled = 
    parentLoading || 
    localLoading ||
    tribesLoading ||
    Object.values(fieldErrors).some(error => error) ||
    !formData.name.trim() || 
    !formData.dob || 
    !formData.tribe;

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'other', label: 'Other' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <Input
        name="name"
        label="Full Name *"
        value={formData.name}
        onChange={handleInputChange}
        disabled={parentLoading || localLoading}
        placeholder="Enter your full name"
        error={fieldErrors.name}
      />

      <Input
        type="text"
        name="dob"
        label="Date of Birth (MM/DD/YYYY) *"
        value={formData.dob}
        onChange={handleInputChange}
        disabled={parentLoading || localLoading}
        placeholder="MM/DD/YYYY"
        error={fieldErrors.dob}
      />

      <Select
        name="tribe"
        label="Select Your Tribe *"
        value={formData.tribe || ''}
        onChange={handleSelectChange}
        options={tribes}
        disabled={parentLoading || localLoading || tribesLoading}
        placeholder={tribesLoading ? "Loading tribes..." : "Select your tribe"}
        error={fieldErrors.tribe}
      />

      <Select
        name="gender"
        label="Gender (Optional)"
        value={formData.gender || ''}
        onChange={handleSelectChange}
        options={genderOptions}
        disabled={parentLoading || localLoading}
        placeholder="Select your gender"
      />

      <Button
        type="submit"
        disabled={isSubmitDisabled}
        className={`w-full mt-6 ${(parentLoading || localLoading) ? 'opacity-75' : ''}`}
      >
        {(parentLoading || localLoading) ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Analyzing...
          </>
        ) : (
          'Check My Status'
        )}
      </Button>
    </form>
  );
};

export default PredictorForm;
