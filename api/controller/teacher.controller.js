require("dotenv").config();
const formidable = require("formidable");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Teacher = require("../model/teacher.model");
const ImageKit = require("imagekit");

const jwtSecret = process.env.JWTSECRET;

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

module.exports = {

    getTeacherWithQuery: async (req, res) => {
        try {
            const filterQuery = { school: req.user.schoolId };
            if (req.query.search) filterQuery.name = { $regex: req.query.search, $options: 'i' };

            const teachers = await Teacher.find(filterQuery);
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

                const existing = await Teacher.find({ email: fields.email[0] });
                if (existing.length > 0) return res.status(400).json({ success: false, message: "Email already exists." });

                const salt = bcrypt.genSaltSync(10);
                const hashPassword = bcrypt.hashSync(fields.password[0], salt);

                let teacher_image_url = "";
                if (files.image) {
                    const photo = files.image[0];
                    const fileBuffer = await fs.promises.readFile(photo.filepath);

                    const uploadResult = await imagekit.upload({
                        file: fileBuffer,
                        fileName: photo.originalFilename.replace(/\s/g, "_")
                    });
                    teacher_image_url = uploadResult.url;
                }

                const newTeacher = new Teacher({
                    email: fields.email[0],
                    name: fields.name[0],
                    qualification: fields.qualification[0],
                    age: fields.age[0],
                    gender: fields.gender[0],
                    teacher_image: teacher_image_url,
                    password: hashPassword,
                    school: schoolId
                });

                const savedData = await newTeacher.save();
                res.status(200).json({ success: true, data: savedData, message: "Teacher registered successfully." });

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
                name: teacher.name,
                image_url: teacher.teacher_image,
                role: 'TEACHER'
            }, jwtSecret);

            res.header("Authorization", token).status(200).json({
                success: true,
                message: "Login successful",
                user: {
                    id: teacher._id,
                    name: teacher.name,
                    image_url: teacher.teacher_image,
                    role: 'TEACHER'
                }
            });
        } catch (error) {
            console.error("Error in loginTeacher:", error);
            res.status(500).json({ success: false, message: "Server error in login." });
        }
    },

    getTeacherOwnDetails: async (req, res) => {
        try {
            const teacher = await Teacher.findOne({ _id: req.user.id, school: req.user.schoolId });
            if (!teacher) return res.status(404).json({ success: false, message: "Teacher data not available." });

            res.status(200).json({ success: true, data: teacher });
        } catch (error) {
            console.error("Error in getTeacherOwnDetails:", error);
            res.status(500).json({ success: false, message: "Server error fetching teacher data." });
        }
    },

    getTeacherWithId: async (req, res) => {
        try {
            const teacher = await Teacher.findById(req.params.id);
            if (!teacher) return res.status(404).json({ success: false, message: "Teacher not found." });

            res.status(200).json({ success: true, data: teacher });
        } catch (error) {
            console.error("Error in getTeacherWithId:", error);
            res.status(500).json({ success: false, message: "Server error fetching teacher." });
        }
    },

    updateTeacherWithId: async (req, res) => {
        const form = new formidable.IncomingForm({ keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            try {
                if (err) return res.status(400).json({ message: "Form parse error." });

                const teacher = await Teacher.findById(req.params.id);
                if (!teacher) return res.status(404).json({ message: "Teacher not found." });

                Object.keys(fields).forEach(field => { teacher[field] = fields[field][0]; });

                if (files.image) {
                    const photo = files.image[0];
                    const fileBuffer = await fs.promises.readFile(photo.filepath);

                    const uploadResult = await imagekit.upload({
                        file: fileBuffer,
                        fileName: photo.originalFilename.replace(/\s/g, "_")
                    });
                    teacher.teacher_image = uploadResult.url;
                }

                await teacher.save();
                res.status(200).json({ success: true, message: "Teacher updated successfully.", data: teacher });

            } catch (error) {
                console.error("Error in updateTeacherWithId:", error);
                res.status(500).json({ success: false, message: "Server error updating teacher." });
            }
        });
    },

    deleteTeacherWithId: async (req, res) => {
        try {
            await Teacher.findOneAndDelete({ _id: req.params.id });
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
            const token = req.header("Authorization");
            if (!token) return res.status(401).json({ success: false, message: "Not authorized." });

            const decoded = jwt.verify(token, jwtSecret);
            res.status(200).json({ success: true, data: decoded, message: "Teacher is logged in." });
        } catch (error) {
            console.error("Error in isTeacherLoggedIn:", error);
            res.status(500).json({ success: false, message: "Server error checking login." });
        }
    }
};
