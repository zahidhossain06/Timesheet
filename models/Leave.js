const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const leaveSchema = new Schema({

    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    leaveType: {
        type: String,
        enum: ['Vacation', 'Sick Leave', 'Personal', 'Unpaid'],
        required: true
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String },

    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String },

}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
