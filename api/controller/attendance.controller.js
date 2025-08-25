const Attendance = require('../model/attendance.model');
const moment = require('moment');

module.exports = {
  // CORRECTED markAttendance function
  markAttendance: async (req, res) => {
    // Expect an array of student attendance data, plus the common classId and date
    const { attendanceData, classId, date } = req.body;
    const schoolId = req.user.schoolId;

    // Basic validation to ensure we received an array
    if (!Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({ message: 'Attendance data must be a non-empty array.' });
    }

    try {
      // 1. Map the incoming array to match your Attendance schema
      const documentsToInsert = attendanceData.map(record => ({
        student: record.studentId, // or whatever key you use in the array
        status: record.status,
        class: classId,
        date: date,
        school: schoolId,
      }));

      // 2. Use insertMany for a single, efficient bulk database operation
      const result = await Attendance.insertMany(documentsToInsert);
      
      res.status(201).json({ message: 'Attendance marked successfully', data: result });
    } catch (err) {
      res.status(500).json({ message: 'Error marking attendance', error: err.message });
    }
  },

  // Your getAttendance function is fine for fetching a single student's record
  getAttendance: async (req, res) => {
    const { studentId } = req.params;
    try {
      const attendance = await Attendance.find({ student: studentId }).populate('student');
      res.status(200).json(attendance);
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: 'Error fetching attendance', err });
    }
  },

  // Your checkAttendance function is well-written and correct
  checkAttendance: async (req, res) => {
    try {
      const today = moment().startOf('day');
      const attendanceForToday = await Attendance.findOne({
        class: req.params.classId,
        date: {
          $gte: today.toDate(),
          $lt: moment(today).endOf('day').toDate(),
        },
      });

      if (attendanceForToday) {
        return res.status(200).json({ attendanceTaken: true, message: 'Attendance already taken for today' });
      } else {
        return res.status(200).json({ attendanceTaken: false, message: 'No attendance taken yet for today' });
      }
    } catch (error) {
      console.error('Error checking attendance:', error);
      return res.status(500).json({ message: 'Server error', error });
    }
  },
};