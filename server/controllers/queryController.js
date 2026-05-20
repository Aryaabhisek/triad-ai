const streamGemini  = require('../services/gemini');
const streamGroq    = require('../services/groq');
const streamMistral = require('../services/mistral');
const Query         = require('../models/Query');

exports.handleStream = async (req, res) => {
  const { query } = req.query;
  const userId = req.user.id;

  if (!query) return res.status(400).json({ error: 'Query required' });

  // Setup SSE headers
  res.setHeader('Content-Type',  'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection',    'keep-alive');
  res.flushHeaders();

  const send = (model, type, payload) => {
    res.write(`data: ${JSON.stringify({ model, type, payload })}\n\n`);
  };

  // Track full responses for saving to DB
  const fullResponses = { gemini: '', groq: '', mistral: '' };
  const startTimes    = { gemini: Date.now(), groq: Date.now(), mistral: Date.now() };

  // Stream each model independently and in parallel
  const streamModel = async (name, generatorFn) => {
    try {
      startTimes[name] = Date.now();
      send(name, 'start', {});

      for await (const chunk of generatorFn(query)) {
        fullResponses[name] += chunk;
        send(name, 'chunk', chunk);
      }

      send(name, 'done', { latency: Date.now() - startTimes[name] });
    } catch (err) {
      send(name, 'error', err.message);
    }
  };

  // Fire all 3 in parallel — no waiting!
  await Promise.allSettled([
    streamModel('gemini',  streamGemini),
    streamModel('groq',    streamGroq),
    streamModel('mistral', streamMistral),
  ]);

  // Save complete responses to MongoDB
  await Query.create({
    userId,
    query,
    responses: {
      gemini:  { text: fullResponses.gemini,  latency: Date.now() - startTimes.gemini,  done: true },
      groq:    { text: fullResponses.groq,    latency: Date.now() - startTimes.groq,    done: true },
      mistral: { text: fullResponses.mistral, latency: Date.now() - startTimes.mistral, done: true },
    }
  });

  res.write('data: [ALL_DONE]\n\n');
  res.end();
};

exports.summarize = async (req, res) => {
  const { gemini, mistral, groq, originalPrompt } = req.body;

  if (!gemini && !mistral && !groq) {
    return res.status(400).json({ error: 'At least one response is required' });
  }

  const summaryPrompt = `
Three AI models answered this question: "${originalPrompt}"

Gemini said: ${gemini || '(No response)'}
Mistral said: ${mistral || '(No response)'}  
Groq said: ${groq || '(No response)'}

Synthesize these into one clear, concise summary. 
Highlight where they agree, and note any key differences.
Keep it under 150 words.
  `;

  try {
    if (!process.env.GROQ_API_KEY) {
      console.error('❌ GROQ_API_KEY not configured');
      return res.status(500).json({ error: 'Server configuration error: Missing API key' });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: summaryPrompt }],
        max_tokens: 300
      }),
      timeout: 30000
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('❌ Groq API error:', {
        status: response.status,
        statusText: response.statusText,
        body: errorData
      });
      return res.status(response.status).json({ error: `Groq API error: ${response.statusText}` });
    }

    const data = await response.json();

    if (!data.choices?.[0]?.message?.content) {
      console.error('❌ Invalid Groq response format:', JSON.stringify(data));
      return res.status(500).json({ error: 'Invalid response from summarization service' });
    }

    console.log('✅ Summary generated successfully');
    res.json({ summary: data.choices[0].message.content });
  } catch (err) {
    console.error('❌ Summary generation failed:', {
      message: err.message,
      stack: err.stack
    });
    res.status(500).json({ error: `Summary failed: ${err.message}` });
  }
};