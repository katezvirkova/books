import pytest
from django.urls import reverse
from myapi.models import Bookmark, Category
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
import time
from datetime import timedelta

@pytest.fixture
def login_user(api_client, user):
    login_url = reverse('token_obtain_pair')
    tokens = api_client.post(
        login_url,
        {
            'username': 'meowuser', 'password': '123456kk',
        },
        format="json"
    ).data
    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
    return api_client

@pytest.mark.django_db
def test_register_user(api_client) -> None:
    response = api_client.post(
        "/api/auth/register/",
        {
            'first_name': 'John',
            'last_name': 'Doe',
            'username': 'meowuser',
            'password': '123456kk',
            'password_check': '123456kk',
            'email': 'newuser@example.com',
        },
        format="json"
    )
    assert response.status_code == 201
    assert User.objects.filter(username='meowuser').exists()


@pytest.mark.django_db
def test_logout_user(login_user, user, settings) -> None:
    api_client = login_user
    login_url = reverse('token_obtain_pair')
    tokens = api_client.post(
        login_url,
        {
            'username': 'meowuser', 'password': '123456kk',
        },
        format="json"
    ).data

    response = api_client.post("/api/auth/logout/", {"refresh": tokens["refresh"]}, format="json")
    assert response.status_code == 205

    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')
    response = api_client.get("/api/bookmarks/", format="json")
    assert response.status_code == 200

    time.sleep(6)

    response = api_client.get("/api/bookmarks/", format="json")
    assert response.status_code == 401

@pytest.mark.django_db
def test_get_bookmark_list(login_user, user) -> None:
    api_client = login_user
    category = Category.objects.create(name='Tech')

    Bookmark.objects.create(user=user, url='http://example.com', title='Example Bookmark', category=category)

    response = api_client.get("/api/bookmarks/", format="json")
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0].get('title') == 'Example Bookmark'


@pytest.mark.django_db
def test_get_bookmark_empty_list(login_user, user) -> None:
    api_client = login_user
    response = api_client.get("/api/bookmarks/", format="json")
    assert response.status_code == 200
    assert response.data == []


@pytest.mark.django_db
def test_create_bookmark_no_auth(api_client, user) -> None:
    category = Category.objects.create(name='Tech')
    response = api_client.post(
        "/api/bookmarks/",
        {
            'title': 'New Bookmark',
            'url': 'http://example.com',
            'category_id': category.id,
        },
        format="json"
    )
    assert response.status_code == 401


@pytest.mark.django_db
def test_create_bookmark(login_user, user) -> None:
    api_client = login_user
    category = Category.objects.create(name='Tech')

    response = api_client.post(
        "/api/bookmarks/",
        {
            'title': 'New Bookmark',
            'url': 'http://example.com',
            'category_id': category.id,
        },
        format="json"
    )
    assert response.status_code == 201
    assert response.data['title'] == 'New Bookmark'
    assert response.data['url'] == 'http://example.com'
    assert response.data['category']['name'] == 'Tech'


@pytest.mark.django_db
def test_create_bookmark_invalid_token(api_client, user) -> None:
    category = Category.objects.create(name='Tech')
    api_client.credentials(HTTP_AUTHORIZATION='Bearer invalidtoken')

    response = api_client.post(
        "/api/bookmarks/",
        {
            'title': 'New Bookmark',
            'url': 'http://example.com',
            'category_id': category.id,
        },
        format="json"
    )
    assert response.status_code == 401


@pytest.mark.django_db
def test_update_bookmark(login_user, user) -> None:
    api_client = login_user
    category = Category.objects.create(name='Tech')
    bookmark = Bookmark.objects.create(user=user, url='http://example.com', title='Old Bookmark', category=category)

    response = api_client.put(
        f"/api/bookmarks/{bookmark.id}/",
        {
            'title': 'Updated Bookmark',
            'url': 'http://updatedexample.com',
            'category_id': category.id,
        },
        format="json"
    )
    assert response.status_code == 200
    assert response.data['title'] == 'Updated Bookmark'
    assert response.data['url'] == 'http://updatedexample.com'


@pytest.mark.django_db
def test_delete_bookmark(login_user, user) -> None:
    api_client = login_user
    category = Category.objects.create(name='Tech')
    bookmark = Bookmark.objects.create(user=user, url='http://example.com', title='Example Bookmark', category=category)

    response = api_client.delete(f"/api/bookmarks/{bookmark.id}/", format="json")
    assert response.status_code == 204
    response = api_client.get(f"/api/bookmarks/{bookmark.id}/", format="json")
    assert response.status_code == 404


@pytest.mark.django_db
def test_create_bookmark_invalid_data(login_user, user) -> None:
    api_client = login_user

    response = api_client.post(
        "/api/bookmarks/",
        {
            'title': '',
            'url': 'invalid-url',
            'category_id': 999,
        },
        format="json"
    )
    assert response.status_code == 400


@pytest.mark.django_db
def test_get_bookmark_by_id(login_user, user) -> None:
    api_client = login_user
    category = Category.objects.create(name='Tech')
    bookmark = Bookmark.objects.create(user=user, url='http://example.com', title='Example Bookmark', category=category)

    response = api_client.get(f"/api/bookmarks/{bookmark.id}/", format="json")
    assert response.status_code == 200
    assert response.data['title'] == 'Example Bookmark'
