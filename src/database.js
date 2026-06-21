const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

function initDatabase(dbPath) {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  const db = new Database(dbPath);

  db.exec(`
    CREATE TABLE IF NOT EXISTS feedings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      datetime TEXT NOT NULL,
      amount_ml INTEGER NOT NULL CHECK(amount_ml > 0)
    );
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  migrateFeedingsTable(db);

  db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES ('daily_goal', '400')
  `).run();

  db.prepare(`
    INSERT OR IGNORE INTO settings (key, value) VALUES ('avg_portion_ml', '60')
  `).run();

  function migrateFeedingsTable(db) {
    const columns = db.prepare("PRAGMA table_info(feedings)").all().map(c => c.name);
    if (!columns.includes('vitamins')) {
      db.prepare("ALTER TABLE feedings ADD COLUMN vitamins INTEGER DEFAULT 0").run();
    }
    if (!columns.includes('probiotic')) {
      db.prepare("ALTER TABLE feedings ADD COLUMN probiotic INTEGER DEFAULT 0").run();
    }
    if (!columns.includes('duration_min')) {
      db.prepare("ALTER TABLE feedings ADD COLUMN duration_min INTEGER DEFAULT 0").run();
    }
  }

  function getDailyGoal() {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'daily_goal'").get();
    return row ? parseInt(row.value, 10) : 400;
  }

  function setDailyGoal(value) {
    db.prepare(`
      INSERT INTO settings (key, value) VALUES ('daily_goal', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(String(value));
  }

  function getAvgPortion() {
    const row = db.prepare("SELECT value FROM settings WHERE key = 'avg_portion_ml'").get();
    return row ? parseInt(row.value, 10) : 60;
  }

  function setAvgPortion(value) {
    db.prepare(`
      INSERT INTO settings (key, value) VALUES ('avg_portion_ml', ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `).run(String(value));
  }

  function getFeedingsByDate(date) {
    return db.prepare(`
      SELECT id, datetime, amount_ml, vitamins, probiotic, duration_min FROM feedings
      WHERE date(datetime) = ?
      ORDER BY datetime ASC
    `).all(date);
  }

  function addFeeding(datetime, amount_ml, vitamins, probiotic, duration_min) {
    const result = db.prepare(`
      INSERT INTO feedings (datetime, amount_ml, vitamins, probiotic, duration_min)
      VALUES (?, ?, ?, ?, ?)
    `).run(datetime, amount_ml, vitamins ? 1 : 0, probiotic ? 1 : 0, duration_min || 0);
    return result.lastInsertRowid;
  }

  function updateFeeding(id, datetime, amount_ml, vitamins, probiotic, duration_min) {
    db.prepare(`
      UPDATE feedings
      SET datetime = ?, amount_ml = ?, vitamins = ?, probiotic = ?, duration_min = ?
      WHERE id = ?
    `).run(datetime, amount_ml, vitamins ? 1 : 0, probiotic ? 1 : 0, duration_min || 0, id);
  }

  function deleteFeeding(id) {
    db.prepare(`DELETE FROM feedings WHERE id = ?`).run(id);
  }

  function getStats(date) {
    const rows = getFeedingsByDate(date);
    const total = rows.reduce((sum, r) => sum + r.amount_ml, 0);
    const count = rows.length;

    let hoursActive = 24;
    if (count > 1) {
      const first = new Date(rows[0].datetime);
      const last = new Date(rows[rows.length - 1].datetime);
      hoursActive = Math.max(1, (last - first) / (1000 * 60 * 60));
    }

    const avgPerHour = count > 0 ? total / hoursActive : 0;
    const avgPer3Hours = count > 0 ? avgPerHour * 3 : 0;
    const goal = getDailyGoal();
    const vitaminsTaken = rows.some(r => r.vitamins) ? 1 : 0;
    const probioticTaken = rows.some(r => r.probiotic) ? 1 : 0;
    const supplementsTaken = vitaminsTaken + probioticTaken;
    return {
      total,
      count,
      avgPerHour,
      avgPer3Hours,
      goal,
      remaining: Math.max(0, goal - total),
      supplementsTaken
    };
  }

  return {
    getDailyGoal,
    setDailyGoal,
    getAvgPortion,
    setAvgPortion,
    getFeedingsByDate,
    addFeeding,
    updateFeeding,
    deleteFeeding,
    getStats,
    close: () => db.close()
  };
}

module.exports = { initDatabase };
