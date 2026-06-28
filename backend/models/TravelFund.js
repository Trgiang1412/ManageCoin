const mongoose = require('mongoose');

const travelFundSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: '' },
    destination: { type: String, default: '' },
    cover_emoji: { type: String, default: '✈️' },
    budget: { type: Number, default: 0 },
    currency: { type: String, default: 'VND' },
    start_date: { type: Date },
    end_date: { type: Date },
    owner_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    family_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Family',
        default: null
    },
    members: [{
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: String,
        email: String,
        role: { type: String, enum: ['owner', 'member'], default: 'member' }
    }],
    status: {
        type: String,
        enum: ['planning', 'ongoing', 'completed'],
        default: 'planning'
    },
    color: { type: String, default: '#6366f1' },
}, { timestamps: true });

module.exports = mongoose.model('TravelFund', travelFundSchema);
