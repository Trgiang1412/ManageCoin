const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category_name: {
        type: String,
        required: false
    },
    id_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: false
    },
    date: {
        type: Date,
        default: Date.now
    },
    price: {
        type: Number,
        required: true
    },
    content: {
        type: String
    },
    done_month: {
        type: String,
        default: null
    }
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);
