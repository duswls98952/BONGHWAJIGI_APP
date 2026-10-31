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
      history.replaceState(null, '', '#onboarding');
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

const consentAll = document.querySelector('[data-consent-all]');
const consentItems = [...document.querySelectorAll('[data-consent-item]')];

consentAll.addEventListener('change', () => {
  consentItems.forEach((item) => { item.checked = consentAll.checked; });
});

consentItems.forEach((item) => {
  item.addEventListener('change', () => {
    const selectedCount = consentItems.filter((entry) => entry.checked).length;
    consentAll.checked = selectedCount === consentItems.length;
    consentAll.indeterminate = selectedCount > 0 && selectedCount < consentItems.length;
  });
});

document.querySelectorAll('[data-detail-toggle]').forEach((button) => {
  button.addEventListener('click', () => {
    const detail = document.getElementById(button.dataset.detailToggle);
    const expanded = button.getAttribute('aria-expanded') === 'true';
    button.setAttribute('aria-expanded', String(!expanded));
    detail.hidden = expanded;
  });
});

window.addEventListener('hashchange', showScreen);
showScreen();
