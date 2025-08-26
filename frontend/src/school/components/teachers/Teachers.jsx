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
import apiClient from "../../../../apiClient"; // Adjust path if needed
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { teacherSchema } from "../../../yupSchema/teacherSchemal"; // Corrected typo
import TeacherCardAdmin from "../../utility components/teacher card/TeacherCard";
import * as Yup from 'yup'; // Import Yup for the fix

export default function Teachers() {
    const [teachers, setTeachers] = useState([]);
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
            setImageUrl(URL.createObjectURL(selectedFile));
            setFile(selectedFile);
        }
    };

    const handleSearch = (e) => {
        const { value } = e.target;
        setParams(prevParams => {
            const newParams = { ...prevParams };
            if (value) {
                newParams.search = value;
            } else {
                delete newParams.search;
            }
            return newParams;
        });
    };

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this teacher?")) {
            apiClient
                .delete(`/teacher/delete/${id}`)
                .then((resp) => {
                    setMessage(resp.data.message);
                    setType("success");
                })
                .catch((e) => {
                    setMessage(e.response?.data?.message || "Failed to delete teacher.");
                    setType("error");
                });
        }
    };

    const handleEdit = (id) => {
        setEdit(true);
        apiClient
            .get(`/teacher/fetch-single/${id}`)
            .then((resp) => {
                const { data } = resp.data;
                Formik.setValues({
                    email: data.email,
                    name: data.name,
                    qualification: data.qualification,
                    gender: data.gender,
                    age: data.age,
                    password: "" // Password should not be pre-filled
                });
                setImageUrl(data.teacher_image);
                setEditId(data._id);
            })
            .catch((e) => {
                console.log("Error fetching teacher data for edit.");
            });
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
        email: "",
        name: "",
        qualification: "",
        gender: "",
        age: "",
        password: ""
    };

    // ✅ THE FIX: Create a separate, less strict schema for editing
    const editTeacherSchema = teacherSchema.shape({
        password: Yup.string().notRequired(), // Makes password optional for editing
    });

    const Formik = useFormik({
        initialValues: initialValues,
        // Use the correct schema based on whether you are editing or creating
        validationSchema: isEdit ? editTeacherSchema : teacherSchema,
        onSubmit: (values) => {
            const fd = new FormData();
            Object.keys(values).forEach((key) => {
                if (key === 'password' && isEdit && !values.password) return;
                fd.append(key, values[key]);
            });
            if (file) {
                fd.append("image", file);
            }

            const apiCall = isEdit
                ? apiClient.patch(`/teacher/update/${editId}`, fd)
                : apiClient.post(`/teacher/register`, fd);

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

    const fetchTeachers = () => {
        apiClient
            .get(`/teacher/fetch-with-query`, { params })
            .then((resp) => {
                setTeachers(resp.data.data);
            })
            .catch((e) => {
                console.log("Error fetching teachers data", e);
            });
    };

    useEffect(() => {
        fetchTeachers();
    }, [message, params]);

    return (
        <>
            <Box sx={{ padding: "40px 10px 20px 10px" }}>
                {message && <CustomizedSnackbars reset={resetMessage} type={type} message={message} />}
                <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
                    <Typography variant="h3" sx={{ fontWeight: "bold" }}>Teachers</Typography>
                </Box>
                <Paper elevation={3} sx={{ maxWidth: 500, mx: "auto", p: 4, borderRadius: "20px" }}>
                    <Typography variant="h5" sx={{ textAlign: "center", fontWeight: "bold", mb: 2 }}>
                        {isEdit ? "Edit Teacher" : "Add New Teacher"}
                    </Typography>
                    <Box component="form" noValidate autoComplete="off" onSubmit={Formik.handleSubmit}>
                        <TextField fullWidth type="file" name="file" inputRef={fileInputRef} onChange={addImage} sx={{ mb: 2 }} />
                        
                        {/* FIX: Show image preview in edit mode */}
                        {(imageUrl) && (
                            <CardMedia component="img" image={imageUrl} height="200" sx={{ borderRadius: "12px", objectFit: "cover", mb: 2 }} />
                        )}

                        <TextField fullWidth label="Email" name="email" value={Formik.values.email} onChange={Formik.handleChange} onBlur={Formik.handleBlur} error={Formik.touched.email && Boolean(Formik.errors.email)} helperText={Formik.touched.email && Formik.errors.email} sx={{ mb: 2 }} />
                        <TextField fullWidth label="Name" name="name" value={Formik.values.name} onChange={Formik.handleChange} onBlur={Formik.handleBlur} error={Formik.touched.name && Boolean(Formik.errors.name)} helperText={Formik.touched.name && Formik.errors.name} sx={{ mb: 2 }} />
                        <TextField fullWidth label="Qualification" name="qualification" value={Formik.values.qualification} onChange={Formik.handleChange} onBlur={Formik.handleBlur} error={Formik.touched.qualification && Boolean(Formik.errors.qualification)} helperText={Formik.touched.qualification && Formik.errors.qualification} sx={{ mb: 2 }} />
                        <TextField fullWidth label="Age" name="age" value={Formik.values.age} onChange={Formik.handleChange} onBlur={Formik.handleBlur} error={Formik.touched.age && Boolean(Formik.errors.age)} helperText={Formik.touched.age && Formik.errors.age} sx={{ mb: 2 }} />
                        <FormControl fullWidth sx={{ mb: 2 }}>
                            <InputLabel>Gender</InputLabel>
                            <Select name="gender" label="Gender" value={Formik.values.gender} onChange={Formik.handleChange} onBlur={Formik.handleBlur} error={Formik.touched.gender && Boolean(Formik.errors.gender)}>
                                <MenuItem value="male">Male</MenuItem>
                                <MenuItem value="female">Female</MenuItem>
                                <MenuItem value="other">Other</MenuItem>
                            </Select>
                        </FormControl>
                        {!isEdit && (
                             <TextField fullWidth type="password" label="Password" name="password" value={Formik.values.password} onChange={Formik.handleChange} onBlur={Formik.handleBlur} error={Formik.touched.password && Boolean(Formik.errors.password)} helperText={Formik.touched.password && Formik.errors.password} sx={{ mb: 2 }} />
                        )}
                        <Button type="submit" fullWidth variant="contained" sx={{ mt: 1, mb: 2, py: 1.5, borderRadius: "10px", fontWeight: "bold" }}>Submit</Button>
                        {isEdit && <Button fullWidth variant="outlined" onClick={cancelEdit} sx={{ py: 1.5, borderRadius: "10px" }}>Cancel Edit</Button>}
                    </Box>
                </Paper>
                <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
                    <TextField label="Search by Name..." onChange={handleSearch} sx={{ borderRadius: "12px" }} />
                </Box>
                <Box sx={{ mt: 4, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 2 }}>
                    {teachers.map((teacher) => (
                        <TeacherCardAdmin key={teacher._id} handleEdit={handleEdit} handleDelete={handleDelete} teacher={teacher} />
                    ))}
                </Box>
            </Box>
        </>
    );
}
