import requests
import re

AIC_BASE_URL = "https://api.artic.edu/api/v1"
DEFAULT_FIELDS = "id,title,artist_display,date_display,image_id,thumbnail,short_description,description"


def _clean_text(value):
    if not value:
        return None

    # AIC descriptions are sometimes HTML-formatted (e.g., <p>...</p>).
    text = re.sub(r"<[^>]+>", " ", str(value))
    text = re.sub(r"\s+", " ", text).strip()
    return text or None


def _build_image_url(image_id):
    if not image_id:
        return None
    return f"https://www.artic.edu/iiif/2/{image_id}/full/843,/0/default.jpg"


def _normalize_artwork(item):
    image_id = item.get("image_id")
    description = _clean_text(item.get("short_description") or item.get("description"))
    return {
        "id": item.get("id"),
        "title": item.get("title"),
        "artist": item.get("artist_display"),
        "date": item.get("date_display"),
        "imageUrl": _build_image_url(image_id),
        "thumbnail": item.get("thumbnail"),
        "description": description,
    }


def fetch_artworks(page=1, limit=12, q=None):
    url = f"{AIC_BASE_URL}/artworks/search" if q else f"{AIC_BASE_URL}/artworks"
    params = {
        "page": page,
        "limit": limit,
        "fields": DEFAULT_FIELDS,
    }
    if q:
        params["q"] = q

    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()

    return {
        "data": [_normalize_artwork(item) for item in payload.get("data", [])],
        "pagination": payload.get("pagination", {}),
        "info": payload.get("info", {}),
    }


def fetch_artwork_detail(artwork_id):
    url = f"{AIC_BASE_URL}/artworks/{artwork_id}"
    params = {"fields": DEFAULT_FIELDS}
    response = requests.get(url, params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()

    item = payload.get("data", {}) or {}
    return _normalize_artwork(item)
