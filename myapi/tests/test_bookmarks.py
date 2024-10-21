import pytest
from django.urls import reverse
from myapi.models import Bookmark, Category


@pytest.mark.django_db
def test_get_bookmark_list(api_client, user) -> None:
    login_url = reverse('token_obtain_pair')
    tokens = api_client.post(
        login_url,
        {
            'username': 'meowuser', 'password': '123456kk',
        },
        format="json"
    ).data

    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')

    category = Category.objects.create(name='Tech')

    Bookmark.objects.create(user=user, url='http://example.com', title='Example Bookmark', category=category)

    response = api_client.get("/api/bookmarks/", format="json")
    assert response.status_code == 200
    assert len(response.data) == 1
    assert response.data[0].get('title') == 'Example Bookmark'


@pytest.mark.django_db
def test_get_bookmark_empty_list(api_client, user) -> None:
    login_url = reverse('token_obtain_pair')
    tokens = api_client.post(
        login_url,
        {
            'username': 'meowuser', 'password': '123456kk',
        },
        format="json"
    ).data

    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')

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
def test_create_bookmark(api_client, user) -> None:
    login_url = reverse('token_obtain_pair')
    tokens = api_client.post(
        login_url,
        {
            'username': 'meowuser', 'password': '123456kk',
        },
        format="json"
    ).data

    api_client.credentials(HTTP_AUTHORIZATION=f'Bearer {tokens["access"]}')

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
