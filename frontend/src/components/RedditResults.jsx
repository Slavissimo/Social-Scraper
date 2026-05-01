import { useState } from 'react'
import { formatDate, formatScore } from '../utils/api'

function CommentNode({ comment, allComments }) {
  const [collapsed, setCollapsed] = useState(false)
  const directReplies = allComments.filter(
    c => c.depth === comment.depth + 1 &&
    allComments.indexOf(c) > allComments.indexOf(comment)
  )
  // Only count replies that belong to this comment thread
  const siblings = allComments.filter(c => c.depth <= comment.depth && allComments.indexOf(c) > allComments.indexOf(comment))
  const nextSiblingIdx = siblings.length > 0 ? allComments.indexOf(siblings[0]) : allComments.length
  const myReplies = allComments.slice(allComments.indexOf(comment) + 1, nextSiblingIdx).filter(c => c.depth > comment.depth)

  const depthColors = ['#ff4500','#ff6534','#ff845a','#ffa280','#ffbfaa']
  const color = depthColors[Math.min(comment.depth, depthColors.length - 1)]

  return (
    <div style={{ marginLeft: comment.depth > 0 ? '20px' : '0' }}>
      <div style={styles.comment}>
        {comment.depth > 0 && (
          <div style={{ ...styles.depthLine, background: color + '44' }} />
        )}
        <div style={styles.commentInner}>
          <div style={styles.commentMeta}>
            <span style={styles.author}>u/{comment.author}</span>
            <span style={{ ...styles.score, color }}>▲ {formatScore(comment.score)}</span>
            <span style={styles.date}>{formatDate(comment.created_utc)}</span>
            {myReplies.length > 0 && (
              <button
                style={styles.collapseBtn}
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? `[+] ${myReplies.length} replies` : '[-] collapse'}
              </button>
            )}
          </div>
          <p style={styles.body}>{comment.body}</p>
        </div>
      </div>
      {!collapsed && myReplies.map((reply, i) => (
        reply.depth === comment.depth + 1 && (
          <CommentNode key={reply.id + i} comment={reply} allComments={allComments} />
        )
      ))}
    </div>
  )
}

