const TimeEntry = require('../models/TimeEntry');
const Timesheet = require('../models/Timesheet');
const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);


const getOrCreateTimesheet = async (userId, date) => {
    const weekStartDate = dayjs(date).utc().startOf('week').toDate();

    let timesheet = await Timesheet.findOne({ user: userId, weekStartDate });

    if (!timesheet) {
        timesheet = new Timesheet({ user: userId, weekStartDate });
        await timesheet.save();
    }
    return timesheet;
};


exports.createTimeEntry = async (req, res) => {
    try {
        const { project, taskName, startTime, endTime, description, isBreak } = req.body;
        const userId = req.user.id;

        const start = dayjs(startTime);
        const end = dayjs(endTime);
        const duration = end.diff(start, 'second');

        const timesheet = await getOrCreateTimesheet(userId, start.toDate());


        if (timesheet.status !== 'Not Submitted' && timesheet.status !== 'Rejected') {
            return res.status(400).json({ message: 'Cannot add entry to a locked timesheet.' });
        }

        const newEntry = new TimeEntry({
            user: userId,
            project,
            taskName,
            startTime: start.toDate(),
            endTime: end.toDate(),
            duration,
            description,
            isBreak,
            entryType: 'Manual', 
            timesheet: timesheet._id
        });

        await newEntry.save();


        timesheet.timeEntries.push(newEntry._id);
        timesheet.totalHours += duration;
        await timesheet.save();

        res.status(201).json(newEntry);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getWeeklyEntries = async (req, res) => {
    try {
        const date = req.query.date ? dayjs(req.query.date) : dayjs();
        const weekStartDate = date.utc().startOf('week').toDate();
        const weekEndDate = date.utc().endOf('week').toDate();

        const entries = await TimeEntry.find({
            user: req.user.id,
            startTime: { $gte: weekStartDate, $lte: weekEndDate }
        }).populate('project', 'name');

        res.json(entries);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
