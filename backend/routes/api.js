const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const listController = require('../controllers/listController');

// --- AUTH ROUTES ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);

// --- CATEGORY ROUTES ---
router.get('/categories', authMiddleware, categoryController.getCategories);

// --- LIST ROUTES ---
router.get('/lists', authMiddleware, listController.getLists);
router.post('/lists/end-month', authMiddleware, listController.endMonth);
router.post('/lists', authMiddleware, listController.createList);
router.put('/lists/:id', authMiddleware, listController.updateList);
router.delete('/lists/:id', authMiddleware, listController.deleteList);

module.exports = router;
