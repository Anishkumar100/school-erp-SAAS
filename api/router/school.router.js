const express = require("express");
// Use the correct path to your middleware
const authMiddleware = require('../auth/auth.js'); 
const { 
    getAllSchools, 
    updateSchoolWithId,
    signOut,
    isSchoolLoggedIn, 
    registerSchool, 
    loginSchool, 
    getSchoolOwnData,
    // 1. ✅ IMPORT THE NEW FUNCTION
    getSchoolGallery 
} = require("../controller/school.controller");

const router = express.Router();

// --- PUBLIC ROUTES ---
router.post('/register', registerSchool);
router.post("/login", loginSchool);
// 2. ✅ ADD THE NEW PUBLIC ROUTE FOR THE GALLERY
router.get("/gallery", getSchoolGallery);

// --- PROTECTED ROUTES ---
// This route should be protected, e.g., for an ADMIN role
router.get("/all", authMiddleware(['ADMIN']), getAllSchools); 
router.patch("/update", authMiddleware(['SCHOOL']), updateSchoolWithId);
router.get("/fetch-single", authMiddleware(['SCHOOL']), getSchoolOwnData);
router.post("/sign-out", authMiddleware(), signOut);
router.get("/is-login", authMiddleware(), isSchoolLoggedIn);

module.exports = router;
