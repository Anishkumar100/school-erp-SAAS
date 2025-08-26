import React, { useState, useEffect } from 'react';
import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem, Alert, FormControl, InputLabel } from '@mui/material';
import moment from 'moment';
// 1. Import apiClient instead of axios
import apiClient from '../../../../apiClient'; // Adjust path if needed

const AttendanceTeacher = () => {
  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendanceTaken, setAttendanceTaken] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attendeeClasses, setAttendeeClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  const todayDate = moment().format('YYYY-MM-DD');

  // Fetch the classes this teacher is assigned to
  useEffect(() => {
    const fetchAttendeeClasses = async () => {
      try {
        const response = await apiClient.get(`/class/attendee`);
        setAttendeeClasses(response.data);
        // If there's only one class, select it automatically
        if (response.data.length === 1) {
          setSelectedClass(response.data[0].classId);
        }
      } catch (error) {
        console.error('Error fetching assigned classes:', error);
      }
    };
    fetchAttendeeClasses();
  }, []);

  // Fetch students and check attendance status when a class is selected
  useEffect(() => {
    if (!selectedClass) {
      setStudents([]); // Clear students if no class is selected
      return;
    }

    const fetchStudentsAndCheckAttendance = async () => {
      setLoading(true);
      try {
        // Check if attendance is already taken for today
        const attendanceResponse = await apiClient.get(`/attendance/check/${selectedClass}`);
        setAttendanceTaken(attendanceResponse.data.attendanceTaken);

        // Fetch students only if attendance has not been taken
        if (!attendanceResponse.data.attendanceTaken) {
          const studentsResponse = await apiClient.get(`/student/fetch-with-query`, { params: { student_class: selectedClass } });
          const studentData = studentsResponse.data.data;
          setStudents(studentData);

          // Initialize attendance status for each student
          const initialStatus = {};
          studentData.forEach((student) => {
            initialStatus[student._id] = 'Present'; // default value
          });
          setAttendanceStatus(initialStatus);
        }
      } catch (error) {
        console.error('Error fetching students or checking attendance:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentsAndCheckAttendance();
  }, [selectedClass]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus((prevState) => ({
      ...prevState,
      [studentId]: status,
    }));
  };

  // Submit attendance for all students in a single request
  const submitAttendance = async () => {
    try {
      const attendanceData = students.map((student) => ({
        studentId: student._id,
        status: attendanceStatus[student._id],
      }));

      // ✅ OPTIMIZED: Send all records in a single API call
      await apiClient.post(`/attendance/mark`, {
        attendanceData,
        classId: selectedClass,
        date: todayDate,
      });

      alert('Attendance submitted successfully');
      setAttendanceTaken(true);
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Failed to submit attendance. Please try again.');
    }
  };

  return (
    <Container sx={{ maxWidth: '800px', margin: 'auto', padding: 3, mt: 5 }}>
      <Typography variant="h4" gutterBottom align="center">
        Mark Attendance
      </Typography>

      {attendeeClasses.length > 0 ? (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Class</InputLabel>
          <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
            {attendeeClasses.map((cls) => (
              <MenuItem key={cls.classId} value={cls.classId}>
                {cls.class_text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      ) : (
        <Alert severity="info">You are not assigned as an attendee for any class.</Alert>
      )}

      {loading && <Typography>Loading...</Typography>}

      {selectedClass && !loading && (
        <>
          {attendanceTaken ? (
            <Alert severity="success" sx={{ mb: 3 }}>
              Attendance has already been taken for this class today.
            </Alert>
          ) : students.length > 0 ? (
            <>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student._id}>
                        <TableCell>{student.name}</TableCell>
                        <TableCell>
                          <Select
                            value={attendanceStatus[student._id] || 'Present'}
                            onChange={(e) => handleStatusChange(student._id, e.target.value)}
                            fullWidth
                          >
                            <MenuItem value="Present">Present</MenuItem>
                            <MenuItem value="Absent">Absent</MenuItem>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Button
                variant="contained"
                color="primary"
                onClick={submitAttendance}
                sx={{ mt: 3, display: 'block', mx: 'auto' }}
              >
                Submit Attendance
              </Button>
            </>
          ) : (
            <Alert severity="info" sx={{ mb: 3 }}>
              No students found in this class.
            </Alert>
          )}
        </>
      )}
    </Container>
  );
};

export default AttendanceTeacher;
