const AppError = require('../utils/AppError');

/**
 * Select the best model based on subject and task type.
 */
const selectModel = (taskType, subject = '') => {
  const subj = subject.toLowerCase();

  if (taskType === 'flashcards') return 'meta-llama/llama-3.3-70b-instruct';

  if (subj.includes('math') || subj.includes('calculus') || subj.includes('algebra')) {
    return 'openai/o3-mini';
  }
  if (subj.includes('physic') || subj.includes('mechanic')) {
    return 'google/gemini-2.5-pro';
  }
  if (subj.includes('chem')) {
    return 'anthropic/claude-3-opus';
  }

  return 'anthropic/claude-3.5-sonnet';
};

/**
 * Call OpenRouter API from the backend.
 * The API key is provided by the frontend via headers.
 */
const callOpenRouter = async (req, prompt, system = '', taskType = 'general', subject = '') => {
  const apiKey = req.headers['x-openrouter-key'];
  if (!apiKey) {
    throw new AppError('Missing OpenRouter API key', 400);
  }

  const model = selectModel(taskType, subject);
  const messages = [];
  if (system) messages.push({ role: 'system', content: system });
  messages.push({ role: 'user', content: prompt });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25000);

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Title': 'MINXY Smart Study Assistant+',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new AppError(err?.error?.message || `OpenRouter HTTP ${response.status}`, 502);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';

    if (!text) {
      throw new AppError('AI returned an empty response', 502);
    }

    return { text, model };
  } catch (err) {
    clearTimeout(timeout);
    if (err.name === 'AbortError') {
      throw new AppError('AI request timed out', 504);
    }
    if (err instanceof AppError) throw err;
    throw new AppError(`AI service error: ${err.message}`, 502);
  }
};

module.exports = { callOpenRouter };
