from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass
    # Users should have: followers, follows, posts, likes


class Follow(models.Model):
    following = models.ManyToManyField(User, related_name="followers")


class Posts(models.Model):
    timestamp = models.DateTimeField(auto_now_add=True)
    content = models.TextField()
    poster = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    liked_by = models.ManyToManyField(User, related_name="liked_by")

    def __str__(self):
        """Return poster and timestamp."""
        return f"{self.poster} at {self.timestamp}."
