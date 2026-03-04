const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Transaction = require('../models/Transaction');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'managecoin_super_secret_key';

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token.replace('Bearer ', ''), JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// --- AUTH ROUTES ---

// Register
router.post('/auth/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        let user = await User.findOne({ username });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ username, password });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, balance: user.balance } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, username: user.username, balance: user.balance } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Get User (Me)
router.get('/auth/me', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- TRANSACTION ROUTES ---

// Get all transactions for user
router.get('/transactions', authMiddleware, async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add a transaction
router.post('/transactions', authMiddleware, async (req, res) => {
    try {
        let { input } = req.body;
        if (!input) {
            return res.status(400).json({ message: 'Input is required' });
        }

        input = input.trim();
        // Parsing logic: "Category Amount"
        // E.g: "Ăn u 50000", "Cat 500k", "Mèo 500.000"
        // We will split by spaces, take the last part as amount, the rest as category.
        const parts = input.split(' ');
        if (parts.length < 2) {
            return res.status(400).json({ message: 'Invalid format. Use "Category Amount" e.g "Food 50000"' });
        }

        let amountStr = parts[parts.length - 1];
        let categoryStr = parts.slice(0, parts.length - 1).join(' ');

        // Parse amount: support "k" for thousands, remove dots and commas
        // E.g: "50k" -> 50000, "50.000" -> 50000
        let multiplier = 1;
        if (amountStr.toLowerCase().endsWith('k')) {
            multiplier = 1000;
            amountStr = amountStr.slice(0, -1);
        } else if (amountStr.toLowerCase().endsWith('m')) {
            multiplier = 1000000;
            amountStr = amountStr.slice(0, -1);
        } else if (amountStr.toLowerCase().endsWith('tr')) {
            multiplier = 1000000;
            amountStr = amountStr.slice(0, -2);
        }

        amountStr = amountStr.replace(/[^0-9]/g, '');
        let parsedAmount = parseInt(amountStr, 10) * multiplier;

        if (isNaN(parsedAmount)) {
            return res.status(400).json({ message: 'Could not parse amount' });
        }

        // Determine if it's income or expense
        // The user specified "Khi tôi nhập 'Cat <Số tiền>' thì lúc đó hệ cộng tiền vào dư"
        const isIncome = categoryStr.toLowerCase().trim() === 'cat';

        const type = isIncome ? 'income' : 'expense';
        const finalCategory = isIncome ? 'Thu nhập' : categoryStr; // Normalize income category name maybe

        const newTransaction = new Transaction({
            userId: req.user.id,
            amount: parsedAmount,
            category: categoryStr,
            type: type,
            description: input
        });

        const transaction = await newTransaction.save();

        // Update user balance
        const user = await User.findById(req.user.id);
        if (type === 'income') {
            user.balance += parsedAmount;
        } else {
            user.balance -= parsedAmount;
        }
        await user.save();

        res.json({ transaction, balance: user.balance });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
