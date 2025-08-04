const express = require('express');
const router = express.Router();
const taskController = require('../controllers/TaskController');

router.route('/')
    .get(taskController.getAllTasks)
    .post(taskController.createTask);


router.route('/:id')
    .put(taskController.updateTask)
    .delete(taskController.deleteTask);

module.exports = router;
