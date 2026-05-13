from django.contrib import admin
from .models import Equipment

@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'quantity', 'is_available', 'created_at')
    list_filter = ('is_available',)
    search_fields = ('name', 'description')