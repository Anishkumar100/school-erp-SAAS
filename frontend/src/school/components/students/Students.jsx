import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  CardMedia,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import apiClient from "../../../../apiClient";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { studentSchema } from "../../../yupSchema/studentSchema";
import StudentCardAdmin from "../../utility components/student card/StudentCard";

export default function Students() {
  const [studentClass, setStudentClass] = useState([]);
  const [students, setStudents] = useState([]);
  const [isEdit, setEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null); // Independent state for image preview

  // Handle image file selection
  const addImage = (event) => {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setImageUrl(URL.createObjectURL(selectedFile));
    }
  };

  const [params, setParams] = useState({});
  const handleClass = (e) => {
    setParams((prevParams) => ({
      ...prevParams,
      student_class: e.target.value || undefined,
    }));
  };

  const handleSearch = (e) => {
    setParams((prevParams) => ({
      ...prevParams,
      search: e.target.value || undefined,
    }));
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete?")) {
      axios
        .delete(`${baseUrl}/student/delete/${id}`)
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
    axios
      .get(`${baseUrl}/student/fetch-single/${id}`)
      .then((resp) => {
        const data = resp.data.data;
        Formik.setValues({
          email: data.email,
          name: data.name,
          student_class: data.student_class._id,
          gender: data.gender,
          age: data.age,
          guardian: data.guardian,
          guardian_phone: data.guardian_phone,
          password: data.password,
        });
        setImageUrl(data.image); // Assuming response has `image` URL field for preview
        setEditId(data._id);
      })
      .catch(() => console.log("Error in fetching edit data."));
  };

  const cancelEdit = () => {
    setEdit(false);
    Formik.resetForm();
  };

  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const resetMessage = () => setMessage("");

  const initialValues = {
    name: "",
    email: "",
    student_class: "",
    gender: "",
    age: "",
    guardian: "",
    guardian_phone: "",
    password: "",
  };

  const Formik = useFormik({
    initialValues,
    validationSchema: studentSchema,
    onSubmit: (values) => {
      if (isEdit) {
        const fd = new FormData();
        Object.keys(values).forEach((key) => fd.append(key, values[key]));
        if (file) {
          fd.append("image", file, file.name);
        }

        axios
          .patch(`${baseUrl}/student/update/${editId}`, fd)
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
            handleClearFile();
            cancelEdit();
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
          });
      } else {
        if (file) {
          const fd = new FormData();
          fd.append("image", file, file.name);
          Object.keys(values).forEach((key) => fd.append(key, values[key]));

          axios
            .post(`${baseUrl}/student/register`, fd)
            .then((resp) => {
              setMessage(resp.data.message);
              setType("success");
              Formik.resetForm();
              handleClearFile();
            })
            .catch((e) => {
              setMessage(e.response.data.message);
              setType("error");
            });
        } else {
          setMessage("Please provide an image.");
          setType("error");
        }
      }
    },
  });

  const fetchStudentClass = () => {
    axios
      .get(`${baseUrl}/class/fetch-all`)
      .then((resp) => {
        setStudentClass(resp.data.data);
      })
      .catch(() => console.log("Error in fetching student Class"));
  };

  const fetchStudents = () => {
    apiClient // 👈 This is the solution
      .get("/student/fetch-with-query", { params }) // No need for baseUrl
      .then((resp) => {
        setStudents(resp.data.data);
      })
      .catch(() => console.log("Error in fetching students data"));
  };

  useEffect(() => {
    fetchStudents();
    fetchStudentClass();
  }, [message, params]);

  //   CLEARING IMAGE FILE REFENCE FROM INPUT
  const fileInputRef = useRef(null);
  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    setFile(null); // Reset the file state
    setImageUrl(null); // Clear the image preview
  };
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
        <Box sx={{ display: "flex", justifyContent: "center" }}>
          <Typography variant="h2">Students</Typography>
        </Box>

        {/* Centered Add Student Form */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
          <Box sx={{ width: "100%", maxWidth: 600 }}>
            <Paper sx={{ padding: "20px", borderRadius: "20px" }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: "800", textAlign: "center" }}
              >
                {isEdit ? "Edit Student" : "Add New Student"}
              </Typography>

              {/* === Your Formik Form (no changes) === */}
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={Formik.handleSubmit}
              >
                {/* Image input and preview */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    flexWrap: "wrap",
                    mt: 2,
                  }}
                >
                  <Typography sx={{ marginRight: "20px" }} variant="h6">
                    Student Pic
                  </Typography>
                  <TextField
                    id="filled-basic"
                    variant="outlined"
                    name="file"
                    type="file"
                    onChange={addImage}
                    inputRef={fileInputRef}
                  />
                </Box>
                {imageUrl && (
                  <Box sx={{ position: "relative", mt: 2 }}>
                    <CardMedia component="img" image={imageUrl} height="240px" />
                  </Box>
                )}

                {/* === Other Fields (no changes to structure) === */}
                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  label="email"
                  name="email"
                  variant="outlined"
                  value={Formik.values.email}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.email && Formik.errors.email && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.email}
                  </p>
                )}

                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  label="name"
                  name="name"
                  variant="outlined"
                  value={Formik.values.name}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.name && Formik.errors.name && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.name}
                  </p>
                )}

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Class</InputLabel>
                  <Select
                    name="student_class"
                    value={Formik.values.student_class}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  >
                    {studentClass &&
                      studentClass.map((value, i) => (
                        <MenuItem key={i} value={value._id}>
                          {value.class_text}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
                {Formik.touched.student_class && Formik.errors.student_class && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.student_class}
                  </p>
                )}

                <FormControl fullWidth sx={{ mt: 2 }}>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={Formik.values.gender}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                  >
                    <MenuItem value="">Select Gender</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                {Formik.touched.gender && Formik.errors.gender && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.gender}
                  </p>
                )}

                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  label="Age"
                  name="age"
                  variant="outlined"
                  value={Formik.values.age}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.age && Formik.errors.age && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.age}
                  </p>
                )}

                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  label="Guardian"
                  name="guardian"
                  variant="outlined"
                  value={Formik.values.guardian}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.guardian && Formik.errors.guardian && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.guardian}
                  </p>
                )}

                <TextField
                  fullWidth
                  sx={{ mt: 2 }}
                  label="Guardian Phone"
                  name="guardian_phone"
                  variant="outlined"
                  value={Formik.values.guardian_phone}
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                />
                {Formik.touched.guardian_phone && Formik.errors.guardian_phone && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.guardian_phone}
                  </p>
                )}

                {!isEdit && (
                  <>
                    <TextField
                      fullWidth
                      sx={{ mt: 2 }}
                      label="Password"
                      name="password"
                      variant="outlined"
                      value={Formik.values.password}
                      onChange={Formik.handleChange}
                      onBlur={Formik.handleBlur}
                    />
                    {Formik.touched.password && Formik.errors.password && (
                      <p style={{ color: "red", textTransform: "capitalize" }}>
                        {Formik.errors.password}
                      </p>
                    )}
                  </>
                )}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  {isEdit ? "Update Student" : "Register Student"}
                </Button>

                {isEdit && (
                  <Button
                    fullWidth
                    onClick={cancelEdit}
                    variant="outlined"
                    sx={{ mt: 1 }}
                  >
                    Cancel
                  </Button>
                )}
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* Filters Section */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3, gap: 2, flexWrap: "wrap" }}>
          {/* Search Field */}
          <TextField
            label="Search Students"
            variant="outlined"
            onChange={handleSearch}
            sx={{ minWidth: 250 }}
          />

          {/* Class Filter */}
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter by Class</InputLabel>
            <Select
              value={params.student_class || ""}
              onChange={handleClass}
            >
              <MenuItem value="">All Classes</MenuItem>
              {studentClass.map((value, i) => (
                <MenuItem key={i} value={value._id}>
                  {value.class_text}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>


        {/* Student Cards in Flickable (Scrollable) Row */}
        <Box sx={{ mt: 5, overflowX: "auto" }}>
          <Box
            sx={{
              display: "flex",
              gap: "20px",
              width: "max-content",
              padding: "10px",
            }}
          >
            {students.length > 0 &&
              students.map((value, i) => (
                <StudentCardAdmin
                  key={i}
                  student={value}
                  handleDelete={handleDelete}
                  handleEdit={handleEdit}
                />
              ))}
          </Box>
        </Box>
      </Box>
    </>
  );

}
