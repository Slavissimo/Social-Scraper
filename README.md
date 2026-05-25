# Social Comment Scraper

Bachelor Thesis Demo — scrapes public social media comments for analysis.

## Supported Platforms

| Platform  | Status        | Method                          |
|-----------|---------------|---------------------------------|
| Reddit    | ✅ Full        | Public JSON API — no key needed |
| YouTube   | ✅ Full        | YouTube Data API v3 — free key  |
| Facebook  | ⚠️ Stub        | Requires Meta Graph API + App Review |
| Instagram | ⚠️ Stub        | Requires Meta Graph API + App Review |

## Setup

### Backend

```bash
cd backend
pip install -r requirements.txt

# Configure YouTube API key
cp .env.example .env
# Edit .env and add your YOUTUBE_API_KEY
# Get a free key at https://console.cloud.google.com/
# → Enable "YouTube Data API v3" → Create credentials → API key

uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Getting a YouTube API Key (free)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or use an existing one)
3. Navigate to **APIs & Services → Library**
4. Search for **"YouTube Data API v3"** and enable it
5. Go to **APIs & Services → Credentials → Create Credentials → API key**
6. Copy the key into `backend/.env` as `YOUTUBE_API_KEY=...`

Free quota: **10,000 units/day** — one comment fetch costs 1 unit, so this is generous for thesis demo use.

## Example URLs

**Reddit:**
```
https://www.reddit.com/r/python/comments/abc123/my_post/
```

**YouTube:**
```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
https://youtu.be/dQw4w9WgXcQ
https://www.youtube.com/shorts/VIDEO_ID
```

**Facebook / Instagram** (returns architecture documentation stub):
```
https://www.facebook.com/somepost/123
https://www.instagram.com/p/ABC123/
```

## Architecture

```
frontend/ (React + Vite)
  src/
    App.jsx                    — main layout, routing between result views
    components/
      RedditResults.jsx        — renders Reddit post + threaded comments
      YouTubeResults.jsx       — renders YouTube video + comments
      RestrictedResults.jsx    — renders API stub documentation
      PlatformStatus.jsx       — sidebar platform support overview
      UrlInput.jsx             — URL input with platform detection
    hooks/useScraper.js        — fetch state management
    utils/api.js               — API calls, platform detection helpers

backend/ (FastAPI + Python)
  main.py                      — routes, platform detection, CORS
  scrapers/
    reddit.py                  — Reddit public JSON API scraper
    youtube.py                 — YouTube Data API v3 scraper
    platform_stubs.py          — structured stubs for Facebook/Instagram
```

## Stack

- **Frontend:** React 18, Vite
- **Backend:** FastAPI, httpx, Python 3.12
- **APIs:** Reddit public JSON (no auth), YouTube Data API v3 (free key)
