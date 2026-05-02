const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'change-this-secret-in-production';

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, groupId: user.group_id },
    secret,
    { expiresIn: '8h' }
  );
}

function protect(req, res, next) {
  const header = req.headers.authorization || '';
  const authToken = header.startsWith('Bearer ') ? header.slice(7) : req.query.token;
  if (!authToken) return res.status(401).json({ message: 'Authentification requise.' });
  try {
    req.user = jwt.verify(authToken, secret);
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Session invalide ou expiree.' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ message: 'Acces admin requis.' });
  return next();
}

module.exports = { createToken, protect, requireAdmin };
