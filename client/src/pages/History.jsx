import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function History() {
  const [history, setHistory] = useState([]);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    api.get('/history').then(r => setHistory(r.data));
  }, []);

  const remove = async (id) => {
    await api.delete(`/history/${id}`);
    setHistory(prev => prev.filter(q => q._id !== id));
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 20 }}>
      <h2>📜 Your Query History</h2>
      {history.length === 0 && <p style={{ color: '#aaa' }}>No history yet. Go ask something!</p>}
      {history.map(item => (
        <div key={item._id} style={{ border: '1px solid #eee', borderRadius: 10, padding: 16, marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <strong onClick={() => setExpanded(expanded === item._id ? null : item._id)} style={{ cursor: 'pointer' }}>
              {item.query}
            </strong>
            <div style={{ display: 'flex', gap: 8, fontSize: 12, color: '#aaa' }}>
              <span>{new Date(item.createdAt).toLocaleDateString()}</span>
              <button onClick={() => remove(item._id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>Delete</button>
            </div>
          </div>

          {expanded === item._id && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginTop: 12 }}>
              {['gemini', 'groq', 'mistral'].map(m => (
                <div key={m} style={{ background: '#f9f9f9', padding: 10, borderRadius: 8, fontSize: 13 }}>
                  <strong style={{ display: 'block', marginBottom: 6, textTransform: 'capitalize' }}>{m}</strong>
                  <p style={{ margin: 0, lineHeight: 1.6 }}>{item.responses[m]?.text?.slice(0, 200)}...</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}