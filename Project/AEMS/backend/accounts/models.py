from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('customer', 'Customer'),
        ('admin', 'Admin')
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='customer')
    
class Exhibition(models.Model):
    title = models.CharField(max_length=255)
    venue = models.CharField(max_length=255)
    location = models.CharField(max_length=255)
    date = models.DateField()
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    


class Artwork(models.Model):
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255, blank=True, null=True)
    price = models.FloatField(default=0)
    category = models.CharField(max_length=255, blank=True, null=True)
    image = models.URLField(max_length=1000, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    model_3d = models.URLField(max_length=1000, blank=True, null=True)
    STATUS_CHOICES = [
        ("available", "Available"),
        ("sold", "Sold"),
        ("in_auction", "In Auction"),
    ]
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="available")

    def __str__(self):
        return self.title


class Auction(models.Model):
    artwork = models.ForeignKey(Artwork, on_delete=models.CASCADE, related_name="auctions")
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    starting_bid = models.FloatField(default=0)
    min_increment = models.FloatField(default=1)
    STATUS = [
        ("scheduled", "Scheduled"),
        ("active", "Active"),
        ("paused", "Paused"),
        ("cancelled", "Cancelled"),
        ("ended", "Ended"),
    ]
    status = models.CharField(max_length=20, choices=STATUS, default="scheduled")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Auction({self.artwork.title})"


class Bid(models.Model):
    auction = models.ForeignKey(Auction, on_delete=models.CASCADE, related_name="bids")
    user = models.ForeignKey('CustomUser', on_delete=models.SET_NULL, null=True, blank=True)
    amount = models.FloatField()
    anonymous = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-timestamp"]

    def __str__(self):
        return f"Bid({self.amount}) on {self.auction}"