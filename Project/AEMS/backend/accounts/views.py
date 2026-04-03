from django.contrib.auth import authenticate, login, logout
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from .models import Exhibition
from .serializers import ExhibitionSerializer
from django.utils import timezone
import requests
from rest_framework.decorators import api_view
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings
import os
from rest_framework.response import Response
from .models import Artwork
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, ProfileUpdateSerializer
from .serializers import ArtworkSerializer
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import action
from django.db import transaction
from .models import Auction, Bid
from .serializers import AuctionSerializer, BidSerializer

class ArtworkViewSet(ModelViewSet):
    queryset = Artwork.objects.all()
    serializer_class = ArtworkSerializer


class AuctionViewSet(ModelViewSet):
    queryset = Auction.objects.all().order_by("-start_time")
    serializer_class = AuctionSerializer

    @action(detail=True, methods=['POST'])
    @transaction.atomic
    def place_bid(self, request, pk=None):
        auction = self.get_object()
        user = request.user if request.user.is_authenticated else None
        amount = float(request.data.get('amount', 0))
        anonymous = bool(request.data.get('anonymous', False))

        # basic validation
        if auction.status != 'active':
            return Response({'error': 'Auction not active'}, status=status.HTTP_400_BAD_REQUEST)

        highest = auction.bids.first()
        current = highest.amount if highest else auction.starting_bid

        min_allowed = current + auction.min_increment
        if amount < min_allowed:
            return Response({'error': f'Bid must be at least {min_allowed}'}, status=status.HTTP_400_BAD_REQUEST)

        bid = Bid.objects.create(auction=auction, user=user, amount=amount, anonymous=anonymous)

        return Response(BidSerializer(bid).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['POST'])
    def end(self, request, pk=None):
        auction = self.get_object()
        auction.status = 'ended'
        auction.save()
        # update artwork status if there is a winner
        highest = auction.bids.first()
        if highest:
            art = auction.artwork
            art.status = 'sold'
            art.save()
        return Response({'status': 'ended'})


class BidViewSet(ModelViewSet):
    queryset = Bid.objects.all()
    serializer_class = BidSerializer

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


@csrf_exempt
@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def register_view(request):
    requested_role = request.data.get('role', 'customer')
    if requested_role == 'admin' and not settings.DEBUG:
        return Response(
            {'error': 'Admin registration is only available in development mode.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
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


@csrf_exempt
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

@api_view(['GET'])
def import_aic_artworks(request):
    url = "https://api.artic.edu/api/v1/artworks?page=1&limit=20"

    res = requests.get(url)
    data = res.json().get("data", [])

    created = []

    for item in data:
        title = item.get("title")
        artist = item.get("artist_title")
        image_id = item.get("image_id")

        image_url = f"https://www.artic.edu/iiif/2/{image_id}/full/843,/0/default.jpg" if image_id else ""

       
        if not Artwork.objects.filter(title=title).exists():
            art = Artwork.objects.create(
                title=title,
                artist=artist,
                price=500,
                category="AIC",
                image=image_url,
                description="Imported from AIC",
            )
            created.append(art.title)

    return Response({
        "message": "Imported successfully",
        "count": len(created),
        "items": created
    })


@csrf_exempt
@api_view(['POST'])
def upload_file(request):
    """Simple upload endpoint that accepts a single file in 'file' field and returns its public URL."""
    f = request.FILES.get('file')
    if not f:
        return Response({'error': 'No file provided'}, status=400)

    # create uploads directory
    upload_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
    os.makedirs(upload_dir, exist_ok=True)

    filename = f.name
    save_path = os.path.join('uploads', filename)

    # ensure unique filename
    base, ext = os.path.splitext(filename)
    counter = 1
    while default_storage.exists(save_path):
        filename = f"{base}-{counter}{ext}"
        save_path = os.path.join('uploads', filename)
        counter += 1

    # save file
    path = default_storage.save(save_path, ContentFile(f.read()))

    url = request.build_absolute_uri(settings.MEDIA_URL + path)
    return Response({'url': url})
