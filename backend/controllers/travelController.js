const mongoose = require('mongoose');
const TravelFund = require('../models/TravelFund');
const TravelExpense = require('../models/TravelExpense');

// ── HELPERS ──────────────────────────────────────────────────────────────────

// Compute total_spent and total_income for a fund
async function computeFundStats(fundId) {
    const agg = await TravelExpense.aggregate([
        { $match: { fund_id: new mongoose.Types.ObjectId(fundId) } },
        { 
            $group: { 
                _id: null, 
                total_spent: { 
                    $sum: { $cond: [{ $ne: ['$category', 'góp_quỹ'] }, '$amount', 0] }
                },
                total_income: { 
                    $sum: { $cond: [{ $eq: ['$category', 'góp_quỹ'] }, '$amount', 0] }
                }
            } 
        }
    ]);
    return {
        total_spent: agg[0]?.total_spent || 0,
        total_income: agg[0]?.total_income || 0
    };
}

// Auto-update status based on dates
function resolveStatus(fund) {
    if (!fund.start_date && !fund.end_date) return fund.status || 'planning';
    
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const start = fund.start_date ? new Date(fund.start_date) : null;
    const end = fund.end_date ? new Date(fund.end_date) : null;
    
    if (start) start.setHours(0,0,0,0);
    if (end) end.setHours(0,0,0,0);
    
    if (end && end < today) return 'completed';
    if (start && start > today) return 'planning';
    if (start && end && today >= start && today <= end) return 'ongoing';
    
    if (start && !end && today >= start) return 'ongoing';
    if (end && !start && today <= end) return 'ongoing';
    
    return 'planning';
}

// ── FUND CRUD ─────────────────────────────────────────────────────────────────

