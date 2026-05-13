from rest_framework import serializers
from .models import RoomReservation, EquipmentReservation
from rooms.serializers import RoomSerializer
from users.serializers import UserSerializer
from equipments.serializers import EquipmentSerializer

class RoomReservationSerializer(serializers.ModelSerializer):
    room_details = RoomSerializer(source='room', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = RoomReservation
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate(self, data):
        from django.db.models import Q
        
        # Sécurité : Seul un admin peut changer le statut
        if 'status' in data and not self.context['request'].user.is_admin:
            raise serializers.ValidationError({"status": "Seul un administrateur peut modifier le statut."})
            
        room = data.get('room') or getattr(self.instance, 'room', None)
        date = data.get('date') or getattr(self.instance, 'date', None)
        heure_debut = data.get('heure_debut') or getattr(self.instance, 'heure_debut', None)
        heure_fin = data.get('heure_fin') or getattr(self.instance, 'heure_fin', None)

        if room and date and heure_debut and heure_fin:
            if heure_debut >= heure_fin:
                raise serializers.ValidationError("L'heure de fin doit être après l'heure de début.")

            conflits = RoomReservation.objects.filter(
                room=room,
                date=date,
                status__in=['confirmee', 'en_attente']
            ).filter(
                Q(heure_debut__lt=heure_fin) & Q(heure_fin__gt=heure_debut)
            )

            if self.instance:
                conflits = conflits.exclude(pk=self.instance.pk)

            if conflits.exists():
                dernier_conflit = conflits.order_by('heure_fin').last()
                heure_dispo = dernier_conflit.heure_fin.strftime("%H:%M")
                raise serializers.ValidationError(
                    f"Cette salle est déjà occupée. Elle sera disponible à partir de {heure_dispo}."
                )

        return data

class EquipmentReservationSerializer(serializers.ModelSerializer):
    equipment_details = EquipmentSerializer(source='equipment', read_only=True)
    user_details = UserSerializer(source='user', read_only=True)

    class Meta:
        model = EquipmentReservation
        fields = '__all__'
        read_only_fields = ['user', 'created_at', 'updated_at']

    def validate(self, data):
        from django.db.models import Q, Sum

        if 'status' in data and not self.context['request'].user.is_admin:
            raise serializers.ValidationError({"status": "Seul un administrateur peut modifier le statut."})

        equipment = data.get('equipment') or getattr(self.instance, 'equipment', None)
        date = data.get('date') or getattr(self.instance, 'date', None)
        heure_debut = data.get('heure_debut') or getattr(self.instance, 'heure_debut', None)
        heure_fin = data.get('heure_fin') or getattr(self.instance, 'heure_fin', None)
        quantite = data.get('quantite') or getattr(self.instance, 'quantite', None)

        if equipment and date and heure_debut and heure_fin and quantite is not None:
            if heure_debut >= heure_fin:
                raise serializers.ValidationError("L'heure de fin doit être après l'heure de début.")

            conflits = EquipmentReservation.objects.filter(
                equipment=equipment,
                date=date,
                status__in=['confirmee', 'en_attente']
            ).filter(
                Q(heure_debut__lt=heure_fin) & Q(heure_fin__gt=heure_debut)
            )

            if self.instance:
                conflits = conflits.exclude(pk=self.instance.pk)

            total_reserve = conflits.aggregate(total=Sum('quantite'))['total'] or 0

            if total_reserve + quantite > equipment.quantity:
                dispo = max(0, equipment.quantity - total_reserve)
                dernier_conflit = conflits.order_by('heure_fin').last()
                heure_dispo = dernier_conflit.heure_fin.strftime("%H:%M") if dernier_conflit else "plus tard"
                
                raise serializers.ValidationError(
                    f"Stock insuffisant. Seulement {dispo} disponible(s). Le stock reviendra à partir de {heure_dispo}."
                )

        return data