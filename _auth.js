$(document).ready(function () {
    const apiUrl = 'http://127.0.0.1:8000/api/auth/';

    // Реєстрація
    $('#register-form').on('submit', async function (e) {
        e.preventDefault();
        const username = $('#reg-username').val();
        const firstName = $('#first-name').val();
        const lastName = $('#last-name').val();
        const email = $('#email').val();
        const password = $('#reg-password').val();
        const passwordCheck = $('#confirm-password').val();

        try {
            const response = await fetch(`${apiUrl}register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    password_check: passwordCheck,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                $('#register-error').text(errorData.error || 'Registration failed.').removeClass('hidden');
                return;
            }

            alert('Registration successful! Redirecting to login...');
            window.location.href = 'login.html'; // Перенаправлення на сторінку логіну
        } catch (error) {
            $('#register-error').text('An error occurred. Please try again.').removeClass('hidden');
        }
    });

    // Логін
    $('#login-form').on('submit', async function (e) {
        e.preventDefault();
        const username = $('#username').val();
        const password = $('#password').val();

        try {
            const response = await fetch(`${apiUrl}login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                $('#login-error').text(errorData.error || 'Login failed.').removeClass('hidden');
                return;
            }

            const data = await response.json();
            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            localStorage.setItem('username', username);

            window.location.href = './index.html'; // Перенаправлення на сторінку закладок
        } catch (error) {
            $('#login-error').text('An error occurred. Please try again.').removeClass('hidden');
        }
    });
});
