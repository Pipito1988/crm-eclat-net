interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  message?: string;
  inline?: boolean;
}

export function LoadingSpinner({ 
  size = 'medium', 
  message = 'A carregar...', 
  inline = false 
}: LoadingSpinnerProps) {
  const sizeMap = {
    small: '16px',
    medium: '24px',
    large: '32px'
  };

  const spinnerSize = sizeMap[size];

  const spinnerStyle: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    border: '2px solid #f3f3f3',
    borderTop: '2px solid var(--primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    display: inline ? 'inline-block' : 'block',
    margin: inline ? '0 8px 0 0' : '0 auto'
  };

  const containerStyle: React.CSSProperties = inline 
    ? { display: 'inline-flex', alignItems: 'center' }
    : { textAlign: 'center', padding: '20px' };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {message && (
        <span style={{ 
          marginLeft: inline ? '8px' : '0',
          marginTop: inline ? '0' : '8px',
          display: inline ? 'inline' : 'block',
          color: '#666',
          fontSize: '0.9rem'
        }}>
          {message}
        </span>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
