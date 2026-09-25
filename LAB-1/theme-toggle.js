const themeToggle = document.querySelector('#theme-btn');

function applyTheme(theme) {
  if (theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
    themeToggle.setAttribute('aria-pressed', 'true');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
    themeToggle.setAttribute('aria-pressed', 'false');
  }
}

// 1. Restore saved theme or detect system preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  applyTheme(savedTheme);
} else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  applyTheme('dark');
} else {
  applyTheme('light');
}

// 2. Toggle on click
themeToggle.addEventListener('click', () => {
  const isCurrentlyDark = document.body.classList.contains('dark-theme');
  const nextTheme = isCurrentlyDark ? 'light' : 'dark';
  applyTheme(nextTheme);
  localStorage.setItem('theme', nextTheme);
});