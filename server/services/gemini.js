const axios = require('axios');

async function* streamGemini(prompt) {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${process.env.GEMINI_API_KEY}&alt=sse`,
    { contents: [{ parts: [{ text: prompt }] }] },
    { responseType: 'stream' }
  );

  for await (const chunk of res.data) {
    const lines = chunk.toString().split('\n').filter(l => l.startsWith('data:'));
    for (const line of lines) {
      try {
        const json = JSON.parse(line.replace('data:', '').trim());
        const text = json.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {}
    }
  }
}

module.exports = streamGemini;