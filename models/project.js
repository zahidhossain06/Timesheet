const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const taskSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },

    status: {
        type: String,
        enum: ['To-Do', 'In Progress', 'Done'],
        default: 'To-Do'
    }
});

const projectSchema = new Schema({

    name: { type: String, required: true, unique: true },
    clientName: { type: String },
    description: { type: String },
    budgetedHours: { type: Number, default: 0 }, 


    assignedMembers: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],

    tasks: [taskSchema]

}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
