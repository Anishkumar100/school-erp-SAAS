import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
} from "@mui/material";
import SwipeableViews from "react-swipeable-views";
import Carousel from "./carousel/Carousel";
import Gallery from "./gallery/Gallery";

const Home = () => {
  const testimonials = [
    {
      quote:
        "This school has been a fantastic experience for my children. The faculty is supportive, and the programs are enriching!",
      name: "Parent of Grade 3 Student",
      initial: "P",
    },
    {
      quote:
        "Amazing curriculum and teachers! My child loves going to school every day.",
      name: "Parent of Grade 1 Student",
      initial: "A",
    },
    {
      quote:
        "Great focus on overall development beyond academics. Highly recommended.",
      name: "Parent of Grade 5 Student",
      initial: "G",
    },
  ];

  const [testimonialIndex, setTestimonialIndex] = useState(0);

  // ✅ Autoplay effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000); // change slide every 5 seconds
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <Box sx={{ width: "100%", bgcolor: "background.default" }}>
      {/* Carousel Section */}
      <Carousel />

      {/* Programs Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Our Programs
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          mb={5}
        >
          Designed to empower and inspire students at every stage.
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {["Elementary School", "Middle School", "High School"].map(
            (program) => (
              <Grid item xs={12} sm={6} md={4} key={program}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    p: 3,
                    borderRadius: 4,
                    boxShadow: 4,
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-6px)",
                      boxShadow: 8,
                    },
                  }}
                >
                  <CardContent>
                    <Typography
                      variant="h6"
                      align="center"
                      sx={{ fontWeight: 600 }}
                    >
                      {program}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          )}
        </Grid>
      </Container>

      {/* Gallery Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Typography
          variant="h4"
          align="center"
          gutterBottom
          sx={{ fontWeight: 700 }}
        >
          Registered Schools
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          mb={5}
        >
          See some of the schools that have joined our platform.
        </Typography>
        <Gallery />
      </Container>

      {/* Testimonials Section */}
      <Box
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: "linear-gradient(135deg, #f5f7fa, #c3cfe2)",
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            sx={{ fontWeight: 700 }}
          >
            What Parents Say
          </Typography>

          <SwipeableViews
            index={testimonialIndex}
            onChangeIndex={setTestimonialIndex}
            enableMouseEvents
          >
            {testimonials.map((item, idx) => (
              <Box
                key={idx}
                sx={{
                  mt: 4,
                  p: { xs: 3, md: 4 },
                  bgcolor: "background.paper",
                  borderRadius: 4,
                  boxShadow: 4,
                  textAlign: "center",
                  maxWidth: 700,
                  mx: "auto",
                }}
              >
                {/* Avatar / Initial */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    mx: "auto",
                    mb: 2,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 28,
                    fontWeight: 600,
                    boxShadow: 2,
                  }}
                >
                  {item.initial}
                </Box>

                <Typography
                  variant="h6"
                  color="text.primary"
                  sx={{
                    fontStyle: "italic",
                    mb: 2,
                    fontWeight: 500,
                    px: { xs: 1, md: 3 },
                  }}
                >
                  "{item.quote}"
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  - {item.name}
                </Typography>
              </Box>
            ))}
          </SwipeableViews>

          {/* Dots */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            {testimonials.map((_, idx) => (
              <Box
                key={idx}
                onClick={() => setTestimonialIndex(idx)}
                sx={{
                  width: 10,
                  height: 10,
                  mx: 0.7,
                  bgcolor:
                    testimonialIndex === idx ? "primary.main" : "grey.400",
                  borderRadius: "50%",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                }}
              />
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
