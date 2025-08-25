const express = require('express');
const router = express.Router();
// ✅ Corrected Path
const authMiddleware = require('../auth/auth.js');
const { 
    createClass, 
    getAllClass, 
    getClassWithId, 
    updateClassWithId, 
    deleteClassWithId, 
    createSubTeacher, 
    updateSubTeacher, 
    deleteSubTeacherWithId, 
    getAttendeeTeacher 
} = require("../controller/class.controller");

router.post("/create", authMiddleware(['SCHOOL']), createClass);
router.get("/fetch-all", authMiddleware(['SCHOOL', 'TEACHER']), getAllClass);

// ✅ SECURITY FIX: Added authMiddleware to protect this route
router.get("/fetch-single/:id", authMiddleware(['SCHOOL', 'TEACHER']), getClassWithId);

router.patch("/update/:id", authMiddleware(['SCHOOL']), updateClassWithId);
router.delete("/delete/:id", authMiddleware(['SCHOOL']), deleteClassWithId);

// ✅ UNCOMMENTED & SECURED: These routes are now active and protected
router.post("/sub-teach/new/:id", authMiddleware(['SCHOOL']), createSubTeacher);
router.patch("/sub-teach/update/:classId/:subTeachId", authMiddleware(['SCHOOL']), updateSubTeacher);
router.delete("/sub-teach/delete/:classId/:subTeachId", authMiddleware(['SCHOOL']), deleteSubTeacherWithId);

router.get("/attendee", authMiddleware(['TEACHER']), getAttendeeTeacher);

module.exports = router;