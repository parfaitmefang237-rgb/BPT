const { get, all, run } = require('../config/db');

const publicFields = `users.id, users.name, users.email, users.role, users.group_id,
  groups.name AS group_name, users.created_at`;

module.exports = {
  findByEmail(email) {
    return get('SELECT users.*, groups.name AS group_name FROM users JOIN groups ON groups.id = users.group_id WHERE email = ?', [email]);
  },
  findById(id) {
    return get(`SELECT ${publicFields} FROM users JOIN groups ON groups.id = users.group_id WHERE users.id = ?`, [id]);
  },
  list(limit, offset) {
    return all(`SELECT ${publicFields} FROM users JOIN groups ON groups.id = users.group_id ORDER BY users.created_at DESC LIMIT ? OFFSET ?`, [limit, offset]);
  },
  count() {
    return get('SELECT COUNT(*) AS count FROM users');
  },
  create({ name, email, passwordHash, role = 'user', groupId }) {
    return run('INSERT INTO users (name, email, password_hash, role, group_id) VALUES (?, ?, ?, ?, ?)', [name, email, passwordHash, role, groupId]);
  },
  update(id, { name, role, groupId }) {
    return run('UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role), group_id = COALESCE(?, group_id) WHERE id = ?', [name, role, groupId, id]);
  },
  remove(id) {
    return run('DELETE FROM users WHERE id = ?', [id]);
  }
};
