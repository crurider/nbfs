const dateInput = document.getElementById('date');
const timeInput = document.getElementById('time');
const amountInput = document.getElementById('amount');
const durationInput = document.getElementById('duration');
const vitaminsInput = document.getElementById('vitamins');
const probioticInput = document.getElementById('probiotic');
const feedingIdInput = document.getElementById('feeding-id');
const form = document.getElementById('feeding-form');
const formTitle = document.getElementById('form-title');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const dailyGoalInput = document.getElementById('daily-goal');
const avgPortionInput = document.getElementById('avg-portion');
const feedingsList = document.getElementById('feedings-list');
const listDateLabel = document.getElementById('list-date-label');
const listCount = document.getElementById('list-count');
const btnPrev = document.getElementById('btn-prev');
const btnToday = document.getElementById('btn-today');
const btnNext = document.getElementById('btn-next');
const navDateInput = document.getElementById('nav-date');

const statTotal = document.getElementById('stat-total');
const statTotalCard = document.getElementById('stat-total-card');
const statRemaining = document.getElementById('stat-remaining');
const statHour = document.getElementById('stat-hour');
const statAvgMeal = document.getElementById('stat-avg-meal');
const statSupplements = document.getElementById('stat-supplements');
const statSupplementsCard = document.getElementById('stat-supplements-card');

const projMeals = document.getElementById('proj-meals');
const projMealsUntilMidnight = document.getElementById('proj-meals-until-midnight');
const projMealList = document.getElementById('proj-meal-list');
const projAmount = document.getElementById('proj-amount');
const projTotalMeals = document.getElementById('proj-total-meals');
const projNote = document.getElementById('proj-note');
const btnRefreshProjection = document.getElementById('btn-refresh-projection');
const themeSwitch = document.getElementById('theme-switch');

const reportsToggle = document.getElementById('reports-toggle');
const reportsView = document.getElementById('reports-view');
const mainEl = document.querySelector('main.main');
const btnReportsBack = document.getElementById('btn-reports-back');
const reportsDateInput = document.getElementById('reports-date');
const chartWeekly = document.getElementById('chart-weekly');
const chartHourly = document.getElementById('chart-hourly');
const chartDayNight = document.getElementById('chart-daynight');
const chartIntervals = document.getElementById('chart-intervals');

const MIN_INTERVAL_HOURS = 1.0;

let currentAvgPortion = 60;

const confirmModal = document.getElementById('confirm-modal');
const confirmTitle = document.getElementById('confirm-title');
const confirmMessage = document.getElementById('confirm-message');
const confirmOk = document.getElementById('confirm-ok');
const confirmCancel = document.getElementById('confirm-cancel');
const confirmIcon = document.querySelector('.modal-icon');

const ARROW_UP_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>`;
const ARROW_DOWN_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>`;

