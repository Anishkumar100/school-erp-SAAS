/* eslint-disable react-hooks/exhaustive-deps */
import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Button,
    CardMedia,
    Paper,
    TextField,
    Typography,
  } from "@mui/material";

  import { useFormik } from "formik";
  import { useEffect, useRef, useState } from "react";
  import axios from "axios";
  import { baseUrl } from "../../../environment";
  import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
  import { teacherSchema } from "../../../yupSchema/teacherSchemal";
import TeacherCardAdmin from "../../utility components/teacher card/TeacherCard";
 
  
  export default function Teachers() {
    const [teacherClass, setteacherClass] = useState([]);
    const [teachers, setteachers] = useState([]);
    const [isEdit, setEdit] = useState(false);
    const [editId, setEditId] = useState(null);
  
    const [date, setDate] = useState(null);
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
  
    const addImage = (event) => {
      const file = event.target.files[0];
      setImageUrl(URL.createObjectURL(file));
      console.log("Image", file, event.target.value);
      setFile(file);
    };
  
    const [params, setParams] = useState({});

  
    const handleSearch = (e) => {
      let newParam;
      if (e.target.value !== "") {
        newParam = { ...params, search: e.target.value };
      } else {
        newParam = { ...params };
        delete newParam["search"];
      }
  
      setParams(newParam);
    };
  
    const handleDelete = (id) => {
      if (confirm("Are you sure you want to delete?")) {
        axios
          .delete(`${baseUrl}/teacher/delete/${id}`)
          .then((resp) => {
            setMessage(resp.data.message);
            setType("success");
          })
          .catch((e) => {
            setMessage(e.response.data.message);
            setType("error");
            console.log("Error, deleting", e);
          });
      }
    };
    const handleEdit = (id) => {
      console.log("Handle  Edit is called", id);
      setEdit(true);
      axios
        .get(`${baseUrl}/teacher/fetch-single/${id}`)
        .then((resp) => {
          Formik.setFieldValue("email", resp.data.data.email);
          Formik.setFieldValue("name", resp.data.data.name);
          Formik.setFieldValue("qualification", resp.data.data.qualification)
          Formik.setFieldValue("gender", resp.data.data.gender)
          Formik.setFieldValue("age", resp.data.data.age);
          Formik.setFieldValue("password", resp.data.data.password)
          setEditId(resp.data.data._id);
        })
        .catch((e) => {
          console.log("Error  in fetching edit data.");
        });
    };
  
    const cancelEdit = () => {
      setEdit(false);
      Formik.resetForm()
    };

    //   CLEARING IMAGE FILE REFENCE FROM INPUT
  const fileInputRef = useRef(null);
  const handleClearFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
    setFile(null); // Reset the file state
    setImageUrl(null); // Clear the image preview
  };

  
    //   MESSAGE
    const [message, setMessage] = useState("");
    const [type, setType] = useState("succeess");
  
    const resetMessage = () => {
      setMessage("");
    };
  
    const initialValues = {
        email: "",
        name:  "",
        qualification:  "",
        gender:  "",
        age: "",
        password: ""
    };

    const Formik = useFormik({
      initialValues: initialValues,
      validationSchema: teacherSchema,
      onSubmit: (values) => {
        console.log("teacher calls admin Formik values", values);
        if (isEdit) {

            const fd = new FormData();
            Object.keys(values).forEach((key) => fd.append(key, values[key]));
            if (file) {
              fd.append("image", file, file.name);
            }
    
            axios
              .patch(`${baseUrl}/teacher/update/${editId}`, fd)
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
            // const fd = new FormData();
            // fd.append("image", file, file.name);
            // fd.append('email', values.email);
            // fd.append("name", values.name);
            // fd.append("qualification", values.qualification);
            // fd.append("age", values.age);
            // fd.append("gender", values.gender);
            // fd.append("password", values.password)
            const fd = new FormData();
            fd.append("image", file, file.name);
            Object.keys(values).forEach((key) => fd.append(key, values[key]));
  
            axios
              .post(`${baseUrl}/teacher/register`, fd)
              .then((resp) => {
                console.log("Response after submitting admin teacher", resp);
                setMessage(resp.data.message);
                setType("success");
                handleClearFile()
              })
              .catch((e) => {
                setMessage(e.response.data.message);
                setType("error");
                console.log("Error, response admin teacher calls", e);
              });
            Formik.resetForm();
            setFile(null);
          } else {
            setMessage("Please provide image.");
            setType("error");
          }
        }
      },
    });
  
    const [month, setMonth] = useState([]);
    const [year, setYear] = useState([]);
    const fetchteacherClass = () => {
      // axios
      //   .get(`${baseUrl}/teacher/get-month-year`)
      //   .then((resp) => {
      //     console.log("Fetching month and year.", resp);
      //     setMonth(resp.data.month);
      //     setYear(resp.data.year);
      //   })
      //   .catch((e) => {
      //     console.log("Error in fetching month and year", e);
      //   });
    };
  
    const fetchteachers = () => {
      axios
        .get(`${baseUrl}/teacher/fetch-with-query`, { params: params })
        .then((resp) => {
          console.log("Fetching data in  teacher Calls  admin.", resp);
          setteachers(resp.data.data);
        })
        .catch((e) => {
          console.log("Error in fetching teacher calls admin data", e);
        });
    };
    useEffect(() => {
      fetchteachers();
      // fetchteacherClass();
    }, [message, params]);
    return (
      <>
        <Box sx={{ padding: "40px 10px 20px 10px" }}>
          {message && (
            <CustomizedSnackbars reset={resetMessage} type={type} message={message} />
          )}
    
          <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
            <Typography
              variant="h3"
              sx={(theme) => ({
                fontWeight: "bold",
                color: theme.palette.text.primary,
              })}
            >
              Teachers
            </Typography>
          </Box>
    
          <Paper
            elevation={3}
            sx={(theme) => ({
              maxWidth: 500,
              mx: "auto",
              p: 4,
              borderRadius: "20px",
              backgroundColor:
                theme.palette.mode === "dark" ? "#1f1f1f" : "#f5f5f5",
              color: theme.palette.text.primary,
            })}
          >
            <Typography
              variant="h5"
              sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}
            >
              {isEdit ? "Edit Teacher" : "Add New Teacher"}
            </Typography>
    
            <Box
              component="form"
              noValidate
              autoComplete="off"
              onSubmit={Formik.handleSubmit}
            >
              <Typography variant="body1" sx={{ mb: 1 }}>
                Teacher Pic
              </Typography>
    
              <TextField
                fullWidth
                type="file"
                name="file"
                inputRef={fileInputRef}
                onChange={addImage}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />
    
              {file && (
                <CardMedia
                  component="img"
                  image={imageUrl}
                  height="200"
                  sx={{ borderRadius: "12px", objectFit: "cover", mb: 2 }}
                />
              )}
    
              {["email", "name", "qualification", "age", "password"].map((field) =>
                !isEdit && field === "password" ? (
                  <TextField
                    key={field}
                    fullWidth
                    type="password"
                    label="Password"
                    name="password"
                    value={Formik.values.password}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                    sx={{ mb: 2 }}
                  />
                ) : field !== "password" ? (
                  <TextField
                    key={field}
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={field}
                    value={Formik.values[field]}
                    onChange={Formik.handleChange}
                    onBlur={Formik.handleBlur}
                    sx={{ mb: 2 }}
                  />
                ) : null
              )}
    
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  label="Gender"
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
    
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{
                  mt: 1,
                  mb: 2,
                  py: 1.5,
                  borderRadius: "10px",
                  fontWeight: "bold",
                }}
              >
                Submit
              </Button>
    
              {isEdit && (
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={cancelEdit}
                  sx={{
                    py: 1.5,
                    borderRadius: "10px",
                  }}
                >
                  Cancel Edit
                </Button>
              )}
            </Box>
          </Paper>
    
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <TextField
              label="Search Name ..."
              onChange={handleSearch}
              sx={{ borderRadius: "12px" }}
            />
          </Box>
    
          <Box
            sx={{
              mt: 4,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 2,
            }}
          >
            {teachers &&
              teachers.map((teacher, i) => (
                <TeacherCardAdmin
                  key={i}
                  handleEdit={handleEdit}
                  handleDelete={handleDelete}
                  teacher={teacher}
                />
              ))}
          </Box>
        </Box>
      </>
    );
    }
  