// Header toolbar: light/dark theme, manual and auto refresh, fullscreen.

let isDarkMode = true;

function toggleTheme() {
    setTheme(!isDarkMode);
}

function setTheme(dark) {
    isDarkMode = dark;
    const html = document.documentElement;
    const icon = document.getElementById('thumbIcon');

    if (isDarkMode) {
        html.setAttribute('data-theme', 'dark');
        icon.className = 'fa-solid fa-moon';
    } else {
        html.setAttribute('data-theme', 'light');
        icon.className = 'fa-solid fa-sun';
    }

    updateChartColors(isDarkMode);
}

function autoDetectTheme() {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(systemPrefersDark);
}

let lastUpdatedTimer = null;

function stampLastUpdated() {
    const now = new Date();
    const label = document.getElementById('lastUpdatedLabel');
    if (label) label.innerText = `Updated ${now.toLocaleTimeString()}`;
}

function refreshDashboard() {
    applyFilters();
    stampLastUpdated();
}

function toggleAutoRefresh() {
    const btn = document.getElementById('autoRefreshBtn');
    if (lastUpdatedTimer) {
        clearInterval(lastUpdatedTimer);
        lastUpdatedTimer = null;
        btn.classList.remove('auto-refresh-active');
        btn.title = 'Toggle auto-refresh (60s)';
    } else {
        lastUpdatedTimer = setInterval(refreshDashboard, 60000);
        btn.classList.add('auto-refresh-active');
        btn.title = 'Auto-refresh ON (every 60s) — click to stop';
        refreshDashboard();
    }
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        document.exitFullscreen();
    }
}
