import { useState } from 'react'
import { useScraper } from './hooks/useScraper'
import { UrlInput } from './components/UrlInput'
import { RedditResults } from './components/RedditResults'
import { RestrictedResults } from './components/RestrictedResults'
import { PlatformStatus } from './components/PlatformStatus'

export default function App() {
  const { loading, data, error, scrape, reset } = useScraper()
  const [lastUrl, setLastUrl] = useState('')

  function handleSubmit(url) {
    setLastUrl(url)
    scrape(url)
  }

  function handleReset() {
    reset()
    setLastUrl('')
  }

  return (
    <div style={styles.root}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>
            <span style={styles.logoAccent}>{'>'}</span>
            <span style={styles.logoText}>social_scraper</span>
          </div>
          <div style={styles.headerRight}>
            <span style={styles.thesis}>Bachelor Thesis Demo</span>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <main style={styles.main}>
        <aside style={styles.sidebar}>
          <PlatformStatus />
          <div style={styles.sidebarNote}>
            <p style={styles.noteText}>
              Enter any public post URL from a supported platform. Reddit posts are fully scraped
              including nested comments. Other platforms return architecture documentation.
            </p>
          </div>
        </aside>

        <div style={styles.content}>
          {/* Search bar */}
          <div style={styles.inputSection}>
            <UrlInput onSubmit={handleSubmit} loading={loading} />
          </div>

          {/* Loading */}
          {loading && (
            <div style={styles.loadingState}>
              <div style={styles.loadingDots}>
                <span style={{ ...styles.loadingDot, animationDelay: '0ms' }} />
                <span style={{ ...styles.loadingDot, animationDelay: '150ms' }} />
                <span style={{ ...styles.loadingDot, animationDelay: '300ms' }} />
              </div>
              <span style={styles.loadingText}>Fetching post data...</span>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div style={styles.errorCard}>
              <div style={styles.errorHeader}>
                <span style={styles.errorIcon}>✕</span>
                <span style={styles.errorTitle}>Request Failed</span>
                <button style={styles.dismissBtn} onClick={handleReset}>Clear</button>
              </div>
              <p style={styles.errorMessage}>{error}</p>
            </div>
          )}

          {/* Results */}
          {data && !loading && (
            <div style={styles.results}>
              <div style={styles.resultsHeader}>
                <span style={styles.resultsTitle}>
                  {data.status === 'success' ? '✓ Scrape Complete' : '⚠ Platform Restricted'}
                </span>
                <button style={styles.newSearchBtn} onClick={handleReset}>
                  ← New Search
                </button>
              </div>

              {data.status === 'success' && data.platform === 'reddit' && (
                <RedditResults data={data} />
              )}
              {data.status === 'not_implemented' && (
                <RestrictedResults data={data} />
              )}
            </div>
          )}

          {/* Empty state */}
          {!data && !loading && !error && (
            <div style={styles.emptyState}>
              <div style={styles.emptyGrid}>
                <EmptyCard
                  platform="Reddit"
                  color="#ff4500"
                  status="Fully supported"
                  desc="Scrapes post metadata, all comments with threading, author info, and scores."
                />
                <EmptyCard
                  platform="X (Twitter)"
                  color="#1d9bf0"
                  status="API stub"
                  desc="Returns architecture documentation. Full implementation requires paid API access."
                />
                <EmptyCard
                  platform="Facebook"
                  color="#1877f2"
                  status="API stub"
                  desc="Returns architecture documentation. Requires Meta Graph API with app review."
                />
                <EmptyCard
                  platform="Instagram"
                  color="#e1306c"
                  status="API stub"
                  desc="Returns architecture documentation. Owned by Meta, same restrictions apply."
                />
              </div>
            </div>
          )}
        </div>
      </main>

      <footer style={styles.footer}>
        <span style={styles.footerText}>
          Social Comment Scraper — Bachelor Thesis Project — Built with React + FastAPI
        </span>
      </footer>
    </div>
  )
}

function EmptyCard({ platform, color, status, desc }) {
  return (
    <div style={styles.emptyCard}>
      <div style={{ ...styles.emptyCardTop, borderColor: color + '44' }}>
        <span style={{ ...styles.emptyCardName, color }}>{platform}</span>
        <span style={{
          ...styles.emptyCardStatus,
          color: status.includes('stub') ? 'var(--text-dimmer)' : 'var(--green)',
        }}>
          {status}
        </span>
      </div>
      <p style={styles.emptyCardDesc}>{desc}</p>
    </div>
  )
}

const styles = {
  root: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
  },
  header: {
    borderBottom: '1px solid var(--border)',
    background: 'var(--bg-2)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  headerInner: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: { display: 'flex', alignItems: 'center', gap: '8px' },
  logoAccent: {
    fontFamily: 'var(--mono)',
    fontSize: '20px',
    fontWeight: 700,
    color: 'var(--accent)',
  },
  logoText: {
    fontFamily: 'var(--mono)',
    fontSize: '16px',
    fontWeight: 600,
    color: 'var(--text)',
    letterSpacing: '-0.02em',
  },
  headerRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  thesis: {
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    color: 'var(--text-dimmer)',
    border: '1px solid var(--border)',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  main: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '24px',
    flex: 1,
    display: 'flex',
    gap: '24px',
    width: '100%',
  },
  sidebar: {
    width: '220px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    position: 'sticky',
    top: '68px',
    alignSelf: 'flex-start',
  },
  sidebarNote: {
    padding: '12px',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
  },
  noteText: { fontSize: '12px', color: 'var(--text-dimmer)', lineHeight: 1.7 },
  content: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', minWidth: 0 },
  inputSection: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
  },
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '24px',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
  },
  loadingDots: { display: 'flex', gap: '5px' },
  loadingDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--accent)',
    animation: 'pulse 1s ease-in-out infinite',
    display: 'inline-block',
  },
  loadingText: { fontFamily: 'var(--mono)', fontSize: '13px', color: 'var(--text-dim)' },
  errorCard: {
    background: 'var(--red-dim)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  errorHeader: { display: 'flex', alignItems: 'center', gap: '8px' },
  errorIcon: { color: 'var(--red)', fontWeight: 700 },
  errorTitle: { fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600, color: 'var(--red)', flex: 1 },
  dismissBtn: {
    background: 'none',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '4px',
    padding: '3px 8px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    cursor: 'pointer',
  },
  errorMessage: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--text-dim)', lineHeight: 1.6 },
  results: { display: 'flex', flexDirection: 'column', gap: '16px' },
  resultsHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  resultsTitle: { fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 600, color: 'var(--text)' },
  newSearchBtn: {
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '5px 12px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    cursor: 'pointer',
  },
  emptyState: { padding: '8px 0' },
  emptyGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '12px',
  },
  emptyCard: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  emptyCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '8px',
    borderBottom: '1px solid',
  },
  emptyCardName: { fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700 },
  emptyCardStatus: { fontFamily: 'var(--mono)', fontSize: '10px', textTransform: 'uppercase' },
  emptyCardDesc: { fontSize: '12px', color: 'var(--text-dimmer)', lineHeight: 1.7 },
  footer: {
    borderTop: '1px solid var(--border)',
    padding: '14px 24px',
    textAlign: 'center',
  },
  footerText: { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dimmer)' },
}
