const axios = require('axios');

async function* streamGroq(prompt) {
  const res = await axios.post(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      stream: true
    },
    {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      responseType: 'stream'
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

module.exports = streamGroq;