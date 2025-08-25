require("dotenv").config();
const formidable = require("formidable");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWTSECRET;

const Student = require("../model/student.model");
const Attendance = require('../model/attendance.model');
const imagekit = require("../utils/imagekit"); // Make sure path is correct

module.exports = {

    getStudentWithQuery: async(req, res)=>{
        try {
            const filterQuery = {};
            const schoolId = req.user.schoolId;
            filterQuery['school'] = schoolId;

            if(req.query.hasOwnProperty('search')){
                filterQuery['name'] = {$regex: req.query.search, $options:'i'}
            }

            if(req.query.hasOwnProperty('student_class')){
                filterQuery['student_class'] = req.query.student_class
            }

            const filteredStudents = await Student.find(filterQuery).populate("student_class");
            res.status(200).json({success:true, data:filteredStudents})
        } catch (error) {
            console.log("Error in fetching Student with query", error);
            res.status(500).json({success:false, message:"Error in fetching Student with query."})
        }
    },

    registerStudent: async (req, res) => {
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            try {
                if(err) return res.status(400).json({ message: "Error parsing the form data." });

                const existing = await Student.find({ email: fields.email[0] });
                if(existing.length > 0) return res.status(500).json({ success: false, message: "Email Already Exist!" });

                let studentImageUrl = "";
                if (files.image) {
                    const photo = files.image[0];
                    const fileData = await fs.promises.readFile(photo.filepath);

                    const upload = await imagekit.upload({
                        file: fileData,
                        fileName: photo.originalFilename.replace(" ", "_"),
                        folder: "/student_images"
                    });

                    studentImageUrl = upload.url;
                }

                const salt = bcrypt.genSaltSync(10);
                const hashPassword = bcrypt.hashSync(fields.password[0], salt);

                const newStudent = new Student({
                    email: fields.email[0],
                    name: fields.name[0],
                    student_class: fields.student_class[0],
                    guardian: fields.guardian[0],
                    guardian_phone: fields.guardian_phone[0],
                    age: fields.age[0],
                    gender: fields.gender[0],
                    student_image: studentImageUrl,
                    password: hashPassword,
                    school: req.user.id
                });

                const savedData = await newStudent.save();
                res.status(200).json({ success: true, data: savedData, message:"Student is Registered Successfully." })

            } catch(e) {
                console.log("ERROR in registerStudent", e);
                res.status(500).json({ success: false, message: "Failed Registration." })
            }
        });
    },

    loginStudent: async (req, res) => {
        try {
            const resp = await Student.find({ email: req.body.email });
            if(resp.length === 0) return res.status(401).json({ success: false, message: "Email not registered." });

            const isAuth = bcrypt.compareSync(req.body.password, resp[0].password);
            if(!isAuth) return res.status(401).json({ success: false, message: "Password doesn't match." });

            const token = jwt.sign({
                id: resp[0]._id,
                schoolId: resp[0].school,
                email: resp[0].email,
                image_url: resp[0].student_image,
                name: resp[0].name,
                role: 'STUDENT'
            }, jwtSecret);

            res.header("Authorization", token).status(200).json({
                success: true,
                message: "Success Login",
                user: {
                    id: resp[0]._id,
                    email: resp[0].email,
                    image_url: resp[0].student_image,
                    name: resp[0].name,
                    role: 'STUDENT'
                }
            });
        } catch(error) {
            console.log("Error in loginStudent", error);
            res.status(500).json({ success: false, message: "Server Error in Login. Try later" });
        }
    },

    getStudentWithId: async(req, res)=>{
        try {
            const id = req.params.id;
            const schoolId = req.user.schoolId;
            const student = await Student.findOne({_id:id, school:schoolId}).populate("student_class");

            if(!student) return res.status(500).json({ success: false, message: "Student data not Available" });

            res.status(200).json({success:true, data:student});
        } catch(e) {
            console.log("Error in getStudentWithId", e);
            res.status(500).json({ success: false, message: "Error in getting Student Data" });
        }
    },

    getOwnDetails: async(req, res)=>{
        try {
            const id = req.user.id;
            const schoolId = req.user.schoolId;
            const student = await Student.findOne({_id:id,school:schoolId}).populate("student_class");

            if(!student) return res.status(500).json({ success: false, message: "Student data not Available" });

            res.status(200).json({success:true, data:student});
        } catch(e) {
            console.log("Error in getOwnDetails", e);
            res.status(500).json({ success: false, message: "Error in getting Student Data" });
        }
    },

    updateStudentWithId: async (req, res) => {
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            try {
                if(err) return res.status(400).json({ message: "Error parsing the form data." });

                const { id } = req.params;
                const student = await Student.findById(id);
                if(!student) return res.status(404).json({ message: "Student not found." });

                // Update text fields
                Object.keys(fields).forEach((field) => {
                    student[field] = fields[field][0];
                });

                // Handle image file if provided
                if(files.image){
                    const photo = files.image[0];
                    const fileData = await fs.promises.readFile(photo.filepath);

                    const upload = await imagekit.upload({
                        file: fileData,
                        fileName: photo.originalFilename.replace(" ", "_"),
                        folder: "/student_images"
                    });

                    student.student_image = upload.url;
                }

                await student.save();
                res.status(200).json({ message: "Student updated successfully", data: student });
            } catch(e) {
                console.log("Error in updateStudentWithId", e);
                res.status(500).json({ message: "Error updating student details." });
            }
        });
    },

    deleteStudentWithId: async(req, res)=>{
        try {
            const id = req.params.id;
            const schoolId = req.user.schoolId;

            await Attendance.deleteMany({school:schoolId, student:id});
            await Student.findOneAndDelete({_id:id, school:schoolId});

            res.status(200).json({success:true, message:"Student deleted successfully"});
        } catch(error) {
            console.log("Error in deleteStudentWithId", error);
            res.status(500).json({success:false, message:"Server Error in deleting Student. Try later"})
        }
    },

    signOut: async(req, res)=>{
        try {
            res.header("Authorization", "").status(200).json({success:true, message:"Student Signed Out Successfully."});
        } catch(error) {
            console.log("Error in Sign out", error);
            res.status(500).json({success:false, message:"Server Error in Signing Out. Try later"});
        }
    },

    isStudentLoggedIn: async(req, res)=>{
        try {
            const token = req.header("Authorization");
            if(!token) return res.status(401).json({success:false, message:"You are not Authorized."});

            const decoded = jwt.verify(token, jwtSecret);
            if(!decoded) return res.status(401).json({success:false, message:"You are not Authorized."});

            res.status(200).json({success:true, data:decoded, message:"Student is logged in"});
        } catch(error) {
            console.log("Error in isStudentLoggedIn", error);
            res.status(500).json({success:false, message:"Server Error in Student Logged in check. Try later"});
        }
    }

};
