import { Box, Button, CardMedia, TextField, Typography, Paper } from "@mui/material";
import { useFormik } from "formik";
import { registerSchema } from "../../../yupSchema/registerSchema";
import { useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { useNavigate } from "react-router-dom";
import './Register.css';

export default function Register() {
    const [message, setMessage] = useState("");
    const [type, setType] = useState("success");
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const navigate = useNavigate();

    const addImage = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setImageUrl(URL.createObjectURL(selectedFile));
            setFile(selectedFile);
        }
    };

    const resetMessage = () => {
        setMessage("");
    };

    const initialValues = {
        school_name: "",
        email: "",
        owner_name: "",
        password: "",
        confirm_password: ""
    };

    const Formik = useFormik({
        initialValues: initialValues,
        validationSchema: registerSchema,
        onSubmit: (values) => {
            if (!file) {
                setMessage("Please provide an image.");
                setType("error");
                return; // Stop the submission if no file is selected
            }

            const fd = new FormData();
            // ✅ Explicitly append each field to ensure correct parsing
            fd.append("image", file);
            fd.append("school_name", values.school_name);
            fd.append("email", values.email);
            fd.append("owner_name", values.owner_name);
            fd.append("password", values.password);

            axios.post(`${baseUrl}/school/register`, fd)
                .then(resp => {
                    setMessage(resp.data.message);
                    setType("success");
                    setFile(null);
                    Formik.resetForm();
                    setTimeout(() => {
                        navigate("/"); // Redirect to login page after success
                    }, 2000);
                })
                .catch(e => {
                    // Provide a more specific error message if available
                    const errorMessage = e.response?.data?.message || "Registration failed. Please try again.";
                    setMessage(errorMessage);
                    setType("error");
                });
        }
    });

    return (
        <Box
            component={'div'}
            sx={{
                width: "100%",
                minHeight: "100vh",
                background: "linear-gradient(to bottom, #320e3b, #6c0ba9)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: 2,
            }}
        >
            {message && <CustomizedSnackbars reset={resetMessage} type={type} message={message} />}

            <Paper
                elevation={6}
                sx={{
                    borderRadius: "20px",
                    padding: "30px",
                    width: "100%",
                    maxWidth: "400px",
                    position: "relative",
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    textAlign: "center"
                }}
            >
                {/* Decorative face */}
                <Box
                    sx={{
                        position: "absolute",
                        top: "-30px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "100px",
                        height: "100px",
                        background: "linear-gradient(to bottom, #a600ff, #d17aff)",
                        borderRadius: "50%",
                        zIndex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <Box sx={{ width: "10px", height: "10px", background: "#000", borderRadius: "50%", margin: "4px" }} />
                    <Box sx={{ width: "10px", height: "10px", background: "#000", borderRadius: "50%", margin: "4px" }} />
                    <Box sx={{ width: "6px", height: "6px", background: "#000", borderRadius: "50%", margin: "2px" }} />
                </Box>

                <Typography variant="h5" sx={{ marginTop: "60px", fontWeight: "bold", color: "#333" }}>
                    Register School
                </Typography>

                <Box component="form" noValidate autoComplete="off" onSubmit={Formik.handleSubmit}>
                    <TextField
                        fullWidth
                        sx={{ marginTop: 2 }}
                        label="School Name"
                        variant="outlined"
                        name="school_name"
                        value={Formik.values.school_name}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        error={Formik.touched.school_name && Boolean(Formik.errors.school_name)}
                        helperText={Formik.touched.school_name && Formik.errors.school_name}
                    />

                    <TextField
                        fullWidth
                        sx={{ marginTop: 2 }}
                        label="Email"
                        variant="outlined"
                        name="email"
                        value={Formik.values.email}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        error={Formik.touched.email && Boolean(Formik.errors.email)}
                        helperText={Formik.touched.email && Formik.errors.email}
                    />

                    <TextField
                        fullWidth
                        sx={{ marginTop: 2 }}
                        label="Your Name"
                        variant="outlined"
                        name="owner_name"
                        value={Formik.values.owner_name}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        error={Formik.touched.owner_name && Boolean(Formik.errors.owner_name)}
                        helperText={Formik.touched.owner_name && Formik.errors.owner_name}
                    />

                    <TextField
                        fullWidth
                        sx={{ marginTop: 2 }}
                        label="Password"
                        type="password"
                        variant="outlined"
                        name="password"
                        value={Formik.values.password}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        error={Formik.touched.password && Boolean(Formik.errors.password)}
                        helperText={Formik.touched.password && Formik.errors.password}
                    />

                    <TextField
                        fullWidth
                        sx={{ marginTop: 2 }}
                        label="Confirm Password"
                        type="password"
                        variant="outlined"
                        name="confirm_password"
                        value={Formik.values.confirm_password}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        error={Formik.touched.confirm_password && Boolean(Formik.errors.confirm_password)}
                        helperText={Formik.touched.confirm_password && Formik.errors.confirm_password}
                    />

                    <Box sx={{ marginTop: 2 }}>
                        <Button
                            variant="contained"
                            component="label"
                        >
                            Upload School Image
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={addImage}
                            />
                        </Button>
                        {file && (
                            <CardMedia component="img" height="150" image={imageUrl} alt="Preview" sx={{ marginTop: 2, borderRadius: 2 }} />
                        )}
                    </Box>

                    <Button
                        type="submit"
                        variant="contained"
                        sx={{
                            backgroundColor: "#1976d2",
                            color: "#fff",
                            marginTop: 2,
                            borderRadius: "10px",
                            width: "100%"
                        }}
                    >
                        Submit
                    </Button>
                </Box>
            </Paper>
        </Box>
    );
}
