from django.urls import path,include

from .views import artic_artwork_detail, list_artic_artworks

urlpatterns = [
    path("aic/", list_artic_artworks, name="aic-artworks-list"),
    path("aic/<int:artwork_id>/", artic_artwork_detail, name="aic-artwork-detail"),
]
