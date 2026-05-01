"""
Stubs for platforms that cannot be scraped due to API restrictions.
These return structured responses explaining WHY the platform is not supported,
which is useful for thesis documentation and presentation.
"""

PLATFORM_INFO = {
    "x": {
        "name": "X (Twitter)",
        "reason": "API access is restricted",
        "technical_detail": (
            "Twitter's API v2 requires a paid subscription (Basic at $100/month or higher) "
            "to access tweet data. The free tier only allows posting. "
            "Unofficial scraping is actively blocked via bot detection (Cloudflare, rate limiting, "
            "login walls) and violates the Terms of Service."
        ),
        "architecture_note": (
            "A full implementation would use Twitter API v2 with OAuth 2.0 Bearer Token, "
            "calling GET /2/tweets/:id and GET /2/tweets/:id/quote_tweets for replies. "
            "The response would be paginated using next_token cursors."
        ),
        "relevant_endpoints": [
            "GET https://api.twitter.com/2/tweets/:id",
            "GET https://api.twitter.com/2/tweets/search/recent",
        ]
    },
    "facebook": {
        "name": "Facebook",
        "reason": "Requires authenticated Graph API with app review",
        "technical_detail": (
            "Facebook's Graph API requires an approved Facebook App and user authentication "
            "via OAuth. Public post comments are only accessible if the user grants the "
            "'pages_read_engagement' permission. Meta actively blocks all unauthenticated scraping "
            "and has legal history of pursuing scrapers (hiQ Labs v. LinkedIn precedent applies)."
        ),
        "architecture_note": (
            "A full implementation would use Graph API v18+ with a Page Access Token, "
            "calling /{post-id}/comments with fields=message,from,like_count,created_time. "
            "Would require OAuth 2.0 login flow and app review approval from Meta."
        ),
        "relevant_endpoints": [
            "GET https://graph.facebook.com/v18.0/{post-id}/comments",
            "GET https://graph.facebook.com/v18.0/{comment-id}/comments (nested)",
        ]
    },
    "instagram": {
        "name": "Instagram",
        "reason": "Owned by Meta, same restrictions as Facebook",
        "technical_detail": (
            "Instagram's Basic Display API was deprecated in late 2024. "
            "The Instagram Graph API requires a Business/Creator account linked to a Facebook Page, "
            "plus app review. All public scraping (including via tools like Instaloader) "
            "violates ToS and is blocked via CAPTCHA and rate limiting."
        ),
        "architecture_note": (
            "A full implementation would use the Instagram Graph API with a long-lived access token, "
            "calling GET /{media-id}/comments with fields=text,username,timestamp. "
            "The account must be a professional account and the media must be owned by that account."
        ),
        "relevant_endpoints": [
            "GET https://graph.instagram.com/{media-id}/comments",
            "GET https://graph.instagram.com/me/media",
        ]
    }
}

def scrape_stub(platform: str, url: str) -> dict:
    info = PLATFORM_INFO.get(platform, {
        "name": platform.capitalize(),
        "reason": "Platform not supported",
        "technical_detail": "This platform has not been implemented.",
        "architecture_note": "No architecture available.",
        "relevant_endpoints": []
    })

    return {
        "platform": platform,
        "status": "not_implemented",
        "url": url,
        "platform_name": info["name"],
        "reason": info["reason"],
        "technical_detail": info["technical_detail"],
        "architecture_note": info["architecture_note"],
        "relevant_endpoints": info["relevant_endpoints"],
    }
