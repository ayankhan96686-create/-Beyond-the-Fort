document.addEventListener('DOMContentLoaded', () => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const themeToggleBtn = $('#themeToggleBtn');
  const legacyThemeToggleBtn = $('#legacyThemeToggleBtn');
  const storedTheme = localStorage.getItem('venator_theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  const applyTheme = theme => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    for (const button of [themeToggleBtn, legacyThemeToggleBtn]) {
      if (!button) continue;
      button.setAttribute('aria-label', window.BeyondI18n?.t(theme === 'dark' ? 'nav.themeLight' : 'nav.themeDark') || (theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'));
    }
    localStorage.setItem('venator_theme', theme);
  };
  applyTheme(storedTheme);
  document.addEventListener('beyondfort:languagechange', () => {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    themeToggleBtn?.setAttribute('aria-label', window.BeyondI18n?.t(dark ? 'nav.themeLight' : 'nav.themeDark') || (dark ? 'Switch to light mode' : 'Switch to dark mode'));
  });
  const toggleTheme = () => applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
  themeToggleBtn?.addEventListener('click', toggleTheme);
  legacyThemeToggleBtn?.addEventListener('click', toggleTheme);

  const form = $('#planForm');
  if (!form) return;
  const result = $('#planResult');
  const slider = $('#timeBudgetSlider');
  const sliderDisplay = $('#sliderDisplay');
  const dateInput = $('#visitDateInput');
  const startInput = $('#startTimeInput');
  const deadlineInput = $('#deadlineInput');
  const queryInput = $('#queryInput');
  const errorBox = $('#formError');
  const submitButton = $('#buildItineraryButton');
  const agentProgress = window.createAgentProgress({
    root: $('#agentProgress'), agent: $('#agentProgressAgent'), icon: $('#agentProgressIcon'),
    message: $('#agentProgressMessage'), progress: $('#agentProgressTrack'),
    fill: $('#agentProgressFill'), percent: $('#agentProgressPercent')
  });
  const companionInput = $('#companionInput');
  const transitInput = $('#transitModeInput');
  const selectedInterests = new Set();
  let itineraryRequestInProgress = false;
  const locationState = { start: null, end: null };
  const startSummary = $('#startLocationSummary');
  const endSummary = $('#endLocationSummary');
  const returnToStartInput = $('#returnToStartInput');
  const locationMessage = $('#locationPickerMessage');
  let activeMapTarget = 'start';
  const locationMarkers = {};
  const locationMap = window.L && $('#locationPickerMap') ? L.map('locationPickerMap', { scrollWheelZoom: false }).setView([26.203, 78.17], 12) : null;
  if (locationMap) {
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>' }).addTo(locationMap);
    locationMap.on('click', event => {
      const target = activeMapTarget;
      setLocation(target, { label: target === 'start' ? 'Selected start map point' : 'Selected destination map point', latitude: event.latlng.lat, longitude: event.latlng.lng, source: 'map_pin' });
      locationMessage.textContent = `${target === 'start' ? 'Starting point' : 'Destination'} selected from the map.`;
    });
    window.setTimeout(() => locationMap.invalidateSize(), 0);
  }
  const names = { solo: 'Just me', couple: 'Two people', family: 'Family with children', group: 'Group', auto: 'Auto-rickshaw', e_rickshaw: 'E-rickshaw', cab: 'Cab' };
  const minDate = new Date();
  const localDate = new Date(minDate.getTime() - minDate.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  dateInput.min = localDate;
  if (!dateInput.value || dateInput.value < localDate) dateInput.value = localDate;

  const minutes = value => { const [h, m] = (value || '0:0').split(':').map(Number); return h * 60 + m; };
  const displayDuration = value => { const h = Math.floor(value / 60); const m = value % 60; return `${h ? `${h}h` : ''}${m ? ` ${m}m` : ''}`.trim() || '0m'; };
  const updateSummary = () => {
    const labels = [...selectedInterests];
    $('#selectedInterests').textContent = `Selected interests: ${labels.length ? labels.join(', ') : 'none yet'}`;
    const duration = Math.round(Number(slider.value) * 60);
    sliderDisplay.textContent = displayDuration(duration);
    $('#tripSelectionSummary').textContent = `Date ${dateInput.value || '—'} · ${startInput.value || '—'} start · ${displayDuration(duration)} available · return by ${deadlineInput.value || '—'} · ${names[companionInput.value]} · ${names[transitInput.value]}`;
  };
  const validLocation = item => item && Number.isFinite(Number(item.latitude)) && Number.isFinite(Number(item.longitude)) && Number(item.latitude) >= -90 && Number(item.latitude) <= 90 && Number(item.longitude) >= -180 && Number(item.longitude) <= 180;
  function setLocation(which, item) {
    if (!validLocation(item)) return false;
    const normalized = { ...item, label: String(item.label || (which === 'start' ? 'Starting point' : 'Destination')).trim() || (which === 'start' ? 'Starting point' : 'Destination'), latitude: Number(item.latitude), longitude: Number(item.longitude) };
    locationState[which] = normalized;
    const summaryNode = which === 'start' ? startSummary : endSummary;
    summaryNode.textContent = `${normalized.label} · ${normalized.latitude.toFixed(5)}, ${normalized.longitude.toFixed(5)}`;
    if (locationMap) {
      if (locationMarkers[which]) locationMarkers[which].remove();
      const icon = L.divIcon({ className: 'trip-map-icon-shell', iconSize: [38, 44], iconAnchor: [19, 42], html: `<span class="trip-map-marker trip-map-marker-${which}">${which === 'start' ? 'S' : 'E'}</span>` });
      locationMarkers[which] = L.marker([normalized.latitude, normalized.longitude], { icon, title: `${which === 'start' ? 'Start' : 'End'}: ${normalized.label}` }).addTo(locationMap).bindPopup(`${which === 'start' ? 'Start' : 'End'} · ${normalized.label}`);
      const activeLocations = [locationState.start, returnToStartInput.checked ? locationState.start : locationState.end].filter(validLocation);
      if (activeLocations.length > 1) locationMap.fitBounds(L.latLngBounds(activeLocations.map(point => [point.latitude, point.longitude])).pad(0.18), { maxZoom: 15 });
      else locationMap.setView([normalized.latitude, normalized.longitude], Math.max(locationMap.getZoom(), 14));
    }
    if (which === 'start' && returnToStartInput.checked) {
      endSummary.textContent = normalized ? `Return to start · ${normalized.label} · ${normalized.latitude.toFixed(5)}, ${normalized.longitude.toFixed(5)}` : 'Return to start selected';
    }
    updateSummary();
    return true;
  }
  document.querySelectorAll('[data-map-target]').forEach(button => button.addEventListener('click', () => {
    if (button.dataset.mapTarget === 'end' && returnToStartInput.checked) { locationMessage.textContent = 'Uncheck “Return to my starting point” before selecting a separate destination.'; return; }
    activeMapTarget = button.dataset.mapTarget;
    document.querySelectorAll('[data-map-target]').forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
    locationMessage.textContent = `Click the map to choose your ${activeMapTarget === 'start' ? 'starting point' : 'destination'}.`;
  }));
  returnToStartInput.addEventListener('change', () => {
    const endPanel = $('#endLocationPanel');
    endPanel.classList.toggle('is-returning-to-start', returnToStartInput.checked);
    if (returnToStartInput.checked) {
      endSummary.textContent = locationState.start ? `Return to start · ${locationState.start.label} · ${locationState.start.latitude.toFixed(5)}, ${locationState.start.longitude.toFixed(5)}` : 'Choose a starting point first';
      if (locationMarkers.end) { locationMarkers.end.remove(); delete locationMarkers.end; }
    } else {
      endSummary.textContent = locationState.end ? `${locationState.end.label} · ${locationState.end.latitude.toFixed(5)}, ${locationState.end.longitude.toFixed(5)}` : 'No destination selected';
    }
    updateSummary();
  });
  document.querySelectorAll('[data-clear-location]').forEach(button => button.addEventListener('click', () => {
    const which = button.dataset.clearLocation; locationState[which] = null;
    if (locationMarkers[which]) { locationMarkers[which].remove(); delete locationMarkers[which]; }
    (which === 'start' ? startSummary : endSummary).textContent = `No ${which === 'start' ? 'start' : 'destination'} selected`;
    if (which === 'start' && returnToStartInput.checked) endSummary.textContent = 'Choose a starting point first';
    updateSummary();
  }));
  document.querySelectorAll('[data-geolocate]').forEach(button => button.addEventListener('click', () => {
    const which = button.dataset.geolocate;
    if (!navigator.geolocation) { locationMessage.textContent = 'This browser does not provide location access. Choose a map point or enter coordinates instead.'; return; }
    locationMessage.textContent = 'Your browser will ask whether this page may use your location once for this trip.';
    navigator.geolocation.getCurrentPosition(position => {
      const point = position.coords;
      setLocation(which, { label: 'My current location', latitude: point.latitude, longitude: point.longitude, source: 'browser_geolocation', accuracy_m: point.accuracy, captured_at: new Date().toISOString() });
      locationMessage.textContent = `Current location selected (reported accuracy about ${Math.round(point.accuracy)} m).`;
    }, error => {
      const reason = error.code === 1 ? 'Location permission was denied.' : error.code === 3 ? 'Location lookup timed out.' : 'The device could not determine a location.';
      locationMessage.textContent = `${reason} You can still choose a map point or enter coordinates.`;
    }, { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 });
  }));
  $('#applyCoordinatesButton').addEventListener('click', () => {
    const read = which => {
      const prefix = which === 'start' ? 'start' : 'end';
      const latitudeText = $(`#${prefix}LatInput`).value.trim(), longitudeText = $(`#${prefix}LngInput`).value.trim();
      const latitude = latitudeText ? Number(latitudeText) : NaN, longitude = longitudeText ? Number(longitudeText) : NaN;
      const label = $(`#${prefix}LabelInput`).value.trim() || (which === 'start' ? 'Manual starting point' : 'Manual destination');
      return { label, latitude, longitude, source: 'manual_coordinates' };
    };
    if (!setLocation('start', read('start'))) { locationMessage.textContent = 'Enter a valid start latitude (−90 to 90) and longitude (−180 to 180).'; return; }
    if (!returnToStartInput.checked && !setLocation('end', read('end'))) { locationMessage.textContent = 'Enter a valid destination latitude (−90 to 90) and longitude (−180 to 180).'; return; }
    locationMessage.textContent = returnToStartInput.checked ? 'Starting coordinates saved; destination will use the same point.' : 'Start and destination coordinates saved.';
  });
  const updateDurationLimit = () => {
    if (!startInput.value || !deadlineInput.value) return;
    const window = minutes(deadlineInput.value) - minutes(startInput.value);
    if (window > 0) {
      const maxHours = Math.min(8 * 60, window) / 60;
      slider.min = maxHours < 1 ? String(1 / 60) : '1';
      slider.step = maxHours < 1 ? String(1 / 60) : '0.5';
      slider.max = String(maxHours);
      if (Number(slider.value) > Number(slider.max)) slider.value = slider.max;
      if (Number(slider.value) < Number(slider.min)) slider.value = slider.min;
    }
    updateSummary();
  };
  $$('.interest-options [data-interest]').forEach(button => button.addEventListener('click', () => {
    const interest = button.dataset.interest;
    if (selectedInterests.has(interest)) selectedInterests.delete(interest); else selectedInterests.add(interest);
    button.classList.toggle('active', selectedInterests.has(interest));
    button.setAttribute('aria-pressed', String(selectedInterests.has(interest)));
    updateSummary();
  }));
  for (const [selector, hidden] of [['#companionChips', companionInput], ['#transitModeChips', transitInput]]) {
    $(`${selector}`).addEventListener('click', event => {
      const button = event.target.closest('[data-value]');
      if (!button) return;
      hidden.value = button.dataset.value;
      $$('[data-value]', $(selector)).forEach(chip => {
        const active = chip === button;
        chip.classList.toggle('active', active);
        chip.setAttribute('aria-pressed', String(active));
      });
      updateSummary();
    });
  }
  slider.addEventListener('input', updateSummary);
  [dateInput, startInput, deadlineInput].forEach(input => input.addEventListener('change', updateDurationLimit));
  $$('.chip[data-query]').forEach(control => control.addEventListener('click', () => { queryInput.value = control.dataset.query || ''; queryInput.focus(); }));
  try {
    const savedTrip = JSON.parse(sessionStorage.getItem('beyondFortTrip') || 'null');
    const saved = JSON.parse(sessionStorage.getItem('beyondFortPreferences') || 'null') || savedTrip?.request;
    if (saved) {
      dateInput.value = saved.date || dateInput.value;
      startInput.value = saved.start_time || startInput.value;
      deadlineInput.value = saved.deadline || deadlineInput.value;
      if (saved.available_minutes) slider.value = String(saved.available_minutes / 60);
      form.elements.budget.value = saved.budget ?? '';
      queryInput.value = saved.query || '';
      companionInput.value = saved.companion || companionInput.value;
      transitInput.value = saved.transport_mode || transitInput.value;
      returnToStartInput.checked = saved.return_to_start !== false;
      if (saved.start_location) setLocation('start', saved.start_location);
      else if (saved.return_location_coordinates) setLocation('start', { ...saved.return_location_coordinates, latitude: saved.return_location_coordinates.lat, longitude: saved.return_location_coordinates.lng, label: saved.return_location || 'Previous starting point', source: 'legacy_config' });
      if (saved.end_location && saved.return_to_start === false) setLocation('end', saved.end_location);
      (saved.interests || []).forEach(interest => {
        const button = $$('.interest-options [data-interest]').find(item => item.dataset.interest === interest);
        if (button) { selectedInterests.add(interest); button.classList.add('active'); button.setAttribute('aria-pressed', 'true'); }
      });
      for (const [selector, value] of [['#companionChips', companionInput.value], ['#transitModeChips', transitInput.value]]) {
        $$('[data-value]', $(selector)).forEach(chip => { const active = chip.dataset.value === value; chip.classList.toggle('active', active); chip.setAttribute('aria-pressed', String(active)); });
      }
      updateDurationLimit();
    }
  } catch { /* Ignore invalid tab-local state and leave a clean form. */ }
  updateSummary();

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (itineraryRequestInProgress) return;
    errorBox.hidden = true;
    const interests = [...selectedInterests];
    const freeformInterest = queryInput.value.trim();
    if (freeformInterest && !interests.includes(freeformInterest) && freeformInterest !== interests.join(', ')) interests.push(freeformInterest);
    const start = minutes(startInput.value);
    const deadline = minutes(deadlineInput.value);
    const duration = Math.round(Number(slider.value) * 60);
    if (!interests.length) return showError('Choose at least one interest or describe what you would like to experience.');
    if (!dateInput.value || dateInput.value < localDate) return showError('Choose today or a future visit date.');
    if (!startInput.value || !deadlineInput.value || deadline <= start) return showError('Your return deadline must be later than your start time on the selected visit date.');
    if (!Number.isFinite(duration) || duration <= 0 || duration > deadline - start) return showError('Available duration must be positive and fit between your start time and return deadline.');
    if (!form.reportValidity()) return;

    const startLocation = locationState.start;
    const returnToStart = returnToStartInput.checked;
    const endLocation = returnToStart ? startLocation : locationState.end;
    if (!validLocation(startLocation)) return showError('Choose a valid starting point using your location, the map, or manual coordinates.');
    if (!validLocation(endLocation)) return showError('Choose a valid destination or select “Return to my starting point”.');
    const payload = {
      query: interests.join(', '), user_query: interests.join(', '), interests,
      city: 'Gwalior', date: dateInput.value, start_time: startInput.value,
      deadline: deadlineInput.value, available_minutes: duration,
      start_location: startLocation, end_location: endLocation, return_to_start: returnToStart,
      return_location: endLocation.label,
      return_location_coordinates: { lat: startLocation.latitude, lng: startLocation.longitude },
      transport_mode: transitInput.value, companion: companionInput.value,
      budget: form.elements.budget.value ? Number(form.elements.budget.value) : null
    };
    sessionStorage.setItem('beyondFortPreferences', JSON.stringify(payload));
    sessionStorage.removeItem('beyondFortTrip');
    itineraryRequestInProgress = true;
    agentProgress.start();
    submitButton.disabled = true;
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.querySelector('span').textContent = window.BeyondI18n?.t('planner.building') || 'Building your itinerary…';
    result.hidden = true;
    try {
      const response = await fetch('/api/v1/tourism-plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), signal: AbortSignal.timeout(50000)
      });
      const itinerary = await response.json();
      agentProgress.stop();
      if (!response.ok || !itinerary || !['feasible', 'infeasible', 'needs_input', 'provider_error'].includes(itinerary.status)) {
        throw new Error(itinerary.errors?.join(' ') || itinerary.error || `The planning service returned status ${response.status}.`);
      }
      if (itinerary.status === 'provider_error' || itinerary.status === 'needs_input') {
        throw new Error([...(itinerary.errors || []), ...(itinerary.missing_fields || [])].join(' ') || 'The planning service could not validate this request.');
      }
      sessionStorage.setItem('beyondFortTrip', JSON.stringify({ request: payload, itinerary }));
      window.location.assign('/itinerary');
    } catch (error) {
      agentProgress.stop();
      showError(error.name === 'TimeoutError' ? 'The itinerary service took too long to respond. Please try again.' : `We couldn’t build your itinerary: ${error.message}`);
      result.hidden = true;
    } finally {
      itineraryRequestInProgress = false;
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.querySelector('span').textContent = window.BeyondI18n?.t('planner.build') || 'Build my itinerary';
    }
  });
  function showError(message) { errorBox.textContent = message; errorBox.hidden = false; errorBox.focus?.(); }
});
