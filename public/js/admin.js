(() => {
  const root = document.querySelector('#adminUsers');
  if (!root) return;
  const csrf = () => decodeURIComponent(document.cookie.split('; ').find(x => x.startsWith('beyond_fort_csrf='))?.split('=').slice(1).join('=') || '');
  fetch('/api/admin/users', { credentials: 'same-origin' }).then(async response => {
    const result = await response.json(); if (!response.ok) throw new Error(result.message || 'Unable to load accounts.');
    root.replaceChildren();
    for (const user of result.data || []) {
      const row = document.createElement('div'); row.className = 'admin-user-row';
      const email = document.createElement('span'); email.textContent = user.email;
      const role = document.createElement('span'); role.textContent = user.role;
      const select = document.createElement('select'); select.setAttribute('aria-label', `Role for ${user.email}`);
      for (const value of ['user', 'administrator']) { const option = document.createElement('option'); option.value = value; option.textContent = value; option.selected = value === user.role; select.append(option); }
      const save = document.createElement('button'); save.type = 'button'; save.textContent = 'Save role'; save.addEventListener('click', async () => {
        const response = await fetch(`/api/admin/users/${encodeURIComponent(user.id)}/role`, { method: 'PATCH', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf() }, body: JSON.stringify({ role: select.value }) });
        const result = await response.json(); document.querySelector('#adminMessage').textContent = response.ok ? 'Role updated.' : result.message || 'Unable to update role.'; if (response.ok) role.textContent = result.user.role;
      });
      row.append(email, role, select, save); root.append(row);
    }
  }).catch(error => { root.textContent = error.message; });
})();
