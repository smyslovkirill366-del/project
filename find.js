let currentFilter = 'Все';

// Получаем элементы
const subjectButtons = document.querySelectorAll('[data-subject]');
const homeworkContainer = document.getElementById('homework-container');
const emptyState = document.getElementById('empty-state');
const refreshBtn = document.getElementById('refresh-homework-btn');

// Загружаем и отображаем домашние задания при загрузке страницы
document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await window.authReady;
    if (!isAuthenticated) return;
    await loadHomeworks();
});

refreshBtn?.addEventListener('click', loadHomeworks);

// Обработчик фильтрации по предметам
subjectButtons.forEach(button => {
    button.addEventListener('click', () => {
        currentFilter = button.getAttribute('data-subject');

        // Убираем активный класс со всех кнопок
        subjectButtons.forEach(btn => btn.classList.remove('active'));

        // Добавляем активный класс к выбранной кнопке
        button.classList.add('active');

        // Перезагружаем задания с фильтром
        loadHomeworks();
    });
});

// Функция загрузки и отображения домашних заданий
async function loadHomeworks() {
    refreshBtn.disabled = true;
    refreshBtn.classList.add('is-loading');
    emptyState.textContent = 'Здесь пока нет домашних заданий';

    let homeworks;
    try {
        homeworks = await getHomework();
    } catch (error) {
        showDatabaseError(error);
        homeworkContainer.innerHTML = '';
        emptyState.textContent = 'Не удалось загрузить домашние задания';
        emptyState.style.display = 'block';
        refreshBtn.disabled = false;
        refreshBtn.classList.remove('is-loading');
        return;
    }

    // Фильтруем по выбранному предмету
    if (currentFilter !== 'Все') {
        homeworks = homeworks.filter(hw => hw.subject === currentFilter);
    }

    // Сортируем по дате (новые сначала)
    homeworks.sort((a, b) => new Date(b.date) - new Date(a.date));

    // Очищаем контейнер
    homeworkContainer.innerHTML = '';

    // Если заданий нет, показываем пустое состояние
    if (homeworks.length === 0) {
        emptyState.style.display = 'block';
        refreshBtn.disabled = false;
        refreshBtn.classList.remove('is-loading');
        return;
    }

    emptyState.style.display = 'none';

    // Создаем карточки для каждого задания
    homeworks.forEach(homework => {
        const card = createHomeworkCard(homework);
        homeworkContainer.appendChild(card);
    });

    refreshBtn.disabled = false;
    refreshBtn.classList.remove('is-loading');
}

// Функция создания карточки задания
function createHomeworkCard(homework) {
    const card = document.createElement('div');
    card.className = `homework-card priority-${homework.priority}${homework.completed ? ' is-completed' : ''}`;

    // Форматируем дату
    const date = new Date(homework.date);
    const formattedDate = date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const priority = PRIORITIES[homework.priority] || PRIORITIES.medium;
    card.innerHTML = `
        <div class="card-topline">
            <div class="card-subject">${escapeHtml(homework.subject)}</div>
            <span class="priority-badge">${priority.label}</span>
        </div>
        <div class="card-text">${escapeHtml(homework.text).replace(/\n/g, '<br>')}</div>
        ${homework.image ? `<img src="${homework.image}" alt="Фото ДЗ" class="card-image">` : ''}
        <div class="card-date">${formattedDate}</div>
        <div class="card-actions">
            <button class="btn card-complete" data-action="complete" data-id="${homework.id}">
                ${homework.completed ? 'Вернуть в список' : 'Выполнено'}
            </button>
            <button class="btn card-delete" data-action="delete" data-id="${homework.id}">Удалить</button>
        </div>
    `;

    return card;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

homeworkContainer.addEventListener('click', async event => {
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) return;

    const id = Number(actionButton.dataset.id);
    if (actionButton.dataset.action === 'delete') {
        await deleteHomeworkCard(id);
    } else {
        await toggleHomeworkCompletion(id);
    }
});

async function toggleHomeworkCompletion(id) {
    const button = homeworkContainer.querySelector(`[data-action="complete"][data-id="${id}"]`);
    if (button) button.disabled = true;

    try {
        const homeworks = await getHomework();
        const homework = homeworks.find(item => item.id === id);
        if (!homework) return;

        await updateHomework(id, { isDone: !homework.completed });
        await loadHomeworks();
    } catch (error) {
        showDatabaseError(error);
    }
}

async function deleteHomeworkCard(id) {
    if (!confirm('Удалить это домашнее задание?')) {
        return;
    }

    try {
        await deleteHomework(id);
        await loadHomeworks();
    } catch (error) {
        showDatabaseError(error);
    }
}
