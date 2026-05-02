const express = require('express');
const controller = require('../controllers/categoryController');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', controller.listCategories);
router.post('/', protect, requireAdmin, controller.createCategory);
router.put('/:id', protect, requireAdmin, controller.updateCategory);
router.delete('/:id', protect, requireAdmin, controller.deleteCategory);

module.exports = router;
