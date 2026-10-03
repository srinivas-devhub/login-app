// ============================================================
// script.js — Connects the Frontend HTML pages to the Backend
// ============================================================

// The base URL of our backend API
// 👇 Replace this with your actual Render URL after deploying the backend
const API_URL = 'https://login-app-backend.onrender.com/api/auth';

// ============================================================
// HELPER: Show an alert message in the #alert-box div
// type = 'error' or 'success'
// ============================================================
function showAlert(message, type) {
  const alertBox = document.getElementById('alert-box');
  if (!alertBox) return;
  alertBox.textContent = message;
  alertBox.className = 'alert ' + type; // Adds 'error' or 'success' CSS class
}

// ============================================================
// HELPER: Set button to loading state (shows spinner, disables it)
// ============================================================
function setLoading(btn, isLoading) {
  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>Please wait...';
  } else {
    btn.disabled = false;
  }
}

// ============================================================
// HELPER: Format a date string to a readable format
// e.g., "2026-10-03T16:43:04.685Z" → "October 3, 2026"
// ============================================================
function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

// ============================================================
// DETECT which page we are on and run the right code
// ============================================================
const currentPage = window.location.pathname;

// ============================================================
// LOGIN PAGE  (index.html)
// ============================================================
if (document.getElementById('login-form')) {

  // If user is already logged in, skip login and go to dashboard
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
  }

  document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Stop the form from reloading the page

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const btn      = document.getElementById('login-btn');

    // Basic frontend validation
    if (!email || !password) {
      return showAlert('Please enter both email and password.', 'error');
    }

    setLoading(btn, true);

    try {
      // Send login request to backend
      const response = await fetch(API_URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Server returned an error (e.g., wrong password)
        showAlert(data.message || 'Login failed.', 'error');
        btn.disabled = false;
        btn.innerHTML = 'Sign In';
        return;
      }

      // SUCCESS: Save token to localStorage and go to dashboard
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'dashboard.html';

    } catch (err) {
      showAlert('Could not connect to the server. Is the backend running?', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Sign In';
    }
  });
}

// ============================================================
// REGISTER PAGE  (register.html)
// ============================================================
if (document.getElementById('register-form')) {

  // If user is already logged in, skip register and go to dashboard
  if (localStorage.getItem('token')) {
    window.location.href = 'dashboard.html';
  }

  document.getElementById('register-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const name            = document.getElementById('name').value.trim();
    const email           = document.getElementById('email').value.trim();
    const password        = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const btn             = document.getElementById('register-btn');

    // Frontend validation
    if (!name || !email || !password || !confirmPassword) {
      return showAlert('Please fill in all fields.', 'error');
    }
    if (password.length < 6) {
      return showAlert('Password must be at least 6 characters.', 'error');
    }
    if (password !== confirmPassword) {
      return showAlert('Passwords do not match.', 'error');
    }

    setLoading(btn, true);

    try {
      // Send registration request to backend
      const response = await fetch(API_URL + '/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(data.message || 'Registration failed.', 'error');
        btn.disabled = false;
        btn.innerHTML = 'Create Account';
        return;
      }

      // SUCCESS: Show success message, then redirect to login after 1.5 seconds
      showAlert('Account created! Redirecting to login...', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1500);

    } catch (err) {
      showAlert('Could not connect to the server. Is the backend running?', 'error');
      btn.disabled = false;
      btn.innerHTML = 'Create Account';
    }
  });
}

// ============================================================
// DASHBOARD PAGE  (dashboard.html)
// ============================================================
if (document.getElementById('logout-btn')) {

  const token = localStorage.getItem('token');

  // If no token exists, user is not logged in — redirect to login
  if (!token) {
    window.location.href = 'index.html';
  } else {
    // Fetch user profile from the protected backend API
    fetch(API_URL + '/profile', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + token  // Send the JWT token
      }
    })
    .then(response => response.json())
    .then(data => {
      if (data.user) {
        // Populate the dashboard with user data
        document.getElementById('user-name').textContent   = data.user.name;
        document.getElementById('user-email').textContent  = data.user.email;
        document.getElementById('user-joined').textContent = formatDate(data.user.createdAt);
      } else {
        // Token was invalid or expired
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'index.html';
      }
    })
    .catch(() => {
      showAlert('Could not load profile. Is the backend running?', 'error');
    });
  }

  // LOGOUT: Remove token from localStorage and redirect to login
  document.getElementById('logout-btn').addEventListener('click', function () {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  });
}
