const express = require('express');
const router = express.Router();
const { createTimeEntry, getWeeklyEntries } = require('../controllers/timeEntryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createTimeEntry);

router.route('/week')
    .get(protect, getWeeklyEntries);

module.exports = router;
