import { formatDate } from '../utils/api'

export function YouTubeResults({ data }) {
  const { video, comments, stats } = data

  return (
    <div style={styles.container}>
      {/* Video metadata card */}
      <div style={styles.videoCard}>
        <div style={styles.videoTop}>
          {video.thumbnail && (
            <img src={video.thumbnail} alt="thumbnail" style={styles.thumbnail} />
          )}
          <div style={styles.videoMeta}>
            <div style={styles.platformRow}>
              <span style={styles.platformBadge}>▶ YouTube</span>
              {video.comments_disabled && (
                <span style={styles.disabledBadge}>Comments disabled</span>
              )}
            </div>
            <h2 style={styles.videoTitle}>{video.title}</h2>
            <div style={styles.channelRow}>
              <span style={styles.channel}>{video.channel}</span>
              <span style={styles.sep}>·</span>
              <span style={styles.date}>{video.published_at ? new Date(video.published_at).toLocaleDateString() : ''}</span>
            </div>
            <div style={styles.statsRow}>
              <Stat label="Views" value={fmtNum(video.view_count)} />
              {video.like_count != null && <Stat label="Likes" value={fmtNum(video.like_count)} />}
              {video.comment_count != null && <Stat label="Comments" value={fmtNum(video.comment_count)} />}
            </div>
          </div>
        </div>
        {video.description && (
          <p style={styles.description}>{video.description}{video.description.length >= 500 ? '…' : ''}</p>
        )}
      </div>

      {/* Scrape stats bar */}
      <div style={styles.statsBar}>
        <span style={styles.statsLabel}>Scraped</span>
        <span style={styles.statsValue}>{stats.total_scraped} comments</span>
        {stats.next_page_token && (
          <span style={styles.statsNote}>(first 100 shown — video has more)</span>
        )}
        {stats.note && <span style={styles.statsNote}>{stats.note}</span>}
      </div>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div style={styles.commentsList}>
          {comments.map((c, i) => (
            <CommentRow key={c.id || i} comment={c} />
          ))}
        </div>
      ) : (
        <div style={styles.noComments}>
          {video.comments_disabled ? 'Comments are disabled on this video.' : 'No comments found.'}
        </div>
      )}
    </div>
  )
}

function CommentRow({ comment }) {
  const isReply = comment.depth > 0
  return (
    <div style={{
      ...styles.comment,
      marginLeft: isReply ? '32px' : '0',
      borderLeft: isReply ? '2px solid var(--border)' : 'none',
      paddingLeft: isReply ? '16px' : '0',
      opacity: isReply ? 0.88 : 1,
    }}>
      <div style={styles.commentHeader}>
        <div style={styles.commentLeft}>
          <span style={styles.avatar}>{comment.author?.[0]?.toUpperCase() || '?'}</span>
          <span style={styles.author}>{comment.author}</span>
          {isReply && <span style={styles.replyTag}>reply</span>}
        </div>
        <div style={styles.commentRight}>
          {comment.like_count > 0 && (
            <span style={styles.likes}>♥ {fmtNum(comment.like_count)}</span>
          )}
          <span style={styles.commentDate}>
            {comment.published_at ? new Date(comment.published_at).toLocaleDateString() : ''}
          </span>
        </div>
      </div>
      <p style={styles.commentBody}>{comment.body}</p>
      {comment.reply_count > 0 && (
        <span style={styles.replyCount}>{comment.reply_count} {comment.reply_count === 1 ? 'reply' : 'replies'}</span>
      )}
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div style={styles.stat}>
      <span style={styles.statValue}>{value}</span>
      <span style={styles.statLabel}>{label}</span>
    </div>
  )
}

function fmtNum(n) {
  if (n == null) return '—'
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

const styles = {
  container: { display: 'flex', flexDirection: 'column', gap: '14px' },

  videoCard: {
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    overflow: 'hidden',
  },
  videoTop: {
    display: 'flex',
    gap: '16px',
    padding: '20px',
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: '160px',
    minWidth: '160px',
    height: '90px',
    objectFit: 'cover',
    borderRadius: '6px',
    border: '1px solid var(--border)',
  },
  videoMeta: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  platformRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  platformBadge: {
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    color: '#ff0000',
    background: 'rgba(255,0,0,0.08)',
    border: '1px solid rgba(255,0,0,0.2)',
    borderRadius: '4px',
    padding: '2px 8px',
    fontWeight: 700,
  },
  disabledBadge: {
    fontFamily: 'var(--mono)',
    fontSize: '10px',
    color: 'var(--text-dimmer)',
    background: 'var(--bg-4)',
    border: '1px solid var(--border)',
    borderRadius: '4px',
    padding: '2px 8px',
  },
  videoTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: 'var(--text)',
    lineHeight: 1.4,
    margin: 0,
  },
  channelRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  channel: { fontFamily: 'var(--mono)', fontSize: '12px', color: 'var(--accent)', fontWeight: 600 },
  sep: { color: 'var(--border)', fontSize: '12px' },
  date: { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dimmer)' },
  statsRow: { display: 'flex', gap: '16px', marginTop: '4px' },
  stat: { display: 'flex', flexDirection: 'column', gap: '1px' },
  statValue: { fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, color: 'var(--text)' },
  statLabel: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dimmer)', textTransform: 'uppercase' },
  description: {
    fontSize: '12px',
    color: 'var(--text-dimmer)',
    lineHeight: 1.6,
    padding: '0 20px 16px',
    margin: 0,
    borderTop: '1px solid var(--border)',
    paddingTop: '14px',
  },

  statsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
  },
  statsLabel: { fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--text-dimmer)', textTransform: 'uppercase' },
  statsValue: { fontFamily: 'var(--mono)', fontSize: '13px', fontWeight: 700, color: 'var(--green)' },
  statsNote: { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dimmer)' },

  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    background: 'var(--border)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    overflow: 'hidden',
  },
  comment: {
    background: 'var(--bg-2)',
    padding: '14px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  commentHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  commentLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--accent)',
    color: 'var(--bg)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    fontFamily: 'var(--mono)',
    flexShrink: 0,
    lineHeight: '24px',
    textAlign: 'center',
  },
  author: { fontFamily: 'var(--mono)', fontSize: '12px', fontWeight: 600, color: 'var(--text)' },
  replyTag: {
    fontFamily: 'var(--mono)',
    fontSize: '9px',
    color: 'var(--text-dimmer)',
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: '3px',
    padding: '1px 5px',
    textTransform: 'uppercase',
  },
  commentRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  likes: { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dimmer)' },
  commentDate: { fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text-dimmer)' },
  commentBody: { fontSize: '13px', color: 'var(--text)', lineHeight: 1.7, margin: 0 },
  replyCount: {
    fontFamily: 'var(--mono)',
    fontSize: '11px',
    color: 'var(--accent)',
    cursor: 'default',
  },
  noComments: {
    padding: '32px',
    textAlign: 'center',
    fontFamily: 'var(--mono)',
    fontSize: '13px',
    color: 'var(--text-dimmer)',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
  },
}
