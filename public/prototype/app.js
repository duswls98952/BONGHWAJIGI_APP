let loadingTimer;

function showScreen() {
  const hash = location.hash.slice(1);
  const name = hash || 'loading';
  const selected = document.getElementById(name) ? name : 'home';
  document.querySelectorAll('[data-screen]').forEach((screen) => {
    screen.hidden = screen.id !== selected;
  });
  clearTimeout(loadingTimer);
  if (selected === 'loading' && !hash) {
    loadingTimer = window.setTimeout(() => {
      if (location.hash) return;
      history.replaceState(null, '', '#home');
      showScreen();
    }, 2600);
  }
  window.scrollTo(0, 0);
}

document.querySelectorAll('[data-choice-group]').forEach((group) => {
  group.querySelectorAll('button').forEach((button) => {
    button.setAttribute('aria-pressed', button.classList.contains('selected'));
  });
  group.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    group.querySelectorAll('button').forEach((item) => {
      item.classList.remove('selected');
      item.setAttribute('aria-pressed', 'false');
    });
    button.classList.add('selected');
    button.setAttribute('aria-pressed', 'true');
  });
});

window.addEventListener('hashchange', showScreen);
showScreen();