function formatDateLabel(dateStr) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('sr-RS', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatTime(datetime) {
  return datetime.slice(11, 16);
}

function formatTimeFromDate(date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function to24HourTime(timeStr) {
  if (!timeStr || !timeStr.includes('M')) return timeStr;
  const [timePart, period] = timeStr.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatEndTime(datetime, durationMin) {
  if (!durationMin) return formatTime(datetime);
  const date = new Date(datetime);
  date.setMinutes(date.getMinutes() + durationMin);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatTimeRange(datetime, durationMin) {
  const start = formatTime(datetime);
  if (!durationMin) return start;
  const end = formatEndTime(datetime, durationMin);
  return `${start} <i class="fas fa-arrow-right"></i> ${end}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function distributeAmount(total, count) {
  const base = Math.floor(total / count);
  const extra = total - base * count;
  const amounts = [];
  for (let i = 0; i < count; i++) {
    amounts.push(i < extra ? base + 1 : base);
  }
  return amounts;
}

function formatAmountsPlain(amounts) {
  if (amounts.length === 0) return '0 ml';
  if (amounts.every(a => a === amounts[0])) {
    return `po ${amounts[0]} ml`;
  }
  return amounts.map(a => `${a} ml`).join(' + ');
}

function formatAmountsHtml(amounts) {
  if (amounts.length === 0) return '—';
  return amounts.map(a => `<span class="meal-amount">${a} ml</span>`).join('');
}

function formatInterval(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h} h`;
  return `${h} h ${m} min`;
}

function formatNextTime(lastFeeding, intervalMinutes, count) {
  const date = new Date(lastFeeding);
  date.setMinutes(date.getMinutes() + intervalMinutes * count);
  return formatTimeFromDate(date);
}

function generateMealList(lastFeeding, mealsRemaining, intervalMinutes) {
  if (!lastFeeding || mealsRemaining <= 0) return '—';
  const items = [];
  const start = new Date(lastFeeding);
  for (let i = 0; i < mealsRemaining; i++) {
    const date = new Date(start.getTime() + (i + 1) * intervalMinutes * 60 * 1000);
    const time = formatTimeFromDate(date);
    items.push(`<span class="meal-time">${time}</span>`);
  }
  return items.join('');
}

function round(value) {
  return Math.round(value * 10) / 10;
}

function toISODate(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDateForPicker(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}.${m}.${y}`;
}

function parsePickerDate(pickerDate) {
  if (!pickerDate) return '';
  const [d, m, y] = pickerDate.split('.');
  return `${y}-${m}-${d}`;
}

function setCurrentTime() {
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  timeInput.value = time;
  if (window.NBFSDatePickers) {
    window.NBFSDatePickers.setValue('time', time);
  }
}

function setDate(dateStr) {
  dateInput.value = dateStr;
  navDateInput.value = dateStr;
  if (reportsDateInput) reportsDateInput.value = dateStr;
  if (window.NBFSDatePickers) {
    const pickerDate = formatDateForPicker(dateStr);
    window.NBFSDatePickers.setValue('date', pickerDate);
    window.NBFSDatePickers.setValue('nav-date', pickerDate);
    window.NBFSDatePickers.setValue('reports-date', pickerDate);
  }
}

function setToday() {
  setDate(toISODate(new Date()));
  setCurrentTime();
}

function mountPickers() {
  if (!window.NBFSDatePickers) return;
  const today = toISODate(new Date());
  const nowTime = timeInput.value || `${String(new Date().getHours()).padStart(2, '0')}:${String(new Date().getMinutes()).padStart(2, '0')}`;

  window.NBFSDatePickers.mountDatePicker('date', 'date-picker', formatDateForPicker(dateInput.value || today), (value) => {
    const isoDate = parsePickerDate(value);
    dateInput.value = isoDate;
    navDateInput.value = isoDate;
    refresh();
  });

  window.NBFSDatePickers.mountTimePicker('time', 'time-picker', timeInput.value || nowTime, (value) => {
    timeInput.value = value;
  });

  window.NBFSDatePickers.mountDatePicker('nav-date', 'nav-date-picker', formatDateForPicker(navDateInput.value || today), (value) => {
    const isoDate = parsePickerDate(value);
    dateInput.value = isoDate;
    navDateInput.value = isoDate;
    refresh();
  });
}

function changeDate(days) {
  const current = new Date(dateInput.value + 'T00:00:00');
  current.setDate(current.getDate() + days);
  setDate(toISODate(current));
  refresh();
}

function getIndicator(amount) {
  if (amount < 40) {
    return `<div class="feeding-indicator low" title="Manje od 40 ml">${ARROW_DOWN_SVG}</div>`;
  }
  if (amount > 40) {
    return `<div class="feeding-indicator high" title="Više od 40 ml">${ARROW_UP_SVG}</div>`;
  }
  return '';
}

function getFeedingTags(f) {
  const tags = [];
  if (f.duration_min > 0) {
    tags.push(`<span class="tag tag-duration" title="Trajanje obroka"><i class="fas fa-stopwatch"></i> ${f.duration_min} min</span>`);
  }
  if (f.vitamins) {
    tags.push(`<span class="tag tag-vitamins" title="Dati vitamini"><i class="fas fa-pills"></i> Vitamini</span>`);
  }
  if (f.probiotic) {
    tags.push(`<span class="tag tag-probiotic" title="Dat probiotik"><i class="fas fa-bacterium"></i> Probiotik</span>`);
  }
  return tags.length > 0 ? `<div class="feeding-tags">${tags.join('')}</div>` : '';
}

function showConfirm({ title = 'Potvrda', message, icon = 'triangle-exclamation', okText = 'Potvrdi', cancelText = 'Otkaži', danger = false, okIcon = null, cancelIcon = 'xmark' }) {
  return new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmIcon.innerHTML = `<i class="fas fa-${icon}"></i>`;

    const okIconClass = okIcon || (danger ? 'trash-can' : 'check');
    confirmOk.innerHTML = `<i class="fas fa-${okIconClass}"></i> ${okText}`;

    if (cancelText === null) {
      confirmCancel.classList.add('hidden');
    } else {
      confirmCancel.classList.remove('hidden');
      confirmCancel.innerHTML = `<i class="fas fa-${cancelIcon}"></i> ${cancelText}`;
    }

    confirmOk.className = danger ? 'btn btn-danger' : 'btn btn-primary';

    confirmModal.classList.remove('hidden');

    const cleanup = () => {
      confirmModal.classList.add('hidden');
      confirmOk.onclick = null;
      confirmCancel.onclick = null;
    };

    confirmOk.onclick = () => {
      cleanup();
      resolve(true);
    };

    confirmCancel.onclick = () => {
      cleanup();
      resolve(false);
    };

    confirmModal.querySelector('.modal-backdrop').onclick = () => {
      cleanup();
      resolve(false);
    };
  });
}

function showAlert({ title = 'Obaveštenje', message, icon = 'circle-info' }) {
  return showConfirm({ title, message, icon, okText: 'U redu', cancelText: null, okIcon: 'check' });
}

function renderStats(stats) {
  statTotal.innerHTML = `${stats.total} <span>ml</span>`;
  statRemaining.innerHTML = `${stats.remaining} <span>ml</span>`;
  statHour.innerHTML = `${round(stats.avgPerHour)} <span>ml/h</span>`;
  statAvgMeal.innerHTML = `${round(stats.avgPerMeal)} <span>ml</span>`;

  statTotalCard.classList.remove('success', 'warning', 'danger');
  const diff = stats.goal - stats.total;
  if (stats.total >= stats.goal) {
    statTotalCard.classList.add('success');
  } else if (diff < 50) {
    statTotalCard.classList.add('warning');
  } else {
    statTotalCard.classList.add('danger');
  }

  statSupplements.textContent = `${stats.supplementsTaken}/2`;
  statSupplementsCard.classList.remove('complete', 'incomplete');
  if (stats.supplementsTaken === 2) {
    statSupplementsCard.classList.add('complete');
  } else {
    statSupplementsCard.classList.add('incomplete');
  }
}

function renderProjection(feedings, stats) {
  try {
    const avgPortion = currentAvgPortion || parseInt(avgPortionInput.value, 10) || 60;

    if (!avgPortion || avgPortion <= 0) {
      throw new Error('Prosečna porcija nije ispravna: ' + avgPortionInput.value);
    }

    const remaining = stats.goal - stats.total;

    if (remaining <= 0) {
      projMeals.textContent = '0';
      projMealsUntilMidnight.textContent = '—';
      projMealList.innerHTML = '—';
      projAmount.textContent = '0 ml';
      projTotalMeals.textContent = String(stats.count);
      projNote.innerHTML = '<i class="fas fa-circle-check"></i> Dnevna meta je dostignuta!';
      return;
    }

    const selectedDate = dateInput.value;
    const midnight = new Date(selectedDate + 'T00:00:00');
    midnight.setDate(midnight.getDate() + 1);

    const now = new Date();
    if (now >= midnight) {
      projMeals.textContent = '0';
      projMealsUntilMidnight.textContent = '—';
      projMealList.innerHTML = '—';
      projAmount.textContent = '—';
      projTotalMeals.textContent = String(stats.count);
      projNote.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Ponoć je već prošla. Meta za ovaj dan se više ne može dostiči do ponoći.';
      return;
    }

    let lastFeeding;
    if (feedings.length > 0) {
      lastFeeding = new Date(feedings[feedings.length - 1].datetime);
      if (isNaN(lastFeeding.getTime())) {
        throw new Error('Neispravno vreme poslednjeg obroka: ' + feedings[feedings.length - 1].datetime);
      }
    } else {
      lastFeeding = now;
    }

    const hoursUntilMidnight = (midnight - lastFeeding) / (1000 * 60 * 60);
    if (hoursUntilMidnight <= 0) {
      projMeals.textContent = '0';
      projMealsUntilMidnight.textContent = '—';
      projMealList.innerHTML = '—';
      projAmount.textContent = '—';
      projTotalMeals.textContent = String(stats.count);
      projNote.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Do ponoći ne staje nijedan obrok. Meta ne može biti dostignuta do ponoći, ali možeš nastaviti sutra.';
      return;
    }

    // Početni broj obroka potreban da se popije preostala količina bez prevelikih porcija
    let mealsRemaining = Math.max(1, Math.ceil(remaining / avgPortion));

    // Smanjujemo broj obroka samo ako bi razmak bio prekratak
    while (mealsRemaining > 1 && hoursUntilMidnight / mealsRemaining < MIN_INTERVAL_HOURS) {
      mealsRemaining--;
    }

    const intervalHours = hoursUntilMidnight / mealsRemaining;
    const intervalMinutes = Math.round(intervalHours * 60);
    const amounts = distributeAmount(remaining, mealsRemaining);
    const totalMeals = stats.count + mealsRemaining;
    const lastMealTime = formatNextTime(lastFeeding, intervalMinutes, mealsRemaining);

    projMeals.textContent = String(mealsRemaining);
    projMealsUntilMidnight.textContent = formatInterval(intervalMinutes);
    projMealList.innerHTML = generateMealList(feedings.length > 0 ? feedings[feedings.length - 1].datetime : null, mealsRemaining, intervalMinutes);
    projAmount.innerHTML = feedings.length === 0
      ? `<span class="meal-amount">${avgPortion} ml</span>`
      : formatAmountsHtml(amounts);
    projTotalMeals.textContent = String(totalMeals);

    const idealMeals = Math.max(1, Math.ceil(remaining / avgPortion));
    if (feedings.length === 0) {
      projNote.innerHTML = `<i class="fas fa-circle-info"></i> Unesi prvi obrok da bi video detaljan raspored do ponoći. Preporučena količina po obroku: ${avgPortion} ml.`;
    } else if (mealsRemaining === 1 && remaining > avgPortion * 2) {
      projNote.innerHTML = `<i class="fas fa-triangle-exclamation"></i> Preostala količina (${remaining} ml) je prevelika za jedan obrok. Meta verovatno ne može biti dostignuta na realan način do ponoći.`;
    } else if (idealMeals > mealsRemaining) {
      projNote.innerHTML = `<i class="fas fa-triangle-exclamation"></i> Da meta bude dostignuta do ponoći, rasporedi preostalu količinu u ${mealsRemaining} obroka (${formatAmountsPlain(amounts)}). Razmak između obroka: ${formatInterval(intervalMinutes)}. Poslednji obrok oko ${lastMealTime}.`;
    } else {
      projNote.innerHTML = `<i class="fas fa-check"></i> Preostali obroci (${mealsRemaining}) se uklapaju do ponoći. Razmak između obroka: ${formatInterval(intervalMinutes)}.`;
    }
  } catch (err) {
    console.error(err);
    projMeals.textContent = '—';
    projMealsUntilMidnight.textContent = '—';
    projMealList.innerHTML = '—';
    projAmount.textContent = '—';
    projTotalMeals.textContent = '—';
    projNote.innerHTML = '<i class="fas fa-triangle-exclamation"></i> Greška u projekciji: ' + escapeHtml(err.message);
  }
}

function renderFeedings(feedings) {
  listDateLabel.textContent = formatDateLabel(dateInput.value);
  listCount.textContent = `${feedings.length} ${feedings.length === 1 ? 'obrok' : 'obroka'}`;

  if (feedings.length === 0) {
    feedingsList.innerHTML = '<p class="empty-state">Nema unetih obroka za izabrani dan.</p>';
    return;
  }

  feedingsList.innerHTML = '';
  for (const f of feedings) {
    const item = document.createElement('div');
    item.className = 'feeding-item';
    item.innerHTML = `
      <div class="feeding-info">
        <div class="feeding-main">
          <div class="feeding-time" title="Početak do kraja obroka">${formatTimeRange(f.datetime, f.duration_min)}</div>
          <div class="feeding-amount">${f.amount_ml} ml</div>
          ${getIndicator(f.amount_ml)}
        </div>
        ${getFeedingTags(f)}
      </div>
      <div class="feeding-actions">
        <button class="btn-icon edit" data-id="${f.id}" title="Izmeni"><i class="fas fa-pen"></i></button>
        <button class="btn-icon delete" data-id="${f.id}" title="Obriši"><i class="fas fa-trash-can"></i></button>
      </div>
    `;
    feedingsList.appendChild(item);
  }
}

async function refresh() {
  const date = dateInput.value;
  if (!date) return;
  const [feedings, stats] = await Promise.all([
    window.api.getFeedings(date),
    window.api.getStats(date)
  ]);
  renderStats(stats);
  renderFeedings(feedings);
  renderProjection(feedings, stats);
}

async function loadGoal() {
  const goal = await window.api.getGoal();
  dailyGoalInput.value = goal;
}

async function loadAvgPortion() {
  const portion = await window.api.getAvgPortion();
  currentAvgPortion = portion || 60;
  avgPortionInput.value = currentAvgPortion;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const date = dateInput.value;
  const time = timeInput.value;
  const amount = parseInt(amountInput.value, 10);
  const duration = parseInt(durationInput.value, 10) || 0;
  const vitamins = vitaminsInput.checked;
  const probiotic = probioticInput.checked;

  if (!date || !time || isNaN(amount) || amount <= 0) return;

  const time24 = to24HourTime(time);
  const datetime = `${date}T${time24}:00`;
  const id = feedingIdInput.value;

  try {
    if (id) {
      await window.api.updateFeeding(parseInt(id, 10), datetime, amount, vitamins, probiotic, duration);
    } else {
      await window.api.addFeeding(datetime, amount, vitamins, probiotic, duration);
    }
    resetForm();
    await refresh();
  } catch (err) {
    console.error(err);
    await showAlert({
      title: 'Greška',
      message: 'Došlo je do greške pri čuvanju obroka.',
      icon: 'triangle-exclamation'
    });
  }
});

function resetForm() {
  feedingIdInput.value = '';
  amountInput.value = '';
  durationInput.value = '';
  vitaminsInput.checked = false;
  probioticInput.checked = false;
  formTitle.textContent = 'Novi obrok';
  submitBtn.innerHTML = '<i class="fas fa-plus"></i> Dodaj obrok';
  cancelBtn.innerHTML = '<i class="fas fa-xmark"></i> Otkaži';
  cancelBtn.classList.add('hidden');
  setCurrentTime();
}

cancelBtn.addEventListener('click', resetForm);

feedingsList.addEventListener('click', async (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  const id = parseInt(btn.dataset.id, 10);

  if (btn.classList.contains('delete')) {
    const confirmed = await showConfirm({
      title: 'Brisanje obroka',
      message: 'Da li si siguran da želiš da obrišeš ovaj obrok?',
      icon: 'trash-can',
      okText: 'Obriši',
      danger: true
    });
    if (!confirmed) return;

    try {
      await window.api.deleteFeeding(id);
      await refresh();
    } catch (err) {
      console.error(err);
      await showAlert({
        title: 'Greška',
        message: 'Došlo je do greške pri brisanju.',
        icon: 'triangle-exclamation'
      });
    }
  } else if (btn.classList.contains('edit')) {
    const date = dateInput.value;
    const feedings = await window.api.getFeedings(date);
    const f = feedings.find(item => item.id === id);
    if (!f) return;
    feedingIdInput.value = f.id;
    dateInput.value = f.datetime.slice(0, 10);
    timeInput.value = f.datetime.slice(11, 16);
    if (window.NBFSDatePickers) {
      window.NBFSDatePickers.setValue('date', formatDateForPicker(dateInput.value));
      window.NBFSDatePickers.setValue('time', timeInput.value);
    }
    amountInput.value = f.amount_ml;
    durationInput.value = f.duration_min || '';
    vitaminsInput.checked = !!f.vitamins;
    probioticInput.checked = !!f.probiotic;
    formTitle.textContent = 'Izmeni obrok';
    submitBtn.innerHTML = '<i class="fas fa-check"></i> Sačuvaj izmene';
    cancelBtn.innerHTML = '<i class="fas fa-xmark"></i> Otkaži';
    cancelBtn.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});

dailyGoalInput.addEventListener('change', async () => {
  const value = parseInt(dailyGoalInput.value, 10);
  if (isNaN(value) || value <= 0) {
    await loadGoal();
    return;
  }
  await window.api.setGoal(value);
  await refresh();
});

avgPortionInput.addEventListener('change', async () => {
  const value = parseInt(avgPortionInput.value, 10);
  if (isNaN(value) || value <= 0) {
    await loadAvgPortion();
    return;
  }
  currentAvgPortion = value;
  await window.api.setAvgPortion(value);
  await refresh();
});

btnPrev.addEventListener('click', () => changeDate(-1));
btnToday.addEventListener('click', () => {
  setToday();
  refresh();
});
btnNext.addEventListener('click', () => changeDate(1));
btnRefreshProjection.addEventListener('click', () => refresh());

function loadTheme() {
  const saved = localStorage.getItem('nbfs-theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('nbfs-theme', next);
}

if (themeSwitch) {
  themeSwitch.addEventListener('click', toggleTheme);
  themeSwitch.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  });
}

function formatShortDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('sr-RS', { weekday: 'short', day: 'numeric' });
}

function renderEmpty(container, message = 'Nema podataka') {
  container.innerHTML = `<p class="chart-empty">${escapeHtml(message)}</p>`;
}

function renderBarChart(container, data, options = {}) {
  container.innerHTML = '';
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    renderEmpty(container);
    return;
  }

  const height = options.height || 220;
  const maxValue = options.maxValue || Math.max(...data.map(d => d.value)) * 1.1 || 1;
  const padding = { top: 16, right: 12, bottom: 48, left: 48 };
  const width = container.clientWidth || 400;
  const chartW = Math.max(100, width - padding.left - padding.right);
  const chartH = height - padding.top - padding.bottom;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', height);
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.style.overflow = 'visible';

  const gridCount = 4;
  for (let i = 0; i <= gridCount; i++) {
    const y = padding.top + (chartH * i) / gridCount;
    const value = Math.round(maxValue * (1 - i / gridCount));
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', padding.left);
    line.setAttribute('y1', y);
    line.setAttribute('x2', padding.left + chartW);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', 'var(--border)');
    line.setAttribute('stroke-width', '1');
    if (i > 0 && i < gridCount) line.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(line);

    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', padding.left - 8);
    label.setAttribute('y', y + 4);
    label.setAttribute('text-anchor', 'end');
    label.setAttribute('fill', 'var(--text-light)');
    label.setAttribute('font-size', '11');
    label.textContent = options.formatValue ? options.formatValue(value) : value;
    svg.appendChild(label);
  }

  const slotW = chartW / data.length;
  const barW = slotW * 0.55;

  data.forEach((d, i) => {
    const barH = (d.value / maxValue) * chartH;
    const x = padding.left + i * slotW + (slotW - barW) / 2;
    const y = padding.top + chartH - barH;

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', Math.max(1, barW));
    rect.setAttribute('height', Math.max(0, barH));
    rect.setAttribute('rx', 6);
    rect.setAttribute('ry', 6);
    rect.setAttribute('fill', d.color || options.barColor || 'var(--primary)');
    rect.classList.add('chart-bar');
    svg.appendChild(rect);

    if (barH > 14) {
      const valueLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valueLabel.setAttribute('x', x + barW / 2);
      valueLabel.setAttribute('y', y + 14);
      valueLabel.setAttribute('text-anchor', 'middle');
      valueLabel.setAttribute('fill', 'white');
      valueLabel.setAttribute('font-size', '11');
      valueLabel.setAttribute('font-weight', '700');
      valueLabel.textContent = d.value;
      svg.appendChild(valueLabel);
    }

    const xLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    xLabel.setAttribute('x', x + barW / 2);
    xLabel.setAttribute('y', padding.top + chartH + 20);
    xLabel.setAttribute('text-anchor', 'middle');
    xLabel.setAttribute('fill', 'var(--text-light)');
    xLabel.setAttribute('font-size', '11');
    xLabel.setAttribute('font-weight', '600');
    xLabel.textContent = d.label;
    svg.appendChild(xLabel);
  });

  container.appendChild(svg);
}

function renderDonutChart(container, data, options = {}) {
  container.innerHTML = '';
  if (!data || data.length === 0 || data.every(d => d.value === 0)) {
    renderEmpty(container);
    return;
  }

  const total = data.reduce((sum, d) => sum + d.value, 0);
  const size = 180;
  const radius = 70;
  const center = size / 2;
  const strokeWidth = options.strokeWidth || 28;
  const circumference = 2 * Math.PI * radius;

  const wrapper = document.createElement('div');
  wrapper.className = 'donut-wrapper';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
  svg.style.transform = 'rotate(-90deg)';

  let offset = 0;
  data.forEach((d) => {
    const segment = (d.value / total) * circumference;
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', center);
    circle.setAttribute('cy', center);
    circle.setAttribute('r', radius);
    circle.setAttribute('fill', 'none');
    circle.setAttribute('stroke', d.color || 'var(--primary)');
    circle.setAttribute('stroke-width', strokeWidth);
    circle.setAttribute('stroke-dasharray', `${segment} ${circumference}`);
    circle.setAttribute('stroke-dashoffset', -offset);
    circle.setAttribute('stroke-linecap', 'round');
    circle.classList.add('chart-donut-segment');
    svg.appendChild(circle);
    offset += segment;
  });

  wrapper.appendChild(svg);

  const centerLabel = document.createElement('div');
  centerLabel.className = 'donut-center';
  centerLabel.innerHTML = `<span>${total}</span><small>ml</small>`;
  wrapper.appendChild(centerLabel);

  const legend = document.createElement('div');
  legend.className = 'donut-legend';
  data.forEach((d) => {
    const percent = Math.round((d.value / total) * 100);
    const item = document.createElement('div');
    item.className = 'donut-legend-item';
    item.innerHTML = `<span class="donut-legend-color" style="background:${d.color || 'var(--primary)'}"></span><span>${escapeHtml(d.label)}</span><strong>${percent}%</strong>`;
    legend.appendChild(item);
  });
  wrapper.appendChild(legend);

  container.appendChild(wrapper);
}

function getLast7Days(dateStr) {
  const dates = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(dateStr + 'T00:00:00');
    d.setDate(d.getDate() - i);
    dates.push(toISODate(d));
  }
  return dates;
}

function groupHourly(hourlyData) {
  const groups = [];
  for (let i = 0; i < 24; i += 2) {
    const total = hourlyData
      .filter(h => h.hour >= i && h.hour < i + 2)
      .reduce((sum, h) => sum + h.total, 0);
    groups.push({ label: `${String(i).padStart(2, '0')}h`, value: total });
  }
  return groups;
}

async function loadReports() {
  if (!chartWeekly) return;
  const date = dateInput.value;
  if (!date) return;

  const weekDates = getLast7Days(date);
  const [startDate, endDate] = [weekDates[0], weekDates[weekDates.length - 1]];

  const [goal, dailyTotals, hourlyTotals, split, intervals] = await Promise.all([
    window.api.getGoal(),
    window.api.getDailyTotals(startDate, endDate),
    window.api.getHourlyTotals(date),
    window.api.getDayNightSplit(date),
    window.api.getFeedingIntervals(date)
  ]);

  const dateMap = new Map(dailyTotals.map(d => [d.date, d.total]));
  const weekData = weekDates.map(d => {
    const value = dateMap.get(d) || 0;
    let color;
    if (value >= goal) {
      color = 'var(--success)';
    } else if (value >= goal - 50) {
      color = 'var(--primary)';
    } else {
      color = 'var(--danger)';
    }
    return { label: formatShortDate(d), value, color };
  });

  const weekMax = Math.max(goal, ...weekData.map(d => d.value)) * 1.1 || goal || 1;
  renderBarChart(chartWeekly, weekData, {
    maxValue: weekMax,
    formatValue: v => `${v} ml`
  });

  const hourlyData = groupHourly(hourlyTotals).map(d => ({
    ...d,
    color: d.value > 0 && d.value < currentAvgPortion ? 'var(--danger)' : 'var(--secondary-dark)'
  }));
  const hourlyMax = Math.max(...hourlyData.map(d => d.value), 1) * 1.1;
  renderBarChart(chartHourly, hourlyData, {
    maxValue: hourlyMax,
    formatValue: v => `${v} ml`
  });

  renderDonutChart(chartDayNight, [
    { label: 'Dan (07–19h)', value: split.dayTotal, color: 'var(--success)' },
    { label: 'Noć (19–07h)', value: split.nightTotal, color: 'var(--primary)' }
  ].filter(d => d.value > 0));

  const intervalData = intervals.map((value, index) => ({
    label: `${index + 1}.`,
    value
  }));
  const intervalMax = Math.max(...intervals, 60) * 1.1;
  renderBarChart(chartIntervals, intervalData, {
    maxValue: intervalMax,
    barColor: 'var(--warning)',
    formatValue: v => `${v} min`
  });
}

function mountReportsDatePicker() {
  if (!window.NBFSDatePickers || !reportsDateInput) return;
  const pickerDate = formatDateForPicker(reportsDateInput.value || dateInput.value || toISODate(new Date()));
  window.NBFSDatePickers.mountDatePicker('reports-date', 'reports-date-picker', pickerDate, (value) => {
    const isoDate = parsePickerDate(value);
    reportsDateInput.value = isoDate;
    dateInput.value = isoDate;
    navDateInput.value = isoDate;
    if (window.NBFSDatePickers) {
      window.NBFSDatePickers.setValue('date', formatDateForPicker(isoDate));
      window.NBFSDatePickers.setValue('nav-date', formatDateForPicker(isoDate));
    }
    refresh();
    loadReports();
  });
}

function showReports() {
  if (!reportsView || !mainEl) return;
  mainEl.classList.add('hidden');
  reportsView.classList.remove('hidden');
  if (window.NBFSDatePickers && reportsDateInput) {
    window.NBFSDatePickers.setValue('reports-date', formatDateForPicker(dateInput.value));
  }
  setTimeout(() => {
    loadReports();
  }, 0);
}

function hideReports() {
  if (!reportsView || !mainEl) return;
  reportsView.classList.add('hidden');
  mainEl.classList.remove('hidden');
}

if (reportsToggle) {
  reportsToggle.addEventListener('click', showReports);
  reportsToggle.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      showReports();
    }
  });
}

if (btnReportsBack) {
  btnReportsBack.addEventListener('click', hideReports);
}

(async () => {
  loadTheme();
  setToday();
  mountPickers();
  mountReportsDatePicker();
  await loadGoal();
  await loadAvgPortion();
  await refresh();
})();
