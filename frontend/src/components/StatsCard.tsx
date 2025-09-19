import { Icon } from './Icon';

interface StatsCardProps {
  title: string;
  value: string;
  icon: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  trend,
  variant = 'default' 
}: StatsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          borderColor: 'var(--success-light)',
          iconBg: 'var(--success-bg)',
          iconColor: 'var(--success)',
          valueColor: 'var(--success-dark)'
        };
      case 'danger':
        return {
          borderColor: 'var(--danger-light)',
          iconBg: 'var(--danger-bg)',
          iconColor: 'var(--danger)',
          valueColor: 'var(--danger-dark)'
        };
      case 'warning':
        return {
          borderColor: 'var(--warning-light)',
          iconBg: 'var(--warning-bg)',
          iconColor: 'var(--warning)',
          valueColor: 'var(--warning-dark)'
        };
      case 'info':
        return {
          borderColor: 'var(--info-light)',
          iconBg: 'var(--info-bg)',
          iconColor: 'var(--info)',
          valueColor: 'var(--info-dark)'
        };
      default:
        return {
          borderColor: 'var(--gray-200)',
          iconBg: 'var(--primary-bg)',
          iconColor: 'var(--primary)',
          valueColor: 'var(--text-primary)'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div 
      className="card stat-card"
      style={{
        borderLeft: `4px solid ${styles.borderColor}`,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'flex-start', 
        justifyContent: 'space-between',
        marginBottom: 'var(--space-4)'
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ 
            fontSize: '0.875rem',
            fontWeight: '500',
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            margin: '0 0 var(--space-2) 0'
          }}>
            {title}
          </h3>
          <p style={{
            fontSize: '2rem',
            fontWeight: '700',
            color: styles.valueColor,
            margin: 0,
            lineHeight: 1.2
          }}>
            {value}
          </p>
        </div>
        
        <div style={{
          padding: 'var(--space-3)',
          background: styles.iconBg,
          borderRadius: 'var(--radius-xl)',
          color: styles.iconColor
        }}>
          <Icon name={icon} size="lg" />
        </div>
      </div>

      {trend && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 'var(--space-1)',
          fontSize: '0.75rem',
          color: trend.isPositive ? 'var(--success)' : 'var(--danger)'
        }}>
          <Icon name={trend.isPositive ? 'arrow_up' : 'arrow_down'} size="sm" />
          <span style={{ fontWeight: '500' }}>
            {Math.abs(trend.value)}%
          </span>
          <span className="text-muted">vs mês anterior</span>
        </div>
      )}

      {/* Subtle background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '100px',
        height: '100px',
        background: `radial-gradient(circle, ${styles.iconColor}08 0%, transparent 70%)`,
        borderRadius: '50%',
        transform: 'translate(30px, -30px)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}
