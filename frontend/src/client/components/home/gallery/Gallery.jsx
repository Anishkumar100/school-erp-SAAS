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
import axios from 'axios';
import { baseUrl } from '../../../../environment';

const Gallery = () => {
  const [open, setOpen] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [schools, setSchools] = useState([]);

  const isMobile = useMediaQuery('(max-width:600px)');

  const handleOpen = (school) => {
    setSelectedSchool(school);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedSchool(null);
  };

  useEffect(() => {
    axios
      .get(`${baseUrl}/school/all`)
      .then((resp) => {
        setSchools(resp.data.data);
      })
      .catch((e) => {
        console.log('ERROR', e);
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
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: 6,
                  },
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={`./images/uploaded/school/${school.school_image}`}
                    alt={school.school_name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                      transition: 'transform 0.3s ease',
                    }}
                  />
                </Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    textAlign: 'center',
                    fontWeight: 500,
                    color: 'text.primary',
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

      {/* Modal */}
      <Modal open={open} onClose={handleClose} closeAfterTransition>
        <Fade in={open}>
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
                position: 'absolute',
                top: 8,
                right: 8,
                color: 'grey.600',
                bgcolor: 'rgba(255,255,255,0.7)',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' },
              }}
            >
              <CloseIcon />
            </IconButton>
            {selectedSchool && (
              <>
                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    textAlign: 'center',
                    color: 'text.primary',
                  }}
                >
                  {selectedSchool.school_name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={`./images/uploaded/school/${selectedSchool.school_image}`}
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
