const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timesheetSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    weekStartDate: { type: Date, required: true }, 

    status: {
        type: String,
        enum: ['Not Submitted', 'Pending Approval', 'Approved', 'Rejected'],
        default: 'Not Submitted'
    },
    rejectionReason: { type: String },
    submittedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    approvedAt: { type: Date },

    totalHours: { type: Number, default: 0 }, 
    regularHours: { type: Number, default: 0 }, 
    overtimeHours: { type: Number, default: 0 },

    timeEntries: [{
        type: Schema.Types.ObjectId,
        ref: 'TimeEntry'
    }]

}, { timestamps: true });

timesheetSchema.index({ user: 1, weekStartDate: 1 }, { unique: true });

module.exports = mongoose.model('Timesheet', timesheetSchema);
