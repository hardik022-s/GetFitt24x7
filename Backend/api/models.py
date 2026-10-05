import secrets

from django.db import models


def generate_pass_code():
    """Random, hard-to-guess code like GF-9F3A1C7E, generated on the server."""
    return "GF-" + secrets.token_hex(4).upper()

PREFERRED_TIMES = [
    "Morning (6:00 AM - 9:00 AM)",
    "Midday (11:00 AM - 3:00 PM)",
    "Evening (5:00 PM - 9:00 PM)",
    "Late Night (9:00 PM - 1:00 AM)",
]

PRIMARY_GOALS = [
    "Weight Loss",
    "Muscle Gain",
    "General Fitness & Conditioning",
]

class TrialBooking(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        CONFIRMED = "confirmed", "Confirmed"
        COMPLETED = "completed", "Completed"
        CANCELLED = "cancelled", "Cancelled"

    full_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True)
    preferred_time = models.CharField(max_length=50, choices=[(t, t) for t in PREFERRED_TIMES])
    primary_goal = models.CharField(max_length=50, choices=[(g, g) for g in PRIMARY_GOALS])
    pass_code = models.CharField(
        max_length=20, unique=True, default=generate_pass_code, editable=False
    )
    status = models.CharField(
        max_length=20, choices=Status.choices, default=Status.PENDING
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.pass_code})"


class ContactMessage(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    message = models.TextField(max_length=2000)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.name}: {self.message[:30]}"