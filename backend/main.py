from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from scrapers.reddit import scrape_reddit
from scrapers.platform_stubs import scrape_stub
import os
import re

app = FastAPI(title="Social Comment Scraper API")

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScrapeRequest(BaseModel):
    url: str

def detect_platform(url: str) -> str:
    url = url.lower()
    if "reddit.com" in url:
        return "reddit"
    elif "twitter.com" in url or "x.com" in url:
        return "x"
    elif "facebook.com" in url or "fb.com" in url:
        return "facebook"
    elif "instagram.com" in url:
        return "instagram"
    return "unknown"

@app.get("/")
def root():
    return {"status": "Social Comment Scraper API is running"}

@app.post("/api/scrape")
async def scrape(request: ScrapeRequest):
    url = request.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL cannot be empty")

    platform = detect_platform(url)

    if platform == "unknown":
        raise HTTPException(
            status_code=400,
            detail="URL not recognized. Supported platforms: Reddit, X (Twitter), Facebook, Instagram"
        )

    if platform == "reddit":
        return await scrape_reddit(url)
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
                "description": "Full scraping via public JSON API",
                "example": "https://www.reddit.com/r/python/comments/xxx/post_title/"
            },
            {
                "id": "x",
                "name": "X (Twitter)",
                "status": "restricted",
                "description": "API access requires paid subscription ($100+/month). Scraping is blocked.",
                "example": "https://x.com/user/status/123456789"
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