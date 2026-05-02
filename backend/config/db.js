const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, '..', 'bpt.sqlite');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

async function initDb() {
  await run('PRAGMA foreign_keys = ON');

  await run(`CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT ''
  )`);

  await run(`CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT ''
  )`);

  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    group_id INTEGER NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    type TEXT NOT NULL CHECK(type IN ('pdf','video','software','link')),
    category_id INTEGER NOT NULL,
    group_id INTEGER,
    url TEXT,
    file_path TEXT,
    original_name TEXT,
    created_by INTEGER,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id),
    FOREIGN KEY (group_id) REFERENCES groups(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS private_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    file_path TEXT NOT NULL,
    original_name TEXT NOT NULL,
    admin_visible INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  const groups = [
    ['Famille', 'Acces reserve aux membres de la famille'],
    ['Amis', 'Acces reserve aux amis'],
    ['Etudiants', 'Ressources orientees etudes et concours']
  ];
  for (const group of groups) {
    await run('INSERT OR IGNORE INTO groups (name, description) VALUES (?, ?)', group);
  }

  const categories = [
    ['Sciences, Ingenierie & Technologies', 'A', 'Informatique, reseaux, energie, genie civil et technologies.'],
    ['Sante & Medecine', 'B', 'Documentation sante, prevention, soins et medecine.'],
    ['Administration, Droit & Documents officiels', 'C', 'Guides administratifs, documents et references juridiques.'],
    ['Entrepreneuriat, Business & Finance', 'D', 'Creation entreprise, finance personnelle, gestion et commerce.'],
    ['Examens, Concours & Etudes', 'E', 'Preparation aux examens, concours, bourses et methodologie.'],
    ['Vie pratique & Developpement personnel', 'F', 'Organisation, carriere, communication et vie quotidienne.'],
    ['Logiciels & Outils', 'G', 'Applications utiles, modeles et outils numeriques.']
  ];
  for (const category of categories) {
    await run('INSERT OR IGNORE INTO categories (name, code, description) VALUES (?, ?, ?)', category);
  }

  const famille = await get('SELECT id FROM groups WHERE name = ?', ['Famille']);
  const admin = await get('SELECT id FROM users WHERE email = ?', ['admin@bpt.local']);
  if (!admin) {
    const hash = await bcrypt.hash('AdminBPT2026!', 12);
    await run(
      'INSERT INTO users (name, email, password_hash, role, group_id) VALUES (?, ?, ?, ?, ?)',
      ['Parfait', 'admin@bpt.local', hash, 'admin', famille.id]
    );
  }

  const resourceCount = await get('SELECT COUNT(*) AS count FROM resources');
  if (resourceCount.count === 0) {
    const cats = await all('SELECT id, code FROM categories');
    const byCode = Object.fromEntries(cats.map((cat) => [cat.code, cat.id]));
    const seeds = [
      ['Modele de CV professionnel', 'Un modele simple pour postuler rapidement.', 'link', byCode.F, null, 'https://www.canva.com/resumes/templates/'],
      ['Cours de base en reseaux', 'Introduction aux reseaux informatiques pour debuter.', 'link', byCode.A, null, 'https://www.netacad.com/'],
      ['Guide creation entreprise', 'Ressources utiles pour structurer un petit business.', 'link', byCode.D, null, 'https://www.entrepreneur.com/']
    ];
    for (const item of seeds) {
      await run(
        'INSERT INTO resources (title, description, type, category_id, group_id, url) VALUES (?, ?, ?, ?, ?, ?)',
        item
      );
    }
  }
}

module.exports = { db, run, get, all, initDb };
