const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');
const List = require('../models/List');

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
        const { name, email, password, image } = req.body;
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        user = new User({ name, email, password, image });
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        await user.save();

        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, image: user.image } });
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

// Login
router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });

        const payload = { user: { id: user.id } };
        jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' }, (err, token) => {
            if (err) throw err;
            res.json({ token, user: { id: user.id, name: user.name, email: user.email, image: user.image } });
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

// --- CATEGORY ROUTES ---
router.get('/categories', authMiddleware, async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- LIST ROUTES ---
router.get('/lists', authMiddleware, async (req, res) => {
    try {
        const lists = await List.find().populate('id_category');
        res.json(lists);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/lists', authMiddleware, async (req, res) => {
    try {
        let { input } = req.body;
        if (!input) {
            return res.status(400).json({ message: 'Input is required' });
        }

        input = input.trim();
        const parts = input.split(' ');
        if (parts.length < 2) {
            return res.status(400).json({ message: 'Invalid format. Use "Category Amount" e.g "Food 50000"' });
        }

        let amountStr = parts[parts.length - 1];
        let categoryStr = parts.slice(0, parts.length - 1).join(' ');

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

        const isIncome = categoryStr.toLowerCase().trim() === 'cat' || categoryStr.toLowerCase().includes('thu nhập');
        const type_category = isIncome ? 'income' : 'expense';
        const finalCategory = isIncome ? 'Thu nhập' : categoryStr;

        // Find or create category
        let category = await Category.findOne({ category_name: finalCategory });
        if (!category) {
            category = new Category({ category_name: finalCategory, type_category });
            await category.save();
        }

        const newList = new List({
            category_name: finalCategory,
            id_category: category._id,
            price: parsedAmount,
            content: input
        });

        const list = await newList.save();

        res.json({ transaction: list });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
