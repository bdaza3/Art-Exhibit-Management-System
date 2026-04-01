from django.urls import path, include
from . import views
from .views import exhibitions_list_create, exhibitions_stats, ArtworkViewSet, import_aic_artworks
from rest_framework.routers import DefaultRouter
from .views import ArtworkViewSet, import_aic_artworks

router = DefaultRouter()
router.register(r'artworks', ArtworkViewSet)

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path("exhibitions/", exhibitions_list_create, name="exhibitions-list-create"),
    path("exhibitions/stats/", exhibitions_stats, name="exhibitions-stats"),
    path('', include(router.urls)),
    path('import-aic/', import_aic_artworks),
]
