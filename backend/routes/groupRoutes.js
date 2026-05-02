const express = require('express');
const controller = require('../controllers/groupController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', controller.listGroups);
router.post('/', protect, requireAdmin, controller.createGroup);
router.put('/:id', protect, requireAdmin, controller.updateGroup);
router.delete('/:id', protect, requireAdmin, controller.deleteGroup);

module.exports = router;
