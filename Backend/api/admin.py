from django.contrib import admin

from .models import ContactMessage, TrialBooking


@admin.register(TrialBooking)
class TrialBookingAdmin(admin.ModelAdmin):
    list_display = ("full_name", "phone", "preferred_time", "primary_goal", "pass_code", "status", "created_at")
    list_filter = ("status", "preferred_time", "primary_goal")
    search_fields = ("full_name", "phone", "email", "pass_code")
    readonly_fields = ("pass_code", "created_at")


@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ("name", "email", "is_read", "created_at")
    list_filter = ("is_read",)
    search_fields = ("name", "email", "message")
    readonly_fields = ("created_at",)