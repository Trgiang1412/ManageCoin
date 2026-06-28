const mongoose = require('mongoose');

const CATEGORIES = [
    '',
    'ăn_uống',
    'đi_lại',
    'lưu_trú',
    'mua_sắm',
    'dịch_vụ',
    'góp_quỹ',
    'khác'
];

const travelExpenseSchema = new mongoose.Schema({
    fund_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TravelFund',
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: { type: Number, required: true },
    category: {
        type: String,
        enum: CATEGORIES,
        default: ''
    },
    title: { type: String, required: true },
    note: { type: String, default: '' },
    date: { type: Date, default: Date.now },
    paid_by: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('TravelExpense', travelExpenseSchema);
module.exports.CATEGORIES = CATEGORIES;
