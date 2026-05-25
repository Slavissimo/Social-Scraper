"""
YouTube comment scraper using the YouTube Data API v3.

Requires a Google Cloud API key with YouTube Data API v3 enabled.
Set YOUTUBE_API_KEY in your environment or .env file.

Free quota: 10,000 units/day. One commentThreads request costs 1 unit.
"""

import httpx
import re
import os
from fastapi import HTTPException
from typing import Optional

YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3"


def extract_video_id(url: str) -> Optional[str]:
    """
    Extract YouTube video ID from various URL formats:
      - https://www.youtube.com/watch?v=VIDEO_ID
      - https://youtu.be/VIDEO_ID
      - https://www.youtube.com/shorts/VIDEO_ID
      - https://youtube.com/embed/VIDEO_ID
    """
    patterns = [
        r"(?:youtube\.com/watch\?(?:.*&)?v=)([a-zA-Z0-9_-]{11})",
        r"(?:youtu\.be/)([a-zA-Z0-9_-]{11})",
        r"(?:youtube\.com/shorts/)([a-zA-Z0-9_-]{11})",
        r"(?:youtube\.com/embed/)([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


async def scrape_youtube(url: str) -> dict:
    api_key = os.getenv("YOUTUBE_API_KEY", "").strip()
    if not api_key:
        raise HTTPException(
            status_code=503,
            detail=(
                "YouTube API key is not configured. "
                "Set YOUTUBE_API_KEY in your environment or .env file. "
                "Get a free key at https://console.cloud.google.com/"
            )
        )

    video_id = extract_video_id(url)
    if not video_id:
        raise HTTPException(
            status_code=400,
            detail="Invalid YouTube URL. Expected formats: youtube.com/watch?v=..., youtu.be/..., or youtube.com/shorts/..."
        )

    async with httpx.AsyncClient(timeout=15.0) as client:
        # --- Fetch video metadata ---
        try:
            video_resp = await client.get(
                f"{YOUTUBE_API_BASE}/videos",
                params={
                    "part": "snippet,statistics",
                    "id": video_id,
                    "key": api_key,
                }
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Network error fetching video: {str(e)}")

        if video_resp.status_code == 400:
            raise HTTPException(status_code=400, detail="Invalid YouTube API request. Check your API key.")
        elif video_resp.status_code == 403:
            data = video_resp.json()
            reason = data.get("error", {}).get("message", "Forbidden")
            raise HTTPException(
                status_code=403,
                detail=f"YouTube API access denied: {reason}. Your API key may be invalid or quota exhausted."
            )
        elif video_resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"YouTube API error: {video_resp.status_code}")

        video_data = video_resp.json()
        items = video_data.get("items", [])
        if not items:
            raise HTTPException(status_code=404, detail="Video not found or has been removed.")

        snippet = items[0]["snippet"]
        stats = items[0].get("statistics", {})

        # Check if comments are disabled
        comments_disabled = stats.get("commentCount") is None

        video = {
            "id": video_id,
            "title": snippet.get("title", ""),
            "channel": snippet.get("channelTitle", ""),
            "published_at": snippet.get("publishedAt", ""),
            "description": snippet.get("description", "")[:500],  # truncate long descriptions
            "view_count": int(stats.get("viewCount", 0)),
            "like_count": int(stats.get("likeCount", 0)) if stats.get("likeCount") else None,
            "comment_count": int(stats.get("commentCount", 0)) if stats.get("commentCount") else None,
            "thumbnail": snippet.get("thumbnails", {}).get("high", {}).get("url", ""),
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "comments_disabled": comments_disabled,
        }

        if comments_disabled:
            return {
                "platform": "youtube",
                "status": "success",
                "video": video,
                "comments": [],
                "stats": {
                    "total_scraped": 0,
                    "visible": 0,
                    "deleted_or_removed": 0,
                    "note": "Comments are disabled on this video."
                }
            }

        # --- Fetch top-level comment threads ---
        try:
            comments_resp = await client.get(
                f"{YOUTUBE_API_BASE}/commentThreads",
                params={
                    "part": "snippet,replies",
                    "videoId": video_id,
                    "key": api_key,
                    "maxResults": 100,
                    "order": "relevance",  # or "time"
                    "textFormat": "plainText",
                }
            )
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Network error fetching comments: {str(e)}")

        if comments_resp.status_code == 403:
            err_data = comments_resp.json()
            reason = err_data.get("error", {}).get("errors", [{}])[0].get("reason", "")
            if reason == "commentsDisabled":
                video["comments_disabled"] = True
                return {
                    "platform": "youtube",
                    "status": "success",
                    "video": video,
                    "comments": [],
                    "stats": {"total_scraped": 0, "visible": 0, "deleted_or_removed": 0,
                              "note": "Comments are disabled on this video."}
                }
            raise HTTPException(status_code=403, detail=f"YouTube API access denied for comments: {reason}")
        elif comments_resp.status_code != 200:
            raise HTTPException(status_code=502, detail=f"YouTube comments API error: {comments_resp.status_code}")

        comments_data = comments_resp.json()
        comment_threads = comments_data.get("items", [])

    # --- Flatten comment threads + replies ---
    comments = []
    for thread in comment_threads:
        top = thread["snippet"]["topLevelComment"]["snippet"]
        reply_count = thread["snippet"].get("totalReplyCount", 0)

        comment = {
            "id": thread["snippet"]["topLevelComment"]["id"],
            "author": top.get("authorDisplayName", "[unknown]"),
            "author_channel": top.get("authorChannelUrl", ""),
            "body": top.get("textDisplay", ""),
            "like_count": top.get("likeCount", 0),
            "published_at": top.get("publishedAt", ""),
            "updated_at": top.get("updatedAt", ""),
            "depth": 0,
            "reply_count": reply_count,
            "is_deleted": False,
        }
        comments.append(comment)

        # Include replies if present (up to 5 per thread from this call)
        replies = thread.get("replies", {}).get("comments", [])
        for reply in replies:
            rs = reply["snippet"]
            comments.append({
                "id": reply["id"],
                "author": rs.get("authorDisplayName", "[unknown]"),
                "author_channel": rs.get("authorChannelUrl", ""),
                "body": rs.get("textDisplay", ""),
                "like_count": rs.get("likeCount", 0),
                "published_at": rs.get("publishedAt", ""),
                "updated_at": rs.get("updatedAt", ""),
                "depth": 1,
                "reply_count": 0,
                "is_deleted": False,
            })

    return {
        "platform": "youtube",
        "status": "success",
        "video": video,
        "comments": comments,
        "stats": {
            "total_scraped": len(comments),
            "visible": len(comments),
            "deleted_or_removed": 0,
            "next_page_token": comments_data.get("nextPageToken"),
        }
    }
