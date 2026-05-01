import { useState } from 'react'
import { detectPlatform, PLATFORM_META } from '../utils/api'

const EXAMPLES = {
  reddit: 'https://www.reddit.com/r/programming/comments/abc123/example_post/',
  x: 'https://x.com/username/status/123456789',
  facebook: 'https://www.facebook.com/photo?fbid=123456',
  instagram: 'https://www.instagram.com/p/ABC123xyz/',
}

export function UrlInput({ onSubmit, loading }) {
  const [url, setUrl] = useState('')
  const platform = detectPlatform(url)
  const meta = platform ? PLATFORM_META[platform] : null

  function handleSubmit(e) {
    e.preventDefault()
    if (url.trim()) onSubmit(url.trim())
  }

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputWrapper}>
          {/* Platform badge */}
          {meta && (
            <span style={{
              ...styles.badge,
              color: meta.color,
              borderColor: meta.color + '44',
              background: meta.color + '11',
            }}>
              {meta.label}
              {meta.status === 'restricted' && <span style={styles.dot}>⚠</span>}
            </span>
          )}

          <input
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="Paste a Reddit, X, Facebook, or Instagram post URL..."
            style={styles.input}
            disabled={loading}
            autoFocus
          />
        </div>

        <button type="submit" disabled={loading || !url.trim()} style={styles.button}>
          {loading ? (
            <span style={styles.spinner} />
          ) : (
            <>
              <span>Scrape</span>
              <span style={styles.arrow}>→</span>
            </>
          )}
        </button>
      </form>

      {/* Examples row */}
      <div style={styles.examples}>
        <span style={styles.examplesLabel}>Try:</span>
        {Object.entries(EXAMPLES).map(([plat, example]) => (
          <button
            key={plat}
            style={{
              ...styles.exampleBtn,
              color: PLATFORM_META[plat].color,
              borderColor: PLATFORM_META[plat].color + '33',
            }}
            onClick={() => setUrl(example)}
            disabled={loading}
          >
            {PLATFORM_META[plat].label}
          </button>
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  form: {
    display: 'flex',
    gap: '10px',
  },
  inputWrapper: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '0 12px',
    transition: 'border-color 0.2s',
  },
  badge: {
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    fontWeight: 500,
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginRight: '8px',
  },
  dot: { fontSize: '10px' },
  input: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: '13px',
    padding: '14px 0',
  },
  button: {
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius)',
    padding: '0 24px',
    fontFamily: 'var(--mono)',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minWidth: '110px',
    justifyContent: 'center',
    transition: 'opacity 0.2s',
    opacity: 1,
    whiteSpace: 'nowrap',
  },
  arrow: { fontSize: '16px' },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: '#fff',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  examples: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  examplesLabel: {
    color: 'var(--text-dimmer)',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
  },
  exampleBtn: {
    background: 'transparent',
    border: '1px solid',
    borderRadius: '4px',
    padding: '3px 10px',
    fontSize: '11px',
    fontFamily: 'var(--mono)',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
  },
}
