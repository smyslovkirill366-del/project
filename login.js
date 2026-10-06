const loginForm = document.getElementById('login-form');
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginButton = document.getElementById('login-button');

loginForm.addEventListener('submit', async event => {
    event.preventDefault();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) {
        showAuthError({ message: 'Введите email и пароль.' });
        return;
    }

    loginButton.disabled = true;

    try {
        if (!supabaseClient) {
            throw new Error('Сервис авторизации недоступен. Проверьте подключение к интернету.');
        }

        const { error } = await supabaseClient.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;
        window.location.replace('index.html');
    } catch (error) {
        showAuthError(error);
    } finally {
        loginButton.disabled = false;
    }
});
