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

        // Seed default categories for the new user
        const defaultCategories = [
            { user_id: user.id, category_name: 'Thu nhập', type_category: 'income' },
            { user_id: user.id, category_name: 'Ăn uống', type_category: 'expense' },
            { user_id: user.id, category_name: 'Di chuyển', type_category: 'expense' },
            { user_id: user.id, category_name: 'Mua sắm', type_category: 'expense' },
            { user_id: user.id, category_name: 'Tiết kiệm', type_category: 'expense' },
            { user_id: user.id, category_name: 'Khác', type_category: 'expense' }
        ];
        await Category.insertMany(defaultCategories);

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
        const categories = await Category.find({ user_id: req.user.id });
        res.json(categories);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// --- LIST ROUTES ---
router.get('/lists', authMiddleware, async (req, res) => {
    try {
        const lists = await List.find({ user_id: req.user.id }).populate('id_category');
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

        const itemStrLower = categoryStr.toLowerCase().trim();
        let targetCategoryName = null;

        // Auto categorization logic based ONLY on what we want to map to existing ones
        if (itemStrLower.match(/(bún|phở|cơm|bánh|nước|cafe|trà|uống|ăn|food|mì|nhậu|lẩu|gà|bò)/)) targetCategoryName = 'Ăn uống';
        else if (itemStrLower.match(/(xe|xăng|grab|taxi|bus|vé|di chuyển|car|motor)/)) targetCategoryName = 'Di chuyển';
        else if (itemStrLower.match(/(áo|quần|giày|túi|đồ|siêu thị|mua|shopping|shopee|lazada)/)) targetCategoryName = 'Mua sắm';
        else if (itemStrLower.match(/(tiết kiệm|heo|gửi|save)/)) targetCategoryName = 'Tiết kiệm';
        else if (itemStrLower.match(/(lương|thưởng|bán|lãi|thu|thêm|income)/)) targetCategoryName = 'Thu nhập';

        // 1. Try to find the exact matched category from our auto-categorization
        let category = null;
        if (targetCategoryName) {
            category = await Category.findOne({ user_id: req.user.id, category_name: targetCategoryName });
        }

        // 2. If no auto-match, or the auto-matched category doesn't actually exist in the DB, try to find an exact match from user input
        if (!category) {
            category = await Category.findOne({ user_id: req.user.id, category_name: new RegExp(`^${categoryStr}$`, 'i') });
        }

        // 3. If STILL not found, it MUST go to 'Khác'
        if (!category) {
            category = await Category.findOne({ user_id: req.user.id, category_name: 'Khác' });

            // Just in case 'Khác' was somehow deleted, recreate it
            if (!category) {
                category = new Category({ user_id: req.user.id, category_name: 'Khác', type_category: 'expense' });
                await category.save();
            }
        }

        const finalCategory = category.category_name;

        const newList = new List({
            user_id: req.user.id,
            category_name: finalCategory, // Using the category name of the type
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
