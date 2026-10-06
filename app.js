const SUBJECTS = [
    'Русский язык',
    'Литература',
    'Иностранный язык',
    'Алгебра',
    'Геометрия',
    'Вероятность и статистика',
    'Информатика',
    'История',
    'Обществознание',
    'География',
    'Физика',
    'Химия',
    'Биология',
    'Труд (технология)',
    'Основы безопасности и защиты Родины (ОБЗР)',
    'Физическая культура'
];

const PRIORITIES = {
    urgent: { label: 'Срочно', color: 'urgent' },
    medium: { label: 'Средне', color: 'medium' },
    later: { label: 'Потом', color: 'later' }
};

function getLocalDateKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getStats(homeworks = []) {
    const completedHomeworks = homeworks.filter(homework => homework.completed);
    const xp = completedHomeworks.length * 10;
    const level = Math.floor(xp / 100) + 1;
    const levelXp = xp % 100;

    const days = [];
    const counts = {};
    const today = new Date();

    for (let offset = 6; offset >= 0; offset -= 1) {
        const date = new Date(today);
        date.setHours(12, 0, 0, 0);
        date.setDate(today.getDate() - offset);
        const key = getLocalDateKey(date);
        days.push({
            key,
            label: date.toLocaleDateString('ru-RU', { weekday: 'short' }).replace('.', ''),
            shortDate: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'numeric' })
        });
        counts[key] = 0;
    }

    completedHomeworks.forEach(homework => {
        const completedDate = homework.date;

        if (Object.prototype.hasOwnProperty.call(counts, completedDate)) {
            counts[completedDate] += 1;
        }
    });

    return { xp, level, levelXp, completedCount: completedHomeworks.length, days, counts };
}

function getGrades() {
    try {
        return JSON.parse(localStorage.getItem('grades')) || {};
    } catch {
        return {};
    }
}

function saveGrades(grades) {
    localStorage.setItem('grades', JSON.stringify(grades));
}

function setTheme(theme) {
    const isDark = theme === 'dark';
    document.body.classList.toggle('dark-theme', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', isDark ? 'Включить светлую тему' : 'Включить тёмную тему');
        themeToggle.setAttribute('title', isDark ? 'Светлая тема' : 'Тёмная тема');
        themeToggle.querySelector('.theme-icon-sun')?.classList.toggle('is-hidden', isDark);
        themeToggle.querySelector('.theme-icon-moon')?.classList.toggle('is-hidden', !isDark);
    }
}

function setupTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);

    const themeToggle = document.getElementById('theme-toggle');
    themeToggle?.addEventListener('click', () => {
        setTheme(document.body.classList.contains('dark-theme') ? 'light' : 'dark');
    });
}

function showDatabaseError(error) {
    console.error('Supabase error:', error);

    let modal = document.getElementById('database-error-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'database-error-modal';
        modal.className = 'database-modal';
        modal.innerHTML = `
            <div class="database-modal-card" role="alertdialog" aria-modal="true" aria-labelledby="database-error-title">
                <svg class="database-modal-icon" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12 3 2.8 20h18.4L12 3Z"></path>
                    <path d="M12 9v5M12 17h.01"></path>
                </svg>
                <h2 id="database-error-title">Ошибка базы данных</h2>
                <p class="database-error-message"></p>
                <button type="button" class="btn database-modal-close">Закрыть</button>
            </div>
        `;
        document.body.appendChild(modal);
        modal.querySelector('.database-modal-close').addEventListener('click', () => {
            modal.classList.remove('is-visible');
        });
    }

    const message = error?.message || 'Не удалось выполнить запрос. Попробуйте ещё раз.';
    modal.querySelector('.database-error-message').textContent = message;
    modal.classList.add('is-visible');
}

document.addEventListener('DOMContentLoaded', setupTheme);
