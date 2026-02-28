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