// GET /travel/funds
exports.getFunds = async (req, res) => {
    try {
        const query = {
            $or: [
                { owner_id: req.user.id },
                { 'members.user_id': req.user.id }
            ]
        };
        const funds = await TravelFund.find(query).sort({ createdAt: -1 });

        const fundsWithStats = await Promise.all(funds.map(async (fund) => {
            const stats = await computeFundStats(fund._id);
            const status = resolveStatus(fund);
            return { ...fund.toObject(), total_spent: stats.total_spent, total_income: stats.total_income, status };
        }));

        res.json(fundsWithStats);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /travel/funds
exports.createFund = async (req, res) => {
    try {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        const fund = new TravelFund({
            ...req.body,
            owner_id: req.user.id,
            members: [{
                user_id: user._id,
                name: user.name,
                email: user.email,
                role: 'owner'
            }]
        });
        await fund.save();
        res.status(201).json({ ...fund.toObject(), total_spent: 0 });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /travel/funds/:id
exports.getFundById = async (req, res) => {
    try {
        const fund = await TravelFund.findOne({
            _id: req.params.id,
            $or: [{ owner_id: req.user.id }, { 'members.user_id': req.user.id }]
        });
        if (!fund) return res.status(404).json({ message: 'Không tìm thấy quỹ' });

        const stats = await computeFundStats(fund._id);
        const status = resolveStatus(fund);
        res.json({ ...fund.toObject(), total_spent: stats.total_spent, total_income: stats.total_income, status });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /travel/funds/:id
exports.updateFund = async (req, res) => {
    try {
        const fund = await TravelFund.findOneAndUpdate(
            { _id: req.params.id, $or: [{ owner_id: req.user.id }, { 'members.user_id': req.user.id }] },
            req.body,
            { new: true }
        );
        if (!fund) return res.status(404).json({ message: 'Không tìm thấy quỹ' });

        const total_spent = await computeTotalSpent(fund._id);
        res.json({ ...fund.toObject(), total_spent });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /travel/funds/:id
exports.deleteFund = async (req, res) => {
    try {
        const fund = await TravelFund.findOneAndDelete({ _id: req.params.id, owner_id: req.user.id });
        if (!fund) return res.status(404).json({ message: 'Không tìm thấy quỹ hoặc không có quyền' });
        await TravelExpense.deleteMany({ fund_id: req.params.id });
        res.json({ message: 'Đã xóa quỹ du lịch' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /travel/funds/:id/invite
exports.inviteMember = async (req, res) => {
    try {
        const { email } = req.body;
        const User = require('../models/User');
        const userToInvite = await User.findOne({ email });
        if (!userToInvite) return res.status(404).json({ message: 'Không tìm thấy người dùng này' });

        const fund = await TravelFund.findOne({ _id: req.params.id, owner_id: req.user.id });
        if (!fund) return res.status(404).json({ message: 'Không tìm thấy quỹ hoặc không có quyền' });

        const isMember = fund.members.some(m => m.user_id.toString() === userToInvite._id.toString());
        if (isMember) return res.status(400).json({ message: 'Người này đã ở trong quỹ' });

        fund.members.push({
            user_id: userToInvite._id,
            name: userToInvite.name,
            email: userToInvite.email,
            role: 'member'
        });
        await fund.save();
        res.json(fund);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── EXPENSE CRUD ──────────────────────────────────────────────────────────────

// GET /travel/funds/:id/expenses
exports.getExpenses = async (req, res) => {
    try {
        const expenses = await TravelExpense.find({ fund_id: req.params.id })
            .populate('user_id', 'name email')
            .sort({ date: -1 });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// POST /travel/funds/:id/expenses
exports.createExpense = async (req, res) => {
    try {
        let { input, overrideCategory, title, amount, category, note, paid_by } = req.body;
        
        let parsedAmount = amount;
        let parsedTitle = title;
        let parsedCategory = category || '';

        // NLP Parsing if input is provided (like in listController)
        if (input) {
            input = input.trim();
            const match = input.match(/(.*?)\s+((?:\d+[.,]?\d*)|(?:\d+))\s*(k|m|tr|triệu|trieu|nghìn|nghin|đ|d)?$/i);
            
            let amountStr, unit, categoryStr;
            if (match) {
                categoryStr = match[1].trim();
                amountStr = match[2].replace(/,/g, '.');
                unit = match[3] ? match[3].toLowerCase() : '';
            } else {
                const fallbackMatch = input.match(/((?:\d+[.,]?\d*)|(?:\d+))\s*(k|m|tr|triệu|trieu|nghìn|nghin|đ|d)?$/i);
                if (!fallbackMatch) return res.status(400).json({ message: 'Invalid format. Use "Category Amount"' });
                amountStr = fallbackMatch[1].replace(/,/g, '.');
                unit = fallbackMatch[2] ? fallbackMatch[2].toLowerCase() : '';
                categoryStr = input.substring(0, fallbackMatch.index).trim();
            }

            if (!categoryStr) {
                categoryStr = overrideCategory === 'góp_quỹ' ? 'Góp quỹ' : 'Chi tiêu';
            }

            let multiplier = 1;
            if (['k', 'nghìn', 'nghin'].includes(unit)) multiplier = 1000;
            else if (['m', 'tr', 'triệu', 'trieu'].includes(unit)) multiplier = 1000000;

            parsedAmount = parseFloat(amountStr) * multiplier;
            parsedTitle = categoryStr;

            const itemStrLower = categoryStr.toLowerCase();
            if (overrideCategory) {
                parsedCategory = overrideCategory;
            } else {
                parsedCategory = ''; // Default to uncategorized
                if (itemStrLower.match(/(^|\s)(bún|phở|cơm|bánh|nước|cafe|trà|uống|ăn|food|mì|nhậu|lẩu|gà|bò|thịt|cá|rau|sữa|kem|trà sữa|cà phê)($|\s)/)) parsedCategory = 'ăn_uống';
                else if (itemStrLower.match(/(^|\s)(xe|xăng|grab|taxi|bus|vé|di chuyển|máy bay|tàu|thuyền)($|\s)/)) parsedCategory = 'đi_lại';
                else if (itemStrLower.match(/(^|\s)(nhà nghỉ|khách sạn|hotel|motel|homestay|ngủ|phòng)($|\s)/)) parsedCategory = 'lưu_trú';
                else if (itemStrLower.match(/(^|\s)(chơi|vé vào|bar|pub|tour|biển|bơi|chụp|ảnh|thuê đồ|tham quan)($|\s)/)) parsedCategory = 'dịch_vụ';
                else if (itemStrLower.match(/(^|\s)(quà|đồ lưu niệm|mua|shopping|áo|quần)($|\s)/)) parsedCategory = 'mua_sắm';
                else if (itemStrLower.match(/(^|\s)(góp|nộp|thu|quỹ|đóng)($|\s)/)) parsedCategory = 'góp_quỹ';
            }
        }

        const expense = new TravelExpense({
            fund_id: req.params.id,
            user_id: req.user.id,
            title: parsedTitle || 'Chi tiêu',
            amount: parsedAmount || 0,
            category: parsedCategory,
            note: note || '',
            paid_by: paid_by || ''
        });
        await expense.save();
        res.status(201).json({ transaction: expense });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// PUT /travel/funds/:id/expenses/:eid
exports.updateExpense = async (req, res) => {
    try {
        const expense = await TravelExpense.findOneAndUpdate(
            { _id: req.params.eid, fund_id: req.params.id },
            req.body,
            { new: true }
        );
        if (!expense) return res.status(404).json({ message: 'Không tìm thấy chi tiêu' });
        res.json(expense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// DELETE /travel/funds/:id/expenses/:eid
exports.deleteExpense = async (req, res) => {
    try {
        await TravelExpense.findOneAndDelete({ _id: req.params.eid, fund_id: req.params.id });
        res.json({ message: 'Đã xóa' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET /travel/funds/:id/summary  — tổng hợp theo category
exports.getSummary = async (req, res) => {
    try {
        const fundId = new mongoose.Types.ObjectId(req.params.id);

        const byCategory = await TravelExpense.aggregate([
            { $match: { fund_id: fundId } },
            {
                $group: {
                    _id: '$category',
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { total: -1 } }
        ]);

        const grandTotal = byCategory.reduce((acc, s) => acc + s.total, 0);

        const byDate = await TravelExpense.aggregate([
            { $match: { fund_id: fundId } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    total: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        res.json({
            by_category: byCategory.map(s => ({
                category: s._id,
                total: s.total,
                count: s.count,
                percentage: grandTotal > 0 ? Math.round(s.total / grandTotal * 100) : 0
            })),
            by_date: byDate,
            grand_total: grandTotal
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
