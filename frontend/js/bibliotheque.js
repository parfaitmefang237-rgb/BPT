const user = requireAuth();
let page = 1;

if (user.role !== 'admin') document.getElementById('adminLink')?.classList.add('hidden');

async function loadCategories() {
  const categories = await api('/api/categories');
  const select = document.getElementById('categoryFilter');
  select.innerHTML = '<option value="">Toutes</option>' + categories.map((cat) => `<option value="${cat.id}">${cat.code}. ${cat.name}</option>`).join('');
}

function card(resource) {
  const action = resource.type === 'link'
    ? `<a class="btn primary" href="${resource.url}" target="_blank" rel="noreferrer">Ouvrir</a>`
    : `<a class="btn primary" href="/api/resources/${resource.id}/download?token=${encodeURIComponent(token())}">Telecharger</a>`;
  return `<article class="card">
    <h3>${resource.title}</h3>
    <p>${resource.description || ''}</p>
    <div class="resource-meta">
      <span class="pill">${resource.type}</span>
      <span class="pill">${resource.category_code}</span>
      <span class="pill">${resource.group_name || 'Ouvert'}</span>
    </div>
    ${action}
  </article>`;
}

async function loadResources() {
  const params = new URLSearchParams({
    page,
    limit: 9,
    search: document.getElementById('search').value,
    categoryId: document.getElementById('categoryFilter').value,
    type: document.getElementById('typeFilter').value
  });
  const result = await api(`/api/resources?${params}`, { headers: authHeaders(false) });
  document.getElementById('resourceGrid').innerHTML = result.data.length ? result.data.map(card).join('') : '<p class="message">Aucune ressource trouvee.</p>';
  document.getElementById('pageInfo').textContent = `Page ${page}`;
}

document.addEventListener('DOMContentLoaded', async () => {
  await loadCategories();
  await loadResources();
  document.getElementById('applyFilters').addEventListener('click', () => { page = 1; loadResources(); });
  document.getElementById('prevPage').addEventListener('click', () => { page = Math.max(1, page - 1); loadResources(); });
  document.getElementById('nextPage').addEventListener('click', () => { page += 1; loadResources(); });
});
