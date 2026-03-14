from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from .models import Exhibition
from .serializers import ExhibitionSerializer
from django.utils import timezone

from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, ProfileUpdateSerializer


class CsrfExemptSessionAuth(SessionAuthentication):
    def enforce_csrf(self, request):
        return  # skip CSRF check


@api_view(['GET', 'PUT'])
@authentication_classes([CsrfExemptSessionAuth])
@permission_classes([])
def profile_view(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated'}, status=status.HTTP_401_UNAUTHORIZED)

    if request.method == 'GET':
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'role': request.user.role,
        })

    serializer = ProfileUpdateSerializer(request.user, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        user = request.user
        user.refresh_from_db()
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'role': user.role,
        })
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def register_view(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def login_view(request):
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = authenticate(
            request,
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password'],
        )
        if user is not None:
            login(request, user)
            return Response(UserSerializer(user).data)
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def logout_view(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(["GET", "POST"])
def exhibitions_list_create(request):
    if request.method == "GET":
        exhibitions = Exhibition.objects.all().order_by("-date")
        serializer = ExhibitionSerializer(exhibitions, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = ExhibitionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
def exhibitions_stats(request):
    exhibitions = Exhibition.objects.all()
    today = timezone.now().date()

    total = exhibitions.count()
    upcoming = exhibitions.filter(date__gte=today).count()
    past = exhibitions.filter(date__lt=today).count()

    return Response({
        "total": total,
        "upcoming": upcoming,
        "past": past
    })