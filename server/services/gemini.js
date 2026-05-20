const axios = require('axios');

async function* streamGemini(prompt) {
  try {
    // Validate API key exists
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      { contents: [{ parts: [{ text: prompt }] }] },
      { timeout: 30000 }  // 30s timeout
    );

    // Safely access response with fallbacks
    const text = res.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      throw new Error('No text in Gemini response: ' + JSON.stringify(res.data));
    }

    yield text;

  } catch (error) {
    console.error('Gemini API Error:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    throw error;  // Let controller handle it
  }
}

module.exports = streamGemini;