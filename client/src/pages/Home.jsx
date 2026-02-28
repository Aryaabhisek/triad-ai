import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ResponsePanel from '../components/ResponsePanel';

const MODELS = [
  { key: 'gemini',  label: 'Gemini 1.5 Flash', color: '#4285F4' },
  { key: 'groq',    label: 'LLaMA 3.3 (Groq)', color: '#F55036' },
  { key: 'mistral', label: 'Mistral Small',     color: '#FF7000' },
];

const initialState = () => ({
  gemini:  { text: '', loading: false, latency: null, error: null },
  groq:    { text: '', loading: false, latency: null, error: null },
  mistral: { text: '', loading: false, latency: null, error: null },
});

export default function Home() {
  const { token } = useAuth();
  const [query,     setQuery]     = useState('');
  const [responses, setResponses] = useState(initialState());
  const [asked,     setAsked]     = useState(false);

  const updateModel = (model, updates) => {
    setResponses(prev => ({
      ...prev,
      [model]: { ...prev[model], ...updates }
    }));
  };

  const handleAsk = () => {
    if (!query.trim()) return;

    // Reset state
    setResponses(initialState());
    setAsked(true);

    // Set all to loading
    MODELS.forEach(m => updateModel(m.key, { loading: true }));

    // Open SSE connection — token passed as query param for EventSource
    const url = `http://localhost:5000/api/query/stream?query=${encodeURIComponent(query)}&token=${token}`;
    const es  = new EventSource(url);

    es.onmessage = (e) => {
      if (e.data === '[ALL_DONE]') { es.close(); return; }

      const { model, type, payload } = JSON.parse(e.data);

      if (type === 'start') {
        updateModel(model, { loading: true, text: '' });
      }
      if (type === 'chunk') {
        setResponses(prev => ({
          ...prev,
          [model]: { ...prev[model], text: prev[model].text + payload }
        }));
      }
      if (type === 'done') {
        updateModel(model, { loading: false, latency: payload.latency });
      }
      if (type === 'error') {
        updateModel(model, { loading: false, error: payload });
      }
    };

    es.onerror = () => {
      MODELS.forEach(m => updateModel(m.key, { loading: false }));
      es.close();
    };
  };

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', fontSize: 32 }}>🔺 Triad AI</h1>
      <p style={{ textAlign: 'center', color: '#888' }}>One question. Three AI perspectives. In real-time.</p>

      {/* Input */}
      <div style={{ display: 'flex', gap: 10, margin: '24px 0' }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
          placeholder="Ask anything..."
          style={{ flex: 1, padding: '14px 18px', fontSize: 16, borderRadius: 10, border: '1.5px solid #ddd' }}
        />
        <button
          onClick={handleAsk}
          style={{ padding: '14px 28px', fontSize: 16, background: '#6C63FF', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer' }}
        >
          Ask All →
        </button>
      </div>

      {/* 3 Panels */}
      {asked && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {MODELS.map(model => (
            <ResponsePanel
              key={model.key}
              model={model}
              data={responses[model.key]}
            />
          ))}
        </div>
      )}
    </div>
  );
}