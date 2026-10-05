from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    path("trials/", views.TrialListCreateView.as_view()),
    path("trials/<int:pk>/", views.TrialStatusUpdateView.as_view()),
    path("contact/", views.ContactListCreateView.as_view()),
    path("messages/", views.ContactListCreateView.as_view()),
    path("admin/login/", TokenObtainPairView.as_view()),
    path("admin/refresh/", TokenRefreshView.as_view()),
]