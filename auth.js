function revealAuthenticatedPage() {
    document.documentElement.classList.remove('auth-pending');
}

function showAuthError(error) {
    let modal = document.getElementById('auth-error-modal');

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'auth-error-modal';
        modal.className = 'database-modal';
        modal.innerHTML = `
            <div class="database-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="auth-error-title">
                <svg class="database-modal-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3 2.8 20h18.4L12 3Z"></path>
                    <path d="M12 9v5M12 17h.01"></path>
                </svg>
                <h2 id="auth-error-title">Ошибка входа</h2>
                <p class="database-error-message"></p>
                <button type="button" class="btn database-modal-close">Закрыть</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.database-modal-close').addEventListener('click', () => {
            modal.classList.remove('is-visible');
        });
    }

    modal.querySelector('.database-error-message').textContent =
        error?.message || 'Не удалось выполнить вход. Проверьте данные и попробуйте ещё раз.';
    modal.classList.add('is-visible');
}

async function protectPage() {
    const isPublicPage = document.documentElement.dataset.publicPage === 'true';

    if (!supabaseClient) {
        if (isPublicPage) {
            revealAuthenticatedPage();
            return true;
        } else {
            window.location.replace('login.html');
            return false;
        }
    }

    const { data, error } = await supabaseClient.auth.getSession();

    if (isPublicPage) {
        if (!error && data.session) {
            window.location.replace('index.html');
            return false;
        }

        revealAuthenticatedPage();
        return true;
    }

    if (error || !data.session) {
        window.location.replace('login.html');
        return false;
    }

    revealAuthenticatedPage();
    return true;
}

async function signOutUser() {
    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        showAuthError(error);
        return;
    }

    window.location.replace('login.html');
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-logout]').forEach(button => {
        button.addEventListener('click', signOutUser);
    });
});

window.authReady = protectPage().catch(error => {
    console.error('Auth error:', error);
    window.location.replace('login.html');
    return false;
});
