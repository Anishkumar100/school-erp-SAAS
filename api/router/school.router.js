const express = require("express");
// ✅ Corrected Path
const authMiddleware = require('../middleware/auth.js'); 
const { 
    getAllSchools, 
    updateSchoolWithId,
    signOut,
    isSchoolLoggedIn, 
    registerSchool, 
    loginSchool, 
    getSchoolOwnData 
} = require("../controller/school.controller");

const router = express.Router();

// --- PUBLIC ROUTES ---
// These routes do not require a user to be logged in.
router.post('/register', registerSchool);
router.post("/login", loginSchool); // Changed to POST for consistency

// --- PROTECTED ROUTES ---
// These routes require a valid token.

// ✅ SECURITY FIX: This route should be protected. 
// Only an 'ADMIN' should probably see all schools.
router.get("/all", authMiddleware(['ADMIN']), getAllSchools); 

router.patch("/update", authMiddleware(['SCHOOL']), updateSchoolWithId);
router.get("/fetch-single", authMiddleware(['SCHOOL']), getSchoolOwnData);
router.post("/sign-out", authMiddleware(), signOut); // Changed to POST, protected

// ✅ SECURITY FIX: This route must be protected to check the token.
router.get("/is-login", authMiddleware(), isSchoolLoggedIn);

module.exports = router;