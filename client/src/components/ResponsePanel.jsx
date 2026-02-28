export default function ResponsePanel({ model, data }) {
  const { text, loading, latency, error } = data;

  const copy = () => navigator.clipboard.writeText(text);

  return (
    <div style={{
      border: `2px solid ${model.color}22`,
      borderTop: `4px solid ${model.color}`,
      borderRadius: 12,
      padding: 18,
      minHeight: 350,
      background: '#fff',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: model.color, fontSize: 15 }}>{model.label}</h3>
        {latency && <span style={{ fontSize: 11, color: '#aaa' }}>⏱ {latency}ms</span>}
      </div>

      {/* Content */}
      <div style={{ flex: 1, fontSize: 14, lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>
        {error   && <span style={{ color: 'red' }}>⚠ {error}</span>}
        {!error  && text}
        {loading && <span style={{ color: model.color, animation: 'pulse 1s infinite' }}>▍</span>}
        {!loading && !text && !error && <span style={{ color: '#ccc' }}>Waiting...</span>}
      </div>

      {/* Copy Button */}
      {text && !loading && (
        <button
          onClick={copy}
          style={{ marginTop: 12, padding: '6px 14px', fontSize: 12, borderRadius: 6, border: `1px solid ${model.color}`, color: model.color, background: 'transparent', cursor: 'pointer' }}
        >
          Copy
        </button>
      )}
    </div>
  );
}