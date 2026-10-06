let selectedSubject = '';
let selectedFile = null;
let fileDataURL = null;

// Получаем элементы
const subjectButtons = document.querySelectorAll('[data-subject]');
const homeworkText = document.getElementById('homework-text');
const homeworkFile = document.getElementById('homework-file');
const homeworkDate = document.getElementById('homework-date');
const homeworkPriority = document.getElementById('homework-priority');
const saveBtn = document.getElementById('save-btn');
const selectedSubjectDisplay = document.getElementById('selected-subject-display');
const fileNameDisplay = document.getElementById('file-name');

// Устанавливаем текущую дату по умолчанию
const today = getLocalDateKey();
homeworkDate.value = today;

// Обработчик выбора предмета
subjectButtons.forEach(button => {
    button.addEventListener('click', () => {
        selectedSubject = button.getAttribute('data-subject');

        // Убираем активный класс со всех кнопок
        subjectButtons.forEach(btn => btn.classList.remove('active'));

        // Добавляем активный класс к выбранной кнопке
        button.classList.add('active');

        // Показываем выбранный предмет
        selectedSubjectDisplay.innerHTML = `<div class="selected-subject">${selectedSubject}</div>`;
    });
});

// Обработчик выбора файла
homeworkFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        selectedFile = file;
        fileNameDisplay.textContent = file.name;

        // Читаем файл как Data URL для сохранения в поле photo_url.
        const reader = new FileReader();
        reader.onload = (event) => {
            fileDataURL = event.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        selectedFile = null;
        fileDataURL = null;
        fileNameDisplay.textContent = '';
    }
});

// Обработчик сохранения
saveBtn.addEventListener('click', async () => {
    // Проверка заполнения полей
    if (!selectedSubject) {
        alert('Выберите предмет!');
        return;
    }

    if (!homeworkText.value.trim()) {
        alert('Введите текст домашнего задания!');
        return;
    }

    if (!homeworkDate.value) {
        alert('Выберите дату!');
        return;
    }

    // Создаем объект домашнего задания
    const homework = {
        id: Date.now(),
        subject: selectedSubject,
        text: homeworkText.value.trim(),
        date: homeworkDate.value,
        priority: homeworkPriority.value,
        completed: false,
        completedAt: null,
        image: fileDataURL,
        createdAt: new Date().toISOString()
    };

    saveBtn.disabled = true;

    try {
        await addHomework({
            subject: homework.subject,
            task: homework.text,
            dueDate: homework.date,
            photoUrl: homework.image,
            isDone: false,
            priority: homework.priority
        });

        alert('Домашнее задание сохранено!');
        clearForm();
    } catch (error) {
        showDatabaseError(error);
    } finally {
        saveBtn.disabled = false;
    }
});

// Функция очистки формы
function clearForm() {
    selectedSubject = '';
    homeworkText.value = '';
    homeworkFile.value = '';
    homeworkDate.value = today;
    homeworkPriority.value = 'medium';
    selectedFile = null;
    fileDataURL = null;
    fileNameDisplay.textContent = '';
    selectedSubjectDisplay.innerHTML = '';

    // Убираем активный класс со всех кнопок
    subjectButtons.forEach(btn => btn.classList.remove('active'));
}
