const path = require('path');
const os = require('os');
const fs = require('fs');
const { initDatabase } = require('./src/database');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'nbfs-test-'));
const dbPath = path.join(tmpDir, 'test.db');
const db = initDatabase(dbPath);

function assert(condition, message) {
  if (!condition) throw new Error(`Test failed: ${message}`);
}

function eq(actual, expected, message) {
  if (actual !== expected) {
    throw new Error(`Test failed: ${message}. Expected ${expected}, got ${actual}`);
  }
}

// Default goal
eq(db.getDailyGoal(), 400, 'Default daily goal should be 400');

// Set goal
db.setDailyGoal(500);
eq(db.getDailyGoal(), 500, 'Daily goal should be updated to 500');

// Add feedings
const date = '2026-06-18';
const id1 = db.addFeeding(`${date}T07:30:00`, 90, true, false, 12);
const id2 = db.addFeeding(`${date}T10:15:00`, 60, false, true, 8);
const id3 = db.addFeeding(`${date}T13:00:00`, 80, true, true, 20);

assert(id1 > 0 && id2 > 0 && id3 > 0, 'Feeding IDs should be positive');

// Read feedings
let feedings = db.getFeedingsByDate(date);
eq(feedings.length, 3, 'Should have 3 feedings');
eq(feedings[0].amount_ml, 90, 'First feeding amount');
eq(feedings[0].vitamins, 1, 'First feeding vitamins');
eq(feedings[0].probiotic, 0, 'First feeding probiotic');
eq(feedings[0].duration_min, 12, 'First feeding duration');
eq(feedings[1].amount_ml, 60, 'Second feeding amount');
eq(feedings[1].vitamins, 0, 'Second feeding vitamins');
eq(feedings[1].probiotic, 1, 'Second feeding probiotic');
eq(feedings[1].duration_min, 8, 'Second feeding duration');

// Stats
let stats = db.getStats(date);
eq(stats.total, 230, 'Total should be 230');
eq(stats.count, 3, 'Count should be 3');
eq(stats.goal, 500, 'Goal should be 500');
eq(stats.remaining, 270, 'Remaining should be 270');
eq(Math.round(stats.avgPerHour * 10) / 10, 41.8, 'Avg per hour');
eq(Math.round(stats.avgPerMeal * 10) / 10, 76.7, 'Avg per meal');
eq(stats.supplementsTaken, 2, 'Supplements should be 2/2');

// Update feeding
db.updateFeeding(id2, `${date}T10:30:00`, 70, true, false, 15);
feedings = db.getFeedingsByDate(date);
eq(feedings[1].amount_ml, 70, 'Updated feeding amount');
eq(feedings[1].vitamins, 1, 'Updated feeding vitamins');
eq(feedings[1].probiotic, 0, 'Updated feeding probiotic');
eq(feedings[1].duration_min, 15, 'Updated feeding duration');

stats = db.getStats(date);
eq(stats.total, 240, 'Total after update');
eq(Math.round(stats.avgPerHour * 10) / 10, 43.6, 'Avg per hour after update');
eq(Math.round(stats.avgPerMeal * 10) / 10, 80, 'Avg per meal after update');

// Delete feeding
db.deleteFeeding(id3);
feedings = db.getFeedingsByDate(date);
eq(feedings.length, 2, 'Should have 2 feedings after delete');

stats = db.getStats(date);
eq(stats.total, 160, 'Total after delete');
eq(Math.round(stats.avgPerHour * 10) / 10, 53.3, 'Avg per hour after delete');
eq(Math.round(stats.avgPerMeal * 10) / 10, 80, 'Avg per meal after delete');
eq(stats.supplementsTaken, 1, 'Supplements should be 1/2 after delete');

// Empty date
const emptyStats = db.getStats('2020-01-01');
eq(emptyStats.total, 0, 'Empty date total');
eq(emptyStats.avgPerHour, 0, 'Empty date avg per hour');
eq(emptyStats.avgPerMeal, 0, 'Empty date avg per meal');

// Reports queries
const datePrev = '2026-06-17';
db.addFeeding(`${datePrev}T08:00:00`, 50, false, false, 0);
db.addFeeding(`${datePrev}T20:00:00`, 40, false, false, 0);

const dateNext = '2026-06-19';
db.addFeeding(`${dateNext}T06:00:00`, 30, false, false, 0);
db.addFeeding(`${dateNext}T14:00:00`, 70, false, false, 0);

const dailyTotals = db.getDailyTotals('2026-06-17', '2026-06-19');
eq(dailyTotals.length, 3, 'Daily totals should cover 3 days');
eq(dailyTotals.find(d => d.date === date).total, 160, 'Daily total for main date');
eq(dailyTotals.find(d => d.date === datePrev).total, 90, 'Daily total for previous date');
eq(dailyTotals.find(d => d.date === dateNext).total, 100, 'Daily total for next date');

const hourlyTotals = db.getHourlyTotals(date);
eq(hourlyTotals.length, 2, 'Hourly totals should have 2 groups');
eq(hourlyTotals.find(h => h.hour === 7).total, 90, 'Hourly total for 7am');
eq(hourlyTotals.find(h => h.hour === 10).total, 70, 'Hourly total for 10am');

const split = db.getDayNightSplit(date);
eq(split.dayTotal, 160, 'Day total should be 160');
eq(split.nightTotal, 0, 'Night total should be 0');

const splitPrev = db.getDayNightSplit(datePrev);
eq(splitPrev.dayTotal, 50, 'Day total for previous date');
eq(splitPrev.nightTotal, 40, 'Night total for previous date');

const intervals = db.getFeedingIntervals(date);
eq(intervals.length, 1, 'Should have 1 interval');
eq(intervals[0], 180, 'Interval should be 180 minutes');

const emptyIntervals = db.getFeedingIntervals('2020-01-01');
eq(emptyIntervals.length, 0, 'Empty date should have no intervals');

// Cleanup
db.close();
fs.rmSync(tmpDir, { recursive: true, force: true });

console.log('✅ All database tests passed.');
