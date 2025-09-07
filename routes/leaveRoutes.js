const express = require('express');
const router = express.Router();
const { 
    createLeaveRequest, 
    getUserLeaveRequests, 
    getPendingLeaveRequests, 
    approveLeaveRequest, 
    rejectLeaveRequest 
} = require('../controllers/leaveController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createLeaveRequest)
    .get(protect, getUserLeaveRequests);

router.get('/pending', protect, admin, getPendingLeaveRequests);
router.put('/:id/approve', protect, admin, approveLeaveRequest);
router.put('/:id/reject', protect, admin, rejectLeaveRequest);

module.exports = router;
