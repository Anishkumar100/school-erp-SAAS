const express = require("express");
const router = express.Router();
// ✅ Corrected Path
const authMiddleware = require('../middleware/auth.js'); 
const { 
    createSubject, 
    getAllSubjects, 
    getSubjectWithId, 
    updateSubjectWithId, 
    deleteSubjectWithId 
} = require("../controller/subject.controller");

router.post("/create", authMiddleware(['SCHOOL']), createSubject);
router.get("/fetch-all", authMiddleware(['SCHOOL']), getAllSubjects);
router.get("/fetch-single/:id", authMiddleware(['SCHOOL']), getSubjectWithId);
router.patch("/update/:id", authMiddleware(['SCHOOL']), updateSubjectWithId);
router.delete("/delete/:id", authMiddleware(['SCHOOL']), deleteSubjectWithId);

module.exports = router;