from rest_framework import generics
from rest_framework.permissions import AllowAny, IsAdminUser
from rest_framework.throttling import ScopedRateThrottle

from .emails import notify_contact, notify_trial
from .models import ContactMessage, TrialBooking
from .serializers import (
    ContactMessageSerializer,
    TrialBookingSerializer,
    TrialStatusSerializer,
)


class PublicPostAdminGetMixin:
    """Visitors may POST (rate limited). Everything else is owner-only."""

    def get_permissions(self):
        if self.request.method == "POST":
            return [AllowAny()]
        return [IsAdminUser()]

    def get_throttles(self):
        if self.request.method == "POST":
            self.throttle_scope = "public_form"
            return [ScopedRateThrottle()]
        return []


class TrialListCreateView(PublicPostAdminGetMixin, generics.ListCreateAPIView):
    serializer_class = TrialBookingSerializer

    def get_queryset(self):
        qs = TrialBooking.objects.all()
        status = self.request.query_params.get("status")  # /api/trials/?status=pending
        return qs.filter(status=status) if status else qs

    def perform_create(self, serializer):
        booking = serializer.save()
        notify_trial(booking)


class TrialStatusUpdateView(generics.UpdateAPIView):
    queryset = TrialBooking.objects.all()
    serializer_class = TrialStatusSerializer
    permission_classes = [IsAdminUser]
    http_method_names = ["patch"]


class ContactListCreateView(PublicPostAdminGetMixin, generics.ListCreateAPIView):
    serializer_class = ContactMessageSerializer
    queryset = ContactMessage.objects.all()

    def perform_create(self, serializer):
        message = serializer.save()
        notify_contact(message)