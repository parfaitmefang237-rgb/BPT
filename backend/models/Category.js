const { get, all, run } = require('../config/db');

module.exports = {
  list() {
    return all('SELECT * FROM categories ORDER BY code');
  },
  count() {
    return get('SELECT COUNT(*) AS count FROM categories');
  },
  findById(id) {
    return get('SELECT * FROM categories WHERE id = ?', [id]);
  },
  create({ name, code, description = '' }) {
    return run('INSERT INTO categories (name, code, description) VALUES (?, ?, ?)', [name, code, description]);
  },
  update(id, { name, code, description }) {
    return run('UPDATE categories SET name = COALESCE(?, name), code = COALESCE(?, code), description = COALESCE(?, description) WHERE id = ?', [name, code, description, id]);
  },
  remove(id) {
    return run('DELETE FROM categories WHERE id = ?', [id]);
  }
};
