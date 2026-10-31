let loadingTimer;
let lastEmergencyHash = '#emergency';

const emergencyStages = {
  emergency: { key: 'critical', label: '위급' },
  'emergency-warning': { key: 'warning', label: '경고' },
  'emergency-evacuation': { key: 'evacuation', label: '대피' },
  'emergency-critical': { key: 'critical', label: '위급' },
};

function showScreen() {
  const hash = location.hash.slice(1);
  const name = hash || 'loading';
  const stage = Object.hasOwn(emergencyStages, name) ? emergencyStages[name] : undefined;
  const selected = stage ? 'emergency' : document.getElementById(name) ? name : 'home';
  if (stage) {
    const emergencyScreen = document.getElementById('emergency');
    emergencyScreen.dataset.stage = stage.key;
    emergencyScreen.querySelector('[data-alert-title]').textContent = `${stage.label} 산불 발생`;
    lastEmergencyHash = `#${name}`;
  }
  document.querySelectorAll('[data-emergency-return]').forEach((link) => {
    link.href = lastEmergencyHash;
  });
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

document.querySelector('[data-profile-save]').addEventListener('click', () => {
  document.querySelector('[data-profile-save-notice]').hidden = false;
});

window.addEventListener('hashchange', showScreen);
showScreen();
