export default function SummaryCard({ summary, isLoading, error }) {
  if (!summary && !isLoading && !error) return null;

  const copy = () => navigator.clipboard.writeText(summary);

  return (
    <div style={{
      border: '2px solid #6C63FF22',
      borderTop: '4px solid #6C63FF',
      borderRadius: 12,
      padding: 18,
      minHeight: 200,
      background: '#fff',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column',
      marginTop: 20
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <h3 style={{ margin: 0, color: '#6C63FF', fontSize: 15 }}>
          ✦ AI Summary
        </h3>
        <span style={{ fontSize: 11, color: '#aaa' }}>Synthesized from 3 models</span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, fontSize: 14, lineHeight: 1.8, color: '#333', whiteSpace: 'pre-wrap' }}>
        {error && <span style={{ color: 'red' }}>⚠ {error}</span>}
        {!error && summary}
        {isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#6C63FF', animation: 'pulse 1s infinite' }}>▍</span>
            <span style={{ color: '#999', fontSize: 13 }}>Synthesizing responses...</span>
          </div>
        )}
        {!isLoading && !summary && !error && <span style={{ color: '#ccc' }}>Waiting...</span>}
      </div>

      {/* Copy Button */}
      {summary && !isLoading && !error && (
        <button
          onClick={copy}
          style={{ 
            marginTop: 12, 
            padding: '6px 14px', 
            fontSize: 12, 
            borderRadius: 6, 
            border: '1px solid #6C63FF', 
            color: '#6C63FF', 
            background: 'transparent', 
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}
        >
          Copy
        </button>
      )}
    </div>
  );
}