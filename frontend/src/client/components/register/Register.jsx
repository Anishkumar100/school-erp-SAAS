import { Box, Button, CardMedia, TextField, Typography, Paper } from "@mui/material";
import { useFormik } from "formik";
import { registerSchema } from "../../../yupSchema/registerSchema";
import { useState } from "react";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { useNavigate } from "react-router-dom";
import './Register.css';

export default function Register() {
    const [message, setMessage] = useState("");
    const [type, setType] = useState("success");
    const [file, setFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const navigate = useNavigate()

    const addImage = (event) => {
        const file = event.target.files[0];
        setImageUrl(URL.createObjectURL(file));
        setFile(file);
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
            if (file) {
                const fd = new FormData();
                fd.append("image", file, file.name);

                // 👇 Append array-style fields so backend can access fields.xxx[0]
                fd.append("school_name[]", values.school_name);
                fd.append("email[]", values.email);
                fd.append("owner_name[]", values.owner_name);
                fd.append("password[]", values.password);
                fd.append("confirm_password[]", values.confirm_password);

                axios.post(`${baseUrl}/school/register`, fd)
                    .then(resp => {
                        setMessage(resp.data.message);
                        setType("success");
                        setFile(null);
                        Formik.resetForm();
                        setTimeout(() => {
                            navigate("/");
                        }, 2000);
                    })
                    .catch(e => {
                        setMessage(e.response?.data?.message || "Something went wrong");
                        setType("error");
                    });
            } else {
                setMessage("Please Provide An Image.");
                setType("error");
            }
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
                    />
                    {Formik.touched.school_name && Formik.errors.school_name && (
                        <p style={{ color: "red" }}>{Formik.errors.school_name}</p>
                    )}

                    <TextField
                        fullWidth
                        sx={{ marginTop: 2 }}
                        label="Email"
                        variant="outlined"
                        name="email"
                        value={Formik.values.email}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                    />
                    {Formik.touched.email && Formik.errors.email && (
                        <p style={{ color: "red" }}>{Formik.errors.email}</p>
                    )}

                    <TextField
                        fullWidth
                        sx={{ marginTop: 2 }}
                        label="Your Name"
                        variant="outlined"
                        name="owner_name"
                        value={Formik.values.owner_name}
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                    />
                    {Formik.touched.owner_name && Formik.errors.owner_name && (
                        <p style={{ color: "red" }}>{Formik.errors.owner_name}</p>
                    )}

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
                    />
                    {Formik.touched.password && Formik.errors.password && (
                        <p style={{ color: "red" }}>{Formik.errors.password}</p>
                    )}

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
                    />
                    {Formik.touched.confirm_password && Formik.errors.confirm_password && (
                        <p style={{ color: "red" }}>{Formik.errors.confirm_password}</p>
                    )}

                    <Box sx={{ marginTop: 2 }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={addImage}
                            style={{ marginBottom: 10 }}
                        />
                        {file && (
                            <CardMedia component="img" height="150" image={imageUrl} alt="Preview" />
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
