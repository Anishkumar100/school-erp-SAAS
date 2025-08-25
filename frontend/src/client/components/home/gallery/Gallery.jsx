import React, { useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Modal,
  IconButton,
  useMediaQuery,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// 1. Import apiClient instead of axios
import apiClient from '../../../../apiClient'; // Adjust the path to your apiClient.js file

const Gallery = () => {
  const [open, setOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schools, setSchools] = useState([]);

  const handleOpen = (school) => {
    setSelectedSchool(school);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSchool(null);
  };

  useEffect(() => {
    // 2. Use apiClient for the authenticated request
    apiClient
      .get(`/school/all`) // No need for baseUrl
      .then((resp) => {
        setSchools(resp.data.data);
      })
      .catch((e) => {
        console.log('ERROR fetching schools:', e);
      });
  }, []);

  return (
    <>
      <Grid container spacing={3} sx={{ px: { xs: 1, md: 2 }, py: 2 }}>
        {schools.map((school, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Fade in timeout={600}>
              <Box
                onClick={() => handleOpen(school)}
                sx={{
                  cursor: 'pointer',
                  overflow: 'hidden',
                  borderRadius: 2,
                  boxShadow: 2,
                  height: { xs: 220, md: 250 },
                  // ... other styles
                }}
              >
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <img
                    src={school.school_image} // Use the full URL from the backend
                    alt={school.school_name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    textAlign: 'center',
                    fontWeight: 500,
                    py: 1,
                    bgcolor: 'background.paper',
                  }}
                >
                  {school.school_name}
                </Typography>
              </Box>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Modal remains the same */}
      <Modal open={open} onClose={handleClose}>
        {/* ... modal content ... */}
      </Modal>
    </>
  );
};

export default Gallery;