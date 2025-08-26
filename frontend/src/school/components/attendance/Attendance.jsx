/* eslint-disable react-hooks/exhaustive-deps */
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Paper,
    TextField,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust path if needed
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { Link } from "react-router-dom";

export default function Attendance() {
    const [studentClasses, setStudentClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(true);
    const [params, setParams] = useState({});
    const [message, setMessage] = useState("");
    const [type, setType] = useState("success");

    const resetMessage = () => setMessage("");

    // 2. Use apiClient for all requests
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const classResponse = await apiClient.get(`/class/fetch-all`);
                setStudentClasses(classResponse.data.data);
            } catch (error) {
                console.error("Error fetching classes:", error);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        const fetchStudentsAndAttendance = async () => {
            setLoading(true);
            try {
                const studentResponse = await apiClient.get(`/student/fetch-with-query`, { params });
                const studentsList = studentResponse.data.data;
                setStudents(studentsList);

                if (studentsList.length > 0) {
                    // Fetch attendance for all students in parallel for efficiency
                    const attendancePromises = studentsList.map(student =>
                        apiClient.get(`/attendance/${student._id}`)
                    );
                    const attendanceResults = await Promise.all(attendancePromises);

                    const updatedAttendanceData = {};
                    attendanceResults.forEach((response, index) => {
                        const studentId = studentsList[index]._id;
                        const records = response.data || [];
                        const total = records.length;
                        const present = records.filter(r => r.status === "Present").length;
                        updatedAttendanceData[studentId] = total > 0 ? (present / total) * 100 : 0;
                    });
                    setAttendanceData(updatedAttendanceData);
                }
            } catch (error) {
                console.error("Error fetching student or attendance data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStudentsAndAttendance();
    }, [params, message]);

    const handleClass = (e) => {
        const classId = e.target.value;
        setParams(prev => ({ ...prev, student_class: classId || undefined }));
    };

    const handleSearch = (e) => {
        const searchTerm = e.target.value;
        setParams(prev => ({ ...prev, search: searchTerm || undefined }));
    };

    return (
      <>
        {message && (
          <CustomizedSnackbars
            reset={resetMessage}
            type={type}
            message={message}
          />
        )}
        <Box
          sx={{ background: "rgb(2, 12, 20)", padding: "40px 10px 20px 10px" }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            component={"div"}
          >
            <Typography className="text-beautify hero-text">Attendance</Typography>
          </Box>
  
     
          <Box
            sx={{
              padding: "5px",
              minWidth: 120,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: "20px",
              background: "#fff",
            }}
          >
            <FormControl
              sx={{
                minWidth: "200px",
                padding: "5px",
              }}
            >
              <InputLabel id="demo-simple-select-label">Student Class</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Class"
                onChange={handleClass}
              >
                <MenuItem value={""}>Select Class</MenuItem>
                {studentClasses &&
                  studentClasses.map((value, i) => {
                    return (
                      <MenuItem key={i} value={value._id}>
                        {value.class_text}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>
  
            <TextField
              id="filled-basic"
              label="Search Name  .. "
              onChange={handleSearch}
            />
          </Box>
  
          <Box>
          <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="right">Gender</TableCell>
            <TableCell align="right">Guardian Phone</TableCell>
            <TableCell align="right">Class</TableCell>
            <TableCell align="right">View</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
        {students &&
              students.map((student, i) => {
                return (
                             <TableRow
              key={i}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {student.name}
              </TableCell>
              <TableCell align="right">{student.gender}</TableCell>
              <TableCell align="right">{student.guardian_phone}</TableCell>
              <TableCell align="right">{student.student_class.class_text}</TableCell>
              {/* <TableCell >{fetchAttendanceData(student._id)}</TableCell> */}
              <TableCell align="right"><Link to={`/school/attendance-student/${student._id}`}>Attendance</Link></TableCell>
            </TableRow>) }
          )}
        </TableBody>
      </Table>
    </TableContainer>
          
          </Box>
        </Box>
      </>
    );
  }
  