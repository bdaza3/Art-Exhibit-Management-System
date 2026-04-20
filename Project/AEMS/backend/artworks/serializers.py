from rest_framework import serializers
from .models import Order

class OrderSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source="user.username", read_only=True)
    artwork_title = serializers.CharField(source="artwork.title", read_only=True)
    customer = serializers.CharField(source="user.username", read_only=True)
    total = serializers.FloatField(source="total_price", read_only=True)
    items = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "artwork",
            "quantity",
            "total_price",
            "status",
            "created_at",
            "user_name",
            "artwork_title",
            "customer",
            "total",
            "items",
        ]
        read_only_fields = ["id", "created_at", "user_name", "artwork_title", "customer", "total", "items"]

    def get_items(self, obj):
        unit_price = obj.total_price / obj.quantity if obj.quantity else obj.total_price
        return [
            {
                "title": obj.artwork.title,
                "qty": obj.quantity,
                "price": unit_price,
            }
        ]
