const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Group = require('../models/Group');
const { createToken } = require('../middleware/authMiddleware');

async function register(req, res, next) {
  try {
    const { name, email, password, groupId } = req.body;
    if (!name || !email || !password || !groupId) {
      return res.status(400).json({ message: 'Nom, email, mot de passe et groupe sont requis.' });
    }
    const group = await Group.findById(groupId);
    if (!group) return res.status(400).json({ message: 'Groupe invalide.' });
    const exists = await User.findByEmail(email);
    if (exists) return res.status(409).json({ message: 'Cet email est deja utilise.' });
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await User.create({ name, email, passwordHash, groupId });
    const user = await User.findById(result.id);
    res.status(201).json({ user, token: createToken(user) });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const userWithHash = await User.findByEmail(email);
    if (!userWithHash) return res.status(401).json({ message: 'Identifiants invalides.' });
    const ok = await bcrypt.compare(password, userWithHash.password_hash);
    if (!ok) return res.status(401).json({ message: 'Identifiants invalides.' });
    const user = await User.findById(userWithHash.id);
    res.json({ user, token: createToken(user) });
  } catch (error) {
    next(error);
  }
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
}

module.exports = { register, login, me };
