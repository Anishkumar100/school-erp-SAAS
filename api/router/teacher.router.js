const express = require("express");
const { 
    getTeacherWithQuery, 
    loginTeacher,
    updateTeacherWithId,
    getTeacherWithId,
    signOut,
    isTeacherLoggedIn, 
    registerTeacher, 
    deleteTeacherWithId,
    getTeacherOwnDetails
} = require("../controller/teacher.controller");
const router = express.Router();
// ✅ Corrected Path
const authMiddleware = require('../auth/auth.js');

// --- PUBLIC ROUTE ---
router.post("/login", loginTeacher);

// --- PROTECTED ROUTES ---
router.post('/register', authMiddleware(['SCHOOL']), registerTeacher);
router.get("/fetch-with-query", authMiddleware(['SCHOOL']), getTeacherWithQuery);
router.patch("/update/:id", authMiddleware(['SCHOOL']), updateTeacherWithId);
router.get("/fetch-own", authMiddleware(['TEACHER']), getTeacherOwnDetails);
router.get("/fetch-single/:id", authMiddleware(['TEACHER', 'SCHOOL']), getTeacherWithId);
router.delete("/delete/:id", authMiddleware(['SCHOOL']), deleteTeacherWithId);

// ✅ UNCOMMENTED & SECURED: These routes are now active and protected
router.post("/sign-out", authMiddleware(), signOut); // Changed to POST
router.get("/is-login", authMiddleware(), isTeacherLoggedIn);

module.exports = router;