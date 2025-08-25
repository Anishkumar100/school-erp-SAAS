require("dotenv").config();

const Class = require("../model/class.model");
const Student = require("../model/student.model");
const Exam = require("../model/examination.model");
const Period = require("../model/period.model");

module.exports = {
  // GET ALL CLASSES FOR A SCHOOL
  getAllClass: async (req, res) => {
    try {
      const schoolId = req.user.schoolId;
      const allClasses = await Class.find({ school: schoolId });
      res.status(200).json({ success: true, message: "Fetched all classes successfully", data: allClasses });
    } catch (error) {
      console.error("Error in getAllClass:", error);
      res.status(500).json({ success: false, message: "Server error while fetching classes" });
    }
  },

  // CREATE A NEW CLASS
  createClass: async (req, res) => {
    try {
      const schoolId = req.user.id; // Assuming the user creating the class is the school owner
      const newClass = new Class({ ...req.body, school: schoolId });
      const savedData = await newClass.save();
      res.status(201).json({ success: true, message: "Class created successfully", data: savedData });
    } catch (error) {
      console.error("Error in createClass:", error);
      res.status(500).json({ success: false, message: "Failed to create class" });
    }
  },

  // GET A SINGLE CLASS BY ID
  getClassWithId: async (req, res) => {
    try {
      const classData = await Class.findById(req.params.id)
        .populate("asignSubTeach.subject")
        .populate("asignSubTeach.teacher")
        .populate("attendee");

      if (!classData) {
        return res.status(404).json({ success: false, message: "Class not found" });
      }
      res.status(200).json({ success: true, data: classData });
    } catch (error) {
      console.error("Error in getClassWithId:", error);
      res.status(500).json({ success: false, message: "Server error while fetching class data" });
    }
  },

  // UPDATE A CLASS
  updateClassWithId: async (req, res) => {
    try {
      // Using { new: true } returns the updated document, avoiding a second query
      const updatedClass = await Class.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedClass) {
        return res.status(404).json({ success: false, message: "Class not found" });
      }
      res.status(200).json({ success: true, message: "Class updated successfully", data: updatedClass });
    } catch (error) {
      console.error("Error in updateClassWithId:", error);
      res.status(500).json({ success: false, message: "Server error while updating class" });
    }
  },

  // DELETE A CLASS (ONLY IF NOT IN USE)
  deleteClassWithId: async (req, res) => {
    try {
      const id = req.params.id;
      const schoolId = req.user.schoolId;
      // Check for dependencies in parallel for better performance
      const [studentCount, examCount, periodCount] = await Promise.all([
        Student.countDocuments({ student_class: id, school: schoolId }),
        Exam.countDocuments({ class: id, school: schoolId }),
        Period.countDocuments({ class: id, school: schoolId })
      ]);

      if (studentCount > 0 || examCount > 0 || periodCount > 0) {
        return res.status(400).json({ success: false, message: "This class cannot be deleted because it is already in use by students, exams, or periods." });
      }

      const deletedClass = await Class.findOneAndDelete({ _id: id, school: schoolId });
      if (!deletedClass) {
        return res.status(404).json({ success: false, message: "Class not found" });
      }
      // Corrected logic: No need to find the class after deleting it.
      res.status(200).json({ success: true, message: "Class deleted successfully" });
    } catch (error) {
      console.error("Error in deleteClassWithId:", error);
      res.status(500).json({ success: false, message: "Server error while deleting class" });
    }
  },

  // ASSIGN A SUBJECT/TEACHER TO A CLASS
  createSubTeacher: async (req, res) => {
    try {
      // Using the atomic $push operator is more efficient and safer
      const updatedClass = await Class.findByIdAndUpdate(
        req.params.id,
        { $push: { asignSubTeach: req.body } },
        { new: true }
      );
      if (!updatedClass) {
        return res.status(404).json({ success: false, message: "Class not found" });
      }
      res.status(200).json({ success: true, message: "New subject & teacher assigned", data: updatedClass });
    } catch (error) {
      console.error("Error in createSubTeacher:", error);
      res.status(500).json({ success: false, message: "Server error while assigning subject/teacher" });
    }
  },

  // UPDATE A SUBJECT/TEACHER ASSIGNMENT IN A CLASS
  updateSubTeacher: async (req, res) => {
    try {
      // Using arrayFilters to update a specific element in the array is the correct, atomic way
      const updatedClass = await Class.findOneAndUpdate(
        { _id: req.params.classId },
        { $set: { "asignSubTeach.$[elem]": { _id: req.params.subTeachId, ...req.body } } },
        { 
          arrayFilters: [{ "elem._id": req.params.subTeachId }],
          new: true 
        }
      );
      if (!updatedClass) {
        return res.status(404).json({ success: false, message: "Class or assignment not found" });
      }
      res.status(200).json({ success: true, message: "Assignment updated successfully", data: updatedClass });
    } catch (error) {
      console.error("Error in updateSubTeacher:", error);
      res.status(500).json({ success: false, message: "Server error while updating assignment" });
    }
  },

  // DELETE A SUBJECT/TEACHER ASSIGNMENT FROM A CLASS
  deleteSubTeacherWithId: async (req, res) => {
    try {
      // Using the atomic $pull operator is more efficient and safer
      const updatedClass = await Class.findByIdAndUpdate(
        req.params.classId,
        { $pull: { asignSubTeach: { _id: req.params.subTeachId } } },
        { new: true }
      );
      if (!updatedClass) {
        return res.status(404).json({ success: false, message: "Class not found" });
      }
      res.status(200).json({ success: true, message: "Assignment cancelled successfully", data: updatedClass });
    } catch (error) {
      console.error("Error in deleteSubTeacherWithId:", error);
      res.status(500).json({ success: false, message: "Server error while deleting assignment" });
    }
  },
  
  // GET CLASSES FOR A SPECIFIC TEACHER
  getAttendeeTeacher: async (req, res) => {
    try {
      // Assuming req.user.id is the teacher's ID
      const teacherId = req.user.id; 
      let assignedClasses = await Class.find({ "asignSubTeach.teacher": teacherId });
      
      // Reformat the data for the frontend
      const formattedClasses = assignedClasses.map(x => ({
        class_num: x.class_num,
        class_text: x.class_text,
        classId: x._id
      }));
      
      res.status(200).json(formattedClasses);
    } catch (error) {
      console.error("Error in getAttendeeTeacher:", error);
      res.status(500).json({ success: false, message: "Server error while fetching teacher's classes" });
    }
  }
};