const PLATFORMS = [
  {
    id: 'reddit',
    name: 'Reddit',
    status: 'supported',
    color: '#ff4500',
    detail: 'Public JSON API',
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    status: 'restricted',
    color: '#1d9bf0',
    detail: 'Paid API only',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    status: 'restricted',
    color: '#1877f2',
    detail: 'Graph API + App Review',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    status: 'restricted',
    color: '#e1306c',
    detail: 'Meta Graph API',
  },
]

export function PlatformStatus() {
  return (
    <div style={styles.container}>
      <div style={styles.title}>Platform Support</div>
      <div style={styles.list}>
        {PLATFORMS.map(p => (
          <div key={p.id} style={styles.item}>
            <div style={styles.itemLeft}>
              <div style={{
                ...styles.dot,
                background: p.status === 'supported' ? 'var(--green)' : 'var(--text-dimmer)',
                boxShadow: p.status === 'supported' ? '0 0 6px var(--green)' : 'none',
              }} />
              <span style={{ ...styles.name, color: p.color }}>{p.name}</span>
            </div>
            <span style={{
              ...styles.badge,
              color: p.status === 'supported' ? 'var(--green)' : 'var(--text-dimmer)',
              background: p.status === 'supported' ? 'var(--green-dim)' : 'var(--bg-4)',
              borderColor: p.status === 'supported' ? 'rgba(34,197,94,0.2)' : 'var(--border)',
            }}>
              {p.status === 'supported' ? '✓ Full' : '⚠ Stub'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px',
  },
  title: {
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    color: 'var(--text-dimmer)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: '12px',
  },
  list: { display: 'flex', flexDirection: 'column', gap: '8px' },
  item: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  itemLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  dot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  name: { fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 500 },
  badge: {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    padding: '2px 6px',
    borderRadius: '3px',
    border: '1px solid',
  },
}
