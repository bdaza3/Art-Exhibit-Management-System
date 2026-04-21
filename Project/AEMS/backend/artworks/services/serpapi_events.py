import os
from pathlib import Path
import requests

SERPAPI_SEARCH_URL = "https://serpapi.com/search.json"
DEFAULT_EVENTS_QUERY = "Art Events in Chicago"
DEFAULT_NUM = 10
MAX_NUM = 20
MAX_PAGES = 3


def _load_backend_env_file():
    env_path = Path(__file__).resolve().parents[2] / ".env"
    if not env_path.exists():
        return

    for raw_line in env_path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if key and key not in os.environ:
            os.environ[key] = value


def _normalize_serp_event(item):
    date_info = item.get("date") if isinstance(item.get("date"), dict) else {}
    address_parts = item.get("address") if isinstance(item.get("address"), list) else []

    return {
        "title": item.get("title"),
        "startDate": date_info.get("start_date"),
        "when": date_info.get("when"),
        "address": ", ".join(part for part in address_parts if part),
        "description": item.get("description"),
        "link": item.get("link"),
        "thumbnail": item.get("thumbnail"),
    }


def _event_key(item):
    return (
        str(item.get("title") or "").strip().lower(),
        str(item.get("startDate") or "").strip(),
        str(item.get("address") or "").strip().lower(),
    )


def fetch_serpapi_art_events(query=DEFAULT_EVENTS_QUERY, page=1, num=DEFAULT_NUM, pages=1):
    _load_backend_env_file()
    api_key = os.getenv("SERPAPI_API_KEY")
    if not api_key:
        raise ValueError("SERPAPI_API_KEY is not set.")

    page = max(1, int(page or 1))
    num = max(1, min(MAX_NUM, int(num or DEFAULT_NUM)))
    pages = max(1, min(MAX_PAGES, int(pages or 1)))

    all_events = []

    for page_offset in range(pages):
        start = (page - 1 + page_offset) * num

        params = {
            "engine": "google_events",
            "q": query or DEFAULT_EVENTS_QUERY,
            "api_key": api_key,
            "num": num,
            "start": start,
        }

        response = requests.get(SERPAPI_SEARCH_URL, params=params, timeout=15)
        response.raise_for_status()
        payload = response.json()

        events_results = payload.get("events_results", [])
        all_events.extend(_normalize_serp_event(item) for item in events_results)

    deduped = list({
        _event_key(item): item
        for item in all_events
    }.values())

    return {
        "query": query or DEFAULT_EVENTS_QUERY,
        "page": page,
        "num": num,
        "pages": pages,
        "data": deduped,
        "count": len(deduped),
    }
