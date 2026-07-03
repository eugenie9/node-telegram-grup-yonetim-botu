const Database = require("better-sqlite3");

const db = new Database("veritabani.db");

// Enable WAL mode for better concurrent performance
db.pragma("journal_mode = WAL");

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS moderatorler (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS itibar (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    itibar INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS itibar_gecmisi (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    veren_id INTEGER NOT NULL,
    alan_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Prepared statements for performance
const stmtModeratorEkle = db.prepare(
  "INSERT OR IGNORE INTO moderatorler (id, name) VALUES (?, ?)",
);
const stmtModeratorKaldir = db.prepare("DELETE FROM moderatorler WHERE id = ?");
const stmtYetkiKontrol = db.prepare("SELECT 1 FROM moderatorler WHERE id = ?");
const stmtModeratorListesi = db.prepare("SELECT * FROM moderatorler");
const stmtItibarOgren = db.prepare("SELECT itibar FROM itibar WHERE id = ?");
const stmtItibarEkle = db.prepare(
  "INSERT INTO itibar (id, name, itibar) VALUES (?, ?, 1)",
);
const stmtItibarArttir = db.prepare(
  "UPDATE itibar SET name = ?, itibar = itibar + 1 WHERE id = ?",
);
const stmtItibarGecmisiEkle = db.prepare(
  "INSERT INTO itibar_gecmisi (veren_id, alan_id) VALUES (?, ?)",
);
const stmtItibarGecmisi = db.prepare(`
  SELECT ig.id, ig.veren_id, ig.alan_id, i.name AS veren_ad, ig.created_at
  FROM itibar_gecmisi ig
  LEFT JOIN itibar i ON i.id = ig.veren_id
  WHERE ig.alan_id = ?
  ORDER BY ig.created_at DESC
`);

const stmtTop5 = db.prepare(`
  SELECT id, name, itibar
  FROM itibar
  ORDER BY itibar DESC
  LIMIT 5
`);

const moderatorEkle = async (id, name) => {
  stmtModeratorEkle.run(id, name);
};

const moderatorKaldir = async (id, name) => {
  stmtModeratorKaldir.run(id);
};

const yetkiKontrol = async (id) => {
  const row = stmtYetkiKontrol.get(id);
  return row !== undefined;
};

const moderatorListesi = async () => {
  return stmtModeratorListesi.all();
};

const itibarOgren = async (id) => {
  const row = stmtItibarOgren.get(id);
  if (row === undefined) {
    return false;
  }
  return row.itibar;
};

const itibarArttir = async (id, name, verenId) => {
  const row = stmtItibarOgren.get(id);

  if (row === undefined) {
    stmtItibarEkle.run(id, name);
  } else {
    stmtItibarArttir.run(name, id);
  }

  // Log who gave +1 to whom
  if (verenId !== undefined && verenId !== id) {
    stmtItibarGecmisiEkle.run(verenId, id);
  }
};

const itibarGecmisi = async (alanId) => {
  return stmtItibarGecmisi.all(alanId);
};

const top5 = async () => {
  return stmtTop5.all();
};

let veritabani = {
  moderatorEkle,
  moderatorKaldir,
  yetkiKontrol,
  moderatorListesi,
  itibarOgren,
  itibarArttir,
  itibarGecmisi,
  top5,
};

module.exports = veritabani;
