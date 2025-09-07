const Timesheet = require('../models/Timesheet');
const User = require('../models/User');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);


exports.submitTimesheet = async (req, res) => {
    try {
        const { weekStartDate } = req.body;
        const user = await User.findById(req.user.id);
        
        const timesheet = await Timesheet.findOne({ 
            user: req.user.id, 
            weekStartDate: dayjs(weekStartDate).utc().startOf('week').toDate()
        });
        
        if (!timesheet || timesheet.status !== 'Not Submitted') {
             return res.status(400).json({ message: 'Timesheet cannot be submitted.' });
        }
        

        const weeklyGoalSeconds = (user.weeklyHoursGoal || 40) * 3600;
        if (timesheet.totalHours > weeklyGoalSeconds) {
            timesheet.regularHours = weeklyGoalSeconds;
            timesheet.overtimeHours = timesheet.totalHours - weeklyGoalSeconds;
        } else {
            timesheet.regularHours = timesheet.totalHours;
            timesheet.overtimeHours = 0;
        }

        timesheet.status = 'Pending Approval';
        timesheet.submittedAt = new Date();
        await timesheet.save();
        
        res.json(timesheet);
    } catch (error) {
         res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getPendingTimesheets = async (req, res) => {
    try {
        const pending = await Timesheet.find({ status: 'Pending Approval' })
            .populate('user', 'name email');
        res.json(pending);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.approveTimesheet = async (req, res) => {
    try {
        const timesheet = await Timesheet.findById(req.params.id);
        if(!timesheet || timesheet.status !== 'Pending Approval') {
            return res.status(400).json({ message: 'Timesheet cannot be approved.' });
        }
        
        timesheet.status = 'Approved';
        timesheet.approvedBy = req.user.id;
        timesheet.approvedAt = new Date();
        await timesheet.save();
        
        res.json(timesheet);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};


exports.rejectTimesheet = async (req, res) => {
    try {
        const { reason } = req.body;
        if(!reason) {
            return res.status(400).json({ message: 'A reason is required for rejection.' });
        }
        
        const timesheet = await Timesheet.findById(req.params.id);
        if(!timesheet || timesheet.status !== 'Pending Approval') {
            return res.status(400).json({ message: 'Timesheet cannot be rejected.' });
        }
        
        timesheet.status = 'Rejected';
        timesheet.rejectionReason = reason;
        timesheet.approvedBy = null;
        timesheet.approvedAt = null;
        await timesheet.save();
        
 
        
        res.json(timesheet);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
