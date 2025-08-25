const Period = require('../model/period.model');

module.exports = {
  // CREATE a period with validation
  createPeriod: async (req, res) => {
    try {
      const { teacher, subject, classId, startTime, endTime } = req.body;
      const schoolId = req.user.schoolId;
      const start = new Date(startTime);
      const end = new Date(endTime);

      // 1. ✅ Basic time validation
      if (start >= end) {
        return res.status(400).json({ success: false, message: 'Start time must be before end time.' });
      }

      // 2. ✅ Check for overlapping periods for the same teacher OR class
      const overlappingPeriod = await Period.findOne({
        school: schoolId,
        $or: [{ teacher: teacher }, { class: classId }], // Check for either the same teacher or same class
        // Find a period where the start or end time falls within the new period's range
        $or: [
          { startTime: { $lt: end }, endTime: { $gt: start } },
        ],
      });

      if (overlappingPeriod) {
        return res.status(409).json({ success: false, message: 'This time slot conflicts with an existing period for the selected teacher or class.' });
      }

      const newPeriod = new Period({
        teacher,
        subject,
        class: classId,
        startTime: start,
        endTime: end,
        school: schoolId,
      });

      await newPeriod.save();
      res.status(201).json({ success: true, message: 'Period assigned successfully', data: newPeriod });
    } catch (error) {
      console.error("Error creating period:", error);
      res.status(500).json({ success: false, message: 'Server error while creating period' });
    }
  },

  // GET periods for a specific teacher
  getTeacherPeriods: async (req, res) => {
    try {
      const { teacherId } = req.params;
      const periods = await Period.find({ teacher: teacherId, school: req.user.schoolId })
        .populate('class')
        .populate('subject');
      // 3. ✅ Standardized response
      res.status(200).json({ success: true, data: periods });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching periods' });
    }
  },

  // GET period by ID
  getPeriodsWithId: async (req, res) => {
    try {
      const { id } = req.params;
      const period = await Period.findOne({ _id: id, school: req.user.schoolId })
        .populate('class')
        .populate('subject')
        .populate('teacher');

      if (!period) {
        return res.status(404).json({ success: false, message: 'Period not found' });
      }
      res.status(200).json({ success: true, data: period });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching period' });
    }
  },

  // GET periods for a specific class
  getClassPeriods: async (req, res) => {
    try {
      const { classId } = req.params;
      const periods = await Period.find({ class: classId, school: req.user.schoolId })
        .populate('subject')
        .populate('teacher');
      res.status(200).json({ success: true, data: periods });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching class periods' });
    }
  },

  // GET all periods for the school
  getPeriods: async (req, res) => {
    try {
      const periods = await Period.find({ school: req.user.schoolId })
        .populate('class')
        .populate('subject')
        .populate('teacher');
      res.status(200).json({ success: true, data: periods });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error fetching periods' });
    }
  },

  // UPDATE a period
  updatePeriod: async (req, res) => {
    try {
      const { teacher, subject } = req.body; // Assuming only these can be updated
      const updatedPeriod = await Period.findOneAndUpdate(
        { _id: req.params.id, school: req.user.schoolId },
        { teacher, subject },
        { new: true }
      );

      if (!updatedPeriod) {
        return res.status(404).json({ success: false, message: 'Period not found' });
      }
      res.status(200).json({ success: true, message: 'Period updated successfully', data: updatedPeriod });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error updating period' });
    }
  },

  // DELETE a period
  deletePeriod: async (req, res) => {
    try {
      const deletedPeriod = await Period.findOneAndDelete({ _id: req.params.id, school: req.user.schoolId });

      if (!deletedPeriod) {
        return res.status(404).json({ success: false, message: 'Period not found' });
      }
      res.status(200).json({ success: true, message: 'Period deleted successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting period' });
    }
  },
};