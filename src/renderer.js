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
const stat3h = document.getElementById('stat-3h');
const statSupplements = document.getElementById('stat-supplements');
const statSupplementsCard = document.getElementById('stat-supplements-card');

const projMeals = document.getElementById('proj-meals');
const projMealsUntilMidnight = document.getElementById('proj-meals-until-midnight');
const projMealList = document.getElementById('proj-meal-list');
const projAmount = document.getElementById('proj-amount');
const projTotalMeals = document.getElementById('proj-total-meals');
const projNote = document.getElementById('proj-note');
const btnRefreshProjection = document.getElementById('btn-refresh-projection');

const INTERVAL_HOURS = 3;

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
  return `${start} → ${end}`;
}

function generateMealList(lastFeeding, mealsRemaining) {
  if (!lastFeeding || mealsRemaining <= 0) return '—';
  const times = [];
  const date = new Date(lastFeeding);
  for (let i = 0; i < mealsRemaining; i++) {
    date.setHours(date.getHours() + INTERVAL_HOURS);
    times.push(`${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`);
  }
  return times.map(t => `<span class="meal-time">${t}</span>`).join('');
}

function formatNextTime(datetime) {
  const date = new Date(datetime);
  date.setHours(date.getHours() + 3);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
  if (window.NBFSDatePickers) {
    const pickerDate = formatDateForPicker(dateStr);
    window.NBFSDatePickers.setValue('date', pickerDate);
    window.NBFSDatePickers.setValue('nav-date', pickerDate);
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
    tags.push(`<span class="tag tag-duration" title="Trajanje obroka">⏱️ ${f.duration_min} min</span>`);
  }
  if (f.vitamins) {
    tags.push(`<span class="tag tag-vitamins" title="Dati vitamini">🩹 Vitamini</span>`);
  }
  if (f.probiotic) {
    tags.push(`<span class="tag tag-probiotic" title="Dat probiotik">🦠 Probiotik</span>`);
  }
  return tags.length > 0 ? `<div class="feeding-tags">${tags.join('')}</div>` : '';
}

