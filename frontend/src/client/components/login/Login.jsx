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
import { useFormik } from "formik";
import { loginSchema } from "../../../yupSchema/loginSchema";
import axios from "axios";
import { baseUrl } from "../../../environment";
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./Login.css";
import { AuthContext } from "../../../context/AuthContext";

export default function Login() {
  const { authenticated, login } = useContext(AuthContext);

  const [loginType, setLoginType] = useState("student");
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");

  const navigate = useNavigate();

  const resetMessage = () => {
    setMessage("");
  };

  const handleSelection = (e) => {
    setLoginType(e.target.value);
    resetInitialValue();
  };

  const resetInitialValue = () => {
    Formik.setFieldValue("email", "");
    Formik.setFieldValue("password", "");
  };

  const initialValues = {
    email: "",
    password: "",
  };

  const Formik = useFormik({
    initialValues: initialValues,
    validationSchema: loginSchema,
    onSubmit: (values) => {
      let url;
      let navUrl;

      if (loginType === "school_owner") {
        url = `${baseUrl}/school/login`;
        navUrl = "/school";
      } else if (loginType === "teacher") {
        url = `${baseUrl}/teacher/login`;
        navUrl = "/teacher";
      } else if (loginType === "student") {
        url = `${baseUrl}/student/login`;
        navUrl = "/student";
      }
      axios
        .post(url, { ...values })
        // ...
        .then((resp) => {
          // ...
          const token = resp.headers["authorization"] || resp.headers["Authorization"];

          if (resp.data.success && token) {
            // 1. Create the data object that AuthContext expects
            const authData = {
              token: token,
              user: resp.data.user
            };

            // 2. Call login with the single, complete data object
            login(authData);

            // 3. Navigate to the new page
            navigate(navUrl);
          }
          //...
          Formik.resetForm();

        })
    .catch((e) => {
      setMessage(e.response?.data?.message || "Something went wrong");
      setType("error");
      console.log("Error in login submit", e.response?.data?.message);
    });

},
  });

return (
  <Box
    sx={{
      width: "100vw",
      height: "100vh",
      backgroundImage:
        "url(https://cdn.pixabay.com/photo/2017/08/12/21/42/back2school-2635456_1280.png)",
      backgroundSize: "cover",
      backgroundPosition: "center",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    {message && (
      <CustomizedSnackbars reset={resetMessage} type={type} message={message} />
    )}

    <Paper
      elevation={10}
      sx={{
        padding: "30px",
        borderRadius: "30px",
        backgroundColor: "#ffffff",
        minWidth: "350px",
        width: "90%",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography variant="h4" sx={{ mb: 2 }}>
        Log In
      </Typography>

      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={Formik.handleSubmit}
        sx={{ width: "100%" }}
      >
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>User Type</InputLabel>
          <Select
            value={loginType}
            label="User Type"
            onChange={handleSelection}
          >
            <MenuItem value={"student"}>Student</MenuItem>
            <MenuItem value={"teacher"}>Teacher</MenuItem>
            <MenuItem value={"school_owner"}>School Owner</MenuItem>
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Email"
          variant="outlined"
          name="email"
          value={Formik.values.email}
          onChange={Formik.handleChange}
          onBlur={Formik.handleBlur}
          sx={{ mb: 1 }}
        />
        {Formik.touched.email && Formik.errors.email && (
          <p style={{ color: "red", marginTop: 0 }}>
            {Formik.errors.email}
          </p>
        )}

        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          name="password"
          value={Formik.values.password}
          onChange={Formik.handleChange}
          onBlur={Formik.handleBlur}
          sx={{ mb: 1 }}
        />
        {Formik.touched.password && Formik.errors.password && (
          <p style={{ color: "red", marginTop: 0 }}>
            {Formik.errors.password}
          </p>
        )}

        <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>
          Submit
        </Button>
      </Box>
    </Paper>
  </Box>
);
}