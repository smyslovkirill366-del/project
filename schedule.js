const scheduleData = {
    // Расписание только для 9 «В» класса.
    'Понедельник': [
        'Разговоры о важном 17к',
        'Английский язык 29/6к',
        'Химия 26к',
        'Алгебра 6к',
        'Биология 27к',
        'Физическая культура',
        'Русский язык 9к'
    ],
    'Вторник': [
        'Физика 24к',
        'Геометрия 17к',
        'Английский язык 29/6к',
        'География 9к',
        'История 34к',
        'Вероятность и статистика 31к',
        'Литература 6к'
    ],
    'Среда': [
        'Биология 27к',
        'Русский язык 17к',
        'Литература 17к',
        'Спортивный туризм 17к',
        'Алгебра 6к',
        'Физика 24к',
        'Химия 26к'
    ],
    'Четверг': [
        'ОБЗР 17к',
        'История 34к',
        'Информатика / Английский язык (32к / 29к)',
        'Информатика / Английский язык (32к / 6к)',
        'География 9к',
        'Физическая культура',
        'Классный час 17к'
    ],
    'Пятница': [
        'Физика',
        'Труд(технология) 10/36к',
        'Обществознание 34к',
        'Русский язык 6к',
        'Литература 12к',
        'Алгебра 27к',
        'Геометрия 27к'
    ]
};

const scheduleDays = Object.keys(scheduleData);
const scheduleHead = document.getElementById('schedule-head');
const scheduleBody = document.getElementById('schedule-body');
const scheduleStatus = document.getElementById('schedule-status');
const todayScheduleButton = document.getElementById('today-schedule-btn');

function getTodayScheduleDay() {
    const dayIndex = new Date().getDay();
    return dayIndex >= 1 && dayIndex <= 5 ? scheduleDays[dayIndex - 1] : null;
}

function renderSchedule() {
    scheduleHead.innerHTML = `
        <tr>
            <th class="lesson-number-heading">Урок</th>
            ${scheduleDays.map(day => `<th data-schedule-day="${day}">${day}</th>`).join('')}
        </tr>
    `;

    const lessonCount = Math.max(...scheduleDays.map(day => scheduleData[day].length));
    scheduleBody.innerHTML = Array.from({ length: lessonCount }, (_, index) => `
        <tr>
            <th class="lesson-number">${index + 1}</th>
            ${scheduleDays.map(day => {
                const lesson = scheduleData[day][index] || '';
                return `<td data-schedule-day="${day}" class="${lesson ? '' : 'is-empty'}">${lesson || '—'}</td>`;
            }).join('')}
        </tr>
    `).join('');

    const today = getTodayScheduleDay();
    if (today) {
        document.querySelectorAll(`[data-schedule-day="${today}"]`)
            .forEach(element => element.classList.add('is-today'));
        scheduleStatus.textContent = `Сегодня: ${today}`;
    } else {
        scheduleStatus.textContent = 'Сегодня выходной день';
    }
}

todayScheduleButton.addEventListener('click', () => {
    const today = getTodayScheduleDay();
    document.querySelectorAll('.schedule-table .is-today')
        .forEach(element => element.classList.remove('is-today'));

    if (!today) {
        scheduleStatus.textContent = 'Сегодня выходной день';
        return;
    }

    document.querySelectorAll(`[data-schedule-day="${today}"]`)
        .forEach(element => element.classList.add('is-today'));
    scheduleStatus.textContent = `Сегодня: ${today}`;
});

renderSchedule();