function showConfirm({ title = 'Potvrda', message, icon = '🗑️', okText = 'Potvrdi', cancelText = 'Otkaži', danger = false, okIcon = null, cancelIcon = '✕' }) {
  return new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmMessage.textContent = message;
    confirmIcon.textContent = icon;

    const okIconChar = okIcon || (danger ? '🗑️' : '✓');
    confirmOk.innerHTML = `<span class="btn-icon-text">${okIconChar}</span> ${okText}`;

    if (cancelText === null) {
      confirmCancel.classList.add('hidden');
    } else {
      confirmCancel.classList.remove('hidden');
      confirmCancel.innerHTML = `<span class="btn-icon-text">${cancelIcon}</span> ${cancelText}`;
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

function showAlert({ title = 'Obaveštenje', message, icon = 'ℹ️' }) {
  return showConfirm({ title, message, icon, okText: 'U redu', cancelText: null, okIcon: '✓' });
}

function renderStats(stats) {
  statTotal.innerHTML = `${stats.total} <span>ml</span>`;
  statRemaining.innerHTML = `${stats.remaining} <span>ml</span>`;
  statHour.innerHTML = `${round(stats.avgPerHour)} <span>ml/h</span>`;
  stat3h.innerHTML = `${round(stats.avgPer3Hours)} <span>ml/3h</span>`;

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
      projMealsUntilMidnight.textContent = '0';
      projMealList.innerHTML = '—';
      projAmount.textContent = '0 ml';
      projTotalMeals.textContent = String(stats.count);
      projNote.textContent = '🎉 Dnevna meta je dostignuta!';
      return;
    }

    const mealsForGoal = Math.max(1, Math.ceil(remaining / avgPortion));

    let mealsUntilMidnight = 0;
    let lastMealBeforeMidnight = null;

    const selectedDate = dateInput.value;
    const midnight = new Date(selectedDate + 'T00:00:00');
    midnight.setDate(midnight.getDate() + 1);

    const now = new Date();
    if (now >= midnight) {
      projMeals.textContent = '0';
      projMealsUntilMidnight.textContent = '0';
      projMealList.innerHTML = '—';
      projAmount.textContent = '—';
      projTotalMeals.textContent = String(stats.count);
      projNote.textContent = '⚠️ Ponoć je već prošla. Meta za ovaj dan se više ne može dostiči do ponoći.';
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
    mealsUntilMidnight = Math.max(0, Math.floor(hoursUntilMidnight / INTERVAL_HOURS));

    if (mealsUntilMidnight > 0) {
      const t = new Date(lastFeeding);
      t.setHours(t.getHours() + mealsUntilMidnight * INTERVAL_HOURS);
      lastMealBeforeMidnight = formatTimeFromDate(t);
    }

    if (mealsUntilMidnight === 0) {
      projMeals.textContent = '0';
      projMealsUntilMidnight.textContent = '0';
      projMealList.innerHTML = '—';
      projAmount.textContent = '—';
      projTotalMeals.textContent = String(stats.count);
      projNote.textContent = '⚠️ Do ponoći ne staje nijedan obrok. Meta ne može biti dostignuta do ponoći, ali možeš nastaviti sutra.';
      return;
    }

    const mealsRemaining = Math.min(mealsForGoal, mealsUntilMidnight);
    const recommendedAmount = Math.round(remaining / mealsRemaining);
    const totalMeals = stats.count + mealsRemaining;

    projMeals.textContent = String(mealsRemaining);
    projMealsUntilMidnight.textContent = String(mealsUntilMidnight);
    projMealList.innerHTML = generateMealList(feedings.length > 0 ? feedings[feedings.length - 1].datetime : null, mealsRemaining);
    projAmount.textContent = `${recommendedAmount} ml`;
    projTotalMeals.textContent = String(totalMeals);

    if (mealsForGoal <= mealsUntilMidnight) {
      projNote.textContent = `✅ Svi preostali obroci (${mealsRemaining}) staju do ponoći.`;
    } else {
      projNote.textContent = `⚠️ Da meta bude dostignuta do ponoći, smanji na ${mealsRemaining} obroka i daj po ${recommendedAmount} ml. Poslednji obrok do ponoći oko ${lastMealBeforeMidnight}.`;
    }
  } catch (err) {
    console.error(err);
    projMeals.textContent = '—';
    projMealsUntilMidnight.textContent = '—';
    projMealList.innerHTML = '—';
    projAmount.textContent = '—';
    projTotalMeals.textContent = '—';
    projNote.textContent = '⚠️ Greška u projekciji: ' + err.message;
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
          <div class="feeding-time" title="Početak → kraj obroka">${formatTimeRange(f.datetime, f.duration_min)}</div>
          <div class="feeding-amount">${f.amount_ml} ml</div>
          ${getIndicator(f.amount_ml)}
        </div>
        ${getFeedingTags(f)}
      </div>
      <div class="feeding-actions">
        <button class="btn-icon edit" data-id="${f.id}" title="Izmeni">✏️</button>
        <button class="btn-icon delete" data-id="${f.id}" title="Obriši">🗑️</button>
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
      icon: '⚠️'
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
  submitBtn.innerHTML = '<span class="btn-icon-text">➕</span> Dodaj obrok';
  cancelBtn.innerHTML = '<span class="btn-icon-text">✕</span> Otkaži';
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
      icon: '🗑️',
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
        icon: '⚠️'
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
    submitBtn.innerHTML = '<span class="btn-icon-text">✓</span> Sačuvaj izmene';
    cancelBtn.innerHTML = '<span class="btn-icon-text">✕</span> Otkaži';
    cancelBtn.classList.remove('hidden');
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

(async () => {
  setToday();
  mountPickers();
  await loadGoal();
  await loadAvgPortion();
  await refresh();
})();
