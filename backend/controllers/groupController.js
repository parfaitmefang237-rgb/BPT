const Group = require('../models/Group');

async function listGroups(req, res, next) {
  try {
    res.json(await Group.list());
  } catch (error) {
    next(error);
  }
}

async function createGroup(req, res, next) {
  try {
    const result = await Group.create(req.body);
    res.status(201).json(await Group.findById(result.id));
  } catch (error) {
    next(error);
  }
}

async function updateGroup(req, res, next) {
  try {
    await Group.update(req.params.id, req.body);
    res.json(await Group.findById(req.params.id));
  } catch (error) {
    next(error);
  }
}

async function deleteGroup(req, res, next) {
  try {
    await Group.remove(req.params.id);
    res.json({ message: 'Groupe supprime.' });
  } catch (error) {
    next(error);
  }
}

module.exports = { listGroups, createGroup, updateGroup, deleteGroup };
