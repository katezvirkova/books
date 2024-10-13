from django.db import models

class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class Bookmark(models.Model):
    url = models.URLField(max_length=500)
    title = models.CharField(max_length=255)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    favorite = models.BooleanField(default=False)

    def __str__(self):
        return self.title