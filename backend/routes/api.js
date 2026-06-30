const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const categoryController = require('../controllers/categoryController');
const listController = require('../controllers/listController');
const familyController = require('../controllers/familyController');
const travelController = require('../controllers/travelController');

// --- AUTH ROUTES ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.getMe);
router.put('/auth/me', authMiddleware, authController.updateMe);

// --- CATEGORY ROUTES ---
router.get('/categories', authMiddleware, categoryController.getCategories);

// --- LIST ROUTES ---
router.get('/lists', authMiddleware, listController.getLists);
router.get('/lists/statistics', authMiddleware, listController.getStatistics);
router.post('/lists/end-month', authMiddleware, listController.endMonth);
router.post('/lists', authMiddleware, listController.createList);
router.put('/lists/:id', authMiddleware, listController.updateList);
router.delete('/lists/:id', authMiddleware, listController.deleteList);

// --- FAMILY ROUTES ---
router.get('/family/all', authMiddleware, familyController.getMyFamilies);
router.get('/family', authMiddleware, familyController.getFamily);
router.post('/family', authMiddleware, familyController.createFamily);
router.post('/family/switch', authMiddleware, familyController.switchFamily);
router.post('/family/add-member', authMiddleware, familyController.addMember);
router.post('/family/accept-invite', authMiddleware, familyController.acceptInvite);
router.post('/family/reject-invite', authMiddleware, familyController.rejectInvite);
router.post('/family/:familyId/leave', authMiddleware, familyController.leaveFamily);
router.delete('/family/:familyId/member/:memberId', authMiddleware, familyController.removeMember);
router.delete('/family/:familyId', authMiddleware, familyController.dissolveFamily);

// --- TRAVEL ROUTES ---
router.get('/travel/funds', authMiddleware, travelController.getFunds);
router.post('/travel/funds', authMiddleware, travelController.createFund);
router.get('/travel/statistics', authMiddleware, travelController.getStatistics);
router.get('/travel/funds/:id', authMiddleware, travelController.getFundById);
router.put('/travel/funds/:id', authMiddleware, travelController.updateFund);
router.delete('/travel/funds/:id', authMiddleware, travelController.deleteFund);
router.post('/travel/funds/:id/invite', authMiddleware, travelController.inviteMember);

router.get('/travel/funds/:id/expenses', authMiddleware, travelController.getExpenses);
router.post('/travel/funds/:id/expenses', authMiddleware, travelController.createExpense);
router.put('/travel/funds/:id/expenses/:eid', authMiddleware, travelController.updateExpense);
router.delete('/travel/funds/:id/expenses/:eid', authMiddleware, travelController.deleteExpense);
router.get('/travel/funds/:id/summary', authMiddleware, travelController.getSummary);

module.exports = router;

