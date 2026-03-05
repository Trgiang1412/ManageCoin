const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category_name: {
        type: String,
        required: true
    },
    type_category: {
        type: String,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
