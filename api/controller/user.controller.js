require("dotenv").config();
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const ImageKit = require("imagekit");

const jwtSecret = process.env.JWTSECRET;

const User = require("../model/user.model");

// Initialize ImageKit once
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

module.exports = {

    getAllUsers: async(req, res) => {
        try {
            const users = await User.find();
            res.status(200).json({ success: true, message: "Success in fetching all users", data: users });
        } catch (error) {
            console.log("Error in getAllUsers", error);
            res.status(500).json({ success: false, message: "Server Error in Getting All Users. Try later" });
        }
    },

    register: async(req, res) => {
        const form = new formidable.IncomingForm();
        const schoolId = req.user?.schoolId; // optional if needed
        form.parse(req, async(err, fields, files) => {
            try {
                if (err) return res.status(400).json({ success: false, message: "Error parsing form data" });

                const existingUser = await User.find({ email: fields.email[0] });
                if (existingUser.length > 0) {
                    return res.status(500).json({ success: false, message: "Email Already Exists!" });
                }

                let imageUrl = "";
                if (files.image) {
                    const file = files.image[0];
                    const fileData = await fs.promises.readFile(photo.filepath);

                    const uploadResult = await imagekit.upload({
                        file: fileData,
                        fileName: file.originalFilename.replace(" ", "_")
                    });

                    imageUrl = uploadResult.url;
                }

                const hashPassword = bcrypt.hashSync(fields.password[0], 10);

                const newUser = new User({
                    email: fields.email[0],
                    name: fields.username[0],
                    password: hashPassword,
                    country: fields.country[0],
                    image_url: imageUrl,
                    eye_color: fields.eye_color[0],
                    hair_color: fields.hair_color[0],
                    height: fields.height[0],
                    weight: fields.weight[0],
                    age: fields.age[0],
                    gender: fields.gender[0],
                    role: fields.role ? fields.role[0] : "USER"
                });

                const savedUser = await newUser.save();
                res.status(200).json({ success: true, data: savedUser, message: "User Registered Successfully." });

            } catch (e) {
                console.log("Error in Register", e);
                res.status(500).json({ success: false, message: "Failed Registration." });
            }
        });
    },

    login: async(req, res) => {
        try {
            const user = await User.findOne({ email: req.body.email });
            if (!user) return res.status(401).json({ success: false, message: "Email not registered." });

            const isAuth = bcrypt.compareSync(req.body.password, user.password);
            if (!isAuth) return res.status(401).json({ success: false, message: "Password doesn't match." });

            const token = jwt.sign({
                id: user._id,
                username: user.name,
                image_url: user.image_url,
                role: user.role
            }, jwtSecret);

            res.header("Authorization", token);
            res.status(200).json({
                success: true,
                message: "Success Login",
                user: { id: user._id, username: user.name, image_url: user.image_url, role: user.role }
            });

        } catch (e) {
            console.log("Error in login", e);
            res.status(500).json({ success: false, message: "Server Error during login." });
        }
    },

    getUserWithId: async(req, res) => {
        try {
            const id = req.user.id;
            const user = await User.findById(id);
            if (!user) return res.status(500).json({ success: false, message: "User data not Available" });
            res.status(200).json({ success: true, data: user });
        } catch (e) {
            console.log("Error in getUserWithId", e);
            res.status(500).json({ success: false, message: "Error in getting User Data" });
        }
    },

    updateUserWithId: async(req, res) => {
        const form = new formidable.IncomingForm();
        form.parse(req, async(err, fields, files) => {
            try {
                if (err) return res.status(400).json({ message: "Error parsing the form data." });
                const id = req.user.id;
                const user = await User.findById(id);
                if (!user) return res.status(404).json({ message: "User not found." });

                Object.keys(fields).forEach(field => {
                    user[field] = fields[field][0];
                });

                if (files.image) {
                    const file = files.image[0];
                    const fileData = await fs.promises.readFile(photo.filepath);
                    const uploadResult = await imagekit.upload({
                        file: fileData,
                        fileName: file.originalFilename.replace(" ", "_")
                    });
                    user.image_url = uploadResult.url;
                }

                await user.save();
                res.status(200).json({ success: true, message: "User updated successfully", data: user });
            } catch (e) {
                console.log("Error updating user", e);
                res.status(500).json({ message: "Error updating user details." });
            }
        });
    },

    signOut: async(req, res) => {
        try {
            res.header("Authorization", "");
            res.status(200).json({ success: true, message: "User Signed Out Successfully." });
        } catch (error) {
            console.log("Error in Sign out", error);
            res.status(500).json({ success: false, message: "Server Error in Signing Out. Try later" });
        }
    },

    isUserLoggedIn: async(req, res) => {
        try {
            const token = req.header("Authorization");
            if (!token) return res.status(401).json({ success: false, message: "You are not Authorized." });

            const decoded = jwt.verify(token, jwtSecret);
            res.status(200).json({ success: true, data: decoded, message: "User is logged in" });

        } catch (error) {
            console.log("Error in isUserLoggedIn", error);
            res.status(500).json({ success: false, message: "Server Error in User Logged in check. Try later" });
        }
    },

    isUserAdmin: async(req, res) => {
        try {
            const token = req.header("Authorization");
            if (!token) return res.status(401).json({ success: false, message: "You are not Authorized." });

            const decoded = jwt.verify(token, jwtSecret);
            if (decoded.role === "ADMIN") {
                return res.status(200).json({ success: true, message: "User is an Admin." });
            } else {
                return res.status(401).json({ success: false, message: "You are not an Authorized Admin." });
            }

        } catch (error) {
            console.log("Error in isUserAdmin", error);
            res.status(500).json({ success: false, message: "Server Error in Admin check. Try later" });
        }
    }
};
