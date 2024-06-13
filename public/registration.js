document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const errorMessage = document.getElementById('errorMessage');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new URLSearchParams(new FormData(registerForm)).toString();
        const response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: formData
        });
        const message = await response.text();
        if (response.ok) {
            window.location.href = '/';
        } else {
            errorMessage.textContent = message;
        }
    });
});