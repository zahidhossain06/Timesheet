const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const timeEntrySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
    taskName: { type: String, required: true },

    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    duration: { type: Number, required: true },
    description: { type: String },
    entryType: {
        type: String,
        enum: ['Timer', 'Manual'],
        required: true
    },

    isBreak: { type: Boolean, default: false },

    timesheet: { type: Schema.Types.ObjectId, ref: 'Timesheet', required: true }

}, { timestamps: true });

module.exports = mongoose.model('TimeEntry', timeEntrySchema);
