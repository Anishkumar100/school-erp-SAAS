/* eslint-disable react-hooks/exhaustive-deps */
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
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
  IconButton,
} from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust path if needed
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { classSchema } from "../../../yupSchema/classSchema";
import { Link } from "react-router-dom";

import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Class() {
  const [studentClass, setStudentClass] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  // 2. All functions now use apiClient
  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      apiClient
        .delete(`/class/delete/${id}`)
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
      .get(`/class/fetch-single/${id}`)
      .then((resp) => {
        Formik.setFieldValue("class_num", resp.data.data.class_num);
        Formik.setFieldValue("class_text", resp.data.data.class_text);
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
    class_num: "",
    class_text: ""
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: classSchema,
    onSubmit: (values) => {
      if (isEdit) {
        apiClient
          .patch(`/class/update/${editId}`, values)
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
          .post(`/class/create`, values)
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

  const fetchStudentClasses = () => {
    apiClient
      .get(`/class/fetch-all`)
      .then((resp) => {
        setStudentClass(resp.data.data);
      })
      .catch((e) => {
        console.log("Error in fetching classes data", e);
      });
  };

  useEffect(() => {
    fetchStudentClasses();
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
      <Box sx={{ padding: "40px 10px 20px 10px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          component={"div"}
        >
          <Typography className="text-beautify2 hero-text" variant="h2">Class</Typography>
        </Box>

        <Box component={"div"} sx={{ display: 'flex', justifyContent: 'center', px: 2 }}>
          <Paper sx={{ padding: "30px", width: "100%", maxWidth: "600px", borderRadius: "16px" }}>
            <Typography variant="h4" sx={{ fontWeight: "800", textAlign: "center" }}>
              {isEdit ? "Edit Class" : "Add New Class"}
            </Typography>
            <Box component="form" noValidate autoComplete="off" onSubmit={Formik.handleSubmit}>
              <TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                label="Class Text"
                variant="outlined"
                name="class_text"
                value={Formik.values.class_text}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.class_text && Boolean(Formik.errors.class_text)}
                helperText={Formik.touched.class_text && Formik.errors.class_text}
              />
              <TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                label="Class Number"
                variant="outlined"
                name="class_num"
                value={Formik.values.class_num}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
                error={Formik.touched.class_num && Boolean(Formik.errors.class_num)}
                helperText={Formik.touched.class_num && Formik.errors.class_num}
              />
              <Box sx={{ marginTop: "10px" }}>
                <Button type="submit" sx={{ marginRight: "10px" }} variant="contained">
                  Submit
                </Button>
                {isEdit && (
                  <Button variant="outlined" onClick={cancelEdit}>
                    Cancel Edit
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, textAlign: "center" }}>
            Added Classes
          </Typography>

          <Box
            sx={{
              display: "flex",
              overflowX: "auto",
              gap: 2,
              px: 2,
              py: 1,
            }}
          >
            {studentClass.map((value) => (
              <Paper
                key={value._id}
                sx={{
                  p: 2,
                  minWidth: "250px",
                  flexShrink: 0,
                  borderRadius: "12px",
                  transition: "transform 0.3s ease-in-out",
                  '&:hover': {
                    transform: "scale(1.05)",
                  },
                }}
              >
                <Typography variant="h6">Class: {value.class_text} [{value.class_num}]</Typography>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                  <IconButton onClick={() => handleEdit(value._id)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(value._id)} color="secondary">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}
