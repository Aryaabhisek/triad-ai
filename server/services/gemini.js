const axios = require('axios');

async function* streamGemini(prompt) {
  const res = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GEMINI_API_KEY}`,
    { contents: [{ parts: [{ text: prompt }] }] }
  );

  const text = res.data.candidates[0].content.parts[0].text;
  yield text;
}

module.exports = streamGemini;