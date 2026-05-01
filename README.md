# Social Comment Scraper
**Bachelor Thesis Demo Project**

A full-stack web application that scrapes comments from social media posts.
Built with **React** (frontend) + **FastAPI** (backend).

---

## Platform Support

| Platform  | Status        | Method                          |
|-----------|---------------|---------------------------------|
| Reddit    | ✅ Full        | Public JSON API (no key needed) |
| X/Twitter | ⚠️ Stub        | Paid API required ($100+/mo)    |
| Facebook  | ⚠️ Stub        | Meta Graph API + app review     |
| Instagram | ⚠️ Stub        | Meta Graph API + app review     |

---

## Project Structure

```
social-scraper/
├── backend/
│   ├── main.py                    # FastAPI app, routing, platform detection
│   ├── requirements.txt
│   └── scrapers/
│       ├── reddit.py              # Full Reddit scraper (public JSON API)
│       └── platform_stubs.py     # Structured stubs for restricted platforms
│
└── frontend/
    ├── src/
    │   ├── App.jsx                # Main layout and state
    │   ├── components/
    │   │   ├── UrlInput.jsx       # URL input with live platform detection
    │   │   ├── RedditResults.jsx  # Comment tree, filters, export
    │   │   ├── RestrictedResults.jsx  # Architecture docs for unsupported platforms
    │   │   └── PlatformStatus.jsx # Sidebar status panel
    │   ├── hooks/
    │   │   └── useScraper.js      # Async scraping hook
    │   └── utils/
    │       └── api.js             # API calls and helpers
    └── vite.config.js             # Vite proxy → backend
```

---

## Setup & Running

### 1. Backend (Pop!_OS + pipx)

```bash
# Install uvicorn as a pipx app (once)
pipx install uvicorn[standard]

# Inject the backend dependencies into that environment (once)
pipx inject uvicorn fastapi httpx pydantic

# Run the server
cd backend
pipx run --spec uvicorn[standard] uvicorn main:app --reload --port 8000
```

API will be available at: `http://localhost:8000`  
Interactive docs: `http://localhost:8000/docs`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App will open at: `http://localhost:5173`

---

## API Endpoints

### `POST /api/scrape`
Accepts a URL and returns scraped data or a structured stub response.

**Request:**
```json
{ "url": "https://www.reddit.com/r/python/comments/abc123/..." }
```

**Reddit Response:**
```json
{
  "platform": "reddit",
  "status": "success",
  "post": { "title": "...", "author": "...", "score": 123, ... },
  "comments": [ { "id": "...", "author": "...", "body": "...", "depth": 0, ... } ],
  "stats": { "total_scraped": 45, "visible": 42, "deleted_or_removed": 3 }
}
```

**Restricted Platform Response:**
```json
{
  "platform": "instagram",
  "status": "not_implemented",
  "reason": "Owned by Meta...",
  "technical_detail": "...",
  "architecture_note": "...",
  "relevant_endpoints": ["..."]
}
```

### `GET /api/platforms`
Returns support status for all platforms.

---

## Reddit Scraper Technical Notes

- Uses `https://reddit.com/r/.../comments/.../.json` — no authentication required
- Recursively flattens the nested comment tree (handles arbitrary depth)
- Handles `[deleted]` / `[removed]` comments
- Detects private/deleted posts via HTTP 403/404 responses
- User-Agent set to comply with Reddit's API guidelines

---

## How to Extend

To add real X/Twitter support:
1. Get API credentials at `developer.twitter.com` (Basic plan minimum)
2. Implement `scrapers/twitter.py` using `GET /2/tweets/:id` with Bearer Token
3. Wire it in `main.py` under `platform == "x"`

Same pattern applies for Facebook and Instagram via Meta's Graph API.
