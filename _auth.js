document.addEventListener('DOMContentLoaded', () => {
    const accessToken = localStorage.getItem('access');


    if (accessToken && window.location.pathname.includes('login.html')) {
        window.location.href = 'http://localhost:8000/api/bookmarks/';
    }


    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('http://127.0.0.1:8000/api/auth/login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password }),
                });

                if (!response.ok) throw new Error('Invalid credentials');

                const data = await response.json();
                localStorage.setItem('access', data.access);
                localStorage.setItem('refresh', data.refresh);
                localStorage.setItem('username', username);

                window.location.href = 'http://localhost:8000/api/bookmarks/';
            } catch (error) {
                document.getElementById('error-message').classList.remove('hidden');
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        const registerForm = document.getElementById('register-form');
        
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('reg-username').value;
                const firstName = document.getElementById('first-name').value;
                const lastName = document.getElementById('last-name').value;
                const email = document.getElementById('email').value;
                const password = document.getElementById('reg-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
    
                
                if (password !== confirmPassword) {
                    alert('Passwords do not match!');
                    return;
                }
    
                try {
                   
                    const response = await fetch('http://127.0.0.1:8000/api/auth/register/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, first_name: firstName, last_name: lastName, email, password }),
                    });
    
                    
                    if (!response.ok) throw new Error('Registration failed');
    
                    
                    alert('Registration successful! Redirecting to bookmarks page...');
    
                    
                    window.location.href = 'http://localhost:8000/api/bookmarks/';
                } catch (error) {
                    document.getElementById('register-error').classList.remove('hidden');
                }
            });
        }
    });
    
   
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('username');
            window.location.href = 'login.html';
        });
    }
});