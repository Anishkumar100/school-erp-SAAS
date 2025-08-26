require("dotenv").config();

const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const connectToDatabase = require("./db"); // <-- import reusable DB

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


app.use(cors({
  origin: "https://spark-erp-one.vercel.app",
  credentials: true,
  exposedHeaders: ["Authorization"], // ✅ important
}));

// Connect to MongoDB once

connectToDatabase(process.env.MONGO_URI || `mongodb+srv://akcoder1102004:ak@schoolmanagement.9ltii0g.mongodb.net/?retryWrites=true&w=majority&appName=schoolManagement`)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((e) => console.log("MongoDB Connection Error", e));

// Routes
app.get("/", (req, res) => {
  res.send("Spark Solutions Built this APP");
});

app.use("/api/school", schoolRouter);
app.use("/api/student", studentRouter);
app.use("/api/teacher", teacherRouter);
app.use("/api/class", classRouter);
app.use("/api/subject", subjectRouter);
app.use("/api/examination", examRouter);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/period", periodRoutes);
app.use("/api/notices", noticeRoutes);

app.get("/api/auth/check", authCheck);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
