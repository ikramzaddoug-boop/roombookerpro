from django.db import models
from django.conf import settings
from rooms.models import Room
from equipments.models import Equipment
from django.core.exceptions import ValidationError

class BaseReservation(models.Model):
    STATUS_CHOICES = [
        ('en_attente', 'En attente'),
        ('confirmee', 'Confirmée'),
        ('annulee', 'Annulée'),
        ('refusee', 'Refusée'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    heure_debut = models.TimeField()
    heure_fin = models.TimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='en_attente')
    titre = models.CharField(max_length=200, null=True, blank=True)
    description = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return f"{self.user.username} - {self.date}"

class RoomReservation(BaseReservation):
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='room_reservations')
    nombre_personnes = models.IntegerField(default=1)

    def clean(self):
        # Validation Conflit Salle
        conflits = RoomReservation.objects.filter(
            room=self.room,
            date=self.date,
            status='confirmee'
        ).exclude(id=self.id).filter(
            models.Q(heure_debut__lt=self.heure_fin, heure_fin__gt=self.heure_debut)
        )
        if conflits.exists():
            raise ValidationError("Cette salle est déjà réservée sur ce créneau.")

class EquipmentReservation(BaseReservation):
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, related_name='equipment_reservations')
    quantite = models.IntegerField(default=1)

    def clean(self):
        # Validation Stock Équipement
        total_reserve = EquipmentReservation.objects.filter(
            equipment=self.equipment,
            date=self.date,
            status='confirmee'
        ).exclude(id=self.id).filter(
            models.Q(heure_debut__lt=self.heure_fin, heure_fin__gt=self.heure_debut)
        ).aggregate(total=models.Sum('quantite'))['total'] or 0

        if total_reserve + self.quantite > self.equipment.quantity:
            raise ValidationError(f"Stock insuffisant pour cet équipement. (Dispo: {self.equipment.quantity - total_reserve})")