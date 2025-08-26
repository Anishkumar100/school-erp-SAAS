/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Container, Button, Select, MenuItem, InputLabel, FormControl, TextField, Typography } from '@mui/material';
// 1. Import apiClient instead of axios
import apiClient from '../../../../apiClient'; // Adjust path if needed

const periods = [
  { id: 1, label: 'Period 1 (10:00 AM - 11:00 AM)', startTime: '10:00', endTime: '11:00' },
  { id: 2, label: 'Period 2 (11:00 AM - 12:00 PM)', startTime: '11:00', endTime: '12:00' },
  { id: 3, label: 'Period 3 (12:00 PM - 1:00 PM)', startTime: '12:00', endTime: '13:00' },
  { id: 4, label: 'Lunch Break (1:00 PM - 2:00 PM)', startTime: '13:00', endTime: '14:00' }, // break
  { id: 5, label: 'Period 4 (2:00 PM - 3:00 PM)', startTime: '14:00', endTime: '15:00' },
  { id: 6, label: 'Period 5 (3:00 PM - 4:00 PM)', startTime: '15:00', endTime: '16:00' },
];

const AssignPeriod2 = ({ classId, isEdit, periodId, close }) => {
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teacher, setTeacher] = useState('');
  const [subject, setSubject] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [message, setMessage] = useState("");

  useEffect(() => {
    // 2. Use apiClient for all requests
    const fetchData = async () => {
      try {
        const [teacherResponse, subjectResponse] = await Promise.all([
          apiClient.get(`/teacher/fetch-with-query`, { params: {} }),
          apiClient.get(`/subject/fetch-all`, { params: {} })
        ]);
        setTeachers(teacherResponse.data.data);
        setSubjects(subjectResponse.data.data);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPeriod) {
      alert('Please select a period');
      return;
    }

    try {
      await apiClient.post(`/period/create`, {
        teacher,
        subject,
        classId,
        startTime: `${date}T${selectedPeriod.startTime}:00`,
        endTime: `${date}T${selectedPeriod.endTime}:00`,
      });
      alert('Period assigned successfully');
      close();
    } catch (error) {
      console.error('Error assigning period:', error);
      alert(error.response?.data?.message || "Error in assigning period.");
    }
  };

  const handleUpdateEvent = async () => {
    try {
      await apiClient.put(`/period/update/${periodId}`, {
        teacher,
        subject,
      });
      alert('Period updated successfully');
      close();
    } catch (error) {
      console.error('Error updating period:', error);
      alert("Period update error.");
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm("Are you sure you want to delete this period?")) {
        try {
            await apiClient.delete(`/period/delete/${periodId}`);
            alert('Period deleted successfully');
            close();
        } catch (error) {
            console.error('Error deleting period:', error);
            alert("Error in period deletion.");
        }
    }
  };

  useEffect(() => {
    const fetchPeriodsWithId = async (pId) => {
      try {
        const response = await apiClient.get(`/period/${pId}`);
        const periodData = response.data.data; // Use .data from standardized response
        const start = new Date(periodData.startTime);
        const startTimeString = `${String(start.getHours()).padStart(2, '0')}:00`;
        
        setTeacher(periodData.teacher._id);
        setSubject(periodData.subject._id);
        setSelectedPeriod(periods.find(p => p.startTime === startTimeString));
        setDate(periodData.startTime.substring(0, 10));
      } catch (error) {
        console.error('Error fetching period details:', error);
      }
    };

    if (isEdit && periodId) {
      fetchPeriodsWithId(periodId);
    }
  }, [isEdit, periodId]);


  return (
    <Container>
      <h2>Assign Period to Teacher</h2>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth margin="normal">
          <InputLabel>Teacher</InputLabel>
          <Select label={"Teacher"} value={teacher} onChange={(e) => setTeacher(e.target.value)} required>
            {teachers.map((teacher) => (
              <MenuItem key={teacher._id} value={teacher._id}>{teacher.name}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Subject</InputLabel>
          <Select label={"Subject"} value={subject} onChange={(e) => setSubject(e.target.value)} required>
            {subjects.map((sbj) => (
              <MenuItem key={sbj._id} value={sbj._id}>{sbj.subject_name}</MenuItem>
            ))}
          </Select>
        </FormControl>


        {/* Select predefined periods */}
     
          <FormControl fullWidth margin="normal">
          <InputLabel>Select Period</InputLabel>
          <Select value={selectedPeriod?selectedPeriod.id:""}
          label="Select Period"
           onChange={(e) => setSelectedPeriod(periods.find(p => p.id === e.target.value))}
           disabled={isEdit?true:false}
            required>
            {periods.map((period) => (
              <MenuItem key={period.id} value={period.id}>
                {period.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
      

        <TextField
          label="Date"
          type="date"
          fullWidth
          // InputLabelProps={{ shrink: true }}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          disabled={isEdit?true:false}
          required
        />

       
        {isEdit?<>
            <Button onClick={handleDeleteEvent} color="secondary">
            Delete
          </Button>
          <Button onClick={handleUpdateEvent} color="primary">
            Update
          </Button>
          </>:
           <Button type="submit" variant="contained" color="primary">
           Assign Period
         </Button>
         }
      </form>
    </Container>
  );
};

export default AssignPeriod2;
