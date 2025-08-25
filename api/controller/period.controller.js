const Period = require('../model/period.model');

// Create a period
exports.createPeriod = async (req, res) => {
  try {
    const { teacher, subject, classId, startTime, endTime } = req.body;
    const schoolId = req.user.schoolId;

    const newPeriod = new Period({
      teacher,
      subject,
      class: classId,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      school: schoolId,
    });

    await newPeriod.save();
    res.status(201).json({ message: 'Period assigned successfully', period: newPeriod });
  } catch (error) {
    console.error("Error creating period:", error);
    res.status(500).json({ message: 'Error creating period', error });
  }
};

// Get periods for a specific teacher
exports.getTeacherPeriods = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const { teacherId } = req.params;
    const periods = await Period.find({ teacher: teacherId, school: schoolId })
      .populate('class')
      .populate('subject');
    res.status(200).json({ periods });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching periods', error });
  }
};

// Get period by ID (with school check ✅)
exports.getPeriodsWithId = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    const period = await Period.findOne({ _id: id, school: schoolId })
      .populate('class')
      .populate('subject')
      .populate('teacher');

    if (!period) {
      return res.status(404).json({ message: 'Period not found or unauthorized' });
    }

    res.status(200).json({ period });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching period by id', error });
  }
};

// Get periods for a specific class
exports.getClassPeriods = async (req, res) => {
  try {
    const { classId } = req.params;
    const schoolId = req.user.schoolId;
    const periods = await Period.find({ class: classId, school: schoolId })
      .populate('subject')
      .populate('teacher');
    res.status(200).json({ periods });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching class periods', error });
  }
};

// Get all periods for school
exports.getPeriods = async (req, res) => {
  try {
    const schoolId = req.user.schoolId;
    const periods = await Period.find({ school: schoolId })
      .populate('class')
      .populate('subject')
      .populate('teacher');
    res.status(200).json({ periods });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching periods', error });
  }
};

// Update period (already has school check ✅)
exports.updatePeriod = async (req, res) => {
  try {
    const { startTime, endTime, teacher, subject } = req.body;
    const periodId = req.params.id;

    const updatedPeriod = await Period.findOneAndUpdate(
      { _id: periodId, school: req.user.schoolId },
      { subject, teacher },
      { new: true }
    );

    if (!updatedPeriod) {
      return res.status(404).json({ message: 'Period not found or unauthorized' });
    }

    res.status(200).json({ message: 'Period updated successfully', period: updatedPeriod });
  } catch (error) {
    res.status(500).json({ message: 'Error updating period', error });
  }
};

// Delete period (with school check ✅)
exports.deletePeriod = async (req, res) => {
  try {
    const periodId = req.params.id;
    const schoolId = req.user.schoolId;

    const deleted = await Period.findOneAndDelete({ _id: periodId, school: schoolId });

    if (!deleted) {
      return res.status(404).json({ message: 'Period not found or unauthorized' });
    }

    res.status(200).json({ message: 'Period deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting period', error });
  }
};
