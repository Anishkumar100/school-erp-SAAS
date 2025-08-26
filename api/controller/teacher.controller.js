require("dotenv").config();
const formidable = require("formidable");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Teacher = require("../model/teacher.model");
const Class = require("../model/class.model");
const Period = require("../model/period.model");
const imagekit = require("../imageKit");

const jwtSecret = process.env.JWTSECRET;

module.exports = {
  getTeacherWithQuery: async (req, res) => {
    try {
      const filterQuery = { school: req.user.schoolId };
      if (req.query.search)
        filterQuery.name = { $regex: req.query.search, $options: "i" };

      const teachers = await Teacher.find(filterQuery).select('-password');
      res.status(200).json({ success: true, data: teachers });
    } catch (error) {
      console.error("Error in getTeacherWithQuery:", error);
      res.status(500).json({ success: false, message: "Error fetching teachers." });
    }
  },

  registerTeacher: async (req, res) => {
    const form = new formidable.IncomingForm({ keepExtensions: true });
    const schoolId = req.user.schoolId;

    form.parse(req, async (err, fields, files) => {
      try {
        if (err) return res.status(400).json({ success: false, message: "Form parse error." });

        const existing = await Teacher.findOne({ email: fields.email?.[0] });
        if (existing) return res.status(409).json({ success: false, message: "Email already exists." });

        const salt = bcrypt.genSaltSync(10);
        const hashPassword = bcrypt.hashSync(fields.password?.[0], salt);

        let teacher_image_url = "";
        if (files.image && files.image[0]) {
          const photo = files.image[0];
          const uploadResult = await imagekit.upload({
            file: photo.filepath,
            fileName: photo.originalFilename.replace(/\s/g, "_"),
          });
          teacher_image_url = uploadResult.url;
        }

        const newTeacher = new Teacher({
          email: fields.email?.[0],
          name: fields.name?.[0],
          qualification: fields.qualification?.[0],
          age: fields.age?.[0],
          gender: fields.gender?.[0],
          teacher_image: teacher_image_url,
          password: hashPassword,
          school: schoolId,
        });

        const savedData = await newTeacher.save();
        savedData.password = undefined;
        res.status(201).json({ success: true, data: savedData, message: "Teacher registered successfully." });
      } catch (error) {
        console.error("Error in registerTeacher:", error);
        res.status(500).json({ success: false, message: "Failed registration." });
      }
    });
  },

  loginTeacher: async (req, res) => {
    try {
      const teacher = await Teacher.findOne({ email: req.body.email });
      if (!teacher) return res.status(401).json({ success: false, message: "Email not registered." });

      const isAuth = bcrypt.compareSync(req.body.password, teacher.password);
      if (!isAuth) return res.status(401).json({ success: false, message: "Password doesn't match." });

      const token = jwt.sign({
        id: teacher._id,
        schoolId: teacher.school,
        role: "TEACHER",
      },
        jwtSecret
      );

      res.header("Authorization", token).status(200).json({
        success: true,
        message: "Login successful",
        user: {
          id: teacher._id,
          name: teacher.name,
          image_url: teacher.teacher_image,
          role: "TEACHER",
        },
      });
    } catch (error) {
      console.error("Error in loginTeacher:", error);
      res.status(500).json({ success: false, message: "Server error in login." });
    }
  },

  getTeacherOwnDetails: async (req, res) => {
    try {
      const teacher = await Teacher.findOne({ _id: req.user.id, school: req.user.schoolId }).select('-password');
      if (!teacher) return res.status(404).json({ success: false, message: "Teacher data not available." });
      res.status(200).json({ success: true, data: teacher });
    } catch (error) {
      console.error("Error in getTeacherOwnDetails:", error);
      res.status(500).json({ success: false, message: "Server error fetching teacher data." });
    }
  },

  getTeacherWithId: async (req, res) => {
    try {
      const teacher = await Teacher.findOne({ _id: req.params.id, school: req.user.schoolId }).select('-password');
      if (!teacher) {
        return res.status(404).json({ success: false, message: "Teacher not found." });
      }
      res.status(200).json({ success: true, data: teacher });
    } catch (error) {
      console.error("Error in getTeacherWithId:", error);
      res.status(500).json({ success: false, message: "Server error fetching teacher." });
    }
  },



  // In controller/teacher.controller.js

  updateTeacherWithId: async (req, res) => {
    // Use the same formidable setup as your working register function
    const form = new formidable.IncomingForm({ keepExtensions: true });

    form.parse(req, async (err, fields, files) => {
      try {
        if (err) {
          return res.status(400).json({ success: false, message: "Form parsing error." });
        }

        const teacherId = req.params.id;
        const schoolId = req.user.schoolId;

        // Build an object with only the fields you want to update
        const updateData = {};
        if (fields.name?.[0]) updateData.name = fields.name[0];
        if (fields.qualification?.[0]) updateData.qualification = fields.qualification[0];
        if (fields.age?.[0]) updateData.age = fields.age[0];
        if (fields.gender?.[0]) updateData.gender = fields.gender[0];
        if (fields.email?.[0]) updateData.email = fields.email[0];

        // If the email is being changed, check if it's already taken
        if (updateData.email) {
          const existingTeacher = await Teacher.findOne({
            email: updateData.email,
            _id: { $ne: teacherId } // Exclude the current teacher from the check
          });
          if (existingTeacher) {
            return res.status(409).json({ success: false, message: "This email is already in use." });
          }
        }

        // Handle a new image upload
        if (files.image && files.image[0]) {
          const photo = files.image[0];
          const uploadResult = await imagekit.upload({
            file: photo.filepath,
            fileName: photo.originalFilename.replace(/\s/g, "_"),
          });
          updateData.teacher_image = uploadResult.url;
        }

        // Perform the update
        const updatedTeacher = await Teacher.findOneAndUpdate(
          { _id: teacherId, school: schoolId }, // Securely find the teacher
          { $set: updateData },
          { new: true }
        ).select('-password');

        if (!updatedTeacher) {
          return res.status(404).json({ success: false, message: "Teacher not found." });
        }

        res.status(200).json({ success: true, message: "Teacher updated successfully.", data: updatedTeacher });

      } catch (error) {
        console.error("Error in updateTeacherWithId:", error);
        res.status(500).json({ success: false, message: "Server error updating teacher." });
      }
    });
  },
  deleteTeacherWithId: async (req, res) => {
    try {
      const teacherId = req.params.id;
      const schoolId = req.user.schoolId;

      const isAssignedToClass = await Class.findOne({ school: schoolId, "asignSubTeach.teacher": teacherId });
      const isAssignedToPeriod = await Period.findOne({ school: schoolId, teacher: teacherId });

      if (isAssignedToClass || isAssignedToPeriod) {
        return res.status(400).json({ success: false, message: "Cannot delete teacher. They are currently assigned to classes or periods." });
      }

      const deletedTeacher = await Teacher.findOneAndDelete({ _id: teacherId, school: schoolId });

      if (!deletedTeacher) {
        return res.status(404).json({ success: false, message: "Teacher not found." });
      }
      res.status(200).json({ success: true, message: "Teacher deleted successfully." });
    } catch (error) {
      console.error("Error in deleteTeacherWithId:", error);
      res.status(500).json({ success: false, message: "Server error deleting teacher." });
    }
  },

  signOut: async (req, res) => {
    try {
      res.header("Authorization", "").status(200).json({ success: true, message: "Teacher signed out successfully." });
    } catch (error) {
      console.error("Error in signOut:", error);
      res.status(500).json({ success: false, message: "Server error signing out." });
    }
  },

  isTeacherLoggedIn: async (req, res) => {
    try {
      const token = req.header("Authorization")?.replace('Bearer ', '');
      if (!token) return res.status(401).json({ success: false, message: "Not authorized." });

      const decoded = jwt.verify(token, jwtSecret);
      res.status(200).json({ success: true, data: decoded, message: "Teacher is logged in." });
    } catch (error) {
      res.status(401).json({ success: false, message: "Invalid or expired token." });
    }
  },
};