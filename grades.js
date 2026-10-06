const gradesList = document.getElementById('grades-list');
const averageValue = document.getElementById('average-value');
const grades = getGrades();

function updateAverage() {
    const values = Object.values(grades).filter(value => [2, 3, 4, 5].includes(Number(value)));
    const average = values.length
        ? (values.reduce((sum, value) => sum + Number(value), 0) / values.length).toFixed(2)
        : '—';

    averageValue.textContent = average;
}

SUBJECTS.forEach(subject => {
    const row = document.createElement('div');
    row.className = 'grade-row';
    row.innerHTML = `
        <span class="grade-subject">${subject}</span>
        <select class="grade-select" aria-label="Оценка по предмету ${subject}">
            <option value="">Не выбрана</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
        </select>
    `;

    const select = row.querySelector('select');
    if (grades[subject]) {
        select.value = String(grades[subject]);
    }

    select.addEventListener('change', event => {
        if (event.target.value) {
            grades[subject] = Number(event.target.value);
        } else {
            delete grades[subject];
        }
        saveGrades(grades);
        updateAverage();
    });

    gradesList.appendChild(row);
});

updateAverage();
