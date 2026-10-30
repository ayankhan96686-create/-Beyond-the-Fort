(() => {
  document.querySelector('#navLogout')?.addEventListener('click', async () => {
    const token = decodeURIComponent(document.cookie.split('; ').find(x => x.startsWith('beyond_fort_csrf='))?.split('=').slice(1).join('=') || '');
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin', headers: { 'X-CSRF-Token': token } });
    sessionStorage.removeItem('beyondFortActiveUser'); sessionStorage.removeItem('beyondFortTrip'); sessionStorage.removeItem('beyondFortPreferences'); sessionStorage.removeItem('beyondFortSavedPlanId');
    location.assign('/');
  });
})();
