from django.urls import path
from . import views
from .views import exhibitions_list_create, exhibitions_stats

urlpatterns = [
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('profile/', views.profile_view, name='profile'),
    path("exhibitions/", exhibitions_list_create, name="exhibitions-list-create"),
    path("exhibitions/stats/", exhibitions_stats, name="exhibitions-stats"),
]
