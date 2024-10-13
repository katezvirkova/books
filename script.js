$(document).ready(function () {
    const apiUrl = 'http://localhost:8000/api/';

    // Завантаження всіх категорій
    function loadCategories() {
        $.get(`${apiUrl}categories/`, function (data) {
            $('#category').empty();
            $('#category').append('<option value="">No Category</option>');
            $('#category-list').empty();
            data.forEach(category => {
                $('#category').append(`<option value="${category.id}">${category.name}</option>`);
                $('#category-list').append(`
                    <button class="category-button" data-id="${category.id}">${category.name}</button>
                `);
            });

            // Прив'язка подій до кнопок категорій
            $('.category-button').off('click').on('click', function () {
                const categoryId = $(this).data('id');
                loadBookmarksByCategory(categoryId);
            });
        }).fail(function (xhr) {
            alert(`Error loading categories: ${xhr.responseText}`);
        });
    }

    // Завантаження всіх закладок
    function loadBookmarks() {
        $.get(`${apiUrl}bookmarks/`, function (data) {
            renderBookmarks(data);
        }).fail(function (xhr) {
            alert(`Error loading bookmarks: ${xhr.responseText}`);
        });
    }

    // Завантаження улюблених закладок
    function loadFavoriteBookmarks() {
        $.get(`${apiUrl}bookmarks/`, function (data) {
            const favorites = data.filter(bookmark => bookmark.favorite);
            renderBookmarks(favorites);
        }).fail(function (xhr) {
            alert(`Error loading favorite bookmarks: ${xhr.responseText}`);
        });
    }

    // Додавання нової категорії
    $('#category-form').submit(function (e) {
        e.preventDefault();
        const name = $('#new-category').val().trim();

        if (!name) {
            alert('Category name cannot be empty!');
            return;
        }

        $.ajax({
            url: `${apiUrl}categories/`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ name }),
            success: function () {
                loadCategories();
                $('#new-category').val('');
            },
            error: function (xhr) {
                alert(`Error adding category: ${xhr.responseText}`);
            }
        });
    });

    // Додавання нової закладки
    $('#bookmark-form').submit(function (e) {
        e.preventDefault();
        const url = $('#url').val().trim();
        const title = $('#title').val().trim();
        const categoryId = $('#category').val() || null;

        if (!url || !title) {
            alert('Both URL and Title are required!');
            return;
        }

        $.ajax({
            url: `${apiUrl}bookmarks/`,
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ url, title, category_id: categoryId }),
            success: function () {
                loadBookmarks();
                resetForm();
            },
            error: function (xhr) {
                alert(`Error adding bookmark: ${xhr.responseText}`);
            }
        });
    });

    // Пошук закладки за ID з перенаправленням на 404
    $('#search-bookmark-form').submit(function (e) {
        e.preventDefault();
        const bookmarkId = $('#bookmark-id').val().trim();

        if (!bookmarkId) {
            alert('Please enter a valid ID!');
            return;
        }

        $.get(`${apiUrl}bookmarks/${bookmarkId}/`, function (data) {
            renderSingleBookmark(data);
        }).fail(function (xhr) {
            if (xhr.status === 404) {
                window.location.href = "/404.html";
            } else {
                alert(`Error loading bookmark: ${xhr.responseText}`);
            }
        });
    });

    // Рендеринг списку закладок
    function renderBookmarks(data) {
        $('#bookmarks-list').empty();
        data.forEach(bookmark => {
            const isFavorite = bookmark.favorite ? '⭐' : '';
            const categoryName = bookmark.category ? bookmark.category.name : 'No Category';
            $('#bookmarks-list').append(`
                <div class="bookmark-item" id="bookmark-${bookmark.id}">
                    <div>
                        <a href="${bookmark.url}" target="_blank">${bookmark.title}</a> ${isFavorite}
                        <span class="category">(${categoryName})</span>
                    </div>
                    <div>
                        <button onclick="editBookmark(${bookmark.id})">Edit</button>
                        <button onclick="toggleFavorite(${bookmark.id})">Favorite</button>
                        <button onclick="deleteBookmark(${bookmark.id})">Delete</button>
                    </div>
                </div>
            `);
        });
    }

    // Рендеринг однієї закладки
    function renderSingleBookmark(bookmark) {
        $('#bookmarks-list').html(`
            <div class="bookmark-item">
                <div>
                    <a href="${bookmark.url}" target="_blank">${bookmark.title}</a> 
                    <span class="category">(${bookmark.category ? bookmark.category.name : 'No Category'})</span>
                </div>
            </div>
        `);
    }

    // Скидання форми після додавання/редагування
    function resetForm() {
        $('#url').val('');
        $('#title').val('');
        $('#category').val('');
    }

    // Прив'язка подій до кнопок фільтрації
    $('#view-all').off('click').on('click', function () {
        loadBookmarks();
    });

    $('#view-favorites').off('click').on('click', function () {
        loadFavoriteBookmarks();
    });

    // Початкове завантаження даних
    loadCategories();
    loadBookmarks();
});
