/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
// 1. Import apiClient instead of axios
import apiClient from "../../../apiClient"; // Adjust path if needed
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
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
  const [submitted, setSubmitted] = useState("not submitted");
  const [allSubjects, setAllSubjects] = useState([]);
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");

  const resetMessage = () => {
    setMessage("");
  };

  const handleMessage = (type, message) => {
    setType(type);
    setMessage(message);
  };

  const handleNewExam = () => {
    cancelEditExam();
    setExamForm(true);
  };

  // 2. All functions now use apiClient
  const handleEditExam = (id) => {
    setExamEditId(id);
    setEditExam(true);
    setExamForm(true);
    apiClient
      .get(`/examination/single/${id}`)
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
      apiClient
        .delete(`/examination/delete/${id}`)
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
        apiClient
          .patch(`/examination/update/${examEditId}`, { ...values })
          .then((resp) => {
            handleMessage("success", resp.data.message);
          })
          .catch((e) => {
            handleMessage("error", e.response.data.message);
          });
      } else {
        apiClient
          .post(`/examination/new`, {
            ...values,
            class_id: selectedClass,
          })
          .then((resp) => {
            handleMessage("success", resp.data.message);
          })
          .catch((e) => {
            handleMessage("error", e.response.data.message);
          });
      }
      cancelEditExam();
      setSubmitted("Submitted");
    },
  });

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const fetchExaminations = () => {
    apiClient
      .get(`/examination/fetch-class/${selectedClass}`)
      .then((resp) => {
        setExaminations(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching Examinations.");
      });
  };
  useEffect(() => {
    if (selectedClass) {
      fetchExaminations();
    }
  }, [selectedClass, message]);

  const fetchAllSubjects = () => {
    apiClient
      .get(`/subject/fetch-all`, { params: {} })
      .then((resp) => {
        setAllSubjects(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching all Subjects");
      });
  };

  const fetchStudentClass = () => {
    apiClient
      .get(`/class/fetch-all`)
      .then((resp) => {
        setAllClasses(resp.data.data);
        if (resp.data.data.length > 0) {
          setSelectedClass(resp.data.data[0]._id);
        }
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
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}

      {/* The rest of your JSX remains the same */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ textAlign: "center", fontWeight: 600 }}>
          Examinations
        </Typography>
      </Box>

      {/* Class Selector Paper */}
      <Paper sx={{ px: 4, py: 3, mb: 4, mx: "auto", borderRadius: 4, maxWidth: 1000, boxShadow: 3 }}>
        <FormControl fullWidth>
          <Typography variant="subtitle1" sx={{ mb: 1 }}>Select Class:</Typography>
          <Select value={selectedClass} onChange={handleClassChange}>
            {allClasses.map((value) => (
              <MenuItem key={value._id} value={value._id}>
                {value.class_text}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Exam Form Paper */}
      {examForm && (
        <Paper sx={{ p: 3, mb: 4, mx: "auto", borderRadius: 4, maxWidth: 1000, boxShadow: 3 }}>
          <Typography variant="h6" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
            {isEditExam ? "Edit Examination" : "Assign Examination"}
          </Typography>
          <Box component="form" onSubmit={examFormik.handleSubmit} noValidate autoComplete="off">
            <Grid container spacing={2}>
              {/* Fields for the form */}
            </Grid>
            <Box sx={{ mt: 3, display: "flex", gap: 2 }}>
              <Button type="submit" variant="contained" color="primary">Submit</Button>
              <Button variant="contained" sx={{ backgroundColor: "tomato" }} onClick={cancelEditExam}>Cancel</Button>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Examinations Table Paper */}
      <Paper sx={{ p: 3, mb: 5, mx: "auto", borderRadius: 4, maxWidth: 1000, boxShadow: 3 }}>
        <Typography variant="h5" sx={{ textAlign: "center", mb: 2, fontWeight: 600 }}>
          Scheduled Examinations
        </Typography>
        <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>Exam Date</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Exam Type</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {examinations.map((examination, i) => (
                <TableRow key={i}>
                  <TableCell>{convertDate(examination.examDate)}</TableCell>
                  <TableCell>{examination.subject ? examination.subject.subject_name : "N/A"}</TableCell>
                  <TableCell align="center">{examination.examType}</TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1 }}>
                      <Button variant="contained" sx={{ backgroundColor: "red", color: "#fff" }} onClick={() => handleDeleteExam(examination._id)}>Delete</Button>
                      <Button variant="contained" sx={{ backgroundColor: "gold", color: "#000" }} onClick={() => handleEditExam(examination._id)}>Edit</Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
          <Button variant="contained" onClick={handleNewExam}>+ Add Exam</Button>
        </Box>
      </Paper>
    </>
  );
}