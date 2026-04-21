from django.urls import path,include

from .views import artic_artwork_detail, list_artic_artworks, list_artic_events, list_serpapi_art_events, list_archived_events
from .views import list_orders, order_detail

urlpatterns = [
    path("aic/", list_artic_artworks, name="aic-artworks-list"),
    path("aic/events/", list_artic_events, name="aic-events-list"),
    path("serp/events/", list_serpapi_art_events, name="serp-events-list"),
    path("events/archive/", list_archived_events, name="events-archive-list"),
    path("aic/<int:artwork_id>/", artic_artwork_detail, name="aic-artwork-detail"),
    path("orders/", list_orders),
    path("orders/<int:pk>/", order_detail),
]
