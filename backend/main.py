from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from scrapers.reddit import scrape_reddit
from scrapers.youtube import scrape_youtube
from scrapers.platform_stubs import scrape_stub
from urllib.parse import urlparse
from typing import Optional
import os

app = FastAPI(title="Social Comment Scraper API")

# --- Rate limiting ---
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# --- CORS ---
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

# --- Security headers ---
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# --- URL allowlist (SSRF protection) ---
ALLOWED_DOMAINS = {
    "reddit.com", "www.reddit.com", "old.reddit.com",
    "youtube.com", "www.youtube.com", "youtu.be",
    "facebook.com", "www.facebook.com", "fb.com", "m.facebook.com",
    "instagram.com", "www.instagram.com",
}

def validate_url(url: str) -> str:
    try:
        parsed = urlparse(url)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL format")
    if parsed.scheme not in ("http", "https"):
        raise HTTPException(status_code=400, detail="URL must use http or https")
    domain = parsed.netloc.lower().split(":")[0]
    if domain not in ALLOWED_DOMAINS:
        raise HTTPException(
            status_code=400,
            detail="Domain not allowed. Supported platforms: Reddit, YouTube, Facebook, Instagram"
        )
    return url

def detect_platform(url: str) -> str:
    url = url.lower()
    if "reddit.com" in url:
        return "reddit"
    elif "youtube.com" in url or "youtu.be" in url:
        return "youtube"
    elif "facebook.com" in url or "fb.com" in url:
        return "facebook"
    elif "instagram.com" in url:
        return "instagram"
    return "unknown"

class ScrapeRequest(BaseModel):
    url: str
    page_token: Optional[str] = None

@app.get("/")
def root():
    return {"status": "Social Comment Scraper API is running"}

@app.post("/api/scrape")
@limiter.limit("10/minute")
async def scrape(request: Request, body: ScrapeRequest):
    url = body.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    validate_url(url)
    platform = detect_platform(url)

    if platform == "unknown":
        raise HTTPException(
            status_code=400,
            detail="URL not recognized. Supported platforms: Reddit, YouTube, Facebook, Instagram"
        )

    if platform == "reddit":
        return await scrape_reddit(url)
    elif platform == "youtube":
        return await scrape_youtube(url, page_token=body.page_token)
    else:
        return scrape_stub(platform, url)

@app.get("/api/platforms")
def get_platforms():
    return {
        "platforms": [
            {
                "id": "reddit",
                "name": "Reddit",
                "status": "supported",
                "description": "Full scraping via public JSON API — no key required",
                "example": "https://www.reddit.com/r/python/comments/xxx/post_title/"
            },
            {
                "id": "youtube",
                "name": "YouTube",
                "status": "supported",
                "description": "Full scraping via YouTube Data API v3 — free API key required",
                "example": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            },
            {
                "id": "facebook",
                "name": "Facebook",
                "status": "restricted",
                "description": "Requires authenticated Graph API access with app review approval.",
                "example": "https://www.facebook.com/post/123"
            },
            {
                "id": "instagram",
                "name": "Instagram",
                "status": "restricted",
                "description": "Owned by Meta. Requires authenticated API. Public scraping is blocked.",
                "example": "https://www.instagram.com/p/ABC123/"
            }
        ]
    }
