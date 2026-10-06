const SUPABASE_URL = 'https://wxnucgixbcbdwqmjupzg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_PUrcdhzbzJV0kpx5fY3zJA_idf9JHtp';
// Не называем переменную `supabase`: CDN уже создаёт одноимённый глобальный объект.
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) || null;

const DATABASE_PRIORITY_LABELS = {
    urgent: 'Срочно',
    medium: 'Средне',
    later: 'Потом'
};

function ensureSupabaseClient() {
    if (!supabaseClient) {
        throw new Error('Библиотека Supabase недоступна. Проверьте подключение к интернету.');
    }
}

function priorityKeyFromDatabase(value) {
    if (Object.prototype.hasOwnProperty.call(DATABASE_PRIORITY_LABELS, value)) {
        return value;
    }

    const entry = Object.entries(DATABASE_PRIORITY_LABELS)
        .find(([, label]) => label === value);

    return entry ? entry[0] : 'medium';
}

function priorityLabelForDatabase(value) {
    return DATABASE_PRIORITY_LABELS[value] || value || DATABASE_PRIORITY_LABELS.medium;
}

function normalizeHomework(row) {
    return {
        id: row.id,
        subject: row.subject,
        text: row.task,
        date: row.due_date,
        image: row.photo_url || '',
        completed: Boolean(row.is_done),
        completedAt: null,
        priority: priorityKeyFromDatabase(row.priority),
        createdAt: row.created_at
    };
}

async function getHomework() {
    ensureSupabaseClient();

    const { data, error } = await supabaseClient
        .from('homework')
        .select('*')
        .order('due_date', { ascending: true });

    if (error) throw error;
    return (data || []).map(normalizeHomework);
}

async function getHomeworkForCalendar() {
    ensureSupabaseClient();

    const { data, error } = await supabaseClient
        .from('homework')
        .select('id, subject, task, due_date, priority, is_done')
        .order('due_date', { ascending: true });

    if (error) throw error;

    return data || [];
}

async function addHomework({
    subject,
    task,
    dueDate,
    photoUrl = '',
    isDone = false,
    priority = 'medium'
}) {
    ensureSupabaseClient();

    const { data, error } = await supabaseClient
        .from('homework')
        .insert({
            subject,
            task,
            due_date: dueDate,
            photo_url: photoUrl,
            is_done: isDone,
            priority: priorityLabelForDatabase(priority)
        })
        .select()
        .single();

    if (error) throw error;
    return normalizeHomework(data);
}

async function updateHomework(id, updates = {}) {
    ensureSupabaseClient();

    const databaseUpdates = {};
    if (Object.prototype.hasOwnProperty.call(updates, 'subject')) {
        databaseUpdates.subject = updates.subject;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'task')) {
        databaseUpdates.task = updates.task;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'dueDate')) {
        databaseUpdates.due_date = updates.dueDate;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'photoUrl')) {
        databaseUpdates.photo_url = updates.photoUrl;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'isDone')) {
        databaseUpdates.is_done = updates.isDone;
    }
    if (Object.prototype.hasOwnProperty.call(updates, 'priority')) {
        databaseUpdates.priority = priorityLabelForDatabase(updates.priority);
    }

    const { data, error } = await supabaseClient
        .from('homework')
        .update(databaseUpdates)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return normalizeHomework(data);
}

async function deleteHomework(id) {
    ensureSupabaseClient();

    const { error } = await supabaseClient
        .from('homework')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
