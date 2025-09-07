const Leave = require('../models/Leave');
const User = require('../models/User');


exports.createLeaveRequest = async (req, res) => {
    try {
        const { leaveType, startDate, endDate, reason } = req.body;
        const newRequest = new Leave({
            user: req.user.id,
            leaveType,
            startDate,
            endDate,
            reason
        });
        const leaveRequest = await newRequest.save();
        res.status(201).json(leaveRequest);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.getUserLeaveRequests = async (req, res) => {
    try {
        const requests = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getPendingLeaveRequests = async (req, res) => {
    try {
        const requests = await Leave.find({ status: 'Pending' }).populate('user', 'name');
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.approveLeaveRequest = async (req, res) => {
    try {
        const request = await Leave.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Leave request not found.' });
        }
        
        request.status = 'Approved';
        request.approvedBy = req.user.id;
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.rejectLeaveRequest = async (req, res) => {
    try {
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: 'A reason is required for rejection.' });
        }

        const request = await Leave.findById(req.params.id);
        if (!request) {
            return res.status(404).json({ message: 'Leave request not found.' });
        }

        request.status = 'Rejected';
        request.rejectionReason = reason;
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
