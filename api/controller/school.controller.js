require("dotenv").config();
const formidable = require("formidable");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const School = require("../model/school.model");
const imagekit = require("../utils/imagekit"); // make sure path is correct

const jwtSecret = process.env.JWTSECRET;

module.exports = {

    getAllSchools: async(req,res)=>{
        try {
            const schools= await School.find().select(['-_id','-password','-email','-owner_name','-createdAt']);
            res.status(200).json({success:true, message:"Success in fetching all Schools", data:schools});
        } catch (error) {
            console.log("Error in getAllSchools", error);
            res.status(500).json({success:false, message:"Server Error in Getting All Schools. Try later"});
        }
    },

    registerSchool: async (req, res) => {
        const form = new formidable.IncomingForm();

        form.parse(req, async (err, fields, files) => {
            try {
                if(err) return res.status(400).json({ message: "Error parsing the form data." });

                const existing = await School.find({ email: fields.email });
                if (existing.length > 0) return res.status(500).json({ success: false, message: "Email Already Exist!" });

                let schoolImageUrl = "";
                if (files.image) {
                    const photo = files.image[0];
                    const fileData = await fs.promises.readFile(photo.filepath)

                    const upload = await imagekit.upload({
                        file: fileData,
                        fileName: photo.originalFilename.replace(" ", "_"),
                        folder: "/school_images"
                    });

                    schoolImageUrl = upload.url;
                }

                const salt = bcrypt.genSaltSync(10);
                const hashPassword = bcrypt.hashSync(fields.password[0], salt);

                const newSchool = new School({
                    school_name: fields.school_name[0],
                    email: fields.email[0],
                    owner_name: fields.owner_name[0],
                    password: hashPassword,
                    school_image: schoolImageUrl
                });

                const savedData = await newSchool.save();
                res.status(200).json({ success: true, data: savedData, message:"School is Registered Successfully." });

            } catch (e) {
                console.log("ERROR in RegisterSchool", e);
                res.status(500).json({ success: false, message: "Failed Registration." });
            }
        });
    },

    loginSchool: async (req, res) => {
        try {
            const resp = await School.find({ email: req.body.email });
            if (resp.length === 0) return res.status(401).json({ success: false, message: "Email not registered." });

            const isAuth = bcrypt.compareSync(req.body.password, resp[0].password);
            if (!isAuth) return res.status(401).json({ success: false, message: "Password doesn't match." });

            const token = jwt.sign({
                id: resp[0]._id,
                schoolId: resp[0]._id,
                school_name: resp[0].school_name,
                owner_name: resp[0].owner_name,
                image_url: resp[0].school_image,
                role: 'SCHOOL'
            }, jwtSecret);

            res.header("Authorization", token).status(200).json({
                success: true,
                message: "Success Login",
                user: {
                    id: resp[0]._id,
                    owner_name: resp[0].owner_name,
                    school_name: resp[0].school_name,
                    image_url: resp[0].school_image,
                    role: "SCHOOL"
                }
            });

        } catch (error) {
            console.log("Error in loginSchool", error);
            res.status(500).json({ success: false, message: "Server Error in Login. Try later" });
        }
    },

    getSchoolOwnData: async(req, res)=>{
        try {
            const school = await School.findById(req.user.id);
            if(!school) return res.status(500).json({ success: false, message: "School data not Available" });
            res.status(200).json({success:true, data:school});
        } catch(e) {
            console.log("Error in getSchoolOwnData", e);
            res.status(500).json({ success: false, message: "Error in getting School Data" });
        }
    },

    updateSchoolWithId: async (req, res) => {
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            try {
                if(err) return res.status(400).json({ message: "Error parsing the form data." });

                const id  = req.user.id;
                const school = await School.findById(id);
                if (!school) return res.status(404).json({ message: "School not found." });

                // Update text fields
                Object.keys(fields).forEach((field) => {
                    school[field] = fields[field][0];
                });

                // Handle image file if provided
                if (files.image) {
                    const photo = files.image[0];
                    const fileData = await fs.promises.readFile(photo.filepath);

                    const upload = await imagekit.upload({
                        file: fileData,
                        fileName: photo.originalFilename.replace(" ", "_"),
                        folder: "/school_images"
                    });

                    school.school_image = upload.url;
                }

                await school.save();
                res.status(200).json({ message: "School updated successfully", data: school });

            } catch (e) {
                console.log("Error in updateSchoolWithId", e);
                res.status(500).json({ message: "Error updating school details." });
            }
        });
    },

    signOut: async(req, res)=>{
        try {
            res.header("Authorization",  "").status(200).json({success:true, messsage:"School Signed Out Successfully."});
        } catch (error) {
            console.log("Error in Sign out", error);
            res.status(500).json({success:false, message:"Server Error in Signing Out. Try later"});
        }
    },

    isSchoolLoggedIn: async(req, res)=>{
        try {
            const token = req.header("Authorization");
            if(!token) return res.status(401).json({success:false, message:"You are not Authorized."});

            const decoded = jwt.verify(token, jwtSecret);
            if(!decoded) return res.status(401).json({success:false, message:"You are not Authorized."});

            res.status(200).json({success:true, data:decoded, message:"School is logged in"});
        } catch (error) {
            console.log("Error in isSchoolLoggedIn", error);
            res.status(500).json({success:false, message:"Server Error in School Logged in check. Try later"});
        }
    }

};
