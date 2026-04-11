const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Category = require('../models/Category');

const JWT_SECRET = process.env.JWT_SECRET || 'managecoin_super_secret_key';

exports.register = async (req, res) => {
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
};

exports.login = async (req, res) => {
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
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