export function RedditResults({ data }) {
  const { post, comments, stats } = data
  const [filter, setFilter] = useState('all') // 'all' | 'top' | 'visible'
  const [searchQuery, setSearchQuery] = useState('')
  const [exportMsg, setExportMsg] = useState('')

  const topLevelComments = comments.filter(c => c.depth === 0)

  let filtered = topLevelComments
  if (filter === 'top') filtered = [...filtered].sort((a, b) => b.score - a.score).slice(0, 20)
  if (filter === 'visible') filtered = filtered.filter(c => !c.is_deleted)
  if (searchQuery) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter(c =>
      c.body.toLowerCase().includes(q) || c.author.toLowerCase().includes(q)
    )
  }

  function handleExport() {
    const exportData = {
      post: {
        title: post.title,
        author: post.author,
        subreddit: post.subreddit,
        url: post.url,
        score: post.score,
        num_comments: post.num_comments,
        created: formatDate(post.created_utc),
      },
      stats,
      comments: comments.map(c => ({
        id: c.id,
        author: c.author,
        body: c.body,
        score: c.score,
        depth: c.depth,
        date: formatDate(c.created_utc),
      }))
    }
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reddit_${post.id}_comments.json`
    a.click()
    URL.revokeObjectURL(url)
    setExportMsg('Exported!')
    setTimeout(() => setExportMsg(''), 2000)
  }

  return (
    <div className="fade-in" style={styles.container}>
      {/* Post Card */}
      <div style={styles.postCard}>
        <div style={styles.postHeader}>
          <span style={styles.subreddit}>{post.subreddit}</span>
          <span style={styles.postMeta}>by u/{post.author} • {formatDate(post.created_utc)}</span>
          {post.is_locked && <span style={styles.lockedBadge}>🔒 Locked</span>}
        </div>
        <h2 style={styles.postTitle}>{post.title}</h2>
        {post.selftext && (
          <p style={styles.selftext}>{post.selftext.slice(0, 300)}{post.selftext.length > 300 ? '…' : ''}</p>
        )}
        <div style={styles.postStats}>
          <Stat label="Score" value={formatScore(post.score)} color="var(--accent)" />
          <Stat label="Upvote ratio" value={`${Math.round(post.upvote_ratio * 100)}%`} />
          <Stat label="Total comments" value={post.num_comments} />
          <Stat label="Scraped" value={stats.total_scraped} color="var(--green)" />
          <Stat label="Deleted/removed" value={stats.deleted_or_removed} color="var(--red)" />
        </div>
      </div>

      {/* Controls */}
      <div style={styles.controls}>
        <div style={styles.filterGroup}>
          {['all', 'top', 'visible'].map(f => (
            <button
              key={f}
              style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'All' : f === 'top' ? 'Top 20' : 'Visible only'}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Search comments..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={styles.searchInput}
        />
        <button style={styles.exportBtn} onClick={handleExport}>
          {exportMsg || '↓ Export JSON'}
        </button>
      </div>

      {/* Count */}
      <div style={styles.count}>
        Showing <strong>{filtered.length}</strong> top-level comments
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Comments */}
      <div style={styles.commentsList}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>No comments match your filter.</div>
        ) : (
          filtered.map((comment, i) => (
            <CommentNode key={comment.id + i} comment={comment} allComments={comments} />
          ))
        )}
      </div>
    </div>
  )
}

function Stat({ label, value, color }) {
  return (
    <div style={styles.stat}>
      <span style={{ ...styles.statValue, color: color || 'var(--text)' }}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  )
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '16px' },
  postCard: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  postHeader: { display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  subreddit: {
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--accent)',
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent-border)',
    padding: '2px 8px',
    borderRadius: '4px',
  },
  postMeta: { color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--mono)' },
  lockedBadge: { fontSize: '11px', color: 'var(--yellow)', marginLeft: 'auto' },
  postTitle: { fontSize: '18px', fontWeight: 600, lineHeight: 1.3, color: 'var(--text)' },
  selftext: { color: 'var(--text-dim)', fontSize: '13px', lineHeight: 1.6 },
  postStats: { display: 'flex', gap: '24px', paddingTop: '8px', borderTop: '1px solid var(--border)', flexWrap: 'wrap' },
  stat: { display: 'flex', flexDirection: 'column', gap: '2px' },
  statValue: { fontFamily: 'var(--mono)', fontSize: '15px', fontWeight: 600 },
  statLabel: { fontSize: '11px', color: 'var(--text-dimmer)', textTransform: 'uppercase', letterSpacing: '0.05em' },
  controls: { display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' },
  filterGroup: { display: 'flex', gap: '4px' },
  filterBtn: {
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '6px 12px',
    color: 'var(--text-dim)',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  filterBtnActive: {
    background: 'var(--accent-dim)',
    border: '1px solid var(--accent-border)',
    color: 'var(--accent)',
  },
  searchInput: {
    flex: 1,
    minWidth: '180px',
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '6px 12px',
    color: 'var(--text)',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    outline: 'none',
  },
  exportBtn: {
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '6px 14px',
    color: 'var(--green)',
    fontFamily: 'var(--mono)',
    fontSize: '12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  count: { color: 'var(--text-dim)', fontSize: '12px', fontFamily: 'var(--mono)' },
  commentsList: { display: 'flex', flexDirection: 'column', gap: '2px' },
  empty: { padding: '40px', textAlign: 'center', color: 'var(--text-dimmer)', fontFamily: 'var(--mono)' },
  comment: {
    display: 'flex',
    gap: '0',
    position: 'relative',
    padding: '10px 0',
    borderBottom: '1px solid var(--border)',
  },
  depthLine: {
    width: '2px',
    flexShrink: 0,
    marginRight: '12px',
    borderRadius: '2px',
  },
  commentInner: { flex: 1 },
  commentMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '6px',
    flexWrap: 'wrap',
  },
  author: { fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text)' },
  score: { fontFamily: 'var(--mono)', fontSize: '11px', fontWeight: 500 },
  date: { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dimmer)' },
  collapseBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-dimmer)',
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    cursor: 'pointer',
    padding: 0,
  },
  body: { fontSize: '13px', lineHeight: 1.7, color: 'var(--text)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
}
