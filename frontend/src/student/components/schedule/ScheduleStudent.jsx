/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust path if needed
import {
  Container,
  Typography,
} from '@mui/material';

const localizer = momentLocalizer(moment);

const ScheduleStudent = () => {
  const [events, setEvents] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);

  useEffect(() => {
    // 2. Use apiClient for all requests
    const getStudentDetails = () => {
      apiClient.get(`/student/fetch-own`)
        .then(resp => {
          const studentData = resp.data.data;
          if (studentData && studentData.student_class) {
            setSelectedClass({
              id: studentData.student_class._id,
              class: studentData.student_class.class_text,
            });
          }
        })
        .catch((e) => {
          console.log("Error fetching student details", e);
        });
    };
    getStudentDetails();
  }, []);

  useEffect(() => {
    const fetchClassPeriods = async () => {
      if (!selectedClass) return;
      try {
        const response = await apiClient.get(`/period/class/${selectedClass.id}`);
        const periods = response.data.data || []; // Use .data from standardized response
        const eventsData = periods.map((period) => ({
          id: period._id,
          title: `${period.subject?.subject_name || 'N/A'} By ${period.teacher?.name || 'N/A'}`,
          start: new Date(period.startTime),
          end: new Date(period.endTime),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching periods:", error);
      }
    };
    fetchClassPeriods();
  }, [selectedClass]);

  return (
    <Container sx={{ height: '80vh', mt: 4 }}>
      <Typography variant="h4" sx={{ textAlign: 'center', mb: 3 }}>
        Your Weekly Schedule {selectedClass && `[Class: ${selectedClass.class}]`}
      </Typography>

      <Paper sx={{ height: '100%', p: 2, borderRadius: '16px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          defaultView="week"
          views={["week"]}
          step={30}
          timeslots={1}
          min={new Date(1970, 1, 1, 10, 0, 0)}
          startAccessor="start"
          endAccessor="end"
          max={new Date(1970, 1, 1, 17, 0, 0)}
          defaultDate={new Date()}
          showMultiDayTimes
          style={{ height: "100%", width: "100%" }}
          formats={{ timeGutterFormat: "hh:mm A" }}
        />
      </Paper>
    </Container>
  );
};

export default ScheduleStudent;
