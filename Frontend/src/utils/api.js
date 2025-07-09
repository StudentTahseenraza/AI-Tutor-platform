import axios from 'axios';

export const analyzeProblem = async (problem) => {
  try {
    const response = await axios.post('http://localhost:8000/analyze', { problem });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Failed to analyze problem');
  }
};

export const suggestCode = async (code) => {
  try {
    const response = await axios.post('http://localhost:8000/suggest', { code });
    return response.data.suggestions || [];
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Failed to get suggestions');
  }
};

export const generateTutorial = async (problem) => {
  try {
    const response = await axios.post('http://localhost:8000/generate-tutorial', { problem });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.detail || 'Failed to generate tutorial');
  }
};