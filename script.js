// ============================================
// API Configuration
// ============================================
const API_URL = 'http://localhost:5000/api';

// ============================================
// Helper Functions
// ============================================

// Get auth token from localStorage
function getAuthToken() {
  return localStorage.getItem('token');
}

// Check if user is logged in
function isLoggedIn() {
  return !!getAuthToken();
}

// Get current user from localStorage
function getCurrentUser() {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

// Logout user
function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'loginpage.html';
}

// ============================================
// Multi-select dropdown functionality for signup page
// ============================================
(function() {
  const allergyDropdown = document.getElementById('allergyDropdown');
  if (!allergyDropdown) return;

  const dropdown = allergyDropdown;
  const control = dropdown.querySelector('.multi-control');
  const panel = dropdown.querySelector('.options-panel');
  const selectedPillsContainer = document.getElementById('selectedPills');
  const form = document.getElementById('signupForm');
  const msg = document.getElementById('msg');

  function sortOptionsAlphabetically() {
    const allOpts = Array.from(panel.querySelectorAll('.opt'));
    let otherOpt = null;
    const normalOpts = [];

    allOpts.forEach(opt => {
      const input = opt.querySelector('input[type="checkbox"]');
      if (input && input.id === 'otherCheckbox') otherOpt = opt;
      else normalOpts.push(opt);
    });

    normalOpts.sort((a, b) => {
      const aText = a.querySelector('.opt-label')?.textContent?.trim().toLowerCase() || '';
      const bText = b.querySelector('.opt-label')?.textContent?.trim().toLowerCase() || '';
      return aText.localeCompare(bText);
    });

    const nonOptNodes = Array.from(panel.childNodes).filter(
      n => !(n.nodeType === 1 && n.classList && n.classList.contains('opt'))
    );
    panel.innerHTML = '';
    normalOpts.forEach(opt => panel.appendChild(opt));
    if (otherOpt) panel.appendChild(otherOpt);
    nonOptNodes.forEach(n => panel.appendChild(n));
  }

  sortOptionsAlphabetically();

  const checkboxes = Array.from(panel.querySelectorAll('input[type="checkbox"]'));
  const otherCheckbox = document.getElementById('otherCheckbox');
  const otherInputRow = document.getElementById('otherInputRow');
  const otherInput = document.getElementById('otherInput');
  const otherAdd = document.getElementById('otherAdd');
  const otherError = document.getElementById('otherError');

  let customOthers = [];
  const panelOriginalParent = panel.parentElement;
  const panelOriginalNext = panel.nextSibling;

  function openPanel() {
    const ctrlRect = control.getBoundingClientRect();
    const spaceBelow = window.innerHeight - ctrlRect.bottom;
    const spaceAbove = ctrlRect.top;

    dropdown.classList.add('open');
    control.setAttribute('aria-expanded', 'true');
    dropdown.dataset.open = 'true';

    if (panel.parentElement !== document.body) document.body.appendChild(panel);

    panel.style.position = 'fixed';
    panel.style.left = Math.max(8, Math.round(ctrlRect.left)) + 'px';
    panel.style.width = Math.round(Math.max(ctrlRect.width, control.offsetWidth)) + 'px';

    const desiredMax = 420;
    if (spaceBelow >= 200 || spaceBelow >= spaceAbove) {
      panel.style.top = (Math.round(ctrlRect.bottom) + 8) + 'px';
      panel.style.bottom = '';
      panel.style.maxHeight = Math.min(desiredMax, Math.max(160, spaceBelow - 20)) + 'px';
    } else {
      panel.style.bottom = (Math.round(window.innerHeight - ctrlRect.top) + 8) + 'px';
      panel.style.top = '';
      panel.style.maxHeight = Math.min(desiredMax, Math.max(160, spaceAbove - 20)) + 'px';
    }

    panel.style.display = 'block';
  }

  function closePanel() {
    dropdown.classList.remove('open');
    panel.style.display = 'none';
    control.setAttribute('aria-expanded', 'false');
    dropdown.dataset.open = 'false';

    panel.style.top = '';
    panel.style.bottom = '';
    panel.style.left = '';
    panel.style.width = '';
    panel.style.position = '';
    panel.style.maxHeight = '';

    if (panel.parentElement !== panelOriginalParent) {
      if (panelOriginalNext) panelOriginalParent.insertBefore(panel, panelOriginalNext);
      else panelOriginalParent.appendChild(panel);
    }
  }

  function togglePanel() {
    dropdown.dataset.open === 'true' ? closePanel() : openPanel();
  }

  function normalize(str) {
    return String(str || '').trim().toLowerCase();
  }

  function optionAlreadyExists(text) {
    const norm = normalize(text);
    if (!norm) return false;
    for (const cb of checkboxes) {
      if (cb.value === 'Other') continue;
      const cbVal = normalize(cb.value);
      if (cbVal === norm) return true;
    }
    if (customOthers.some(co => normalize(co) === norm)) return true;
    return false;
  }

  function updateSelectedPills() {
    const selectedCheckboxValues = checkboxes
      .filter(cb => cb.checked && cb.value !== 'Other')
      .map(cb => cb.value);
    const items = [...selectedCheckboxValues, ...customOthers];
    selectedPillsContainer.innerHTML = '';

    items.forEach(val => {
      const pill = document.createElement('span');
      pill.className = 'pill';
      pill.setAttribute('data-value', val);

      const text = document.createElement('span');
      text.textContent = val;
      pill.appendChild(text);

      const btn = document.createElement('button');
      btn.className = 'remove';
      btn.type = 'button';
      btn.setAttribute('aria-label', `Remove ${val}`);
      btn.innerHTML = '✕';
      btn.addEventListener('click', function(e) {
        const idx = customOthers.findIndex(co => normalize(co) === normalize(val));
        if (idx !== -1) {
          customOthers.splice(idx, 1);
        } else {
          const cb = checkboxes.find(c =>
            normalize(c.value) === normalize(val) ||
            (c.parentElement.querySelector('.opt-label') &&
              normalize(c.parentElement.querySelector('.opt-label').textContent) === normalize(val))
          );
          if (cb) cb.checked = false;
        }
        updateSelectedPills();
        e.stopPropagation();
      });

      pill.appendChild(btn);
      selectedPillsContainer.appendChild(pill);
    });
  }

  otherCheckbox.addEventListener('change', function() {
    if (this.checked) {
      otherInputRow.style.display = 'flex';
      setTimeout(() => otherInput.focus(), 30);
    } else {
      otherInputRow.style.display = 'none';
      customOthers = [];
      otherInput.value = '';
      otherError.style.display = 'none';
    }
    updateSelectedPills();
  });

  otherAdd.addEventListener('click', function() {
    const val = otherInput.value.trim();
    if (!val) return;
    if (optionAlreadyExists(val)) {
      otherError.style.display = 'block';
      setTimeout(() => (otherError.style.display = 'none'), 4000);
      otherInput.value = '';
      return;
    }
    customOthers.push(val);
    otherInput.value = '';
    otherError.style.display = 'none';
    updateSelectedPills();
  });

  otherInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      otherAdd.click();
    }
  });

  for (const cb of checkboxes) {
    cb.addEventListener('change', updateSelectedPills);
  }

  control.addEventListener('click', togglePanel);
  control.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePanel();
    }
  });

  document.addEventListener('click', function(e) {
    if (!dropdown.contains(e.target)) closePanel();
  });

  // Form submission with backend API
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    msg.style.display = 'none';
    msg.textContent = '';

    // Validation
    if (!name) {
      msg.textContent = 'Please enter your full name';
      msg.style.display = 'block';
      return;
    }

    if (!email || !email.includes('@')) {
      msg.textContent = 'Please enter a valid email';
      msg.style.display = 'block';
      return;
    }

    if (password.length < 6) {
      msg.textContent = 'Password must be at least 6 characters';
      msg.style.display = 'block';
      return;
    }

    if (password !== confirmPassword) {
      msg.textContent = 'Passwords do not match';
      msg.style.display = 'block';
      return;
    }

    const selectedAllergies = [
      ...checkboxes.filter(cb => cb.checked && cb.value !== 'Other').map(cb => cb.value),
      ...customOthers
    ];

    if (selectedAllergies.length === 0) {
      msg.textContent = 'Please select at least one allergy';
      msg.style.display = 'block';
      return;
    }

    // Call backend API
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name,
          email: email,
          password: password,
          allergies: selectedAllergies
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      } else {
        msg.textContent = data.message || 'Registration failed';
        msg.style.display = 'block';
      }
    } catch (error) {
      console.error('Registration error:', error);
      msg.textContent = 'Network error. Please check if the server is running.';
      msg.style.display = 'block';
    }
  });

  function init() {
    updateSelectedPills();
    otherInputRow.style.display = 'none';
  }

  init();
})();

// ============================================
// Login form functionality with backend API
// ============================================
(function() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      alert('Please enter email and password');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();

      if (data.success) {
        // Store token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Redirect to dashboard
        window.location.href = 'dashboard.html';
      } else {
        alert(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Network error. Please check if the server is running.');
    }
  });
})();
