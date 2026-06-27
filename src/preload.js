const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getFeedings: (date) => ipcRenderer.invoke('get-feedings', date),
  addFeeding: (datetime, amount_ml, vitamins, probiotic, duration_min) => ipcRenderer.invoke('add-feeding', datetime, amount_ml, vitamins, probiotic, duration_min),
  updateFeeding: (id, datetime, amount_ml, vitamins, probiotic, duration_min) => ipcRenderer.invoke('update-feeding', id, datetime, amount_ml, vitamins, probiotic, duration_min),
  deleteFeeding: (id) => ipcRenderer.invoke('delete-feeding', id),
  getStats: (date) => ipcRenderer.invoke('get-stats', date),
  getGoal: () => ipcRenderer.invoke('get-goal'),
  setGoal: (value) => ipcRenderer.invoke('set-goal', value),
  getAvgPortion: () => ipcRenderer.invoke('get-avg-portion'),
  setAvgPortion: (value) => ipcRenderer.invoke('set-avg-portion', value),
  getDailyTotals: (startDate, endDate) => ipcRenderer.invoke('get-daily-totals', startDate, endDate),
  getHourlyTotals: (date) => ipcRenderer.invoke('get-hourly-totals', date),
  getDayNightSplit: (date) => ipcRenderer.invoke('get-day-night-split', date),
  getFeedingIntervals: (date) => ipcRenderer.invoke('get-feeding-intervals', date)
});
