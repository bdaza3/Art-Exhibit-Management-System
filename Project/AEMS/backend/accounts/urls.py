from django.urls import path, include
from . import views
from .views import exhibitions_list_create, exhibitions_stats, ArtworkViewSet, import_aic_artworks, AuctionViewSet, BidViewSet
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'artworks', ArtworkViewSet)
router.register(r'auctions', AuctionViewSet)
router.register(r'bids', BidViewSet)

from .views import upload_file

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path("exhibitions/", exhibitions_list_create, name="exhibitions-list-create"),
    path('exhibitions/<int:pk>/', views.exhibition_detail, name='exhibitions-detail'),
    path("exhibitions/stats/", exhibitions_stats, name="exhibitions-stats"),
    path('', include(router.urls)),
    path('uploads/', upload_file),
    path('import-aic/', import_aic_artworks),
]
