import { useState, useCallback } from 'react';
import { useApp } from '../context/AppContext';

export const useApi = () => {
  const { setLoading, setError, clearError } = useApp();
  const [data, setData] = useState(null);

  const callApi = useCallback(async (apiCall, options = {}) => {
    const {
      showLoading = true,
      showErrors = true,
      onSuccess,
      onError
    } = options;

    try {
      if (showLoading) {
        setLoading(true);
      }
      clearError();

      const response = await apiCall();
      setData(response.data);

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
      
      if (showErrors) {
        setError(errorMessage);
      }

      if (onError) {
        onError(error);
      }

      throw error;
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, [setLoading, setError, clearError]);

  return {
    data,
    callApi,
    setData
  };
};

export const useApiState = (initialData = null) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (apiCall, options = {}) => {
    const { onSuccess, onError } = options;

    try {
      setLoading(true);
      setError(null);

      const response = await apiCall();
      const result = response.data;
      
      setData(result);

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);

      if (onError) {
        onError(err);
      }

      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearData = useCallback(() => {
    setData(initialData);
  }, [initialData]);

  return {
    data,
    loading,
    error,
    execute,
    clearError,
    clearData,
    setData,
    setLoading,
    setError
  };
};