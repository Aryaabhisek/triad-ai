const axios = require('axios');

async function* streamMistral(prompt) {
  if (!process.env.MISTRAL_API_KEY) {
    throw new Error('MISTRAL_API_KEY not configured');
  }

  const res = await axios.post(
    'https://api.mistral.ai/v1/chat/completions',
    {
      model: 'mistral-small-latest',
      messages: [{ role: 'user', content: prompt }],
      stream: true
    },
    {
      headers: { Authorization: `Bearer ${process.env.MISTRAL_API_KEY}` },
      responseType: 'stream',
      timeout: 30000
    }
  );

  for await (const chunk of res.data) {
    const lines = chunk.toString().split('\n').filter(l => l.startsWith('data:'));
    for (const line of lines) {
      const raw = line.replace('data:', '').trim();
      if (raw === '[DONE]') return;
      try {
        const json = JSON.parse(raw);
        const text = json.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {}
    }
  }
}

module.exports = streamMistral;