/* eslint-disable react-hooks/exhaustive-deps */
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
import { useEffect, useRef, useState } from "react";
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust path if needed
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { studentSchema } from "../../../yupSchema/studentSchema";
import StudentCardAdmin from "../../utility components/student card/StudentCard";

export default function Students() {
    const [studentClasses, setStudentClasses] = useState([]);
    const [students, setStudents] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [params, setParams] = useState({});
    const [message, setMessage] = useState("");
    const [type, setType] = useState("success");
    const fileInputRef = useRef(null);

    const resetMessage = () => setMessage("");

    const addImage = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setImageUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleClass = (e) => {
        const classId = e.target.value;
        setParams(prev => ({ ...prev, student_class: classId || undefined }));
    };

    const handleSearch = (e) => {
        const searchTerm = e.target.value;
        setParams(prev => ({ ...prev, search: searchTerm || undefined }));
    };

    // 2. All functions now use apiClient
    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            apiClient
                .delete(`/student/delete/${id}`)
                .then((resp) => {
                    setMessage(resp.data.message);
                    setType("success");
                })
                .catch((e) => {
                    setMessage(e.response?.data?.message || "Failed to delete student.");
                    setType("error");
                });
        }
    };

    const handleEdit = (id) => {
        setEdit(true);
        apiClient
            .get(`/student/fetch-single/${id}`)
            .then((resp) => {
                const { data } = resp.data;
                Formik.setValues({
                    email: data.email,
                    name: data.name,
                    student_class: data.student_class._id,
                    gender: data.gender,
                    age: data.age,
                    guardian: data.guardian,
                    guardian_phone: data.guardian_phone,
                    password: "", // Password should not be pre-filled
                });
                setImageUrl(data.student_image);
                setEditId(data._id);
            })
            .catch(() => console.log("Error fetching student data for edit."));
    };

    const cancelEdit = () => {
        setEdit(false);
        setEditId(null);
        Formik.resetForm();
        handleClearFile();
    };

    const handleClearFile = () => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
        setFile(null);
        setImageUrl(null);
    };

    const initialValues = {
        name: "", email: "", student_class: "", gender: "", age: "",
        guardian: "", guardian_phone: "", password: "",
    };

    const Formik = useFormik({
        initialValues,
        validationSchema: studentSchema,
        onSubmit: (values) => {
            const fd = new FormData();
            Object.keys(values).forEach((key) => {
                // Don't append empty password on edit
                if (key === 'password' && isEdit && !values.password) return;
                fd.append(key, values[key]);
            });
            if (file) {
                fd.append("image", file);
            }

            const apiCall = isEdit
                ? apiClient.patch(`/student/update/${editId}`, fd)
                : apiClient.post(`/student/register`, fd);

            apiCall
                .then((resp) => {
                    setMessage(resp.data.message);
                    setType("success");
                    cancelEdit();
                })
                .catch((e) => {
                    setMessage(e.response?.data?.message || "Operation failed.");
                    setType("error");
                });
        },
    });

    useEffect(() => {
        const fetchClasses = () => {
            apiClient.get(`/class/fetch-all`)
                .then((resp) => setStudentClasses(resp.data.data))
                .catch(() => console.log("Error fetching student classes."));
        };
        fetchClasses();
    }, []);

    useEffect(() => {
        const fetchStudents = () => {
            apiClient.get(`/student/fetch-with-query`, { params })
                .then((resp) => setStudents(resp.data.data))
                .catch(() => console.log("Error fetching students."));
        };
        fetchStudents();
    }, [message, params]);

  return (
    <>
      {message && (
        <CustomizedSnackbars
          reset={resetMessage}
          type={type}
          message={message}
        />
      )}
      <Box
        sx={{ padding: "40px 10px 20px 10px" }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          component={"div"}
        >
          <Typography variant="h2" >Students</Typography>
        </Box>

        <Box component={"div"} sx={{ padding: "40px" }}>
          <Paper
            sx={{ padding: "20px", margin: "10px" }}
          >
            {isEdit ? (
              <Typography
                variant="h4"
                sx={{ fontWeight: "800", textAlign: "center" }}
              >
                Edit Students
              </Typography>
            ) : (
              <Typography
                variant="h4"
                sx={{ fontWeight: "800", textAlign: "center" }}
              >
                Add New Student
              </Typography>
            )}{" "}
            <Box
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={Formik.handleSubmit}
            >
              {!isEdit && (
                <Box
                  component={"div"}
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Typography style={{ marginRight: "50px" }} variant="h4">
                    Student Pic
                  </Typography>
                  <TextField
                    sx={{ marginTop: "10px" }}
                    id="filled-basic"
                    variant="outlined"
                    name="file"
                    type="file"
                    onChange={(event) => {
                      addImage(event);
                    }}
                  />

                  {file && (
                    <Box sx={{ position: "relative" }} component={"div"}>
                      <CardMedia
                        component={"img"}
                        image={imageUrl}
                        height={"240px"}
                      />
                    </Box>
                  )}
                </Box>
              )}

              <TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="email "
                variant="outlined"
                name="email"
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
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="name "
                variant="outlined"
                name="name"
                value={Formik.values.name}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
              />
              {Formik.touched.name && Formik.errors.name && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {Formik.errors.name}
                </p>
              )}

              <FormControl sx={{ minWidth: "220px", marginTop: "10px" }}>
                <InputLabel id="demo-simple-select-label">Class</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Class"
                  name="student_class"
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                  value={Formik.values.student_class}
                >
                  {studentClass &&
                    studentClass.map((value, i) => {
                      return (
                        <MenuItem key={i} value={value._id}>
                          {value.class_text}
                        </MenuItem>
                      );
                    })}
                </Select>
              </FormControl>
              {Formik.touched.student_class && Formik.errors.student_class && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {Formik.errors.student_class}
                </p>
              )}


