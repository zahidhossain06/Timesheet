const express = require('express');
const router = express.Router();
const { submitTimesheet, getPendingTimesheets, approveTimesheet, rejectTimesheet } = require('../controllers/timesheetController');
const { protect, admin } = require('../middleware/authMiddleware');

router.put('/submit', protect, submitTimesheet);
router.get('/pending', protect, admin, getPendingTimesheets);
router.put('/:id/approve', protect, admin, approveTimesheet);
router.put('/:id/reject', protect, admin, rejectTimesheet);

module.exports = router;
