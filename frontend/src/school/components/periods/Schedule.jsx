/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
// 1. Import apiClient instead of axios
import apiClient from '../../../../apiClient'; // Adjust path if needed
import {
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Container,
  Typography,
} from '@mui/material';
import AssignPeriod2 from '../../../school/components/assign period/AssignPeriod2';

const localizer = momentLocalizer(moment);
const eventStyleGetter = (event, start, end, isSelected) => {
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
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddDialog, setOpenAddDialog] = useState(false);

  // Fetch all classes
  const fetchAllClasses = () => {
    // 2. Use apiClient for requests
    apiClient
      .get(`/class/fetch-all`)
      .then((resp) => {
        setAllClasses(resp.data.data);
        if (resp.data.data.length > 0) {
          setSelectedClass(resp.data.data[0]._id);
        }
      })
      .catch((e) => {
        console.error('Error in fetching all Classes');
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
        // 3. Use apiClient for requests
        const response = await apiClient.get(`/period/class/${selectedClass}`);
        const periods = response.data.data || []; // Use .data from standardized response
        const eventsData = periods.map((period) => ({
          id: period._id,
          title: `${period.subject?.subject_name || 'N/A'}, By ${period.teacher?.name || 'N/A'}`,
          start: new Date(period.startTime),
          end: new Date(period.endTime)
        }));
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching periods:', error);
      }
    };

    fetchClassPeriods();
  }, [selectedClass, openDialog, openAddDialog]);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event.id);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedEvent(null);
  };

  const handleOpenAddDialog = () => {
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
  };

  return (
  <Container>
    <Typography className="hero-text" variant="h2" sx={{ textAlign: 'center' }}>
      Weekly Schedule
    </Typography>

    <Paper
      sx={{
        margin: '20px auto',
        padding: '20px',
        maxWidth: 1200,
        borderRadius: '16px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 6,
        },
      }}
    >
      <FormControl fullWidth>
        <Typography sx={{ mb: 1 }}>Change Class</Typography>
        <Select value={selectedClass} onChange={handleClassChange} onBlur={handleClassChange}>
          {allClasses &&
            allClasses.map((value) => (
              <MenuItem key={value._id} value={value._id}>
                {value.class_text}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Paper>

    <Button
      variant="contained"
      color="primary"
      onClick={handleOpenAddDialog}
      sx={{ display: 'block', margin: '10px auto' }}
    >
      Add New Period
    </Button>

    <Paper
      sx={{
        borderRadius: '16px',
        padding: '10px',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'scale(1.02)',
          boxShadow: 6,
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
        max={new Date(1970, 1, 1, 17, 0, 0)}
        startAccessor="start"
        endAccessor="end"
        onSelectEvent={handleSelectEvent}
        defaultDate={new Date()}
        showMultiDayTimes
        eventPropGetter={eventStyleGetter}
        style={{ height: '100%', width: '100%' }}
        formats={{ timeGutterFormat: 'hh:mm A' }}
      />
    </Paper>

    <Dialog open={openDialog} onClose={handleCloseDialog}>
      <DialogTitle>Edit Period</DialogTitle>
      <DialogContent>
        <AssignPeriod2 classId={selectedClass} isEdit={true} periodId={selectedEvent} close={handleCloseDialog} />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseDialog}>Cancel</Button>
      </DialogActions>
    </Dialog>

    <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
      <DialogTitle>Add New Period</DialogTitle>
      <AssignPeriod2 classId={selectedClass} close={handleCloseAddDialog} />
      <DialogActions>
        <Button onClick={handleCloseAddDialog}>Cancel</Button>
      </DialogActions>
    </Dialog>
  </Container>
);

};


export default Schedule;
