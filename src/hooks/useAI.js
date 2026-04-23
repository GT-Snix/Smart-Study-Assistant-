import { useState } from 'react';
import api from '../utils/api';
import useAppStore from '../store/useAppStore';

/**
 * useAI hook — ALL AI calls now go through the backend proxy.
 * The OpenRouter API key NEVER leaves the server.
 */
const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const generate = async (prompt, system = '', taskType = 'general') => {
    setLoading(true);
    setError(null);
    try {
      const subject = useAppStore.getState().subject || '';

      const res = await api.post('/study/generate', {
        prompt,
        system,
        taskType,
        subject,
      });

      return res.data.text;
    } catch (e) {
      setError(e.message);
      return '';
    } finally {
      setLoading(false);
    }
  };

  return { generate, loading, error };
};

export default useAI;