<br/>
              <FormControl sx={{ minWidth: "220px", marginTop: "10px" }}>
                <InputLabel id="demo-simple-select-label">Gender</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Gender"
                  name="gender"
                  onChange={Formik.handleChange}
                  onBlur={Formik.handleBlur}
                  value={Formik.values.gender}
                >
                  <MenuItem value={""}>Select Gender</MenuItem>
                  <MenuItem value={"male"}>Male</MenuItem>
                  <MenuItem value={"female"}>Female</MenuItem>
                  <MenuItem value={"other"}>Other</MenuItem>
                </Select>
              </FormControl>
              {Formik.touched.gender && Formik.errors.gender && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {Formik.errors.gender}
                </p>
              )}


<TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="Age "
                variant="outlined"
                name="age"
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
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="Guardian "
                variant="outlined"
                name="guardian"
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
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="Guardian Phone "
                variant="outlined"
                name="guardian_phone"
                value={Formik.values.guardian_phone}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
              />
              {Formik.touched.guardian_phone &&
                Formik.errors.guardian_phone && (
                  <p style={{ color: "red", textTransform: "capitalize" }}>
                    {Formik.errors.guardian_phone}
                  </p>
                )}

                {!isEdit && <>
                
              <TextField
                fullWidth
                sx={{ marginTop: "10px" }}
                id="filled-basic"
                label="Password "
                variant="outlined"
                name="password"
                value={Formik.values.password}
                onChange={Formik.handleChange}
                onBlur={Formik.handleBlur}
              />
              {Formik.touched.password && Formik.errors.password && (
                <p style={{ color: "red", textTransform: "capitalize" }}>
                  {Formik.errors.password}
                </p>
              )}
                </>}


              <Box sx={{ marginTop: "10px" }} component={"div"}>
                <Button
                  type="submit"
                  sx={{ marginRight: "10px" }}
                  variant="contained"
                >
                  Submit
                </Button>
                {isEdit && (
                  <Button
                    sx={{ marginRight: "10px" }}
                    variant="outlined"
                    onClick={cancelEdit}
                  >
                    Cancel Edit
                  </Button>
                )}
              </Box>
            </Box>
          </Paper>
        </Box>

        <Box
          sx={{
            padding: "5px",
            minWidth: 120,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "20px"
          }}
        >
          <FormControl
            sx={{
              minWidth: "200px",
              padding: "5px",
            }}
          >
            <InputLabel id="demo-simple-select-label">Student Class</InputLabel>
            <Select
              labelId="demo-simple-select-label"
              id="demo-simple-select"
              label="Class"
              onChange={handleClass}
            >
              <MenuItem value={""}>Select Class</MenuItem>
              {studentClass &&
                studentClass.map((value, i) => {
                  return (
                    <MenuItem key={i} value={value._id}>
                      {value.class_text}
                    </MenuItem>
                  );
                })}
            </Select>
          </FormControl>

          <TextField
            id="filled-basic"
            label="Search Name  .. "
            onChange={handleSearch}
          />
        </Box>

        <Box sx={{display:"flex",  flexDirection:"row", flexWrap:"wrap", justifyContent:"space-between"}}>
          {students &&
            students.map((student, i) => {
              return (
                <StudentCardAdmin
                  key={i}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  student={student}
                />
              );
            })}
        </Box>
      </Box>
    </>
  );
}
