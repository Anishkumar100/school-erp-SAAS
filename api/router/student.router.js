const express = require("express");
const { 
    getStudentWithQuery, 
    loginStudent,
    updateStudentWithId,
    getStudentWithId,
    signOut,
    isStudentLoggedIn, 
    getOwnDetails, 
    registerStudent, 
    deleteStudentWithId 
} = require("../controller/student.controller");
// ✅ Corrected Path
const authMiddleware = require('../auth/auth.js');
const router = express.Router();

// --- PUBLIC ROUTE ---
router.post("/login", loginStudent);

// --- PROTECTED ROUTES ---
router.post('/register', authMiddleware(['SCHOOL']), registerStudent);
router.get("/fetch-with-query", authMiddleware(['SCHOOL', 'TEACHER']), getStudentWithQuery);
router.patch("/update/:id", authMiddleware(['SCHOOL']), updateStudentWithId);
router.get("/fetch-own", authMiddleware(['STUDENT']), getOwnDetails);
router.get("/fetch-single/:id", authMiddleware(['STUDENT', 'SCHOOL']), getStudentWithId);
router.delete("/delete/:id", authMiddleware(['SCHOOL']), deleteStudentWithId);

// ✅ SECURITY FIX: These routes must be protected
router.post("/sign-out", authMiddleware(), signOut); // Changed to POST
router.get("/is-login", authMiddleware(), isStudentLoggedIn);

module.exports = router;