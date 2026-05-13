from django.contrib import admin
from .models import RoomReservation, EquipmentReservation

@admin.register(RoomReservation)
class RoomReservationAdmin(admin.ModelAdmin):
    list_display = ('user', 'room', 'date', 'heure_debut', 'status')
    list_filter = ('status', 'date', 'room')
    search_fields = ('user__username', 'room__name')

@admin.register(EquipmentReservation)
class EquipmentReservationAdmin(admin.ModelAdmin):
    list_display = ('user', 'equipment', 'date', 'heure_debut', 'status')
    list_filter = ('status', 'date', 'equipment')
    search_fields = ('user__username', 'equipment__name')