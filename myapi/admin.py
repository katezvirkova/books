from django.contrib import admin
from .models import Bookmark, Category

class BookmarkAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'url', 'category', 'favorite')
    list_filter = ('category', 'favorite')
    search_fields = ('title', 'url')

class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)

admin.site.register(Bookmark, BookmarkAdmin)
admin.site.register(Category, CategoryAdmin)
