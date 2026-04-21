import requests
from datetime import date
from django.contrib.auth import get_user_model
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .services.artic_api import fetch_artwork_detail, fetch_artworks, fetch_exhibition_events
from .services.serpapi_events import fetch_serpapi_art_events, DEFAULT_EVENTS_QUERY
from .models import Artwork, Order, ArchivedEvent
from .serializers import OrderSerializer


def _customer_from_request(request):
	User = get_user_model()
	if request.user.is_authenticated:
		return request.user

	customer = request.data.get("customer") or {}
	username = (
		request.data.get("customer_username")
		or request.data.get("username")
		or (customer.get("username") if isinstance(customer, dict) else None)
		or "guest_customer"
	)
	email = (customer.get("email") if isinstance(customer, dict) else "") or ""
	user, created = User.objects.get_or_create(
		username=username,
		defaults={"email": email, "role": "customer"},
	)
	if created:
		user.set_unusable_password()
		user.save(update_fields=["password"])
	return user


def _artwork_for_item(item):
	title = (item.get("title") or "Untitled purchase").strip()
	artwork, _ = Artwork.objects.get_or_create(
		title=title,
		defaults={
			"artist": item.get("artist") or "",
			"price": float(item.get("price") or 0),
			"image": item.get("image") or "",
			"category": item.get("type") or "Purchase",
			"description": "Created automatically from customer checkout.",
		},
	)
	return artwork


@csrf_exempt
@api_view(["GET", "POST"])
@permission_classes([AllowAny])
def list_orders(request):
	if request.method == "GET":
		orders = Order.objects.select_related("user", "artwork").all().order_by("-created_at")
		serializer = OrderSerializer(orders, many=True)
		return Response(serializer.data)

	items = request.data.get("items") or []
	if not isinstance(items, list) or not items:
		return Response({"error": "At least one cart item is required."}, status=status.HTTP_400_BAD_REQUEST)

	user = _customer_from_request(request)
	created_orders = []

	with transaction.atomic():
		for item in items:
			try:
				quantity = max(1, int(item.get("qty") or 1))
				price = float(item.get("price") or 0)
			except (TypeError, ValueError):
				return Response({"error": "Cart items must include numeric price and quantity."}, status=status.HTTP_400_BAD_REQUEST)

			artwork = _artwork_for_item(item)
			created_orders.append(
				Order.objects.create(
					user=user,
					artwork=artwork,
					quantity=quantity,
					total_price=price * quantity,
					status="Paid",
				)
			)

	serializer = OrderSerializer(created_orders, many=True)
	return Response(serializer.data, status=status.HTTP_201_CREATED)


@csrf_exempt
@api_view(["GET", "PUT", "PATCH", "DELETE"])
@permission_classes([AllowAny])
def order_detail(request, pk):
	try:
		order = Order.objects.select_related("user", "artwork").get(pk=pk)
	except Order.DoesNotExist:
		return Response({"error": "Order not found."}, status=status.HTTP_404_NOT_FOUND)

	if request.method == "GET":
		return Response(OrderSerializer(order).data)

	if request.method in ["PUT", "PATCH"]:
		status_value = request.data.get("status")
		valid_statuses = {choice[0] for choice in Order._meta.get_field("status").choices}
		if status_value not in valid_statuses:
			return Response({"error": "Status must be Pending, Paid, or Shipped."}, status=status.HTTP_400_BAD_REQUEST)
		order.status = status_value
		order.save(update_fields=["status"])
		return Response(OrderSerializer(order).data)

	order.delete()
	return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["GET"])
@permission_classes([AllowAny])
def list_artic_artworks(request):
	try:
		page = int(request.GET.get("page", 1))
		limit = int(request.GET.get("limit", 12))
	except ValueError:
		return Response({"detail": "page and limit must be integers."}, status=400)

	q = request.GET.get("q", "").strip() or None

	try:
		data = fetch_artworks(page=page, limit=limit, q=q)
		return Response(data)
	except requests.RequestException:
		return Response({"detail": "Failed to fetch Art Institute data."}, status=502)


@api_view(["GET"])
@permission_classes([AllowAny])
def artic_artwork_detail(request, artwork_id):
	try:
		data = fetch_artwork_detail(artwork_id=artwork_id)
		return Response(data)
	except requests.RequestException:
		return Response({"detail": "Failed to fetch Art Institute artwork detail."}, status=502)


