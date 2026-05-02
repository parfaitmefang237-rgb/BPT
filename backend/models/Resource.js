const { get, all, run } = require('../config/db');

const selectSql = `SELECT resources.*, categories.name AS category_name, categories.code AS category_code,
  groups.name AS group_name, users.name AS creator_name
  FROM resources
  JOIN categories ON categories.id = resources.category_id
  LEFT JOIN groups ON groups.id = resources.group_id
  LEFT JOIN users ON users.id = resources.created_by`;

module.exports = {
  async list({ categoryId, type, search, userGroupId, role, limit, offset }) {
    const where = [];
    const params = [];
    if (categoryId) {
      where.push('resources.category_id = ?');
      params.push(categoryId);
    }
    if (type) {
      where.push('resources.type = ?');
      params.push(type);
    }
    if (search) {
      where.push('(resources.title LIKE ? OR resources.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (role !== 'admin') {
      where.push('(resources.group_id IS NULL OR resources.group_id = ?)');
      params.push(userGroupId);
    }
    const clause = where.length ? ` WHERE ${where.join(' AND ')}` : '';
    return all(`${selectSql}${clause} ORDER BY resources.created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
  },
  count({ userGroupId, role }) {
    if (role === 'admin') return get('SELECT COUNT(*) AS count FROM resources');
    return get('SELECT COUNT(*) AS count FROM resources WHERE group_id IS NULL OR group_id = ?', [userGroupId]);
  },
  findById(id) {
    return get(`${selectSql} WHERE resources.id = ?`, [id]);
  },
  create(data) {
    return run(
      `INSERT INTO resources (title, description, type, category_id, group_id, url, file_path, original_name, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.title, data.description || '', data.type, data.categoryId, data.groupId || null, data.url || null, data.filePath || null, data.originalName || null, data.createdBy]
    );
  },
  update(id, data) {
    return run(
      `UPDATE resources SET title = COALESCE(?, title), description = COALESCE(?, description), type = COALESCE(?, type),
       category_id = COALESCE(?, category_id), group_id = ?, url = ?, file_path = COALESCE(?, file_path), original_name = COALESCE(?, original_name)
       WHERE id = ?`,
      [data.title, data.description, data.type, data.categoryId, data.groupId || null, data.url || null, data.filePath, data.originalName, id]
    );
  },
  remove(id) {
    return run('DELETE FROM resources WHERE id = ?', [id]);
  }
};
