const List = require('../models/List');
const Category = require('../models/Category');

exports.getLists = async (req, res) => {
    try {
        const lists = await List.find({
            // user_id: req.user.id,
            $or: [
                { done_month: null },
                { done_month: { $exists: false } }
            ]
        }).populate('id_category').populate('user_id', 'name');
        res.json(lists);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.endMonth = async (req, res) => {
    try {
        // Find all unfinished lists for this user
        const query = {
            // user_id: req.user.id,
            $or: [
                { done_month: null },
                { done_month: { $exists: false } }
            ]
        };

        const unfinishedLists = await List.find(query).sort({ date: 1 });

        if (unfinishedLists.length === 0) {
            return res.status(400).json({ message: 'Không có khoản chi nào để kết thúc.' });
        }

        // The date of the oldest transaction
        const oldestDate = unfinishedLists[0].date;
        const month = String(oldestDate.getMonth() + 1).padStart(2, '0');
        const year = oldestDate.getFullYear();
        const doneMonthStr = `${month}/${year}`;

        // Update all unfinished lists
        await List.updateMany(query, { $set: { done_month: doneMonthStr } });

        res.json({ message: 'Đã kết thúc tháng', done_month: doneMonthStr, count: unfinishedLists.length });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.createList = async (req, res) => {
    try {
        let { input } = req.body;
        if (!input) {
            return res.status(400).json({ message: 'Input is required' });
        }

        input = input.trim();
        // Regex to explicitly capture the number and the unit, ignoring leading content
        const match = input.match(/(.*?)\s+((?:\d+[.,]?\d*)|(?:\d+))\s*(k|m|tr|triệu|trieu|nghìn|nghin|đ|d)?$/i);

        let amountStr, unit, categoryStr;

        if (match) {
            categoryStr = match[1].trim();
            amountStr = match[2].replace(/,/g, '.');
            unit = match[3] ? match[3].toLowerCase() : '';
        } else {
            // Fallback for just numbers at the end without leading space e.g., "Food50000"
            const fallbackMatch = input.match(/((?:\d+[.,]?\d*)|(?:\d+))\s*(k|m|tr|triệu|trieu|nghìn|nghin|đ|d)?$/i);
            if (!fallbackMatch) {
                return res.status(400).json({ message: 'Invalid format. Use "Category Amount" e.g "Food 50000" or "Thu nhập 10 triệu"' });
            }
            amountStr = fallbackMatch[1].replace(/,/g, '.');
            unit = fallbackMatch[2] ? fallbackMatch[2].toLowerCase() : '';
            categoryStr = input.substring(0, fallbackMatch.index).trim();
        }

        if (!categoryStr) categoryStr = 'Khác';

        let multiplier = 1;
        if (['k', 'nghìn', 'nghin'].includes(unit)) {
            multiplier = 1000;
        } else if (['m', 'tr', 'triệu', 'trieu'].includes(unit)) {
            multiplier = 1000000;
        }

        let parsedAmount = parseFloat(amountStr) * multiplier;

        if (isNaN(parsedAmount)) {
            return res.status(400).json({ message: 'Could not parse amount' });
        }

        const itemStrLower = categoryStr.toLowerCase().trim();
        let targetCategoryName = null;

        // Auto categorization logic based ONLY on what we want to map to existing ones
        if (itemStrLower.match(/(bún|phở|cơm|bánh|nước|cafe|trà|uống|ăn|food|mì|nhậu|lẩu|gà|bò|thịt|cá|rau|sữa|chợ)/)) targetCategoryName = 'Ăn uống';
        else if (itemStrLower.match(/(xe|xăng|grab|taxi|bus|vé|di chuyển|car|motor)/)) targetCategoryName = 'Di chuyển';
        else if (itemStrLower.match(/(áo|quần|giày|túi|đồ|siêu thị|mua|shopping|shopee|lazada|son|quần áo|mỹ phẩm)/)) targetCategoryName = 'Mua sắm';
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

        // 3. If STILL not found, keep it unassigned
        let finalCategory = '';
        let idCategory = null;

        if (category) {
            finalCategory = category.category_name;
            idCategory = category._id;
        }

        const newList = new List({
            user_id: req.user.id,
            category_name: finalCategory, // Using the category name of the type
            id_category: idCategory,
            price: parsedAmount,
            content: input
        });

        const list = await newList.save();

        res.json({ transaction: list });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.updateList = async (req, res) => {
    try {
        const { category_name } = req.body;
        if (!category_name) {
            return res.status(400).json({ message: 'Category name is required' });
        }
        // tạm thời tắt userId vì sau sẽ làm hệ thóng family
        const list = await List.findOne({ _id: req.params.id });
        // const list = await List.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!list) return res.status(404).json({ message: 'Transaction not found' });
        // Bỏ lấy theo userId
        const category = await Category.findOne({ user_id: req.user.id, category_name });
        if (!category) return res.status(404).json({ message: 'Category not found' });
        list.category_name = category.category_name;
        list.id_category = category._id;
        await list.save();

        res.json({ transaction: list });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteList = async (req, res) => {
    try {
        const list = await List.findOne({ _id: req.params.id, user_id: req.user.id });
        if (!list) return res.status(404).json({ message: 'Transaction not found' });

        await list.deleteOne();
        res.json({ message: 'Transaction deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
