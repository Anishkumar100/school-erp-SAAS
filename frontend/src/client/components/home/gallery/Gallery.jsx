import React, { useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  Modal,
  IconButton,
  Fade,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
// Use the default axios for public routes
import axios from 'axios';
import { baseUrl } from '../../../../../environment'; // Ensure this path is correct

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
  };

  useEffect(() => {
    // Fetch data from the new, public endpoint
    axios
      .get(`${baseUrl}/school/gallery`)
      .then((resp) => {
        setSchools(Array.isArray(resp.data.data) ? resp.data.data : []);
      })
      .catch((e) => {
        console.log('ERROR fetching school gallery:', e);
        setSchools([]);
      });
  }, []); // This runs once when the component mounts

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
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box sx={{ flex: 1, overflow: 'hidden' }}>
                  <img
                    src={school.school_image}
                    alt={school.school_name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
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

      <Modal open={open} onClose={handleClose} closeAfterTransition>
        <Fade in={open} onExited={() => setSelectedSchool(null)}>
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              bgcolor: 'background.paper',
              boxShadow: 24,
              borderRadius: 2,
              maxWidth: '90%',
              maxHeight: '90vh',
              p: { xs: 2, md: 3 },
            }}
          >
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute', top: 8, right: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedSchool && (
              <>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2, textAlign: 'center' }}>
                  {selectedSchool.school_name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={selectedSchool.school_image}
                    alt={selectedSchool.school_name}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      borderRadius: 8,
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              </>
            )}
          </Box>
        </Fade>
      </Modal>
    </>
  );
};

export default Gallery;
