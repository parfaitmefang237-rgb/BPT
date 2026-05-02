const express = require('express');
const multer = require('multer');
const path = require('path');
const controller = require('../controllers/userController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

const uploadDir = path.join(__dirname, '..', 'protected_uploads');
const allowed = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'video/mp4',
  'application/zip',
  'application/x-zip-compressed'
]);

const storage = multer.diskStorage({
  destination: uploadDir,
  filename(req, file, cb) {
    const safe = file.originalname.replace(/[^a-zA-Z0-9_.-]/g, '_');
    cb(null, `${Date.now()}-${safe}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    cb(null, allowed.has(file.mimetype));
  }
});

router.get('/', protect, requireAdmin, controller.listUsers);
router.put('/:id', protect, requireAdmin, controller.updateUser);
router.delete('/:id', protect, requireAdmin, controller.deleteUser);
router.get('/admin/stats', protect, requireAdmin, controller.adminStats);
router.get('/me/space', protect, controller.mySpace);
router.put('/me/note', protect, controller.saveNote);
router.post('/me/files', protect, upload.single('file'), controller.uploadPrivateFile);

module.exports = router;
