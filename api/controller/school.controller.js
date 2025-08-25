require("dotenv").config();
const formidable = require("formidable");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const School = require("../model/school.model");
const imagekit = require("../imageKit");

const jwtSecret = process.env.JWTSECRET;

module.exports = {
    getAllSchools: async (req, res) => {
        try {
            const schools = await School.find().select([
                '-_id',
                '-password',
                '-email',
                '-owner_name',
                '-createdAt'
            ]);
            res.status(200).json({ success: true, message: "Fetched all schools successfully", data: schools });
        } catch (error) {
            console.error("Error in getAllSchools:", error);
            res.status(500).json({ success: false, message: "Server Error while fetching schools" });
        }
    },

    registerSchool: async (req, res) => {
        const form = new formidable.IncomingForm({ keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            try {
                if (err) return res.status(400).json({ success: false, message: "Form parsing error" });

                const existing = await School.findOne({ email: fields.email[0] });
                if (existing) return res.status(400).json({ success: false, message: "Email already exists" });

                let schoolImageUrl = "";
                if (files.image && files.image[0]) {
                    const photo = files.image[0];

                    // upload using file path (ImageKit supports both Buffer and filepath)
                    const upload = await imagekit.upload({
                        file: photo.filepath, // 👈 no fs.readFile
                        fileName: photo.originalFilename.replace(/\s/g, "_"),
                        folder: "/school_images"
                    });
                    schoolImageUrl = upload.url;
                }

                const hashedPassword = bcrypt.hashSync(fields.password[0], 10);

                const newSchool = new School({
                    school_name: fields.school_name[0],
                    email: fields.email[0],
                    owner_name: fields.owner_name[0],
                    password: hashedPassword,
                    school_image: schoolImageUrl
                });

                const savedSchool = await newSchool.save();
                res.status(200).json({ success: true, message: "School registered successfully", data: savedSchool });

            } catch (e) {
                console.error("Error in registerSchool:", e);
                res.status(500).json({ success: false, message: "Server Error during registration" });
            }
        });
    },

    loginSchool: async (req, res) => {
        try {
            const school = await School.findOne({ email: req.body.email });
            if (!school) return res.status(401).json({ success: false, message: "Email not registered" });

            const isPasswordCorrect = bcrypt.compareSync(req.body.password, school.password);
            if (!isPasswordCorrect) return res.status(401).json({ success: false, message: "Password incorrect" });

            const token = jwt.sign({
                id: school._id,
                schoolId: school._id,
                school_name: school.school_name,
                owner_name: school.owner_name,
                image_url: school.school_image,
                role: "SCHOOL"
            }, jwtSecret);

            res.header("Authorization", token).status(200).json({
                success: true,
                message: "Login successful",
                user: {
                    id: school._id,
                    school_name: school.school_name,
                    owner_name: school.owner_name,
                    image_url: school.school_image,
                    role: "SCHOOL"
                }
            });
        } catch (error) {
            console.error("Error in loginSchool:", error);
            res.status(500).json({ success: false, message: "Server Error during login" });
        }
    },

    getSchoolOwnData: async (req, res) => {
        try {
            const school = await School.findById(req.user.id);
            if (!school) return res.status(404).json({ success: false, message: "School not found" });

            res.status(200).json({ success: true, data: school });
        } catch (error) {
            console.error("Error in getSchoolOwnData:", error);
            res.status(500).json({ success: false, message: "Server Error while fetching school data" });
        }
    },


    updateSchoolWithId: async (req, res) => {
        const form = new formidable.IncomingForm({ keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            try {
                if (err) {
                    return res.status(400).json({ success: false, message: "Form parsing error" });
                }

                // 1. Build an object with only the fields you want to update
                const updateData = {};
                if (fields.school_name && fields.school_name[0]) {
                    updateData.school_name = fields.school_name[0];
                }
                if (fields.owner_name && fields.owner_name[0]) {
                    updateData.owner_name = fields.owner_name[0];
                }
                // Add other text fields here as needed

                // 2. Handle the image upload if a new file is provided
                if (files.image && files.image[0]) {
                    const photo = files.image[0];
                    const upload = await imagekit.upload({
                        file: photo.filepath,
                        fileName: photo.originalFilename.replace(/\s/g, "_"),
                        folder: "/school_images"
                    });
                    updateData.school_image = upload.url;
                }

                // 3. Perform a single, atomic update operation
                const updatedSchool = await School.findByIdAndUpdate(
                    req.user.id, // Find the school by the logged-in user's ID
                    { $set: updateData }, // Set the new data
                    { new: true } // Return the updated document
                );

                if (!updatedSchool) {
                    return res.status(404).json({ success: false, message: "School not found" });
                }

                res.status(200).json({ success: true, message: "School updated successfully", data: updatedSchool });

            } catch (error) {
                console.error("Error in updateSchoolWithId:", error);
                res.status(500).json({ success: false, message: "Server error while updating school" });
            }
        });
    },

    signOut: async (req, res) => {
        try {
            res.header("Authorization", "").status(200).json({ success: true, message: "Signed out successfully" });
        } catch (error) {
            console.error("Error in signOut:", error);
            res.status(500).json({ success: false, message: "Server Error during sign out" });
        }
    },

    isSchoolLoggedIn: async (req, res) => {
        try {
            const token = req.header("Authorization");
            if (!token) return res.status(401).json({ success: false, message: "Not Authorized" });

            const decoded = jwt.verify(token, jwtSecret);
            res.status(200).json({ success: true, data: decoded, message: "School is logged in" });

        } catch (error) {
            console.error("Error in isSchoolLoggedIn:", error);
            res.status(500).json({ success: false, message: "Server Error while checking login status" });
        }
    }
};
