require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectToDatabase = require("./db");

// ROUTERS
const schoolRouter = require("./router/school.router");
const studentRouter = require("./router/student.router");
const classRouter = require("./router/class.router");
const subjectRouter = require("./router/subject.router");
const teacherRouter = require('./router/teacher.router');
const examRouter = require('./router/examination.router');
const attendanceRoutes = require('./router/attendance.router');
const periodRoutes = require("./router/period.router");
const noticeRoutes = require("./router/notice.router");
const { authCheck } = require("./controller/auth.controller");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ FIX 1: Allow multiple origins for CORS (local development and production)
const allowedOrigins = [
  "https://spark-erp-one.vercel.app",
  "http://localhost:5173" // Add your local frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  exposedHeaders: ["Authorization"],
}));

// ✅ FIX 2: Use the correct environment variable name 'MONGO_URI'
connectToDatabase(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((e) => console.log("MongoDB Connection Error", e));

// Routes
app.get("/", (req, res) => {
  res.send("Spark Solutions Built this APP");
});

// Apply middleware to all necessary routes
app.use("/api/school", schoolRouter); // School has public and private routes inside
app.use("/api/student", authCheck, studentRouter);
app.use("/api/teacher", authCheck, teacherRouter);
app.use("/api/class", authCheck, classRouter);
app.use("/api/subject", authCheck, subjectRouter);
app.use("/api/examination", authCheck, examRouter);
app.use("/api/attendance", authCheck, attendanceRoutes);
app.use("/api/period", authCheck, periodRoutes);
app.use("/api/notices", authCheck, noticeRoutes);
app.get("/api/auth/check", authCheck);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
