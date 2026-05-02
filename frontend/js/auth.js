const API = '';

function token() {
  return localStorage.getItem('bpt_token');
}

function currentUser() {
  const raw = localStorage.getItem('bpt_user');
  return raw ? JSON.parse(raw) : null;
}

function authHeaders(json = true) {
  const headers = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (token()) headers.Authorization = `Bearer ${token()}`;
  return headers;
}

function setSession(data) {
  localStorage.setItem('bpt_token', data.token);
  localStorage.setItem('bpt_user', JSON.stringify(data.user));
}

function logout() {
  localStorage.removeItem('bpt_token');
  localStorage.removeItem('bpt_user');
  window.location.href = '/';
}

function requireAuth(adminOnly = false) {
  const user = currentUser();
  if (!token() || !user) window.location.href = '/login.html';
  if (adminOnly && user.role !== 'admin') window.location.href = '/bibliotheque.html';
  return user;
}

async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, options);
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || 'Erreur API');
  return data;
}

async function loadGroups(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const groups = await api('/api/groups');
  select.innerHTML = groups.map((group) => `<option value="${group.id}">${group.name}</option>`).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-logout]').forEach((btn) => btn.addEventListener('click', logout));
  document.querySelectorAll('[data-user-name]').forEach((el) => {
    const user = currentUser();
    el.textContent = user ? `${user.name} (${user.group_name})` : '';
  });

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = document.getElementById('authMessage');
      try {
        const data = await api('/api/auth/login', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(Object.fromEntries(new FormData(loginForm)))
        });
        setSession(data);
        window.location.href = data.user.role === 'admin' ? '/admin-dashboard.html' : '/bibliotheque.html';
      } catch (error) {
        message.textContent = error.message;
        message.className = 'message error';
      }
    });
  }

  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    loadGroups('groupId');
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      const message = document.getElementById('authMessage');
      try {
        const data = await api('/api/auth/register', {
          method: 'POST',
          headers: authHeaders(),
          body: JSON.stringify(Object.fromEntries(new FormData(registerForm)))
        });
        setSession(data);
        window.location.href = '/bibliotheque.html';
      } catch (error) {
        message.textContent = error.message;
        message.className = 'message error';
      }
    });
  }
});
