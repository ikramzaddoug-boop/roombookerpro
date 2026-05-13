"""
Management command: python manage.py seed_data
Injecte des données de démonstration complètes pour EmsiSpace.
"""
import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
django.setup()

from django.contrib.auth.hashers import make_password
from users.models import CustomUser
from rooms.models import Room
from equipments.models import Equipment
from reservations.models import RoomReservation, EquipmentReservation
from datetime import date, time, timedelta

print("[SEED] Seeding EmsiSpace demo data...")

# ─────────────────────────────────────────────
# 1. USERS
# ─────────────────────────────────────────────
users_data = [
    {"username": "admin_emsi",   "email": "admin@emsi.ma",      "password": "Admin1234!", "role": "admin",     "first_name": "Admin",   "last_name": "EMSI",      "department": "Direction"},
    {"username": "prof_rachid",  "email": "rachid@emsi.ma",     "password": "Prof1234!",  "role": "professor", "first_name": "Rachid",  "last_name": "Benali",    "department": "Informatique"},
    {"username": "prof_imane",   "email": "imane@emsi.ma",      "password": "Prof1234!",  "role": "professor", "first_name": "Imane",   "last_name": "Elfarissi", "department": "Réseaux"},
    {"username": "etudiant_ali", "email": "ali@emsi.ma",        "password": "Etud1234!",  "role": "student",   "first_name": "Ali",     "last_name": "Moussaoui", "department": "Génie Logiciel"},
    {"username": "etudiant_aya", "email": "aya@emsi.ma",        "password": "Etud1234!",  "role": "student",   "first_name": "Aya",     "last_name": "Khalil",    "department": "Data Science"},
    {"username": "etudiant_omar","email": "omar@emsi.ma",       "password": "Etud1234!",  "role": "student",   "first_name": "Omar",    "last_name": "Tazi",      "department": "Cybersécurité"},
]

created_users = {}
for u in users_data:
    if not CustomUser.objects.filter(username=u["username"]).exists():
        user = CustomUser.objects.create_user(
            username=u["username"],
            email=u["email"],
            password=u["password"],
            role=u["role"],
            first_name=u["first_name"],
            last_name=u["last_name"],
            department=u.get("department", ""),
        )
        created_users[u["username"]] = user
        print(f"  ✅ User créé : {u['username']} ({u['role']})")
    else:
        created_users[u["username"]] = CustomUser.objects.get(username=u["username"])
        print(f"  ⏭  User existant : {u['username']}")

