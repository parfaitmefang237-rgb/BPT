requireAuth();

async function loadSpace() {
  const data = await api('/api/users/me/space', { headers: authHeaders(false) });
  document.getElementById('noteContent').value = data.note.content || '';
  document.getElementById('privateFiles').innerHTML = data.files.length
    ? data.files.map((file) => `<article class="card"><h3>${file.title}</h3><p>${file.description || file.original_name}</p><span class="pill">${file.admin_visible ? 'Visible admin' : 'Prive'}</span></article>`).join('')
    : '<p class="message">Aucun fichier prive pour le moment.</p>';
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadSpace();
  document.getElementById('saveNote').addEventListener('click', async () => {
    await api('/api/users/me/note', {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ content: document.getElementById('noteContent').value })
    });
  });
  document.getElementById('privateUploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const msg = document.getElementById('privateMessage');
    try {
      await api('/api/users/me/files', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token()}` },
        body: new FormData(event.currentTarget)
      });
      msg.textContent = 'Fichier ajoute.';
      msg.className = 'message ok';
      event.currentTarget.reset();
      await loadSpace();
    } catch (error) {
      msg.textContent = error.message;
      msg.className = 'message error';
    }
  });
});
