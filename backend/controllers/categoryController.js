const Category = require('../models/Category');

async function listCategories(req, res, next) {
  try {
    res.json(await Category.list());
  } catch (error) {
    next(error);
  }
}

async function createCategory(req, res, next) {
  try {
    const result = await Category.create(req.body);
    res.status(201).json(await Category.findById(result.id));
  } catch (error) {
    next(error);
  }
}

async function updateCategory(req, res, next) {
  try {
    await Category.update(req.params.id, req.body);
    res.json(await Category.findById(req.params.id));
  } catch (error) {
    next(error);
  }
}

async function deleteCategory(req, res, next) {
  try {
    await Category.remove(req.params.id);
    res.json({ message: 'Categorie supprimee.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listCategories, createCategory, updateCategory, deleteCategory };
