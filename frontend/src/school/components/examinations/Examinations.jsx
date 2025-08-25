/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  CardMedia,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";

import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

import { useEffect, useState } from "react";
import { useFormik } from "formik";
import axios from "axios";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { baseUrl } from "../../../environment";
import { examSchema } from "../../../yupSchema/examinationSchema";
import { convertDate } from "../../../utilityFunctions";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

export default function Examinations() {
  const [isEditExam, setEditExam] = useState(false);
  const [examForm, setExamForm] = useState(false);
  const [examEditId, setExamEditId] = useState(null);

  const [allClasses, setAllClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [examinations, setExaminations] = useState([]);
 const [submitted,  setSubmitted] = useState("not submitted")
  const [allSubjects, setAllSubjects] = useState([]);


  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  const resetMessage = () => {
    setMessage("");
  };
  
const handleMessage=(type, message)=>{
  console.log("Called")
setType(type);
setMessage(message)
}


  const handleNewExam = () => {
    cancelEditExam()
    setExamForm(true);
  };

  const handleEditExam = (id) => {
    setExamEditId(id);
    setEditExam(true);
    setExamForm(true);
    axios
      .get(`${baseUrl}/examination/single/${id}`)
      .then((resp) => {
        examFormik.setFieldValue("exam_date", dayjs(resp.data.data.examDate));
        examFormik.setFieldValue("subject", resp.data.data.subject);
        examFormik.setFieldValue("exam_type", resp.data.data.examType);
      })
      .catch((e) => {
        handleMessage("error", e.response.data.message);

      });
  };

  const handleDeleteExam = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/examination/delete/${id}`)
        .then((resp) => {
          handleMessage("success", resp.data.message);
        })
        .catch((e) => {
          handleMessage("error", e.response.data.message);
        });
    }
  };

  const cancelEditExam = () => {
    setExamForm(false);
    setExamEditId(null);
    examFormik.resetForm();
  };

  const examFormik = useFormik({
    initialValues: { exam_date: "", subject: "", exam_type: "" },
    validationSchema: examSchema,
    onSubmit: (values) => {
      if (isEditExam) {
        axios
          .patch(`${baseUrl}/examination/update/${examEditId}`, { ...values })
          .then((resp) => {
            handleMessage("success", resp.data.message);
          })
          .catch((e) => {
            handleMessage("error", e.response.data.message);
          });
      } else {
        console.log("Values", values)
        console.log("selected Class", selectedClass)
        axios
          .post(`${baseUrl}/examination/new`, {
            ...values,
            class_id: selectedClass,
          })
          .then((resp) => {
            handleMessage("success", resp.data.message);
            console.log("success", resp)
          })
          .catch((e) => {
          console.log(e,"error")
            handleMessage("error", e.response.data.message);
          });
      }
      cancelEditExam();
      setSubmitted("Submitted")
    },
  });

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const fetchExaminations = () => {
    axios
      .get(`${baseUrl}/examination/fetch-class/${selectedClass}`)
      .then((resp) => {
        console.log("ALL Examination", resp);
        setExaminations(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching  Examinstions.");
      });
  };
  useEffect(() => {
    if (selectedClass) {
      fetchExaminations();
    }
  }, [selectedClass,message]);

  const fetchAllSubjects = () => {
    axios
      .get(`${baseUrl}/subject/fetch-all`, { params: {} })
      .then((resp) => {
        console.log("ALL subjects", resp);
        setAllSubjects(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching  all  Classes");
      });
  };

  const fetchStudentClass = () => {
    axios
      .get(`${baseUrl}/class/fetch-all`)
      .then((resp) => {
        setAllClasses(resp.data.data);
        console.log("Class", resp.data);
        setSelectedClass(resp.data.data[0]._id);
      })
      .catch((e) => {
        console.log("Error in fetching student Class", e);
      });
  };
  useEffect(() => {
    fetchStudentClass();
    fetchAllSubjects();
  }, []);

return (
  <>
    {message && (
      <CustomizedSnackbars reset={resetMessage} type={type} message={message} />
    )}

    <Box sx={{ mb: 3 }}>
      <Typography variant="h2" sx={{ textAlign: "center", fontWeight: 600 }}>
        Examinations
      </Typography>
    </Box>

    <Paper
      sx={{
        px: 4,
        py: 3,
        mb: 4,
        mx: "auto",
        borderRadius: 4,
        maxWidth: 1000,
        boxShadow: 3,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: 6,
    },
      }}
    >
      <FormControl fullWidth>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Select Class:
        </Typography>
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

    {examForm && (
      <Paper sx={{ p: 3, mb: 4, mx: "auto", borderRadius: 4, maxWidth: 1000, boxShadow: 3
  }}>
        <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
          {isEditExam ? "Edit Examination" : "Assign Examination"}
        </Typography>
        <Box component="form" onSubmit={examFormik.handleSubmit} noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DemoContainer components={["DatePicker"]}>
                  <DatePicker
                    label="Exam Date"
                    name="exam_date"
                    value={dayjs(examFormik.values.exam_date)}
                    onChange={(e) => examFormik.setFieldValue("exam_date", dayjs(e))}
                  />
                </DemoContainer>
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select
                  label="Subject"
                  name="subject"
                  value={examFormik.values.subject}
                  onChange={examFormik.handleChange}
                  onBlur={examFormik.handleBlur}
                >
                  <MenuItem value="">Select Subject</MenuItem>
                  {allSubjects &&
                    allSubjects.map((subject, i) => (
                      <MenuItem key={i} value={subject._id}>
                        {subject.subject_name}
                      </MenuItem>
                    ))}
                </Select>
                {examFormik.touched.subject && examFormik.errors.subject && (
                  <Typography color="error" variant="caption">
                    {examFormik.errors.subject}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Exam Type"
                name="exam_type"
                value={examFormik.values.exam_type}
                onChange={examFormik.handleChange}
                onBlur={examFormik.handleBlur}
                placeholder="(1st Semester, Half yearly etc)"
              />
              {examFormik.touched.exam_type && examFormik.errors.exam_type && (
                <Typography color="error" variant="caption">
                  {examFormik.errors.exam_type}
                </Typography>
              )}
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
            <Button type="submit" variant="contained" color="primary">
              Submit
            </Button>
            <Button variant="contained" sx={{ backgroundColor: "tomato" }} onClick={cancelEditExam}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    )}

    <Paper
      sx={{
        p: 3,
        mb: 5,
        mx: "auto",
        borderRadius: 4,
        maxWidth: 1000,
        boxShadow: 3,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
      transform: "scale(1.02)",
      boxShadow: 6,
    },
      }}
    >
      <Typography variant="h5" sx={{ textAlign: "center", mb: 2, fontWeight: 600 }}>
        Examinations
      </Typography>

      <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Exam Date</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Exam Type
              </TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="center">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {examinations &&
              examinations.map((examination, i) => (
                <TableRow key={i}>
                  <TableCell>{convertDate(examination.examDate)}</TableCell>
                  <TableCell>
                    {examination.subject ? examination.subject.subject_name : "Add One"}
                  </TableCell>
                  <TableCell align="center">{examination.examType}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: "red", color: "#fff" }}
                        onClick={() => handleDeleteExam(examination._id)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="contained"
                        sx={{ backgroundColor: "gold", color: "#000" }}
                        onClick={() => handleEditExam(examination._id)}
                      >
                        Edit
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
        <Button variant="contained" onClick={handleNewExam}>
          + Add Exam
        </Button>
      </Box>
    </Paper>
  </>
);
}