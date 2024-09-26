document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const registerMessageElement = document.getElementById('register-message');
    const loginMessageElement = document.getElementById('login-message');

    // Handle registration form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const formData = {
                username: document.getElementById('register-username').value,
                email: document.getElementById('register-email').value,
                password: document.getElementById('register-password').value,
            };

            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const result = await response.json();

                registerMessageElement.textContent = response.ok ? result.message : result.message;
                registerMessageElement.style.color = response.ok ? 'green' : 'red';

                if (response.ok) {
                    registerForm.reset();
                    setTimeout(() => window.location.href = '/login', 2000);
                }
            } catch (error) {
                registerMessageElement.textContent = 'Error: ' + error.message;
                registerMessageElement.style.color = 'red';
            }
        });
    }

    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const loginData = {
                username: document.getElementById('login-username').value,
                password: document.getElementById('login-password').value,
            };

            try {
                const response = await fetch('http://localhost:5000/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(loginData),
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('token', result.token);
                    loginMessageElement.textContent = 'Login successful';
                    loginMessageElement.style.color = 'green';

                    // Fetch protected content
                    fetchProtectedContent();
                } else {
                    loginMessageElement.textContent = result.message;
                    loginMessageElement.style.color = 'red';
                }
            } catch (error) {
                loginMessageElement.textContent = 'Error: ' + error.message;
                loginMessageElement.style.color = 'red';
            }
        });
    }

    // Fetch protected content
    async function fetchProtectedContent() {
        const token = localStorage.getItem('token');
        console.log('Token retrieved:', token); // Debug log

        if (!token) {
            console.error('No token found');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/protected', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Response status:', response.status); // Debug log
            const result = await response.json();
            console.log('Response body:', result); // Debug log

            if (response.ok) {
                console.log(result.message);
            } else {
                console.error(result.message);
            }
        } catch (error) {
            console.error('Error fetching protected content:', error);
        }
    }

   
});