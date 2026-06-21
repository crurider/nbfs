const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { initDatabase } = require('./database');

const dbPath = path.join(app.getPath('userData'), 'nbfs.db');
const db = initDatabase(dbPath);

ipcMain.handle('get-feedings', (event, date) => db.getFeedingsByDate(date));
ipcMain.handle('add-feeding', (event, datetime, amount_ml, vitamins, probiotic, duration_min) => db.addFeeding(datetime, amount_ml, vitamins, probiotic, duration_min));
ipcMain.handle('update-feeding', (event, id, datetime, amount_ml, vitamins, probiotic, duration_min) => db.updateFeeding(id, datetime, amount_ml, vitamins, probiotic, duration_min));
ipcMain.handle('delete-feeding', (event, id) => db.deleteFeeding(id));
ipcMain.handle('get-stats', (event, date) => db.getStats(date));
ipcMain.handle('get-goal', () => db.getDailyGoal());
ipcMain.handle('set-goal', (event, value) => db.setDailyGoal(value));
ipcMain.handle('get-avg-portion', () => db.getAvgPortion());
ipcMain.handle('set-avg-portion', (event, value) => db.setAvgPortion(value));

function createWindow() {
  const win = new BrowserWindow({
    width: 900,
    height: 760,
    minWidth: 640,
    minHeight: 560,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.loadFile(path.join(__dirname, 'index.html'));
  win.maximize();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
