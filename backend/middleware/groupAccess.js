const Resource = require('../models/Resource');

async function canAccessResource(req, res, next) {
  const resource = await Resource.findById(req.params.id);
  if (!resource) return res.status(404).json({ message: 'Ressource introuvable.' });
  if (req.user.role === 'admin' || !resource.group_id || resource.group_id === req.user.groupId) {
    req.resource = resource;
    return next();
  }
  return res.status(403).json({ message: 'Cette ressource est reservee a un autre groupe.' });
}

module.exports = { canAccessResource };
