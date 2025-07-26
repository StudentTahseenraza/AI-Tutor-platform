import axios from 'axios';

// Base URL from .env, defaults to localhost for local development
const API = axios.create({
  baseURL: 'https://ai-tutor-platform-z5u9.onrender.com',
  timeout: 30000,
});

const retryRequest = async (fn, maxRetries = 2, delay = 1000) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (i === maxRetries - 1) throw err;
      if (err.response?.status === 429) { // Rate limit exceeded
        console.warn(`Rate limit hit, retrying in ${delay}ms...`, err);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2; // Exponential backoff
      } else {
        throw err;
      }
    }
  }
};

export const analyzeProblem = async (problem) => {
  try {
    const response = await retryRequest(() => API.post('/analyze', { problem }));
    return response.data;
  } catch (err) {
    console.error('Analyze problem error:', err);
    throw new Error(err.response?.data?.detail || 'Failed to analyze problem');
  }
};

export const suggestCode = async (code) => {
  try {
    const response = await retryRequest(() => API.post('/suggest', { code }));
    return response.data.suggestions || [];
  } catch (err) {
    console.error('Suggest code error:', err);
    throw new Error(err.response?.data?.detail || 'Failed to get suggestions');
  }
};

export const askExplanationFollowup = async (context, question) => {
  try {
    const res = await API.post('/chat-explain', {
      context,
      question
    });
    return res.data;
  } catch (err) {
    console.error('Chat explain error:', err);
    throw new Error('Failed to get response from AI.');
  }
};

export const summarizeExplanation = async (context) => {
  try {
    const res = await API.post('/chat-explain', {
      context,
      question: 'Summarize this explanation in simple terms.'
    });
    return res.data;
  } catch (err) {
    console.error('Summarize error:', err);
    throw new Error('Failed to get summary from AI.');
  }
};


// export const generateTutorial = async (problem) => {
//   try {
//     const response = await retryRequest(() => API.post('/generate-tutorial', { problem }));
//     return response.data; // Expects { steps: [...] } from backend
//   } catch (err) {
//     console.error('Generate tutorial error:', err);
//     throw new Error(err.response?.data?.detail || 'Failed to generate tutorial');
//   }
// };