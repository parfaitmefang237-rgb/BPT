const { get, all, run } = require('../config/db');

module.exports = {
  list() {
    return all('SELECT * FROM groups ORDER BY name');
  },
  findById(id) {
    return get('SELECT * FROM groups WHERE id = ?', [id]);
  },
  create({ name, description = '' }) {
    return run('INSERT INTO groups (name, description) VALUES (?, ?)', [name, description]);
  },
  update(id, { name, description }) {
    return run('UPDATE groups SET name = COALESCE(?, name), description = COALESCE(?, description) WHERE id = ?', [name, description, id]);
  },
  remove(id) {
    return run('DELETE FROM groups WHERE id = ?', [id]);
  }
};
