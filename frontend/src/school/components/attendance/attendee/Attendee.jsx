/* eslint-disable react/prop-types */
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow,
} from "@mui/material";
import { useFormik } from "formik";
import { useEffect, useState } from "react";
// 1. Import apiClient instead of axios
import apiClient from "../../../../../apiClient"; // Adjust path if needed

export default function Attendee({ classId, handleMessage, params }) {
    const [isEditAttendee, setEditAttendee] = useState(false);
    const [attendee, setAttendee] = useState(null);
    const [allTeachers, setAllTeachers] = useState([]);

    // 2. All functions now use apiClient
    const fetchClassAndTeachers = () => {
        if (!classId) return;
        Promise.all([
            apiClient.get(`/teacher/fetch-with-query`, { params: {} }),
            apiClient.get(`/class/fetch-single/${classId}`)
        ]).then(([teacherResp, classResp]) => {
            setAllTeachers(teacherResp.data.data);
            const classData = classResp.data.data;
            if (classData.attendee) {
                setAttendee(classData.attendee.name);
                Formik.setFieldValue("attendee", classData.attendee._id);
            } else {
                setAttendee("");
                Formik.setFieldValue("attendee", "");
            }
        }).catch(e => {
            console.error("Error fetching data:", e);
        });
    };

    const cancelEditAttendee = () => {
        setEditAttendee(false);
    };

    const handleEditAttendee = () => {
        setEditAttendee(true);
    };

    const Formik = useFormik({
        initialValues: { attendee: "" },
        onSubmit: (values) => {
            apiClient
                .patch(`/class/update/${classId}`, values)
                .then((resp) => {
                    handleMessage("success", resp.data.message);
                    cancelEditAttendee();
                })
                .catch((e) => {
                    handleMessage("error", e.response?.data?.message || "Failed to update attendee.");
                    cancelEditAttendee();
                });
        },
    });

    useEffect(() => {
        fetchClassAndTeachers();
    }, [isEditAttendee, classId, params, handleMessage]);

    return (
        <>
          
             {isEditAttendee && (
                <Paper sx={{ padding: "20px", margin: "10px" }}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      textTransform: "capitalize",
                      fontWeight: "700",
                    }}
                    variant="h6"
                  >
                    Select Attendee
                  </Typography>
                  <Box
                    component="form"
                    noValidate
                    autoComplete="off"
                    onSubmit={Formik.handleSubmit}
                  >
                    <FormControl sx={{ minWidth: "220px", marginTop: "10px" }}>
                      <InputLabel id="demo-simple-select-label">
                        Teacher
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        label="Gender"
                        name="attendee"
                        onChange={Formik.handleChange}
                        onBlur={Formik.handleBlur}
                        value={Formik.values.attendee}
                      >
                        <MenuItem value={""}>Teacher</MenuItem>
                        {allTeachers && allTeachers.map((teacher, i)=>{
                          return (<MenuItem key={i} value={teacher._id}>{teacher.name}</MenuItem>);
                        })}
                       
                      </Select>
                    </FormControl>

                    <Box sx={{ marginTop: "10px" }} component={"div"}>
                      <Button
                        type="submit"
                        sx={{ marginRight: "10px" }}
                        variant="contained"
                      >
                        Submit
                      </Button>
                      <Button
                        sx={{ background: "tomato", color: "#fff" }}
                        variant="contained"
                        onClick={cancelEditAttendee}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              )}

              <Paper sx={{ padding: "20px", margin: "10px" }}>
                <Typography variant="h5" className="text-beautify">
                  Attendence
                </Typography>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 230 }} aria-label="simple table">
                    <TableBody>
                    

                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: "700",
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            fontSize: "18px",
                          }}
                          component="th"
                          scope="row"
                        >
                          Attendee Teacher
                        </TableCell>
                        <TableCell align="left" sx={{ fontSize: "18px" }}>
                          {attendee?attendee:'No One'}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "20px",
                  }}
                >
                  <Button variant="outlined" onClick={handleEditAttendee}>
                    {attendee? "Change Attendee":"Add Attendee"}
                  </Button>
                </Box>
                </Paper>
              
        </>
    )
}