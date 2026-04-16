const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const listController = require('../controllers/listController');
const familyController = require('../controllers/familyController');

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

// --- FAMILY ROUTES ---
router.get('/family', authMiddleware, familyController.getFamily);
router.post('/family', authMiddleware, familyController.createFamily);
router.post('/family/add-member', authMiddleware, familyController.addMember);
router.post('/family/accept-invite', authMiddleware, familyController.acceptInvite);
router.post('/family/reject-invite', authMiddleware, familyController.rejectInvite);

module.exports = router;
