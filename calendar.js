const calendarGrid = document.getElementById('calendar-grid');
const calendarMonthTitle = document.getElementById('calendar-month-title');
const selectedDateTitle = document.getElementById('selected-date-title');
const calendarTaskList = document.getElementById('calendar-task-list');
const refreshCalendarButton = document.getElementById('refresh-calendar-btn');

const calendarState = {
    currentDate: new Date(),
    homeworks: [],
    byDate: new Map(),
    selectedDate: null
};

function localDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function priorityClass(value) {
    if (value === 'Срочно' || value === 'urgent') return 'priority-urgent';
    if (value === 'Потом' || value === 'later') return 'priority-later';
    return 'priority-medium';
}

function priorityLabel(value) {
    if (value === 'Срочно' || value === 'urgent') return 'Срочно';
    if (value === 'Потом' || value === 'later') return 'Потом';
    return 'Средне';
}

function escapeCalendarText(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function buildHomeworkMap() {
    calendarState.byDate = new Map();

    calendarState.homeworks.forEach(homework => {
        if (!calendarState.byDate.has(homework.due_date)) {
            calendarState.byDate.set(homework.due_date, []);
        }
        calendarState.byDate.get(homework.due_date).push(homework);
    });
}

function renderCalendar() {
    const year = calendarState.currentDate.getFullYear();
    const month = calendarState.currentDate.getMonth();
    const monthName = calendarState.currentDate.toLocaleDateString('ru-RU', {
        month: 'long',
        year: 'numeric'
    });
    calendarMonthTitle.textContent = `Календарь заданий: ${monthName}`;

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstWeekday = (firstDay.getDay() + 6) % 7;
    const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;
    const todayKey = localDateKey(new Date());

    calendarGrid.innerHTML = '';

    for (let index = 0; index < cellCount; index += 1) {
        const dayNumber = index - firstWeekday + 1;
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'calendar-day';

        if (dayNumber < 1 || dayNumber > daysInMonth) {
            cell.classList.add('is-outside');
            cell.disabled = true;
            calendarGrid.appendChild(cell);
            continue;
        }

        const dayDate = new Date(year, month, dayNumber);
        const key = localDateKey(dayDate);
        const tasks = calendarState.byDate.get(key) || [];

        if (key === todayKey) cell.classList.add('is-today');
        if (key === calendarState.selectedDate) cell.classList.add('is-selected');

        const bars = tasks
            .map(task => `<span class="homework-bar ${priorityClass(task.priority)}" title="${priorityLabel(task.priority)}"></span>`)
            .join('');

        cell.innerHTML = `
            <span class="calendar-day-number">${dayNumber}</span>
            <span class="homework-bars">${bars}</span>
        `;
        cell.addEventListener('click', () => selectCalendarDate(key));
        calendarGrid.appendChild(cell);
    }
}

function renderSelectedDay() {
    if (!calendarState.selectedDate) {
        selectedDateTitle.textContent = 'Выберите день';
        calendarTaskList.innerHTML = '<p class="empty-state">Нажмите на день, чтобы увидеть задания.</p>';
        return;
    }

    const selectedDate = new Date(`${calendarState.selectedDate}T12:00:00`);
    selectedDateTitle.textContent = selectedDate.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });

    const tasks = calendarState.byDate.get(calendarState.selectedDate) || [];
    if (!tasks.length) {
        calendarTaskList.innerHTML = '<p class="empty-state">На этот день заданий нет.</p>';
        return;
    }

    calendarTaskList.innerHTML = tasks.map(task => `
        <article class="calendar-task">
            <span class="calendar-task-priority ${priorityClass(task.priority)}">${priorityLabel(task.priority)}</span>
            <div>
                <strong>${escapeCalendarText(task.subject)}</strong>
                <p>${escapeCalendarText(task.task)}</p>
            </div>
        </article>
    `).join('');
}

function selectCalendarDate(key) {
    calendarState.selectedDate = key;
    renderCalendar();
    renderSelectedDay();
}

async function loadCalendar() {
    refreshCalendarButton.disabled = true;
    refreshCalendarButton.classList.add('is-loading');

    try {
        calendarState.homeworks = await getHomeworkForCalendar();
        buildHomeworkMap();
        renderCalendar();
        renderSelectedDay();
    } catch (error) {
        showDatabaseError(error);
        calendarTaskList.innerHTML = '<p class="empty-state">Не удалось загрузить задания.</p>';
    } finally {
        refreshCalendarButton.disabled = false;
        refreshCalendarButton.classList.remove('is-loading');
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await window.authReady;
    if (!isAuthenticated) return;

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    calendarState.selectedDate = localDateKey(today);
    calendarState.currentDate = new Date(currentYear, currentMonth, 1);
    await loadCalendar();
});

refreshCalendarButton.addEventListener('click', loadCalendar);
