/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
// 1. Import apiClient instead of axios
import apiClient from '../../../../apiClient'; // Adjust path if needed
import {
  FormControl,
  MenuItem,
  Paper,
  Container,
  Typography,
  Select,
  InputLabel,
} from '@mui/material';

const localizer = momentLocalizer(moment);

const eventStyleGetter = (event) => {
  const style = {
    backgroundColor: event.bgColor || '#3174ad',
    color: 'white',
    borderRadius: '4px',
    padding: '5px',
    border: 'none',
  };
  return {
    style,
  };
};

const Schedule = () => {
  const [events, setEvents] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');

  // Fetch all classes assigned to the teacher
  const fetchAllClasses = () => {
    // 2. Use apiClient for all requests
    apiClient
      .get(`/class/attendee`) // Fetches classes assigned to the logged-in teacher
      .then((resp) => {
        setAllClasses(resp.data);
        if (resp.data.length > 0) {
          setSelectedClass(resp.data[0].classId);
        }
      })
      .catch((e) => {
        console.error('Error in fetching assigned classes:', e);
      });
  };

  useEffect(() => {
    fetchAllClasses();
  }, []);

  // Fetch periods for the selected class
  useEffect(() => {
    const fetchClassPeriods = async () => {
      if (!selectedClass) return;
      try {
        const response = await apiClient.get(`/period/class/${selectedClass}`);
        const periods = response.data.data || []; // Use .data from standardized response
        const eventsData = periods.map((period) => ({
          id: period._id,
          title: `${period.subject?.subject_name || 'N/A'} By ${period.teacher?.name || 'N/A'}`,
          start: new Date(period.startTime),
          end: new Date(period.endTime),
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching periods:', error);
      }
    };

    fetchClassPeriods();
  }, [selectedClass]);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  return (
    <Container>
      <h2>Weekly Schedule</h2>
  
      {/* Class Selection Box */}
      <Paper sx={{ margin: '10px', padding: '10px' }}>
        <FormControl sx={{ minWidth: '220px', marginTop: '10px' }}>
          <Typography>Change Class</Typography>
          <Select value={selectedClass} onChange={handleClassChange}>
            {allClasses &&
              allClasses.map((value) => (
                <MenuItem key={value._id} value={value._id}>
                  {value.class_text}
                </MenuItem>
              ))}
          </Select>
        </FormControl>
      </Paper>
  
      {/* Calendar with rounded + zoom on hover */}
      <Paper
        elevation={3}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          mx: 'auto',
          my: 2,
          width: '95%',
          transition: 'transform 0.3s ease-in-out',
          '&:hover': {
            transform: 'scale(1.02)',
          },
        }}
      >
        <Calendar
          localizer={localizer}
          events={events}
          defaultView="week"
          views={['week']}
          step={30}
          timeslots={1}
          min={new Date(1970, 1, 1, 10, 0, 0)}
          startAccessor="start"
          endAccessor="end"
          max={new Date(1970, 1, 1, 17, 0, 0)}
          defaultDate={new Date()}
          showMultiDayTimes
          style={{ height: '100%', width: '100%' }}
          formats={{ timeGutterFormat: 'hh:mm A' }}
          eventPropGetter={eventStyleGetter}
        />
      </Paper>
    </Container>
  );
  
};

export default Schedule;
