const User = require('../models/User');
const Resource = require('../models/Resource');
const Category = require('../models/Category');
const { all, get, run } = require('../config/db');

function pageParams(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 50);
  return { page, limit, offset: (page - 1) * limit };
}

async function listUsers(req, res, next) {
  try {
    const { page, limit, offset } = pageParams(req);
    const total = await User.count();
    res.json({ data: await User.list(limit, offset), page, limit, total: total.count });
  } catch (error) {
    next(error);
  }
}

async function updateUser(req, res, next) {
  try {
    await User.update(req.params.id, req.body);
    res.json(await User.findById(req.params.id));
  } catch (error) {
    next(error);
  }
}

async function deleteUser(req, res, next) {
  try {
    if (Number(req.params.id) === req.user.id) return res.status(400).json({ message: 'Impossible de supprimer votre propre compte.' });
    await User.remove(req.params.id);
    res.json({ message: 'Utilisateur supprime.' });
  } catch (error) {
    next(error);
  }
}

async function adminStats(req, res, next) {
  try {
    const users = await User.count();
    const resources = await Resource.count({ role: 'admin' });
    const categories = await Category.count();
    const groups = await get('SELECT COUNT(*) AS count FROM groups');
    res.json({ users: users.count, resources: resources.count, categories: categories.count, groups: groups.count });
  } catch (error) {
    next(error);
  }
}

async function mySpace(req, res, next) {
  try {
    const files = await all('SELECT id, title, description, original_name, admin_visible, created_at FROM private_files WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
    const note = await get('SELECT content, updated_at FROM notes WHERE user_id = ?', [req.user.id]);
    res.json({ files, note: note || { content: '' } });
  } catch (error) {
    next(error);
  }
}

async function saveNote(req, res, next) {
  try {
    const content = req.body.content || '';
    const existing = await get('SELECT id FROM notes WHERE user_id = ?', [req.user.id]);
    if (existing) await run('UPDATE notes SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?', [content, req.user.id]);
    else await run('INSERT INTO notes (user_id, content) VALUES (?, ?)', [req.user.id, content]);
    res.json({ message: 'Note enregistree.' });
  } catch (error) {
    next(error);
  }
}

async function uploadPrivateFile(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: 'Fichier requis.' });
    const title = req.body.title || req.file.originalname;
    const adminVisible = req.body.adminVisible === 'false' ? 0 : 1;
    const result = await run(
      'INSERT INTO private_files (user_id, title, description, file_path, original_name, admin_visible) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, req.body.description || '', req.file.filename, req.file.originalname, adminVisible]
    );
    res.status(201).json({ id: result.id, title, original_name: req.file.originalname });
  } catch (error) {
    next(error);
  }
}

module.exports = { listUsers, updateUser, deleteUser, adminStats, mySpace, saveNote, uploadPrivateFile };
