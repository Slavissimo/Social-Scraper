const API_BASE = '/api'

export async function scrapeUrl(url) {
  const res = await fetch(`${API_BASE}/scrape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  })
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.detail || `Server error: ${res.status}`)
  }
  return data
}

export async function getPlatforms() {
  const res = await fetch(`${API_BASE}/platforms`)
  if (!res.ok) throw new Error('Failed to load platform info')
  return res.json()
}

export function formatDate(utcSeconds) {
  if (!utcSeconds) return 'Unknown'
  return new Date(utcSeconds * 1000).toLocaleString()
}

export function formatScore(score) {
  if (score >= 1000) return `${(score / 1000).toFixed(1)}k`
  return String(score)
}

export function detectPlatform(url) {
  const lower = url.toLowerCase()
  if (lower.includes('reddit.com')) return 'reddit'
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'x'
  if (lower.includes('facebook.com') || lower.includes('fb.com')) return 'facebook'
  if (lower.includes('instagram.com')) return 'instagram'
  return null
}

export const PLATFORM_META = {
  reddit: { label: 'Reddit', color: '#ff4500', status: 'supported' },
  x: { label: 'X (Twitter)', color: '#1d9bf0', status: 'restricted' },
  facebook: { label: 'Facebook', color: '#1877f2', status: 'restricted' },
  instagram: { label: 'Instagram', color: '#e1306c', status: 'restricted' },
}