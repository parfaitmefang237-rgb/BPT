requireAuth(true);

async function loadAdmin() {
  const [stats, users, categories, groups] = await Promise.all([
    api('/api/users/admin/stats', { headers: authHeaders(false) }),
    api('/api/users?limit=50', { headers: authHeaders(false) }),
    api('/api/categories'),
    api('/api/groups')
  ]);
  document.getElementById('statUsers').textContent = stats.users;
  document.getElementById('statResources').textContent = stats.resources;
  document.getElementById('statCategories').textContent = stats.categories;
  document.getElementById('statGroups').textContent = stats.groups;
  document.getElementById('usersBody').innerHTML = users.data.map((u) => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.group_name}</td></tr>`).join('');
  document.getElementById('resourceCategory').innerHTML = categories.map((c) => `<option value="${c.id}">${c.code}. ${c.name}</option>`).join('');
  document.getElementById('resourceGroup').innerHTML = '<option value="">Ouvert</option>' + groups.map((g) => `<option value="${g.id}">${g.name}</option>`).join('');
  document.getElementById('adminLists').innerHTML = [
    ...categories.map((c) => `<article class="card"><h3>${c.code}</h3><p>${c.name}</p></article>`),
    ...groups.map((g) => `<article class="card"><h3>Groupe</h3><p>${g.name}</p></article>`)
  ].join('');
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadAdmin();
  document.getElementById('resourceForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const msg = document.getElementById('adminMessage');
    try {
      await api('/api/resources', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: new FormData(event.currentTarget)
      });
      msg.textContent = 'Ressource publiee.';
      msg.className = 'message ok';
      event.currentTarget.reset();
      await loadAdmin();
    } catch (error) {
      msg.textContent = error.message;
      msg.className = 'message error';
    }
  });
  document.getElementById('categoryForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await api('/api/categories', { method: 'POST', headers: authHeaders(), body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    event.currentTarget.reset();
    await loadAdmin();
  });
  document.getElementById('groupForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    await api('/api/groups', { method: 'POST', headers: authHeaders(), body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget))) });
    event.currentTarget.reset();
    await loadAdmin();
  });
});
