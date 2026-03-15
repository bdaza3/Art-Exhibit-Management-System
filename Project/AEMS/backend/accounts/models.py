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