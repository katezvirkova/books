$(document).ready(function () {
    const apiUrl = 'http://localhost:8000/api/bookmarks/';
    
    
    const accessToken = localStorage.getItem('access');
    
   
    if (!accessToken) {
        window.location.href = 'login.html';
        return;
    }

    
    $('#logout-button').on('click', function () {
        localStorage.removeItem('access');
        localStorage.removeItem('refresh');
        localStorage.removeItem('username');
        alert('You have been logged out.');
        window.location.href = 'login.html'; 
    });

    function loadCategories() {
        $.ajax({
            url: `${apiUrl}categories/`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}` 
            },
            success: function (data) {
                $('#category, #edit-category').empty().append('<option value="">No Category</option>');
                data.forEach(category => {
                    $('#category, #edit-category').append(`<option value="${category.id}">${category.name}</option>`);
                });
            },
            error: function (xhr) {
                alert(`Error loading categories: ${xhr.responseText}`);
            }
        });
    }

    function loadBookmarks() {
        $.ajax({
            url: `${apiUrl}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}` 
            },
            success: function (data) {
                renderBookmarks(data);
            },
            error: function (xhr) {
                alert(`Error loading bookmarks: ${xhr.responseText}`);
            }
        });
    }

    function loadFavoriteBookmarks() {
        $.ajax({
            url: `${apiUrl}`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}` 
            },
            success: function (data) {
                const favorites = data.filter(bookmark => bookmark.favorite);
                renderBookmarks(favorites);
            },
            error: function (xhr) {
                alert(`Error loading favorite bookmarks: ${xhr.responseText}`);
            }
        });
    }

    function renderBookmarks(data) {
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

    $('#view-all').off('click').on('click', function () {
        loadBookmarks();
    });

    $('#view-favorites').off('click').on('click', function () {
        loadFavoriteBookmarks();
    });

    function attachEventHandlers() {
        $('#bookmarks-list').off('click')
            .on('click', '.edit-button', function () {
                const id = $(this).data('id');
                $.ajax({
                    url: `${apiUrl}${id}/`,
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${accessToken}` 
                    },
                    success: function (bookmark) {
                        openEditModal(bookmark);
                    },
                    error: function (xhr) {
                        alert(`Error loading bookmark: ${xhr.responseText}`);
                    }
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

    $('.close-button').click(function () {
        $('#editModal').fadeOut();
    });

    function updateBookmark(id) {
        const title = $('#edit-title').val().trim();
        const url = $('#edit-url').val().trim();
        const categoryId = $('#edit-category').val() || null;

        if (!title || !url) {
            alert('Both Title and URL are required!');
            return;
        }

        $.ajax({
            url: `${apiUrl}${id}/`,
            method: 'PUT',
            contentType: 'application/json',
            headers: {
                'Authorization': `Bearer ${accessToken}`, 
            },
            data: JSON.stringify({ title, url, category_id: categoryId }),
            success: function () {
                $('#editModal').fadeOut();
                loadBookmarks();
            },
            error: function (xhr) {
                alert(`Error updating bookmark: ${xhr.responseText}`);
            }
        });
    }

    function toggleFavorite(id, button) {
        $.ajax({
            url: `${apiUrl}${id}/favorite/`,
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${accessToken}`, 
            },
            success: function () {
                const isFavorite = button.text() === 'Unfavorite';
                button.text(isFavorite ? 'Favorite' : 'Unfavorite');
                loadBookmarks();
            },
            error: function (xhr) {
                alert(`Error toggling favorite: ${xhr.responseText}`);
            }
        });
    }

    function deleteBookmark(id) {
        $.ajax({
            url: `${apiUrl}${id}/`,
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${accessToken}`, 
            },
            success: loadBookmarks,
            error: function (xhr) {
                alert(`Error deleting bookmark: ${xhr.responseText}`);
            }
        });
    }

    $('#category-form').submit(function (e) {
        e.preventDefault();
        const name = $('#new-category').val().trim();

        if (!name) {
            alert('Category name cannot be empty!');
            return;
        }

        $.ajax({
            url: `${apiUrl}categories/`,
            method: 'POST',
            contentType: 'application/json',
            headers: {
                'Authorization': `Bearer ${accessToken}`, 
            },
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
            url: `${apiUrl}`,
            method: 'POST',
            contentType: 'application/json',
            headers: {
                'Authorization': `Bearer ${accessToken}`, 
            },
            data: JSON.stringify({ url, title, category_id: categoryId }),
            success: function () {
                loadBookmarks();
                resetForm('bookmark-form');
            },
            error: function (xhr) {
                alert(`Error adding bookmark: ${xhr.responseText}`);
            }
        });
    });

    function resetForm(formId) {
        $(`#${formId}`)[0].reset();
    }

    $('#search-bookmark-form').submit(function (e) {
        e.preventDefault();
        const bookmarkId = $('#bookmark-id').val().trim();

        if (!bookmarkId) {
            alert('Please enter a valid ID!');
            return;
        }

        $.ajax({
            url: `${apiUrl}${bookmarkId}/`,
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`, 
            },
            success: function (data) {
                renderSingleBookmark(data);
            },
            error: function (xhr) {
                if (xhr.status === 404) {
                    window.location.href = "/404.html";
                } else {
                    alert(`Error loading bookmark: ${xhr.responseText}`);
                }
            }
        });
    });

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

    
    loadCategories();
    loadBookmarks();
});
