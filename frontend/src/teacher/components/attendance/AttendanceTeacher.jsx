import React, { useState, useEffect } from 'react';
import { Container, Button, Table, TableBody, TableCell, TableHead, TableRow, Typography, Select, MenuItem, Alert, FormControl, InputLabel } from '@mui/material';
import axios from 'axios';
import moment from 'moment';
import { baseUrl } from '../../../environment';

const AttendanceTeacher = () => {
  const [students, setStudents] = useState([]);
  const [attendanceStatus, setAttendanceStatus] = useState({});
  const [attendanceTaken, setAttendanceTaken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attendeeClass, setAttendeeClass] = useState([])
  const [selectedClass, setSelectedClass] = useState(''); // New state for selected class
  
  const todayDate = moment().format('YYYY-MM-DD'); // Get today's date in 'YYYY-MM-DD' format

  // Fetch all students and check if attendance is already taken
  useEffect(() => {
    const fetchStudentsAndCheckAttendance = async () => {
      try {
        const attendee = await axios.get(`${baseUrl}/class/attendee`);
        console.log("attendee",attendee)
         setAttendeeClass(attendee.data);

         if(attendeeClass.length>0 && selectedClass){
            // Check if attendance is already taken for today
            const attendanceResponse = await axios.get(`${baseUrl}/attendance/check/${selectedClass.id}`);

            setAttendanceTaken(attendanceResponse.data.attendanceTaken);
              // Fetch students if attendance has not been taken yet
        if (!attendanceResponse.data.attendanceTaken) {
            const studentsResponse = await axios.get(`${baseUrl}/student/fetch-with-query`, { params: { student_class: selectedClass.id} }); // Fetch based on class
            setStudents(studentsResponse.data.data);
  
            // Initialize attendance status for each student
            const initialStatus = {};
            studentsResponse.data.data.forEach((student) => {
              initialStatus[student._id] = 'Present'; // default value
            });
            setAttendanceStatus(initialStatus);
          }
         }
        
      
      
      

        setLoading(false);
      } catch (error) {
        console.error('Error fetching students or checking attendance:', error);
      }
    };

    fetchStudentsAndCheckAttendance();
  }, [todayDate, selectedClass]);

  // Handle attendance status change for each student
  const handleStatusChange = (studentId, status) => {
    setAttendanceStatus((prevState) => ({
      ...prevState,
      [studentId]: status,
    }));
  };

  // Handle class selection
  const handleClassChange = (event) => {
    let input = event.target.value;
    setSelectedClass({id:input.split(",")[0], class_text:input.split(",")[1]});
    console.log(event.target.value)
  };

  // Submit attendance for all students
  const submitAttendance = async () => {
    try {
      const attendanceRecords = students.map((student) => ({
        studentId: student._id,
        date: todayDate,
        status: attendanceStatus[student._id],
        classId: selectedClass.id, // Include the class
      }));
      
      // Send attendance records to backend
      await Promise.all(attendanceRecords.map((record) =>
        axios.post(`${baseUrl}/attendance/mark`, record)
      ));

      alert('Attendance submitted successfully');
      setAttendanceTaken(true); // Set attendance as taken
    } catch (error) {
      console.error('Error submitting attendance:', error);
    }
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container
      sx={{
        maxWidth: '800px',
        margin: 'auto',
        padding: 3,
        backgroundColor: 'transparent', // ✅ fully transparent now
        borderRadius: 3,
        boxShadow: 'none',              // ✅ remove dark shadow
        mt: 5
      }}
    >
      <Typography variant="h4" gutterBottom align="center">
        Mark Attendance
      </Typography>
  
      {attendeeClass.length > 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          You are attendee of {attendeeClass.length} class
          {attendeeClass.length > 1 && 'es'}. Select a class to take attendance.
        </Alert>
      ) : (
        <Alert severity="info">You are not attendee of any class.</Alert>
      )}
  
      {attendeeClass.length > 0 && (
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Class</InputLabel>
          <Select
            value={
              selectedClass
                ? `${selectedClass.id},${selectedClass.class_text}`
                : ''
            }
            onChange={handleClassChange}
          >
            <MenuItem value="">Select Class</MenuItem>
            {attendeeClass.map((student_class, i) => (
              <MenuItem
                key={i}
                value={`${student_class.classId},${student_class.class_text}`}
              >
                {student_class.class_text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
  
      {selectedClass && attendanceTaken && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Attendance already taken today for class {selectedClass.class_text}.
        </Alert>
      )}
  
      {selectedClass && !attendanceTaken && students.length < 1 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No students found in {selectedClass.class_text} class.
        </Alert>
      )}
  
      {selectedClass && !attendanceTaken && students.length > 0 && (
        <>
          {/* ✅ Table fully transparent now */}
          <Table sx={{ borderRadius: 2, backgroundColor: 'transparent' }}>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Roll Number</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student._id}>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.rollNumber}</TableCell>
                  <TableCell>
                    <Select
                      value={attendanceStatus[student._id]}
                      onChange={(e) =>
                        handleStatusChange(student._id, e.target.value)
                      }
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
  
          <Button
            variant="contained"
            color="primary"
            onClick={submitAttendance}
            sx={{ mt: 3, display: 'block', ml: 'auto', mr: 'auto' }}
          >
            Submit Attendance
          </Button>
        </>
      )}
    </Container>
  );
  
};

export default AttendanceTeacher;
