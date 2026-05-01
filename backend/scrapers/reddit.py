import httpx
import re
from fastapi import HTTPException
from typing import Optional

HEADERS = {
    "User-Agent": "SocialCommentScraper/1.0 (Bachelor Thesis Project)"
}

def parse_reddit_url(url: str) -> Optional[str]:
    """
    Extract the base post URL and normalize it to Reddit's JSON endpoint.
    Handles both old.reddit.com and www.reddit.com formats.
    Returns the JSON API URL or None if invalid.
    """
    # Normalize URL
    url = url.strip().rstrip("/")
    url = re.sub(r"https?://(old\.|www\.)?reddit\.com", "https://www.reddit.com", url)

    # Match pattern: /r/subreddit/comments/post_id/...
    pattern = r"https://www\.reddit\.com/r/[^/]+/comments/[^/]+"
    match = re.match(pattern, url)
    if not match:
        return None

    base_url = match.group(0)
    return base_url + "/.json"

def flatten_comments(children: list, depth: int = 0) -> list:
    """
    Recursively flatten nested Reddit comment tree into a flat list.
    """
    result = []
    for child in children:
        if child.get("kind") == "t1":  # t1 = comment
            data = child["data"]
            comment = {
                "id": data.get("id", ""),
                "author": data.get("author", "[deleted]"),
                "body": data.get("body", ""),
                "score": data.get("score", 0),
                "depth": depth,
                "created_utc": data.get("created_utc", 0),
                "permalink": "https://www.reddit.com" + data.get("permalink", ""),
                "is_deleted": data.get("body") in ["[deleted]", "[removed]", None],
                "replies_count": 0,
            }

            # Recurse into replies
            replies_data = data.get("replies")
            if isinstance(replies_data, dict):
                reply_children = replies_data.get("data", {}).get("children", [])
                nested = flatten_comments(reply_children, depth + 1)
                comment["replies_count"] = len([r for r in nested if r["depth"] == depth + 1])
                result.append(comment)
                result.extend(nested)
            else:
                result.append(comment)

        elif child.get("kind") == "more":
            # "Load more comments" placeholder — skip for simplicity
            pass

    return result

async def scrape_reddit(url: str) -> dict:
    json_url = parse_reddit_url(url)

    if not json_url:
        raise HTTPException(
            status_code=400,
            detail="Invalid Reddit URL. Expected format: https://www.reddit.com/r/subreddit/comments/post_id/..."
        )

    async with httpx.AsyncClient(headers=HEADERS, follow_redirects=True, timeout=15.0) as client:
        try:
            response = await client.get(json_url)
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Reddit request timed out. Try again.")
        except httpx.RequestError as e:
            raise HTTPException(status_code=502, detail=f"Network error: {str(e)}")

    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Post not found. The post may have been deleted.")
    elif response.status_code == 403:
        raise HTTPException(
            status_code=403,
            detail="This subreddit or post is private and cannot be accessed."
        )
    elif response.status_code != 200:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Reddit returned an unexpected status: {response.status_code}"
        )

    try:
        data = response.json()
    except Exception:
        raise HTTPException(status_code=502, detail="Failed to parse Reddit response.")

    if not isinstance(data, list) or len(data) < 2:
        raise HTTPException(status_code=502, detail="Unexpected Reddit API response structure.")

    # Post metadata (first element)
    post_listing = data[0]["data"]["children"]
    if not post_listing:
        raise HTTPException(status_code=404, detail="Post data not found.")

    post_data = post_listing[0]["data"]

    post = {
        "id": post_data.get("id", ""),
        "title": post_data.get("title", ""),
        "author": post_data.get("author", "[deleted]"),
        "subreddit": post_data.get("subreddit_name_prefixed", ""),
        "score": post_data.get("score", 0),
        "upvote_ratio": post_data.get("upvote_ratio", 0),
        "url": post_data.get("url", url),
        "selftext": post_data.get("selftext", ""),
        "created_utc": post_data.get("created_utc", 0),
        "num_comments": post_data.get("num_comments", 0),
        "is_locked": post_data.get("locked", False),
    }

    # Comments (second element)
    comment_children = data[1]["data"]["children"]
    comments = flatten_comments(comment_children)

    # Filter out deleted/removed
    visible_comments = [c for c in comments if not c["is_deleted"]]

    return {
        "platform": "reddit",
        "status": "success",
        "post": post,
        "comments": comments,
        "stats": {
            "total_scraped": len(comments),
            "visible": len(visible_comments),
            "deleted_or_removed": len(comments) - len(visible_comments),
        }
    }