import re

from rest_framework import serializers

from .models import ContactMessage, TrialBooking

# Accepts 9876543210, +91 98765 43210, 91-98765-43210, 09876543210
INDIAN_MOBILE = re.compile(r"^(?:\+?91|0)?([6-9]\d{9})$")


class TrialBookingSerializer(serializers.ModelSerializer):
    """Used for the public 'Book Free Trial' form and the admin list."""

    class Meta:
        model = TrialBooking
        fields = [
            "id",
            "full_name",
            "phone",
            "email",
            "preferred_time",
            "primary_goal",
            "pass_code",
            "status",
            "created_at",
        ]
        # The server controls these. Visitors can't send or change them.
        read_only_fields = ["id", "pass_code", "status", "created_at"]

    def validate_phone(self, value):
        cleaned = re.sub(r"[\s\-()]", "", value)
        match = INDIAN_MOBILE.match(cleaned)
        if not match:
            raise serializers.ValidationError("Enter a valid 10-digit Indian mobile number.")
        return f"+91{match.group(1)}"  # store every number in one format


class TrialStatusSerializer(serializers.ModelSerializer):
    """Admin-only: the only thing the owner can change is the status."""

    class Meta:
        model = TrialBooking
        fields = ["status"]


class ContactMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "message", "is_read", "created_at"]
        read_only_fields = ["id", "is_read", "created_at"]
        extra_kwargs = {"message": {"min_length": 5}}