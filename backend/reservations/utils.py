from .models import Reservation
from rooms.models import Room
from datetime import datetime, timedelta


def suggest_alternative(room, date, start_time, end_time):
    suggestions = []

    for i in range(1, 4):
        new_start = (datetime.combine(date, start_time) + timedelta(hours=i)).time()
        new_end = (datetime.combine(date, end_time) + timedelta(hours=i)).time()

        conflicts = Reservation.objects.filter(
            room=room,
            date=date,
            heure_debut__lt=new_end,
            heure_fin__gt=new_start,
            status__in=['en_attente', 'confirmee']
        )

        if not conflicts.exists():
            suggestions.append({
                "start": new_start.strftime("%H:%M"),
                "end": new_end.strftime("%H:%M")
            })

    return suggestions


# --------------------------------------------------

def proposer_creneaux(room, date, duree):
    reservations = Reservation.objects.filter(room=room, date=date)

    slots = []
    for r in reservations:
        start = r.heure_fin
        end_hour = (start.hour + duree) % 24
        slots.append(f"{start.strftime('%H:%M')} - {end_hour:02d}:00")

    return slots


# --------------------------------------------------

def recommander_salles(equipements):
    """
    Retourne les salles qui contiennent TOUS les équipements demandés.
    equipements = liste d'IDs Equipment ou queryset
    """

    if not equipements:
        return Room.objects.all()

    queryset = Room.objects.all()

    for eq in equipements:
        queryset = queryset.filter(equipments=eq)

    return queryset.distinct()


# --------------------------------------------------

def detecter_conflits(room, date, start, end):
    return Reservation.objects.filter(
        room=room,
        date=date,
        heure_debut__lt=end,
        heure_fin__gt=start,
        status__in=['en_attente', 'confirmee']
    ).exists()


# --------------------------------------------------

def optimiser_utilisation():
    return "Optimisation en cours..."