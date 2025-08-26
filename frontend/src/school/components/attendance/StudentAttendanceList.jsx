import React, { useState, useEffect } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { styled } from '@mui/material/styles';
import { Link } from "react-router-dom";
// 1. Import apiClient
import apiClient from "../../../../apiClient"; 
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import Attendee from "./attendee/Attendee";

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const StudentAttendanceList = () => {
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);
  const [studentClasses, setStudentClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [params, setParams] = useState({});
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => setMessage("");
  
  const handleMessage = (type, msg) => {
      setType(type);
      setMessage(msg);
  }

  // 2. Use apiClient for all requests
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const classResponse = await apiClient.get(`/class/fetch-all`);
        setStudentClasses(classResponse.data.data);
      } catch (error) {
        console.error("Error fetching student classes", error);
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
        } else {
            setAttendanceData({}); // Clear data if no students
        }
      } catch (error) {
        console.error("Error fetching students or attendance:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndAttendance();
  }, [params, message]);

  const handleClass = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
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
    <Box sx={{ p: { xs: 2, md: 4 }, width: "100%" }}>
<Typography
  variant="h4"
  align="center"
  gutterBottom
  sx={{
    color: '#1976d2',
    textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
    fontWeight: 'bold',
    letterSpacing: '2px',
    transition: 'all 0.3s ease',
    '&:hover': {
      color: '#1565c0',
      textShadow: '3px 3px 6px rgba(0,0,0,0.4)',
    },
  }}
>
  Attendance
</Typography>


      <Grid container spacing={3}>
        {/* Left Panel */}
        <Grid xs={12} md={3}>
          <Item elevation={3}>
            <Box sx={{ p: 2 }}>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="class-select-label">Student Class</InputLabel>
                <Select
                  labelId="class-select-label"
                  id="class-select"
                  value={selectedClass || ""}
                  onChange={handleClass}
                  label="Student Class"
                >
                  <MenuItem value="">Select Class</MenuItem>
                  {studentClasses.map((value, i) => (
                    <MenuItem key={i} value={value._id}>
                      {value.class_text}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Search Name"
                variant="outlined"
                onChange={handleSearch}
                fullWidth
              />

              {selectedClass && (
                <Box mt={2}>
                  <Attendee
                    params={params}
                    classId={selectedClass}
                    handleMessage={handleMessage}
                  />
                </Box>
              )}
            </Box>
          </Item>
        </Grid>

        {/* Right Panel */}
        <Grid xs={12} md={8}sx={{ flexGrow: 1 }}>
          <Item elevation={3}  sx={{ height: "100%", width: "100%" }}>
            <TableContainer component={Paper} sx={{ width: "100%", minHeight: "400px", overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell align="right"><strong>Gender</strong></TableCell>
                    <TableCell align="right"><strong>Guardian Phone</strong></TableCell>
                    <TableCell align="right"><strong>Class</strong></TableCell>
                    <TableCell align="right"><strong>Percentage</strong></TableCell>
                    <TableCell align="right"><strong>View</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student, i) => (
                    <TableRow key={i}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell align="right">{student.gender}</TableCell>
                      <TableCell align="right">{student.guardian_phone}</TableCell>
                      <TableCell align="right">{student.student_class.class_text}</TableCell>
                      <TableCell align="right">
                        {attendanceData[student._id] !== undefined
                          ? `${attendanceData[student._id].toFixed(2)}%`
                          : "No Data"}
                      </TableCell>
                      <TableCell align="right">
                        <Link to={`/school/attendance-student/${student._id}`}>
                          Details
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Item>
        </Grid>
      </Grid>
    </Box>
  </>
);

};

export default StudentAttendanceList;
