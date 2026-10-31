function showScreen() {
  const name = location.hash.slice(1) || 'home';
  const selected = document.getElementById(name) ? name : 'home';
  document.querySelectorAll('[data-screen]').forEach((screen) => {
    screen.hidden = screen.id !== selected;
  });
  window.scrollTo(0, 0);
}

document.querySelectorAll('[data-choice-group]').forEach((group) => {
  group.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;
    group.querySelectorAll('button').forEach((item) => item.classList.remove('selected'));
    button.classList.add('selected');
  });
});

window.addEventListener('hashchange', showScreen);
showScreen();
