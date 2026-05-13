from django.db import models
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.conf import settings
from .models import CustomUser
from .serializers import RegisterSerializer, UserSerializer, UserAdminSerializer

class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [AllowAny]
    serializer_class = RegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        return Response({
            'user': UserSerializer(user).data,
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(request.user).data)


class StatsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from reservations.models import RoomReservation, EquipmentReservation
        from rooms.models import Room
        from equipments.models import Equipment
        from django.db.models import Count

        total_room_res = RoomReservation.objects.count()
        total_equip_res = EquipmentReservation.objects.count()
        total_reservations = total_room_res + total_equip_res

        # Par salle stats for admin chart
        par_salle = list(
            RoomReservation.objects.values('room__name')
            .annotate(count=Count('id'))
            .order_by('-count')[:8]
            .values('count', name=models.F('room__name'))
        )

        return Response({
            'total_rooms': Room.objects.count(),
            'available_rooms': Room.objects.filter(is_available=True).count(),
            'total_equipments': Equipment.objects.count(),
            'total_reservations': total_reservations,
            'total_users': CustomUser.objects.count(),
            'occupation_rate': self.calculate_occupation_rate(),
            'par_salle': par_salle,
        })

    def calculate_occupation_rate(self):
        from datetime import datetime, timedelta
        from reservations.models import RoomReservation
        from rooms.models import Room

        today = datetime.now().date()
        week_start = today - timedelta(days=today.weekday())
        week_end = week_start + timedelta(days=6)

        reservations = RoomReservation.objects.filter(
            date__range=[week_start, week_end],
            status__in=['en_attente', 'confirmee']
        ).count()

        total_rooms = Room.objects.count()
        if total_rooms == 0:
            return 0

        max_possible = total_rooms * 7 * 8  # 8 slots/day is more realistic
        return min(100, int((reservations / max_possible) * 100)) if max_possible > 0 else 0


class UserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserAdminSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['role', 'is_active']
    search_fields = ['username', 'email', 'first_name', 'last_name', 'department']
    ordering_fields = ['id', 'username', 'email', 'last_login', 'created_at']
    ordering = ['-id']

    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return CustomUser.objects.all()
        return CustomUser.objects.filter(id=user.id)


class PasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(email=email)
            token = default_token_generator.make_token(user)
            reset_link = f"http://localhost:8081/reset-password?uid={user.pk}&token={token}"
            
            subject = "Réinitialisation de votre mot de passe - EmsiSpace"
            text_content = f"Bonjour,\n\nNous avons reçu une demande de réinitialisation de votre mot de passe pour votre compte EmsiSpace.\n\nPour choisir un nouveau mot de passe, veuillez cliquer sur le lien suivant :\n{reset_link}\n\nSi vous n'avez pas fait cette demande, vous pouvez ignorer cet email.\n\nCordialement,\nL'équipe EmsiSpace"
            
            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <span style="font-size: 24px; font-weight: 800; color: #4f46e5; letter-spacing: -0.5px;">EmsiSpace</span>
                </div>
                <h2 style="color: #111827; font-size: 20px; text-align: center; margin-bottom: 20px;">Réinitialisation de votre mot de passe</h2>
                <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">Bonjour,</p>
                <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">Nous avons reçu une demande pour réinitialiser le mot de passe de votre compte.</p>
                <div style="text-align: center; margin: 35px 0;">
                    <a href="{reset_link}" style="background-color: #4f46e5; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block;">Réinitialiser mon mot de passe</a>
                </div>
                <p style="color: #6b7280; line-height: 1.5; font-size: 14px;">Si le bouton ne fonctionne pas, copiez et collez le lien ci-dessous dans votre navigateur :</p>
                <p style="word-break: break-all; color: #4f46e5; font-size: 13px; background-color: #f3f4f6; padding: 12px; border-radius: 6px;">{reset_link}</p>
                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
                <p style="color: #9ca3af; font-size: 13px; text-align: center; line-height: 1.5;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.<br>Votre mot de passe restera inchangé.</p>
            </div>
            """

            send_mail(
                subject,
                text_content,
                getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@roombooker.local"),
                [email],
                fail_silently=False,
                html_message=html_content
            )
        except CustomUser.DoesNotExist:
            pass

        return Response({"message": "If this email exists, reset instructions have been sent."})


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        user_id = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not user_id or not token or not new_password:
            return Response({"error": "uid, token and new_password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = CustomUser.objects.get(pk=user_id)
        except CustomUser.DoesNotExist:
            return Response({"error": "Invalid user"}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({"message": "Password reset successful"})