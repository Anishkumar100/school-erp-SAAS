require("dotenv").config();

const Subject = require("../model/subject.model");
const Exam = require("../model/examination.model");
const Period = require("../model/period.model");

module.exports = {
  // GET ALL SUBJECTS FOR THE SCHOOL
  getAllSubjects: async (req, res) => {
    try {
      const schoolId = req.user.schoolId;
      const allSubjects = await Subject.find({ school: schoolId });
      res.status(200).json({ success: true, message: "Fetched all subjects successfully", data: allSubjects });
    } catch (error) {
      console.error("Error in getAllSubjects:", error);
      res.status(500).json({ success: false, message: "Server error while getting subjects." });
    }
  },

  // CREATE A NEW SUBJECT
  createSubject: async (req, res) => {
    try {
      // REFACTOR: Converted to async/await for consistency
      const schoolId = req.user.schoolId;
      const newSubject = new Subject({ ...req.body, school: schoolId });
      const savedData = await newSubject.save();
      res.status(201).json({ success: true, message: "Subject created successfully", data: savedData });
    } catch (error) {
      console.error("Error in createSubject:", error);
      res.status(500).json({ success: false, message: "Failed to create subject." });
    }
  },

  // GET A SINGLE SUBJECT BY ID
  getSubjectWithId: async (req, res) => {
    try {
      const { id } = req.params;
      const schoolId = req.user.schoolId;
      // FIX: Removed .populate("student_class") as it's not in the Subject schema
      const subject = await Subject.findOne({ _id: id, school: schoolId });

      if (!subject) {
        // FIX: Use 404 for "Not Found"
        return res.status(404).json({ success: false, message: "Subject not found" });
      }
      res.status(200).json({ success: true, data: subject });
    } catch (error) {
      console.error("Error in getSubjectWithId:", error);
      res.status(500).json({ success: false, message: "Server error while getting subject data" });
    }
  },

  // UPDATE A SUBJECT BY ID
  updateSubjectWithId: async (req, res) => {
    try {
      const { id } = req.params;
      // SECURITY FIX: The query MUST include the schoolId to ensure ownership
      // OPTIMIZATION: Use { new: true } to get the updated document in a single call
      const updatedSubject = await Subject.findOneAndUpdate(
        { _id: id, school: req.user.schoolId },
        { $set: req.body },
        { new: true, runValidators: true }
      );

      if (!updatedSubject) {
        return res.status(404).json({ success: false, message: "Subject not found" });
      }
      res.status(200).json({ success: true, message: "Subject updated successfully", data: updatedSubject });
    } catch (error) {
      console.error("Error in updateSubjectWithId:", error);
      res.status(500).json({ success: false, message: "Server error while updating subject." });
    }
  },

  // DELETE A SUBJECT BY ID
  deleteSubjectWithId: async (req, res) => {
    try {
      const { id } = req.params;
      const schoolId = req.user.schoolId;
      
      // Check for dependencies first (this logic is excellent)
      const [examCount, periodCount] = await Promise.all([
          Exam.countDocuments({ subject: id, school: schoolId }),
          Period.countDocuments({ subject: id, school: schoolId })
      ]);

      if (examCount > 0 || periodCount > 0) {
        // FIX: Use 400 for a client-side business logic error
        return res.status(400).json({ success: false, message: "This subject cannot be deleted as it is already in use." });
      }

      const deletedSubject = await Subject.findOneAndDelete({ _id: id, school: schoolId });

      if (!deletedSubject) {
        return res.status(404).json({ success: false, message: "Subject not found." });
      }
      // FIX: Do not query for the subject after deleting it.
      res.status(200).json({ success: true, message: "Subject deleted successfully." });
    } catch (error) {
      console.error("Error in deleteSubjectWithId:", error);
      res.status(500).json({ success: false, message: "Server error while deleting subject." });
    }
  }
};