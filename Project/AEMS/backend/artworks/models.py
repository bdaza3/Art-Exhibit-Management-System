from django.db import models

# Create your models here.


from django.conf import settings


class Artwork(models.Model):
    title = models.CharField(max_length=255)
    artist = models.CharField(max_length=255, blank=True, null=True)
    price = models.FloatField(default=0)
    category = models.CharField(max_length=255, blank=True, null=True)
    image = models.URLField(blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    model_3d = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.title
    
class Order(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE
    )
    artwork = models.ForeignKey(
        "artworks.Artwork",   # ✅ FIXED HERE
        on_delete=models.CASCADE
    )
    quantity = models.IntegerField(default=1)
    total_price = models.FloatField()

    status = models.CharField(
        max_length=20,
        choices=[
            ("Pending", "Pending"),
            ("Paid", "Paid"),
            ("Shipped", "Shipped"),
        ],
        default="Pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.artwork}"