# ─────────────────────────────────────────────
# 2. ROOMS
# ─────────────────────────────────────────────
rooms_data = [
    {"name": "Salle A101",     "room_type": "salle_cours", "capacity": 40, "location": "Bâtiment A – 1er Floor", "floor": 1,
     "image_url": "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800"},
    {"name": "Salle TD-B201",  "room_type": "salle_td",    "capacity": 20, "location": "Bâtiment B – 2nd Floor", "floor": 2,
     "image_url": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=800"},
    {"name": "Labo Réseau",    "room_type": "labo",        "capacity": 25, "location": "Bâtiment C – 1er Floor", "floor": 1,
     "image_url": "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"},
    {"name": "Salle Info C301","room_type": "salle_info",  "capacity": 30, "location": "Bâtiment C – 3ème Floor","floor": 3,
     "image_url": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800"},
    {"name": "Amphi 500",      "room_type": "amphi",       "capacity": 200,"location": "Bâtiment D – RDC",        "floor": 0,
     "image_url": "https://images.unsplash.com/photo-1562774053-701939374585?w=800"},
    {"name": "Salle TP Elec",  "room_type": "salle_tp",   "capacity": 18, "location": "Bâtiment A – 2ème Floor","floor": 2,
     "image_url": "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800"},
    {"name": "Salle Réunion D","room_type": "salle_reunion","capacity": 12,"location": "Bâtiment D – 1er Floor","floor": 1,
     "image_url": "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"},
]

created_rooms = {}
for r in rooms_data:
    if not Room.objects.filter(name=r["name"]).exists():
        room = Room.objects.create(**r, is_available=True)
        created_rooms[r["name"]] = room
        print(f"  ✅ Salle créée : {r['name']}")
    else:
        created_rooms[r["name"]] = Room.objects.get(name=r["name"])
        print(f"  ⏭  Salle existante : {r['name']}")

# ─────────────────────────────────────────────
# 3. EQUIPMENT
# ─────────────────────────────────────────────
equip_data = [
    {"name": "Vidéoprojecteur",  "quantity": 10, "icon": "📽️",
     "description": "Vidéoprojecteur Full HD pour cours",
     "photo_url": "https://images.unsplash.com/photo-1612832021455-245704c6755a?w=400"},
    {"name": "PC Portable",      "quantity": 20, "icon": "💻",
     "description": "PC portables Dell Latitude pour TP",
     "photo_url": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400"},
    {"name": "Tableau Blanc",    "quantity": 15, "icon": "🖊️",
     "description": "Tableau blanc magnétique avec marqueurs",
     "photo_url": "https://images.unsplash.com/photo-1543269664-76bc3997d9ea?w=400"},
    {"name": "Micro Sans Fil",   "quantity": 8,  "icon": "🎤",
     "description": "Microphone sans fil UHF pour amphi",
     "photo_url": "https://images.unsplash.com/photo-1589903308904-1010c2294adc?w=400"},
    {"name": "Caméra Web",       "quantity": 6,  "icon": "📷",
     "description": "Caméra USB HD pour visioconférence",
     "photo_url": "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400"},
    {"name": "Rallonge Electrique","quantity": 12,"icon": "Elec",
     "description": "Rallonge 4 prises 5m",
     "photo_url": ""},
]

created_equips = {}
for e in equip_data:
    if not Equipment.objects.filter(name=e["name"]).exists():
        eq = Equipment.objects.create(**e, is_available=True)
        created_equips[e["name"]] = eq
        print(f"  ✅ Équipement créé : {e['name']} (x{e['quantity']})")
    else:
        created_equips[e["name"]] = Equipment.objects.get(name=e["name"])
        print(f"  ⏭  Équipement existant : {e['name']}")

# ─────────────────────────────────────────────
# 4. ROOM RESERVATIONS
# ─────────────────────────────────────────────
today = date.today()
prof_rachid = created_users.get("prof_rachid")
prof_imane  = created_users.get("prof_imane")
etud_ali    = created_users.get("etudiant_ali")
etud_aya    = created_users.get("etudiant_aya")

room_reservations = [
    {"user": prof_rachid, "room": created_rooms.get("Salle A101"),      "date": today,                    "heure_debut": time(8, 0),  "heure_fin": time(10, 0), "status": "confirmee",  "titre": "Cours Algo L2"},
    {"user": prof_rachid, "room": created_rooms.get("Salle Info C301"), "date": today,                    "heure_debut": time(10, 0), "heure_fin": time(12, 0), "status": "confirmee",  "titre": "TP Base de Données"},
    {"user": prof_imane,  "room": created_rooms.get("Labo Réseau"),     "date": today,                    "heure_debut": time(14, 0), "heure_fin": time(16, 0), "status": "confirmee",  "titre": "TP Réseaux"},
    {"user": etud_ali,    "room": created_rooms.get("Salle TD-B201"),   "date": today,                    "heure_debut": time(16, 0), "heure_fin": time(17, 0), "status": "en_attente", "titre": "Travail de groupe"},
    {"user": prof_rachid, "room": created_rooms.get("Amphi 500"),       "date": today + timedelta(days=1),"heure_debut": time(8, 0),  "heure_fin": time(10, 0), "status": "en_attente", "titre": "Conférence IA"},
    {"user": prof_imane,  "room": created_rooms.get("Salle Réunion D"), "date": today + timedelta(days=2),"heure_debut": time(10, 0), "heure_fin": time(11, 0), "status": "confirmee",  "titre": "Réunion pédagogique"},
    {"user": etud_aya,    "room": created_rooms.get("Salle A101"),      "date": today + timedelta(days=3),"heure_debut": time(14, 0), "heure_fin": time(16, 0), "status": "en_attente", "titre": "Révisions examens"},
    {"user": prof_rachid, "room": created_rooms.get("Salle TP Elec"),   "date": today - timedelta(days=1),"heure_debut": time(8, 0),  "heure_fin": time(10, 0), "status": "confirmee",  "titre": "TP Électronique"},
]

for res in room_reservations:
    if res["user"] and res["room"]:
        if not RoomReservation.objects.filter(user=res["user"], room=res["room"], date=res["date"], heure_debut=res["heure_debut"]).exists():
            RoomReservation.objects.create(nombre_personnes=20, **res)
            print(f"  ✅ Réservation salle : {res['titre']} - {res['date']}")
        else:
            print(f"  ⏭  Réservation salle déjà existante : {res['titre']}")

# ─────────────────────────────────────────────
# 5. EQUIPMENT RESERVATIONS
# ─────────────────────────────────────────────
equip_reservations = [
    {"user": prof_rachid, "equipment": created_equips.get("Vidéoprojecteur"), "quantite": 1, "date": today,                    "heure_debut": time(8, 0),  "heure_fin": time(10, 0), "status": "confirmee",  "titre": "Cours Algo"},
    {"user": prof_imane,  "equipment": created_equips.get("Micro Sans Fil"),  "quantite": 2, "date": today,                    "heure_debut": time(14, 0), "heure_fin": time(16, 0), "status": "confirmee",  "titre": "TP Réseau"},
    {"user": etud_ali,    "equipment": created_equips.get("PC Portable"),     "quantite": 3, "date": today,                    "heure_debut": time(16, 0), "heure_fin": time(18, 0), "status": "en_attente", "titre": "Projet Big Data"},
    {"user": etud_aya,    "equipment": created_equips.get("Caméra Web"),      "quantite": 1, "date": today + timedelta(days=1),"heure_debut": time(10, 0), "heure_fin": time(12, 0), "status": "en_attente", "titre": "Soutenance PFE"},
    {"user": prof_rachid, "equipment": created_equips.get("PC Portable"),     "quantite": 5, "date": today + timedelta(days=2),"heure_debut": time(8, 0),  "heure_fin": time(10, 0), "status": "confirmee",  "titre": "TP Développement"},
]

for res in equip_reservations:
    if res["user"] and res["equipment"]:
        if not EquipmentReservation.objects.filter(user=res["user"], equipment=res["equipment"], date=res["date"], heure_debut=res["heure_debut"]).exists():
            EquipmentReservation.objects.create(**res)
            print(f"  ✅ Réservation équipement : {res['titre']} - {res['date']}")
        else:
            print(f"  ⏭  Déjà existant : {res['titre']}")

print("\n🎉 Seed terminé avec succès !")
print("\n📋 Comptes disponibles :")
print("  Admin  → admin_emsi   / Admin1234!")
print("  Prof   → prof_rachid  / Prof1234!")
print("  Prof   → prof_imane   / Prof1234!")
print("  Étud   → etudiant_ali / Etud1234!")
print("  Étud   → etudiant_aya / Etud1234!")
