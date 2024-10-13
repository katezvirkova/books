from django.urls import path
from .views import (
    BookmarkList, BookmarkDetail, FavoriteBookmark,
    CategoryList, CategoryDetail
)

urlpatterns = [
    path('bookmarks/', BookmarkList.as_view(), name='bookmark-list'),
    path('bookmarks/<int:pk>/', BookmarkDetail.as_view(), name='bookmark-detail'),
    path('bookmarks/<int:pk>/favorite/', FavoriteBookmark.as_view(), name='bookmark-favorite'),
    path('categories/', CategoryList.as_view(), name='category-list'),
    path('categories/<int:pk>/', CategoryDetail.as_view(), name='category-detail'),
]
