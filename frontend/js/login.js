const loginForm = document.getElementById('loginForm');
const errorMsg = document.getElementById('error-msg');

// Check if already logged in
(async () => {
    try {
        const user = await fetchAPI('/auth/me');
        if (user) {
            window.location.href = '/dashboard.html';
        }
    } catch (e) {
        // Not logged in, stay here
    }
})();

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const data = await fetchAPI('/auth/login', 'POST', { username, password });
        if (data && data.message === 'Logged in successfully') {
            window.location.href = '/dashboard.html';
        } else {
            errorMsg.textContent = 'Login failed';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        errorMsg.textContent = err.message || 'Login failed';
        errorMsg.style.display = 'block';
    }
});
