import axios from 'axios';

// Base URL from .env
const API = axios.create({
  baseURL: import.meta.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
});

export const analyzeProblem = async (problem) => {
  try {
    const response = await API.post('/analyze', { problem });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Failed to analyze problem');
  }
};

export const suggestCode = async (code) => {
  try {
    const response = await API.post('/suggest', { code });
    return response.data.suggestions || [];
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Failed to get suggestions');
  }
};

export const generateTutorial = async (problem) => {
  try {
    const response = await API.post('/generate-tutorial', { problem });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Failed to generate tutorial');
  }
};
