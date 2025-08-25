const Examination = require('../model/examination.model');

module.exports = {
  // CREATE A NEW EXAMINATION
  newExamination: async (req, res) => {
    try {
      // REFACTOR: Converted to async/await for consistency
      const newExam = new Examination({
        examDate: req.body.exam_date,
        subject: req.body.subject,
        examType: req.body.exam_type,
        class: req.body.class_id,
        school: req.user.schoolId, // Associate with the school
      });
      const savedExam = await newExam.save();
      res.status(201).json({ success: true, message: "Exam assigned successfully", data: savedExam });
    } catch (error) {
      console.error("Error in newExamination:", error);
      res.status(500).json({ success: false, message: "Failed to assign exam, please try later." });
    }
  },

  // GET EXAMINATIONS FOR A SPECIFIC CLASS
  getExaminationByClass: async (req, res) => {
    try {
      const schoolId = req.user.schoolId;
      const examinations = await Examination.find({ class: req.params.classId, school: schoolId }).populate("subject");
      res.status(200).json({ success: true, message: "Fetched examinations successfully", data: examinations });
    } catch (error) {
      console.error("Error in getExaminationByClass:", error);
      res.status(500).json({ success: false, message: "Failed to fetch examinations, please try later." });
    }
  },

  // GET ALL EXAMINATIONS FOR THE SCHOOL
  getAllExaminations: async (req, res) => {
    try {
      // SECURITY FIX: Filter all examinations by the logged-in user's schoolId
      const examinations = await Examination.find({ school: req.user.schoolId }).populate("subject").populate("class");
      res.status(200).json({ success: true, message: "Fetched all examinations successfully", data: examinations });
    } catch (error) {
      console.error("Error in getAllExaminations:", error);
      res.status(500).json({ success: false, message: "Failed to fetch examinations, please try later." });
    }
  },

  // GET A SINGLE EXAMINATION BY ID
  getExaminationById: async (req, res) => {
    try {
      // SECURITY FIX: Ensure the exam belongs to the user's school
      const examination = await Examination.findOne({ _id: req.params.id, school: req.user.schoolId });
      
      // ADDED: Check if the document exists
      if (!examination) {
        return res.status(404).json({ success: false, message: "Examination not found" });
      }
      res.status(200).json({ success: true, message: "Fetched single examination successfully", data: examination });
    } catch (error) {
      console.error("Error in getExaminationById:", error);
      res.status(500).json({ success: false, message: "Failed to fetch single examination, please try later." });
    }
  },

  // DELETE A SINGLE EXAMINATION BY ID
  deleteExaminationById: async (req, res) => {
    try {
      // SECURITY FIX: Ensure the exam belongs to the user's school
      const deletedExam = await Examination.findOneAndDelete({ _id: req.params.id, school: req.user.schoolId });

      // ADDED: Check if a document was actually deleted
      if (!deletedExam) {
        return res.status(404).json({ success: false, message: "Examination not found" });
      }
      res.status(200).json({ success: true, message: "Examination deleted successfully" });
    } catch (error) {
      console.error("Error in deleteExaminationById:", error);
      res.status(500).json({ success: false, message: "Failed to delete examination, please try later." });
    }
  },

  // UPDATE A SINGLE EXAMINATION BY ID
  updateExaminaitonWithId: async (req, res) => {
    try {
      const updateData = {
        examDate: req.body.exam_date,
        subject: req.body.subject,
        examType: req.body.exam_type
      };
      // SECURITY FIX: Ensure the exam belongs to the user's school
      // OPTIMIZATION: Use { new: true } to return the updated document in one step
      const updatedExam = await Examination.findOneAndUpdate(
        { _id: req.params.id, school: req.user.schoolId },
        updateData,
        { new: true }
      );
      
      // ADDED: Check if a document was found and updated
      if (!updatedExam) {
        return res.status(404).json({ success: false, message: "Examination not found" });
      }
      res.status(200).json({ success: true, message: "Examination updated successfully", data: updatedExam });
    } catch (error) {
      console.error("Error in updateExaminaitonWithId:", error);
      res.status(500).json({ success: false, message: "Server error while updating examination" });
    }
  },
};