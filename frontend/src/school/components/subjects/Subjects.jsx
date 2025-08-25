/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  Button,
  Paper,
  TextField,
  Typography,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Table,
  TableContainer,
} from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
// 1. Import apiClient instead of axios
import apiClient from "../../../apiClient"; // Adjust path if needed
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { subjectSchema } from "../../../yupSchema/subjectSchema";

export default function Subject() {
  const [studentSubject, setStudentSubject] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // 2. All functions now use apiClient
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      apiClient
        .delete(`/subject/delete/${id}`)
        .then((resp) => {
          setMessage(resp.data.message);
          setType("success");
        })
        .catch((e) => {
          setMessage(e.response.data.message);
          setType("error");
        });
    }
  };

  const handleEdit = (id) => {
    setEdit(true);
    apiClient
      .get(`/subject/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("subject_name", resp.data.data.subject_name);
        Formik.setFieldValue("subject_codename", resp.data.data.subject_codename);
        setEditId(resp.data.data._id);
      })
      .catch((e) => {
        console.log("Error in fetching edit data.");
      });
  };

  const cancelEdit = () => {
    setEdit(false);
    Formik.resetForm();
  };

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const resetMessage = () => {
    setMessage("");
  };

  const initialValues = {
    subject_name: "",
    subject_codename: "",
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: subjectSchema,
    onSubmit: (values) => {
      if (isEdit) {
        apiClient
          .patch(`/subject/update/${editId}`, { ...values })
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            cancelEdit();
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
          });
      } else {
        apiClient
          .post(`/subject/create`, { ...values })
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            Formik.resetForm();
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
          });
      }
    },
  });

  const fetchStudentsSubject = () => {
    apiClient
      .get(`/subject/fetch-all`)
      .then((resp) => {
        setStudentSubject(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching subjects data", e);
      });
  };

  useEffect(() => {
    fetchStudentsSubject();
  }, [message]);

  return (
    <>
      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}
      <Box>
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <Typography className="hero-text" variant="h2">
            Subject
          </Typography>
        </Box>

        <Box>
          <Paper
            elevation={4}
            sx={{
              padding: "30px",
              margin: "20px auto",
              borderRadius: "20px",
              maxWidth: "600px",
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: "800", textAlign: "center", mb: 2 }}>
              {isEdit ? "Edit Subject" : "Add New Subject"}
            </Typography>

            <Box component="form" noValidate autoComplete="off" onSubmit={Formik.handleSubmit}>
              <TextField
                fullWidth
                sx={{ marginTop: "10px", borderRadius: "10px" }}
                label="Subject Name"
                variant="outlined"
                name="subject_name"
                value={Formik.values.subject_name}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
              />
              {Formik.touched.subject_name && Formik.errors.subject_name && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {Formik.errors.subject_name}
                </p>
              )}

              <TextField
                fullWidth
                sx={{ marginTop: "10px", borderRadius: "10px" }}
                label="Subject Codename"
                variant="outlined"
                name="subject_codename"
                value={Formik.values.subject_codename}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
              />
              {Formik.touched.subject_codename && Formik.errors.subject_codename && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {Formik.errors.subject_codename}
                </p>
              )}

              <Box sx={{ marginTop: "20px", textAlign: "center" }}>
                <Button type="submit" sx={{ marginRight: "10px", borderRadius: "20px" }} variant="contained">
                  Submit
                </Button>
                {isEdit && (
                  <Button sx={{ borderRadius: "20px" }} variant="outlined" onClick={cancelEdit}>
                    Cancel Edit
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ paddingX: 2, mt: 4 }}>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: "center" }}>
            Added Subjects
          </Typography>

          <TableContainer component={Paper} sx={{ borderRadius: "20px" }}>
            <Table sx={{ minWidth: 650 }} aria-label="subjects table">
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
                  <TableCell>Subject Name</TableCell>
                  <TableCell align="right">Codename</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {studentSubject.map((value, i) => (
                  <TableRow key={i}>
                    <TableCell component="th" scope="row">{value.subject_name}</TableCell>
                    <TableCell align="right">{value.subject_codename}</TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: "flex", justifyContent: "end", gap: 1 }}>
                        <Button
                          variant="contained"
                          sx={{ background: "red", color: "#fff", borderRadius: "10px" }}
                          onClick={() => handleDelete(value._id)}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="contained"
                          sx={{ background: "gold", color: "#222222", borderRadius: "10px" }}
                          onClick={() => handleEdit(value._id)}
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
        </Box>
      </Box>
    </>
  );
}