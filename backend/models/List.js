const mongoose = require('mongoose');

const listSchema = new mongoose.Schema({
    category_name: {
        type: String,
        required: true
    },
    id_category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
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
    }
}, { timestamps: true });

module.exports = mongoose.model('List', listSchema);
