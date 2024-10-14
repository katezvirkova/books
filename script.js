$(document).ready(function () {
    const apiUrl = 'http://localhost:8000/api/';

    // Завантаження всіх категорій
    function loadCategories() {
        $.get(`${apiUrl}categories/`, function (data) {
            // Очищення контейнерів перед додаванням нових категорій
            $('#category, #edit-category').empty().append('<option value="">No Category</option>');
            $('#category-list').empty();  // Очищення списку кнопок категорій

            data.forEach(category => {
                $('#category, #edit-category').append(`<option value="${category.id}">${category.name}</option>`);
                $('#category-list').append(`
                    <button class="category-button" data-id="${category.id}">${category.name}</button>
                `);
        });
        
   
        }).fail(xhr => alert(`Error loading categories: ${xhr.responseText}`));
    }

    // Завантаження всіх закладок
    function loadBookmarks() {
        $.get(`${apiUrl}bookmarks/`, renderBookmarks)
            .fail(xhr => alert(`Error loading bookmarks: ${xhr.responseText}`));
    }

    // Завантаження лише улюблених закладок
    function loadFavoriteBookmarks() {
        $.get(`${apiUrl}bookmarks/`, function (data) {
            const favorites = data.filter(bookmark => bookmark.favorite);
            renderBookmarks(favorites);
        }).fail(xhr => alert(`Error loading favorite bookmarks: ${xhr.responseText}`));
    }

    // Рендеринг закладок
    function renderBookmarks(data) {
        // Очищення списку перед рендерингом
        $('#bookmarks-list').empty();

        data.forEach(bookmark => {
            const favoriteIcon = bookmark.favorite ? '⭐' : '';
            $('#bookmarks-list').append(`
                <div class="bookmark-item" id="bookmark-${bookmark.id}">
                    <div>
                        <a href="${bookmark.url}" target="_blank">${bookmark.title}</a> ${favoriteIcon}
                        <span class="category">(${bookmark.category ? bookmark.category.name : 'No Category'})</span>
                    </div>
                    <div>
                        <button class="edit-button" data-id="${bookmark.id}">Edit</button>
                        <button class="favorite-button" data-id="${bookmark.id}">
                            ${bookmark.favorite ? 'Unfavorite' : 'Favorite'}
                        </button>
                        <button class="delete-button" data-id="${bookmark.id}">Delete</button>
                    </div>
                </div>
            `);
        });

        attachEventHandlers();
    }

    // Прив'язка подій до кнопок фільтрації
    $('#view-all').off('click').on('click', function () {
        loadBookmarks();
    });

    $('#view-favorites').off('click').on('click', function () {
        loadFavoriteBookmarks();
    });

    // Прив'язка подій до інших кнопок
    function attachEventHandlers() {
        $('#bookmarks-list').off('click')
            .on('click', '.edit-button', function () {
                const id = $(this).data('id');
                $.get(`${apiUrl}bookmarks/${id}/`, function (bookmark) {
                    openEditModal(bookmark);
                });
            })
            .on('click', '.favorite-button', function () {
                const id = $(this).data('id');
                toggleFavorite(id, $(this));
            })
            .on('click', '.delete-button', function () {
                const id = $(this).data('id');
                deleteBookmark(id);
            });
    }

    // Відкриття модального вікна для редагування
    function openEditModal(bookmark) {
        $('#edit-title').val(bookmark.title);
        $('#edit-url').val(bookmark.url);
        $('#edit-category').val(bookmark.category ? bookmark.category.id : '');

        $('#editModal').fadeIn();

        $('#edit-bookmark-form').off('submit').on('submit', function (e) {
            e.preventDefault();
            updateBookmark(bookmark.id);
        });
    }

    // Закриття модального вікна
    $('.close-button').click(function () {
        $('#editModal').fadeOut();
    });

    // Оновлення закладки
    function updateBookmark(id) {
        const title = $('#edit-title').val().trim();
        const url = $('#edit-url').val().trim();
        const categoryId = $('#edit-category').val() || null;

        if (!title || !url) {
            alert('Both Title and URL are required!');
            return;
        }

        $.ajax({
            url: `${apiUrl}bookmarks/${id}/`,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({ title, url, category_id: categoryId }),
            success: function () {
                $('#editModal').fadeOut();
                loadBookmarks();
            },
            error: xhr => alert(`Error updating bookmark: ${xhr.responseText}`)
        });
    }

    // Перемикання улюбленої закладки
    function toggleFavorite(id, button) {
        $.ajax({
            url: `${apiUrl}bookmarks/${id}/favorite/`,
            type: 'PATCH',
            success: function () {
                const isFavorite = button.text() === 'Unfavorite';
                button.text(isFavorite ? 'Favorite' : 'Unfavorite');
                loadBookmarks();
            },
            error: xhr => alert(`Error toggling favorite: ${xhr.responseText}`)
        });
    }

    // Видалення закладки
    function deleteBookmark(id) {
        $.ajax({
            url: `${apiUrl}bookmarks/${id}/`,
            type: 'DELETE',
            success: loadBookmarks,
            error: xhr => alert(`Error deleting bookmark: ${xhr.responseText}`)
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
            error: xhr => alert(`Error adding category: ${xhr.responseText}`)
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
                resetForm
                resetForm('bookmark-form');
            },
            error: xhr => alert(`Error adding bookmark: ${xhr.responseText}`)
        });
    });

    // Скидання форми
    function resetForm(formId) {
        $(`#${formId}`)[0].reset();
    }

    // Пошук закладки за ID
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

    // Початкове завантаження даних
    loadCategories();
    loadBookmarks();
});
