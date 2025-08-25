// router/notice.router.js

const express = require("express");
const router = express.Router();
const authMiddleware = require('../auth/auth.js');

// ✅ FIX: Import the correct, consolidated function name
const { newNotice, getNotices, deleteNotice, editNotice } = require("../controller/notice.controller");

// Route to add a new notice
router.post("/add", authMiddleware(['SCHOOL']), newNotice);

// ✅ FIX: This single route now handles fetching all notices AND notices by audience
router.get("/fetch/:audience?", authMiddleware(['SCHOOL', 'TEACHER', 'STUDENT']), getNotices);

// Route to edit a notice
router.put("/:id", authMiddleware(['SCHOOL']), editNotice);

// Route to delete a notice
router.delete("/:id", authMiddleware(['SCHOOL']), deleteNotice);
 
module.exports = router;