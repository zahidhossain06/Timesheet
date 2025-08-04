const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    taskName: {
        type: String,
        required: true,
        trim: true
    },
    duration: {
        type: Number,
        required: [true, 'Duration is required.'],
        min: [0, 'Duration cannot be negative.']
    },

    remainingDuration: {
        type: Number,
        required: true,
    },
    software: {
        type: String,
        required: [true, 'Application is required.'],
        trim: true
    },
    dueDate: {
        type: Date,
        required: [true, 'Due date is required.']
    },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'In Progress', 'Completed', 'Late'],
        default: 'Pending'
    },
}, {
    timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
