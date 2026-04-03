from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    artwork_title = serializers.CharField(source="artwork.title", read_only=True)

    class Meta:
        model = Order
        fields = "__all__"