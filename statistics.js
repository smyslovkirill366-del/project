async function renderStatistics() {
    try {
        const homeworks = await getHomework();
        const stats = getStats(homeworks);
        const levelValue = document.getElementById('level-value');
        const xpValue = document.getElementById('xp-value');
        const xpProgress = document.getElementById('xp-progress');
        const completedValue = document.getElementById('completed-value');
        const chart = document.getElementById('completion-chart');

        levelValue.textContent = stats.level;
        xpValue.textContent = `${stats.levelXp} / 100 XP`;
        completedValue.textContent = stats.completedCount;
        xpProgress.style.width = `${stats.levelXp}%`;
        chart.innerHTML = '';

        stats.days.forEach(day => {
            const column = document.createElement('div');
            column.className = 'chart-column';

            const count = stats.counts[day.key];
            const height = count ? Math.max(12, Math.min(100, count * 22)) : 4;
            column.innerHTML = `
                <span class="chart-count">${count}</span>
                <div class="chart-bar-wrap">
                    <div class="chart-bar" style="height: ${height}%"></div>
                </div>
                <span class="chart-label">${day.label}<br>${day.shortDate}</span>
            `;
            chart.appendChild(column);
        });
    } catch (error) {
        showDatabaseError(error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const isAuthenticated = await window.authReady;
    if (!isAuthenticated) return;
    await renderStatistics();
});
