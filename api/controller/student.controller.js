require("dotenv").config();
const formidable = require("formidable");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const jwtSecret = process.env.JWTSECRET;
const Student = require("../model/student.model");
const Attendance = require("../model/attendance.model");
const imagekit = require("../imageKit");

module.exports = {

    getStudentWithQuery: async (req, res) => {
        try {
            const schoolId = req.user.schoolId;
            const filterQuery = { school: schoolId };

            if (req.query.search) filterQuery.name = { $regex: req.query.search, $options: 'i' };
            if (req.query.student_class) filterQuery.student_class = req.query.student_class;

            const students = await Student.find(filterQuery).populate("student_class");
            res.status(200).json({ success: true, data: students });

        } catch (error) {
            console.error("Error in getStudentWithQuery:", error);
            res.status(500).json({ success: false, message: "Error fetching students." });
        }
    },

    registerStudent: async (req, res) => {
        const form = new formidable.IncomingForm({ keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            try {
                if (err) return res.status(400).json({ success: false, message: "Form parsing error" });

                const existing = await Student.find({ email: fields.email[0] });
                if (existing.length > 0) return res.status(400).json({ success: false, message: "Email already exists" });

                let studentImageUrl = "";
                if (files.image) {
                    const photo = files.image[0];
                    const fileBuffer = await fs.promises.readFile(photo.filepath);

                    const upload = await imagekit.upload({
                        file: fileBuffer,
                        fileName: photo.originalFilename.replace(/\s/g, "_"),
                        folder: "/student_images"
                    });
                    studentImageUrl = upload.url;
                }

                const hashedPassword = bcrypt.hashSync(fields.password[0], 10);

                const newStudent = new Student({
                    email: fields.email[0],
                    name: fields.name[0],
                    student_class: fields.student_class[0],
                    guardian: fields.guardian[0],
                    guardian_phone: fields.guardian_phone[0],
                    age: fields.age[0],
                    gender: fields.gender[0],
                    student_image: studentImageUrl,
                    password: hashedPassword,
                    school: req.user.id
                });

                const savedStudent = await newStudent.save();
                res.status(200).json({ success: true, message: "Student registered successfully", data: savedStudent });

            } catch (error) {
                console.error("Error in registerStudent:", error);
                res.status(500).json({ success: false, message: "Server Error during registration" });
            }
        });
    },

    loginStudent: async (req, res) => {
        try {
            const student = await Student.findOne({ email: req.body.email });
            if (!student) return res.status(401).json({ success: false, message: "Email not registered" });

            const isPasswordCorrect = bcrypt.compareSync(req.body.password, student.password);
            if (!isPasswordCorrect) return res.status(401).json({ success: false, message: "Password incorrect" });

            const token = jwt.sign({
                id: student._id,
                schoolId: student.school,
                email: student.email,
                image_url: student.student_image,
                name: student.name,
                role: "STUDENT"
            }, jwtSecret);

            res.header("Authorization", token).status(200).json({
                success: true,
                message: "Login successful",
                user: {
                    id: student._id,
                    email: student.email,
                    image_url: student.student_image,
                    name: student.name,
                    role: "STUDENT"
                }
            });

        } catch (error) {
            console.error("Error in loginStudent:", error);
            res.status(500).json({ success: false, message: "Server Error during login" });
        }
    },

    getStudentWithId: async (req, res) => {
        try {
            const { id } = req.params;
            const schoolId = req.user.schoolId;

            const student = await Student.findOne({ _id: id, school: schoolId }).populate("student_class");
            if (!student) return res.status(404).json({ success: false, message: "Student not found" });

            res.status(200).json({ success: true, data: student });

        } catch (error) {
            console.error("Error in getStudentWithId:", error);
            res.status(500).json({ success: false, message: "Server Error fetching student" });
        }
    },

    getOwnDetails: async (req, res) => {
        try {
            const student = await Student.findOne({ _id: req.user.id, school: req.user.schoolId }).populate("student_class");
            if (!student) return res.status(404).json({ success: false, message: "Student not found" });

            res.status(200).json({ success: true, data: student });

        } catch (error) {
            console.error("Error in getOwnDetails:", error);
            res.status(500).json({ success: false, message: "Server Error fetching student" });
        }
    },

    updateStudentWithId: async (req, res) => {
        const form = new formidable.IncomingForm({ keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            try {
                if (err) return res.status(400).json({ success: false, message: "Form parsing error" });

                const { id } = req.params;
                const student = await Student.findById(id);
                if (!student) return res.status(404).json({ success: false, message: "Student not found" });

                Object.keys(fields).forEach(key => student[key] = fields[key][0]);

                if (files.image) {
                    const photo = files.image[0];
                    const fileBuffer = await fs.promises.readFile(photo.filepath);

                    const upload = await imagekit.upload({
                        file: fileBuffer,
                        fileName: photo.originalFilename.replace(/\s/g, "_"),
                        folder: "/student_images"
                    });
                    student.student_image = upload.url;
                }

                await student.save();
                res.status(200).json({ success: true, message: "Student updated successfully", data: student });

            } catch (error) {
                console.error("Error in updateStudentWithId:", error);
                res.status(500).json({ success: false, message: "Server Error updating student" });
            }
        });
    },

    deleteStudentWithId: async (req, res) => {
        try {
            const { id } = req.params;
            const schoolId = req.user.schoolId;

            await Attendance.deleteMany({ school: schoolId, student: id });
            await Student.findOneAndDelete({ _id: id, school: schoolId });

            res.status(200).json({ success: true, message: "Student deleted successfully" });

        } catch (error) {
            console.error("Error in deleteStudentWithId:", error);
            res.status(500).json({ success: false, message: "Server Error deleting student" });
        }
    },

    signOut: async (req, res) => {
        try {
            res.header("Authorization", "").status(200).json({ success: true, message: "Signed out successfully" });
        } catch (error) {
            console.error("Error in signOut:", error);
            res.status(500).json({ success: false, message: "Server Error during sign out" });
        }
    },

    isStudentLoggedIn: async (req, res) => {
        try {
            const token = req.header("Authorization");
            if (!token) return res.status(401).json({ success: false, message: "Not Authorized" });

            const decoded = jwt.verify(token, jwtSecret);
            res.status(200).json({ success: true, data: decoded, message: "Student is logged in" });

        } catch (error) {
            console.error("Error in isStudentLoggedIn:", error);
            res.status(500).json({ success: false, message: "Server Error checking login" });
        }
    }

};
