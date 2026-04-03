from rest_framework import serializers
from .models import CustomUser
from .models import Exhibition
from .models import Artwork
from .models import Auction, Bid


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=True)
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'password', 'role']
        read_only_fields = ['id']

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            password=validated_data['password'],
            role=validated_data.get('role', 'customer'),
        )
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']


class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name']

    def validate_username(self, value):
        user = self.instance
        if CustomUser.objects.exclude(pk=user.pk).filter(username=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value
class ExhibitionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Exhibition
        fields = "__all__"

class ArtworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artwork
        fields = '__all__'


class BidSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()

    class Meta:
        model = Bid
        fields = ['id', 'auction', 'user', 'amount', 'anonymous', 'timestamp']

    def get_user(self, obj):
        if obj.anonymous:
            return {'id': None, 'username': 'Anonymous'}
        if obj.user:
            return {'id': obj.user.id, 'username': obj.user.username}
        return None


class AuctionSerializer(serializers.ModelSerializer):
    artwork = ArtworkSerializer(read_only=True)
    artwork_id = serializers.PrimaryKeyRelatedField(queryset=Artwork.objects.all(), source='artwork', write_only=True)
    bids = BidSerializer(many=True, read_only=True)

    class Meta:
        model = Auction
        fields = ['id', 'artwork', 'artwork_id', 'start_time', 'end_time', 'starting_bid', 'min_increment', 'status', 'created_at', 'bids']