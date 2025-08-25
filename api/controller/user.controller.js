require("dotenv").config();
const formidable = require("formidable");
const bcrypt = require("bcryptjs");
const jwt = require('jsonwebtoken');
const User = require("../model/user.model");
// CODE QUALITY: Import the shared imagekit instance
const imagekit = require("../imageKit");

const jwtSecret = process.env.JWTSECRET;

module.exports = {
    getAllUsers: async (req, res) => {
        try {
            // SECURITY FIX: Never send password hashes to the client
            const users = await User.find().select('-password');
            res.status(200).json({ success: true, message: "Fetched all users successfully", data: users });
        } catch (error) {
            console.error("Error in getAllUsers:", error);
            res.status(500).json({ success: false, message: "Server error while fetching users." });
        }
    },

    register: async (req, res) => {
        const form = new formidable.IncomingForm({ keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            try {
                if (err) return res.status(400).json({ success: false, message: "Error parsing form data" });

                // CORRECTNESS: Use findOne for checking existence
                const existingUser = await User.findOne({ email: fields.email[0] });
                if (existingUser) {
                    // CORRECTNESS: Use 409 Conflict for existing resources
                    return res.status(409).json({ success: false, message: "Email already exists!" });
                }

                let imageUrl = "";
                if (files.image && files.image[0]) {
                    // BUG FIX: The variable is 'files.image[0]', not 'photo'
                    const file = files.image[0];
                    
                    const uploadResult = await imagekit.upload({
                        file: file.filepath, // ImageKit can use the filepath directly
                        fileName: file.originalFilename.replace(/\s/g, "_")
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
                // SECURITY FIX: Don't send the password back in the response
                savedUser.password = undefined; 
                res.status(201).json({ success: true, data: savedUser, message: "User registered successfully." });
            } catch (e) {
                console.error("Error in Register:", e);
                res.status(500).json({ success: false, message: "Failed registration." });
            }
        });
    },
    
    login: async (req, res) => {
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

            res.header("Authorization", token).status(200).json({
                success: true,
                message: "Login successful",
                user: { id: user._id, username: user.name, image_url: user.image_url, role: user.role }
            });

        } catch (e) {
            console.error("Error in login:", e);
            res.status(500).json({ success: false, message: "Server error during login." });
        }
    },

    getUserWithId: async (req, res) => {
        try {
            // SECURITY FIX: Exclude the password from the result
            const user = await User.findById(req.user.id).select('-password');
            if (!user) {
                // CORRECTNESS: Use 404 for "Not Found"
                return res.status(404).json({ success: false, message: "User not found" });
            }
            res.status(200).json({ success: true, data: user });
        } catch (e) {
            console.error("Error in getUserWithId:", e);
            res.status(500).json({ success: false, message: "Error getting user data" });
        }
    },

    updateUserWithId: async (req, res) => {
        const form = new formidable.IncomingForm({ keepExtensions: true });

        form.parse(req, async (err, fields, files) => {
            try {
                if (err) return res.status(400).json({ message: "Error parsing the form data." });

                // SECURITY FIX: Build an update object with only allowed fields
                const updateData = {};
                const allowedFields = ['name', 'country', 'eye_color', 'hair_color', 'height', 'weight', 'age', 'gender'];
                
                allowedFields.forEach(field => {
                    if (fields[field]?.[0]) {
                        updateData[field] = fields[field][0];
                    }
                });
                
                if (files.image && files.image[0]) {
                    // BUG FIX: The variable is 'files.image[0]', not 'photo'
                    const file = files.image[0];
                    const uploadResult = await imagekit.upload({
                        file: file.filepath,
                        fileName: file.originalFilename.replace(/\s/g, "_")
                    });
                    updateData.image_url = uploadResult.url;
                }

                const updatedUser = await User.findByIdAndUpdate(
                    req.user.id,
                    { $set: updateData },
                    { new: true }
                ).select('-password'); // SECURITY FIX: Exclude password from response

                if (!updatedUser) {
                    return res.status(404).json({ message: "User not found." });
                }
                res.status(200).json({ success: true, message: "User updated successfully", data: updatedUser });
            } catch (e) {
                console.error("Error updating user:", e);
                res.status(500).json({ message: "Error updating user details." });
            }
        });
    },

    signOut: async (req, res) => {
        try {
            res.header("Authorization", "").status(200).json({ success: true, message: "User signed out successfully." });
        } catch (error) {
            console.error("Error in signOut:", error);
            res.status(500).json({ success: false, message: "Server error while signing out." });
        }
    },

    isUserLoggedIn: async (req, res) => {
        try {
            const token = req.header("Authorization")?.replace('Bearer ', '');
            if (!token) return res.status(401).json({ success: false, message: "You are not authorized." });
            
            const decoded = jwt.verify(token, jwtSecret);
            res.status(200).json({ success: true, data: decoded, message: "User is logged in" });
        } catch (error) {
            res.status(401).json({ success: false, message: "Invalid or expired token." });
        }
    },

    isUserAdmin: async (req, res) => {
        try {
            const token = req.header("Authorization")?.replace('Bearer ', '');
            if (!token) return res.status(401).json({ success: false, message: "You are not authorized." });
            
            const decoded = jwt.verify(token, jwtSecret);
            if (decoded.role === "ADMIN") {
                return res.status(200).json({ success: true, message: "User is an Admin." });
            } else {
                // CORRECTNESS: Use 403 Forbidden for authenticated users without permission
                return res.status(403).json({ success: false, message: "You do not have admin privileges." });
            }
        } catch (error) {
            // Catches invalid/expired tokens
            res.status(401).json({ success: false, message: "Invalid token." });
        }
    }
};