import requests
import re
from datetime import date

AIC_BASE_URL = "https://api.artic.edu/api/v1"
DEFAULT_FIELDS = "id,title,artist_display,date_display,image_id,thumbnail,short_description,description"
DEFAULT_EVENT_FIELDS = "id,title,short_description,description,image_url,start_date,end_date,start_time,end_time,date_display,location"


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


def _normalize_iso_date(value):
    if not value:
        return None
    value = str(value)
    # Keep only YYYY-MM-DD for frontend date formatting.
    return value[:10] if len(value) >= 10 else None


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


def _normalize_event(item):
    start_date = _normalize_iso_date(item.get("start_date"))
    end_date = _normalize_iso_date(item.get("end_date")) or start_date
    start_time = item.get("start_time")
    end_time = item.get("end_time")

    if start_time and end_time:
        time_display = f"{start_time} - {end_time}"
    elif start_time:
        time_display = str(start_time)
    else:
        time_display = "Museum Hours"

    parsed_start = None
    parsed_end = None
    try:
        parsed_start = date.fromisoformat(start_date) if start_date else None
    except ValueError:
        parsed_start = None
    try:
        parsed_end = date.fromisoformat(end_date) if end_date else None
    except ValueError:
        parsed_end = None

    today = date.today()
    status = "Ongoing" if (parsed_start and parsed_start <= today <= (parsed_end or parsed_start)) else "Upcoming"

    return {
        "id": f"aic-evt-{item.get('id')}",
        "sourceId": item.get("id"),
        "title": item.get("title") or "Untitled Event",
        "museum": "The Art Institute of Chicago",
        "city": "Chicago, IL",
        "startDate": start_date,
        "endDate": end_date,
        "time": time_display,
        "description": _clean_text(item.get("short_description") or item.get("description")) or "No description available.",
        "highlights": [item.get("date_display")] if item.get("date_display") else [],
        "image": item.get("image_url"),
        "ticketFrom": 20,
        "status": status,
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


def fetch_exhibition_events(page=1, limit=12, q=None):
    params = {
        "page": page,
        "limit": limit,
        "fields": DEFAULT_EVENT_FIELDS,
    }
    if q:
        params["q"] = q

    response = requests.get(f"{AIC_BASE_URL}/events", params=params, timeout=10)
    response.raise_for_status()
    payload = response.json()

    normalized = [_normalize_event(item) for item in payload.get("data", [])]
    # Keep only current and upcoming events for customer-facing listings.
    today = date.today()
    filtered = []
    for event in normalized:
        start_str = event.get("startDate")
        end_str = event.get("endDate") or start_str
        if not start_str:
            continue
        try:
            start_dt = date.fromisoformat(start_str)
            end_dt = date.fromisoformat(end_str) if end_str else start_dt
        except ValueError:
            continue

        if end_dt >= today:
            filtered.append(event)

    filtered.sort(key=lambda x: x.get("startDate") or "9999-12-31")

    return {
        "data": filtered,
        "pagination": payload.get("pagination", {}),
        "info": payload.get("info", {}),
    }
