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


class ArchivedEvent(models.Model):
    SOURCE_CHOICES = [
        ("aic", "Art Institute of Chicago"),
        ("serp", "SerpApi Google Events"),
    ]

    source = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    source_event_id = models.CharField(max_length=255, blank=True, null=True)
    event_key = models.CharField(max_length=512, unique=True)

    title = models.CharField(max_length=255)
    museum = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=255, blank=True, null=True)
    start_date = models.DateField(blank=True, null=True)
    end_date = models.DateField(blank=True, null=True)
    time_display = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    highlights = models.JSONField(default=list, blank=True)
    image_url = models.URLField(blank=True, null=True)
    ticket_from = models.FloatField(default=20)
    link = models.URLField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["start_date", "title"]

    def __str__(self):
        return f"{self.title} ({self.source})"