const Task = require('../models/Task');

exports.createTask = async (req, res) => {
    try {
        const { taskName, duration, software, dueDate } = req.body;
        const newTask = new Task({
            taskName,
            duration,
            software,
            dueDate,
            remainingDuration: duration * 60
        });
        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        console.error("Error creating task:", error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", errors: error.errors });
        }
        res.status(500).json({ message: "Server error while creating task.", error: error.message });
    }
};

exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find({}).sort({ status: 1, createdAt: -1 });
        res.status(200).json(tasks);
    } catch (error) {
        console.error("Error fetching tasks:", error.message);
        res.status(500).json({ message: "Error fetching tasks", error: error.message });
    }
};

exports.updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const updatePayload = { ...req.body };

        if (updatePayload.duration !== undefined) {
            updatePayload.remainingDuration = updatePayload.duration * 60;
        }

        const updatedTask = await Task.findByIdAndUpdate(id, updatePayload, { new: true, runValidators: true });
        if (!updatedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json(updatedTask);
    } catch (error) {
        console.error("Error updating task:", error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: "Validation Error", errors: error.errors });
        }
        res.status(500).json({ message: "Error updating task", error: error.message });
    }
};

exports.deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTask = await Task.findByIdAndDelete(id);
        if (!deletedTask) {
            return res.status(404).json({ message: "Task not found" });
        }
        res.status(200).json({ message: "Task successfully deleted" });
    } catch (error) {
        console.error("Error deleting task:", error.message);
        res.status(500).json({ message: "Error deleting task", error: error.message });
    }
};
