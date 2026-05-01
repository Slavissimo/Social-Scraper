export function RestrictedResults({ data }) {
  const {
    platform_name,
    reason,
    technical_detail,
    architecture_note,
    relevant_endpoints,
    url,
  } = data

  const platformColors = {
    x: '#1d9bf0',
    facebook: '#1877f2',
    instagram: '#e1306c',
  }
  const color = platformColors[data.platform] || '#888'

  return (
    <div className="fade-in" style={styles.container}>
      {/* Header */}
      <div style={{ ...styles.header, borderColor: color + '44', background: color + '0a' }}>
        <div style={styles.headerTop}>
          <div style={{ ...styles.platformBadge, color, borderColor: color + '44', background: color + '15' }}>
            {platform_name}
          </div>
          <div style={{ ...styles.statusBadge }}>
            ⛔ Not Implemented
          </div>
        </div>
        <div style={styles.urlDisplay}>
          <span style={styles.urlLabel}>URL</span>
          <span style={styles.urlText}>{url}</span>
        </div>
        <div style={styles.reasonText}>
          <strong>Why:</strong> {reason}
        </div>
      </div>

      {/* Technical explanation */}
      <Section title="Technical Detail" icon="🔒">
        <p style={styles.text}>{technical_detail}</p>
      </Section>

      {/* Architecture note - great for thesis! */}
      <Section title="How It Would Be Implemented" icon="🏗">
        <p style={styles.text}>{architecture_note}</p>
        {relevant_endpoints?.length > 0 && (
          <div style={styles.endpoints}>
            <div style={styles.endpointsLabel}>Relevant API Endpoints:</div>
            {relevant_endpoints.map((ep, i) => (
              <code key={i} style={styles.endpoint}>{ep}</code>
            ))}
          </div>
        )}
      </Section>

      {/* Thesis note */}
      <div style={styles.thesisNote}>
        <span style={styles.thesisIcon}>💡</span>
        <p style={styles.thesisText}>
          This response is intentionally structured for academic documentation. The architecture
          notes above describe the full implementation path that would be required to scrape
          this platform with proper API access.
        </p>
      </div>
    </div>
  )
}

function Section({ title, icon, children }) {
  return (
    <div style={styles.section}>
      <div style={styles.sectionTitle}>
        <span>{icon}</span>
        <span>{title}</span>
      </div>
      <div style={styles.sectionBody}>{children}</div>
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '14px' },
  header: {
    border: '1px solid',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  headerTop: { display: 'flex', alignItems: 'center', gap: '10px' },
  platformBadge: {
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    fontWeight: 700,
    padding: '3px 10px',
    borderRadius: '4px',
    border: '1px solid',
  },
  statusBadge: {
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    color: 'var(--red)',
    background: 'var(--red-dim)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '4px',
    padding: '3px 8px',
  },
  urlDisplay: {
    display: 'flex',
    gap: '10px',
    alignItems: 'baseline',
  },
  urlLabel: {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    color: 'var(--text-dimmer)',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    flexShrink: 0,
  },
  urlText: {
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    color: 'var(--text-dim)',
    wordBreak: 'break-all',
  },
  reasonText: {
    fontSize: '13px',
    color: 'var(--text)',
    lineHeight: 1.6,
  },
  section: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  sectionTitle: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    padding: '10px 16px',
    background: 'var(--bg-3)',
    borderBottom: '1px solid var(--border)',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-dim)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  sectionBody: { padding: '16px' },
  text: { fontSize: '13px', lineHeight: 1.8, color: 'var(--text)' },
  endpoints: { marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '6px' },
  endpointsLabel: {
    fontSize: '11px',
    color: 'var(--text-dimmer)',
    fontFamily: 'var(--mono)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '4px',
  },
  endpoint: {
    display: 'block',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    color: 'var(--green)',
    background: 'var(--green-dim)',
    border: '1px solid rgba(34,197,94,0.2)',
    padding: '6px 12px',
    borderRadius: '4px',
    wordBreak: 'break-all',
  },
  thesisNote: {
    display: 'flex',
    gap: '12px',
    padding: '14px 16px',
    background: 'var(--yellow-dim)',
    border: '1px solid rgba(234,179,8,0.2)',
    borderRadius: 'var(--radius)',
  },
  thesisIcon: { fontSize: '18px', flexShrink: 0 },
  thesisText: { fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.7 },
}
