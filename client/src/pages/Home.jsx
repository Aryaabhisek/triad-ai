import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import ResponsePanel from '../components/ResponsePanel';
import SummaryCard from '../components/SummaryCard'; // 👈 NEW IMPORT

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

  // 👇 NEW: summary state
  const [summary,       setSummary]       = useState('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryError,  setSummaryError]  = useState(null);

  const updateModel = (model, updates) => {
    setResponses(prev => ({
      ...prev,
      [model]: { ...prev[model], ...updates }
    }));
  };

  // 👇 NEW: track how many models have finished
  const finishedModels = useRef({});

  const handleAsk = () => {
    if (!query.trim()) return;

    // Reset state
    setResponses(initialState());
    setAsked(true);
    setSummary('');           // 👈 reset summary on new question
    setSummaryError(null);    // 👈 reset summary error
    setIsSummarizing(false);
    finishedModels.current = {}; // 👈 reset tracker

    // Set all to loading
    MODELS.forEach(m => updateModel(m.key, { loading: true }));

    const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const url = `${BASE_URL}/api/query/stream?query=${encodeURIComponent(query)}&token=${token}`;
    const es  = new EventSource(url);

    es.onmessage = (e) => {
      if (e.data === '[ALL_DONE]') {
        es.close();
        return;
      }

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

        // 👇 NEW: mark this model as done and store its final text
        finishedModels.current[model] = true;

        // 👇 NEW: if all 3 are done, trigger summarizer
        if (Object.keys(finishedModels.current).length === MODELS.length) {
          setResponses(prev => {
            triggerSummary(query, prev); // pass final snapshot
            return prev;
          });
        }
      }
      if (type === 'error') {
        updateModel(model, { loading: false, error: payload });
        finishedModels.current[model] = true;

      // Trigger summary even if one model fails
      if (Object.keys(finishedModels.current).length === MODELS.length) {
        setResponses(prev => {
        triggerSummary(query, prev);
      return prev;
    });
  }
}
    };

    es.onerror = () => {
      MODELS.forEach(m => updateModel(m.key, { loading: false }));
      es.close();
    };
  };

  // 👇 NEW: summary fetcher function
  const triggerSummary = async (originalPrompt, finalResponses) => {
    setIsSummarizing(true);
    setSummaryError(null);
    const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    try {
      const res = await fetch(`${BASE_URL}/api/query/summarize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          originalPrompt,
          gemini:  finalResponses.gemini.text,
          mistral: finalResponses.mistral.text,
          groq:    finalResponses.groq.text,
        })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Summary API error:', data);
        setSummaryError(data.error || 'Unknown error');
        setSummary('');
      } else {
        setSummary(data.summary || '');
        setSummaryError(null);
      }
    } catch (err) {
      console.error('Summary fetch failed:', err);
      setSummaryError(err.message || 'Network error');
      setSummary('');
    } finally {
      setIsSummarizing(false);
    }
  };


  

  return (
    <div style={{ maxWidth: 1300, margin: '0 auto', padding: '20px' }}>
      <h1 style={{ textAlign: 'center', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
        <img src="/Triad_AI_Logo_SVG.svg" alt="Triad AI Logo" style={{ height: '40px', width: '40px' }} />
        Triad AI
      </h1>
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

      {/* 👇 NEW: Summary card — shows below the 3 panels */}
      {asked && (
        <SummaryCard summary={summary} isLoading={isSummarizing} error={summaryError} />
      )}
    </div>
  );
}