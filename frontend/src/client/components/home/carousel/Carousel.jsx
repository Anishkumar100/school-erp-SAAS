import React, { useState } from 'react';
import SwipeableViews from 'react-swipeable-views';
import { Typography, Box, IconButton } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const carouselItems = [
  {
    image: 'https://cdn.pixabay.com/photo/2020/12/10/20/40/color-5821297_1280.jpg',
    title: 'Explore Our Classrooms',
    description: 'Engaging and inspiring environments for every student.',
  },
  {
    image: 'https://cdn.pixabay.com/photo/2017/10/10/00/03/child-2835430_1280.jpg',
    title: 'Empowering Students',
    description: 'We believe in fostering the potential of each child.',
  },
  {
    image: 'https://cdn.pixabay.com/photo/2019/09/03/01/51/child-4448370_1280.jpg',
    title: 'Learning Tools',
    description: 'Providing the right tools for effective learning.',
  },
];

const Carousel = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % carouselItems.length);
  };

  const handleBack = () => {
    setActiveIndex((prev) => (prev === 0 ? carouselItems.length - 1 : prev - 1));
  };

  return (
    <Box sx={{ position: 'relative', width: '100%', overflow: 'hidden' }}>
      <SwipeableViews index={activeIndex} onChangeIndex={setActiveIndex}>
        {carouselItems.map((item, idx) => (
          <Box key={idx} sx={{ position: 'relative' }}>
            <img
              src={item.image}
              alt={item.title}
              style={{
                width: '100%',
                height: '70vh',
                minHeight: '400px',
                objectFit: 'cover',
                filter: 'brightness(0.8)',
              }}
            />
            {/* Modern Text Overlay */}
            <Box
              sx={{
                position: 'absolute',
                bottom: { xs: 20, md: 40 },
                left: '50%',
                transform: 'translateX(-50%)',
                width: { xs: '90%', md: '60%' },
                bgcolor: 'rgba(0, 0, 0, 0.5)',
                backdropFilter: 'blur(4px)',
                p: { xs: 2, md: 3 },
                borderRadius: 2,
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: '#fff',
                  mb: 1,
                  textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                }}
              >
                {item.title}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#ddd',
                  lineHeight: 1.5,
                }}
              >
                {item.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </SwipeableViews>

      {/* Navigation Buttons */}
      <IconButton
        onClick={handleBack}
        sx={{
          position: 'absolute',
          top: '50%',
          left: 16,
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(0,0,0,0.4)',
          color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
          borderRadius: '50%',
          zIndex: 2,
        }}
      >
        <ArrowBackIosNewIcon />
      </IconButton>
      <IconButton
        onClick={handleNext}
        sx={{
          position: 'absolute',
          top: '50%',
          right: 16,
          transform: 'translateY(-50%)',
          bgcolor: 'rgba(0,0,0,0.4)',
          color: '#fff',
          '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' },
          borderRadius: '50%',
          zIndex: 2,
        }}
      >
        <ArrowForwardIosIcon />
      </IconButton>
    </Box>
  );
};

export default Carousel;
