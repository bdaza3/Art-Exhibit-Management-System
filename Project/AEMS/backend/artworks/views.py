import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .services.artic_api import fetch_artwork_detail, fetch_artworks
from .models import Order
from .serializers import OrderSerializer
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["GET"])
def list_orders(request):
    orders = Order.objects.all().order_by("-created_at")
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


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
