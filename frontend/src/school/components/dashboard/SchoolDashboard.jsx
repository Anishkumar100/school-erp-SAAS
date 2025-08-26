import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Paper, CardMedia, IconButton, TextField, Button } from "@mui/material";
import Grid2 from "@mui/material/Grid2"; // Importing Grid2
import { Bar } from "react-chartjs-2";
import PreviewIcon from '@mui/icons-material/Preview';

// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust path if needed

// ChartJS setup
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import styled from "@emotion/styled";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from '@mui/icons-material/Visibility';

import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "#fff",
  minWidth: "400px",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

const SchoolDashboard = () => {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [schoolDetails, setSchoolDetails] = useState(null);
  const [schoolName, setSchoolName] = useState('');
  const [schooImage, setSchoolImage] = useState('');
  const [schoolEdit, setSchoolEdit] = useState(false);
  const [preview, setPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const resetMessage = () => setMessage("");

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 2. Use apiClient for all requests
        const studentRes = await apiClient.get("/student/fetch-with-query", { params: {} });
        const teacherRes = await apiClient.get("/teacher/fetch-with-query", { params: {} });
        const classesRes = await apiClient.get("/class/fetch-all");
        const subjectsRes = await apiClient.get("/subject/fetch-all");
        const schoolData = await apiClient.get("/school/fetch-single");

        setSchoolDetails(schoolData.data.data);
        setSchoolName(schoolData.data.data.school_name);
        setSchoolImage(schoolData.data.data.school_image)
        setTotalStudents(studentRes.data.data.length);
        setTotalTeachers(teacherRes.data.data.length);
        setClasses(classesRes.data.data);
        setSubjects(subjectsRes.data.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // Fallback to dummy data on error if needed
      }
    };
    fetchData();
  }, [message]);

  // Data for Classes and Subjects Chart
  const classesData = {
    labels: classes.map((classObj) => classObj.class_text),
    datasets: [
      {
        label: "Classes",
        data: classes.map(() => 1),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
      },
    ],
  };

  const subjectsData = {
    labels: subjects.map((subject) => subject.subject_name),
    datasets: [
      {
        label: "Subjects",
        data: subjects.map(() => 1),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      },
    ],
  };

  const handleSchoolEdit = () => {
    setSchoolEdit(true);
    setImageUrl(null);
  };

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  const addImage = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const fileInputRef = useRef(null);
  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setFile(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("school_name", schoolName);
    if (file) {
      fd.append("image", file, file.name);
    }
    // 3. Use apiClient for the update request
    apiClient
      .patch("/school/update", fd)
      .then((resp) => {
        setMessage(resp.data.message);
        setType("success");
        handleClearFile();
        setSchoolEdit(false);
      })
      .catch((e) => {
        setMessage(e.response.data.message);
        setType("error");
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}
      {schoolEdit && (
        <Paper sx={{ maxWidth: '780px', margin: "auto", padding: "10px", marginTop: "120px" }}>
          <Box component="form" noValidate autoComplete="off">
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ marginRight: "50px" }} variant="h4"> School Pic </Typography>
              <TextField name="file" type="file" onChange={addImage} inputRef={fileInputRef} />
              {imageUrl && <CardMedia component="img" sx={{ marginTop: '10px' }} image={imageUrl} height="440px" />}
            </Box>
            <TextField
              fullWidth
              sx={{ marginTop: "10px" }}
              value={schoolName}
              label="School Name"
              variant="outlined"
              onChange={e => { setSchoolName(e.target.value) }}
            />
            <Box>
              <Button onClick={handleSubmit} variant="outlined" sx={{ marginTop: "10px", marginRight: '5px' }}>
                Submit
              </Button>
              <Button onClick={() => { setSchoolEdit(false) }} variant="outlined" sx={{ marginTop: "10px" }}>
                Cancel
              </Button>
            </Box>
          </Box>
        </Paper>
      )}

      <Typography variant="h4" gutterBottom>
        Dashboard {schoolDetails && `[ ${schoolDetails.school_name} ]`}
      </Typography>

      {/* ... The rest of your component remains the same ... */}
       <Grid2 container spacing={3}>
        {/* Total Students */}
        <Grid2 xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Total Students</Typography>
              <Typography variant="h4">{totalStudents}</Typography>
            </Paper>
        </Grid2>
        {/* Total Teachers */}
        <Grid2 xs={12} md={6}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Total Teachers</Typography>
              <Typography variant="h4">{totalTeachers}</Typography>
            </Paper>
        </Grid2>
        {/* Classes Chart */}
        <Grid2 xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Classes Overview</Typography>
              <Bar data={classesData} options={{ responsive: true }} />
            </Paper>
        </Grid2>
        {/* Subjects Chart */}
        <Grid2 xs={12} md={6}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6">Subjects Overview</Typography>
              <Bar data={subjectsData} options={{ responsive: true }} />
            </Paper>
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default SchoolDashboard;