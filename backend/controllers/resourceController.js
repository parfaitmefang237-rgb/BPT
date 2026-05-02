const path = require('path');
const Resource = require('../models/Resource');

function pageParams(req) {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '12', 10), 1), 30);
  return { page, limit, offset: (page - 1) * limit };
}

async function listResources(req, res, next) {
  try {
    const { page, limit, offset } = pageParams(req);
    const data = await Resource.list({
      categoryId: req.query.categoryId,
      type: req.query.type,
      search: req.query.search,
      userGroupId: req.user?.groupId,
      role: req.user?.role || 'user',
      limit,
      offset
    });
    res.json({ data, page, limit });
  } catch (error) {
    next(error);
  }
}

async function createResource(req, res, next) {
  try {
    const filePath = req.file ? req.file.filename : null;
    if (req.body.type !== 'link' && !filePath) return res.status(400).json({ message: 'Fichier requis pour ce type.' });
    if (req.body.type === 'link' && !req.body.url) return res.status(400).json({ message: 'URL requise pour un lien.' });
    const result = await Resource.create({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      categoryId: req.body.categoryId,
      groupId: req.body.groupId || null,
      url: req.body.url,
      filePath,
      originalName: req.file?.originalname,
      createdBy: req.user.id
    });
    res.status(201).json(await Resource.findById(result.id));
  } catch (error) {
    next(error);
  }
}

async function updateResource(req, res, next) {
  try {
    await Resource.update(req.params.id, {
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      categoryId: req.body.categoryId,
      groupId: req.body.groupId || null,
      url: req.body.url || null,
      filePath: req.file?.filename,
      originalName: req.file?.originalname
    });
    res.json(await Resource.findById(req.params.id));
  } catch (error) {
    next(error);
  }
}

async function deleteResource(req, res, next) {
  try {
    await Resource.remove(req.params.id);
    res.json({ message: 'Ressource supprimee.' });
  } catch (error) {
    next(error);
  }
}

async function downloadResource(req, res) {
  if (!req.resource.file_path) return res.status(404).json({ message: 'Aucun fichier associe.' });
  const file = path.join(__dirname, '..', 'protected_uploads', req.resource.file_path);
  res.download(file, req.resource.original_name || req.resource.title);
}

module.exports = { listResources, createResource, updateResource, deleteResource, downloadResource };