@api_view(["GET"])
@permission_classes([AllowAny])
def list_artic_events(request):
	try:
		page = int(request.GET.get("page", 1))
		limit = int(request.GET.get("limit", 12))
	except ValueError:
		return Response({"detail": "page and limit must be integers."}, status=400)

	q = request.GET.get("q", "").strip() or None

	try:
		data = fetch_exhibition_events(page=page, limit=limit, q=q)
		return Response(data)
	except requests.RequestException:
		return Response({"detail": "Failed to fetch Art Institute exhibition events."}, status=502)


@api_view(["GET"])
@permission_classes([AllowAny])
def list_serpapi_art_events(request):
	q = request.GET.get("q", "").strip() or DEFAULT_EVENTS_QUERY
	try:
		page = int(request.GET.get("page", 1))
		num = int(request.GET.get("num", 10))
		pages = int(request.GET.get("pages", 1))
	except ValueError:
		return Response({"detail": "page, num, and pages must be integers."}, status=400)

	try:
		data = fetch_serpapi_art_events(query=q, page=page, num=num, pages=pages)
		return Response(data)
	except ValueError as exc:
		return Response({"detail": str(exc)}, status=500)
	except requests.RequestException:
		return Response({"detail": "Failed to fetch events from SerpApi."}, status=502)


def _parse_iso_date(value):
	if not value:
		return None
	text = str(value)[:10]
	try:
		return date.fromisoformat(text)
	except ValueError:
		return None


def _save_archived_events(items):
	for item in items:
		title = (item.get("title") or "Untitled Event").strip()
		source = item.get("source") or "aic"
		start_date_value = _parse_iso_date(item.get("startDate"))
		city = item.get("city") or "Chicago, IL"
		event_key = f"{source}|{title.lower()}|{start_date_value or ''}|{city.lower()}"

		ArchivedEvent.objects.update_or_create(
			event_key=event_key,
			defaults={
				"source": source,
				"source_event_id": str(item.get("sourceId") or "")[:255] or None,
				"title": title,
				"museum": item.get("museum") or "Chicago Art Events",
				"city": city,
				"start_date": start_date_value,
				"end_date": _parse_iso_date(item.get("endDate")) or start_date_value,
				"time_display": item.get("time") or item.get("when") or "Event Time TBA",
				"description": item.get("description") or "No description available.",
				"highlights": item.get("highlights") if isinstance(item.get("highlights"), list) else [],
				"image_url": item.get("image") or item.get("thumbnail"),
				"ticket_from": float(item.get("ticketFrom") or 20),
				"link": item.get("link"),
			},
		)


def _serialize_archived_events(queryset):
	data = []
	for event in queryset:
		data.append(
			{
				"id": f"arch-{event.id}",
				"source": event.source,
				"sourceId": event.source_event_id,
				"title": event.title,
				"museum": event.museum,
				"city": event.city,
				"startDate": event.start_date.isoformat() if event.start_date else None,
				"endDate": event.end_date.isoformat() if event.end_date else None,
				"time": event.time_display,
				"description": event.description,
				"highlights": event.highlights or [],
				"image": event.image_url,
				"ticketFrom": event.ticket_from,
				"link": event.link,
			}
		)
	return data


@api_view(["GET"])
@permission_classes([AllowAny])
def list_archived_events(request):
	refresh = str(request.GET.get("refresh", "0")).lower() in {"1", "true", "yes"}
	q = request.GET.get("q", "").strip() or DEFAULT_EVENTS_QUERY

	if refresh or not ArchivedEvent.objects.exists():
		combined_events = []

		# Refresh from AIC, but continue even if one source fails.
		try:
			aic_data = fetch_exhibition_events(page=1, limit=50, q=None)
			for item in aic_data.get("data", []):
				item["source"] = "aic"
			combined_events.extend(aic_data.get("data", []))
		except requests.RequestException:
			pass

		try:
			serp_data = fetch_serpapi_art_events(query=q, page=1, num=20, pages=3)
			for item in serp_data.get("data", []):
				item["source"] = "serp"
			combined_events.extend(serp_data.get("data", []))
		except (requests.RequestException, ValueError):
			pass

		if combined_events:
			_save_archived_events(combined_events)

	queryset = ArchivedEvent.objects.all().order_by("start_date", "title")
	return Response({
		"count": queryset.count(),
		"data": _serialize_archived_events(queryset),
		"source": "database",
	})
