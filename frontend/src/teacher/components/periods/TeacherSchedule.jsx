/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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

  useEffect(() => {
    const fetchTeacherClasses = () => {
      apiClient
        .get(`/class/attendee`)
        .then((resp) => {
          const classes = resp.data || [];
          setAllClasses(classes);
          if (classes.length > 0) {
            setSelectedClass(classes[0].classId);
          }
        })
        .catch((e) => {
          console.error('Error in fetching assigned classes:', e);
        });
    };
    fetchTeacherClasses();
  }, []);

  useEffect(() => {
    const fetchClassPeriods = async () => {
      if (!selectedClass) return;
      try {
        const response = await apiClient.get(`/period/class/${selectedClass}`);
        const periods = response.data.data || [];
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
      <Typography variant="h4" sx={{ textAlign: 'center', my: 3 }}>Weekly Schedule</Typography>

      <Paper sx={{ margin: '20px auto', padding: '20px', maxWidth: '400px', borderRadius: '16px' }}>
        <FormControl fullWidth>
          <InputLabel>Select Class</InputLabel>
          <Select
            value={selectedClass}
            label="Select Class"
            onChange={handleClassChange}
          >
            {allClasses.map((value) => (
              <MenuItem key={value.classId} value={value.classId}>
                {value.class_text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      <Paper
        elevation={3}
        sx={{
          borderRadius: '16px',
          overflow: 'hidden',
          mx: 'auto',
          my: 2,
          height: '600px',
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
