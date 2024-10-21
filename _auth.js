$(document).ready(function () {
    const apiUrl = 'http://127.0.0.1:8000/api/auth/';

    // Функція для валідації полів
    function validateRegistrationForm(username, firstName, lastName, email, password, passwordCheck) {
        if (!username || !firstName || !lastName || !email || !password || !passwordCheck) {
            return "All fields are required.";
        }

        if (password.length < 8) {
            return "Password must be at least 8 characters long.";
        }

        // Перевірка на складність паролю
        if (!/\d/.test(password) || !/[A-Za-z]/.test(password)) {
            return "Password must contain at least one letter and one number.";
        }

        if (password !== passwordCheck) {
            return "Passwords do not match.";
        }

        // Перевірка на валідність електронної пошти
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            return "Enter a valid email address.";
        }

        // Перевірка на максимальну кількість символів
        if (username.length > 150 || firstName.length > 30 || lastName.length > 30 || email.length > 254) {
            return "Input exceeds maximum character limits.";
        }

        return null; // Все вірно
    }

    // Реєстрація
    $('#register-form').on('submit', async function (e) {
        e.preventDefault();
        const username = $('#reg-username').val();
        const firstName = $('#first-name').val();
        const lastName = $('#last-name').val();
        const email = $('#email').val();
        const password = $('#reg-password').val();
        const passwordCheck = $('#confirm-password').val();

        // Валідація
        const validationError = validateRegistrationForm(username, firstName, lastName, email, password, passwordCheck);
        if (validationError) {
            $('#register-error').text(validationError).removeClass('hidden');
            return; // Припинити виконання, якщо є помилка
        }

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

            // Логування відповіді сервера
            const responseData = await response.json();
            console.log(responseData);

            if (!response.ok) {
                $('#register-error').text(responseData.error || 'Registration failed.').removeClass('hidden');
                return;
            }

            alert('Registration successful! Redirecting to login...');
            window.location.href = 'login.html'; // Перенаправлення на сторінку логіну
        } catch (error) {
            console.error(error); // Логування помилки
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

            const data = await response.json();
            console.log(data); // Логування відповіді для відстеження помилок

            if (!response.ok) {
                $('#login-error').text(data.error || 'Login failed.').removeClass('hidden');
                return;
            }

            localStorage.setItem('access', data.access);
            localStorage.setItem('refresh', data.refresh);
            localStorage.setItem('username', username);

            window.location.href = './index.html'; // Перенаправлення на сторінку закладок
        } catch (error) {
            console.error(error); // Логування помилки
            $('#login-error').text('An error occurred. Please try again.').removeClass('hidden');
        }
    });
});
