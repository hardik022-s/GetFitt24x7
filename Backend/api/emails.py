import logging

from django.conf import settings
from django.core.mail import send_mail

logger = logging.getLogger(__name__)


def _send(subject, body, to):
    """Send one email. A failure is logged but never crashes the request,
    because the booking is already saved in the database."""
    try:
        send_mail(subject, body, settings.DEFAULT_FROM_EMAIL, [to], fail_silently=False)
    except Exception:
        logger.exception("Email failed: %s", subject)


def notify_trial(booking):
    # 1. Tell the gym
    _send(
        f"New free trial booking: {booking.full_name}",
        (
            f"Name: {booking.full_name}\n"
            f"Phone: {booking.phone}\n"
            f"Email: {booking.email or 'not provided'}\n"
            f"Preferred time: {booking.preferred_time}\n"
            f"Goal: {booking.primary_goal}\n"
            f"Pass code: {booking.pass_code}"
        ),
        settings.GYM_NOTIFY_EMAIL,
    )
    # 2. Send the visitor their pass, only if they gave an email
    if booking.email:
        _send(
            "Your GetFitt24x7 free trial pass",
            (
                f"Hi {booking.full_name},\n\n"
                f"Your free 1-day pass code is: {booking.pass_code}\n"
                f"Preferred time: {booking.preferred_time}\n\n"
                "Show this code at the front desk. See you soon!\n"
                "GetFitt24x7"
            ),
            booking.email,
        )


def notify_contact(msg):
    _send(
        f"New message from {msg.name}",
        f"From: {msg.name} <{msg.email}>\n\n{msg.message}",
        settings.GYM_NOTIFY_EMAIL,
    )