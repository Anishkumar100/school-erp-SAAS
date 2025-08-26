/* eslint-disable react/prop-types */
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
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
// 1. Import apiClient instead of axios
import apiClient from "../../../../../../apiClient"; // Adjust path if needed
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { examSchema } from "../../../../../yupSchema/examinationSchema";
import { convertDate } from "../../../../../utilityFunctions";

export default function Examinations({ allSubjects, handleMessage, examinations }) {
    const [isEditExam, setEditExam] = useState(false);
    const [examForm, setExamForm] = useState(false);
    const [examEditId, setExamEditId] = useState(null);

    const handleNewExam = () => {
        setEditExam(false); // Ensure we are not in edit mode
        setExamEditId(null);
        examFormik.resetForm();
        setExamForm(true);
    };

    // 2. All functions now use apiClient
    const handleEditExam = (id) => {
        setExamEditId(id);
        setEditExam(true);
        setExamForm(true);
        apiClient
            .get(`/examination/single/${id}`)
            .then((resp) => {
                const { data } = resp.data;
                examFormik.setFieldValue("exam_date", dayjs(data.examDate));
                examFormik.setFieldValue("subject", data.subject);
                examFormik.setFieldValue("exam_type", data.examType);
            })
            .catch((e) => {
                handleMessage("error", e.response?.data?.message || "Failed to fetch exam details.");
            });
    };

    const handleDeleteExam = (id) => {
        if (window.confirm("Are you sure you want to delete this examination?")) {
            apiClient
                .delete(`/examination/delete/${id}`)
                .then((resp) => {
                    handleMessage("success", resp.data.message);
                })
                .catch((e) => {
                    handleMessage("error", e.response?.data?.message || "Failed to delete examination.");
                });
        }
    };

    const cancelEditExam = () => {
        setExamForm(false);
        setEditExam(false);
        setExamEditId(null);
        examFormik.resetForm();
    };

    const examFormik = useFormik({
        initialValues: { exam_date: "", subject: "", exam_type: "" },
        validationSchema: examSchema,
        onSubmit: (values) => {
            const apiCall = isEditExam
                ? apiClient.patch(`/examination/update/${examEditId}`, values)
                : apiClient.post(`/examination/new`, { ...values, class_id: getClassId() });

            apiCall
                .then(resp => {
                    handleMessage("success", resp.data.message);
                    cancelEditExam();
                })
                .catch(e => {
                    handleMessage("error", e.response?.data?.message || "Operation failed.");
                });
        },
    });

    const getClassId = () => {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        return urlParams.get("class-id");
    };


    return(
        <>
         {examForm && (
                <Paper sx={{ padding: "20px", margin: "10px" }}>
                  <Typography
                    sx={{
                      textAlign: "center",
                      textTransform: "capitalize",
                      fontWeight: "700",
                    }}
                    variant="h6"
                  >
                    Assign Examination
                  </Typography>
                  <Box
                    component="form"
                    noValidate
                    autoComplete="off"
                    onSubmit={examFormik.handleSubmit}
                  >
                    <Box component={"div"}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DemoContainer components={["DatePicker"]}>
                          <DatePicker
                            label="Exam Date"
                            name="exam_date"
                            value={dayjs(examFormik.values.exam_date)}
                            onChange={(e) => {
                              console.log(e);
                              //  setDate(dayjs(e))
                              examFormik.setFieldValue("exam_date", dayjs(e));
                            }}
                          />
                        </DemoContainer>
                      </LocalizationProvider>
                    </Box>

                    <FormControl sx={{ minWidth: "220px", marginTop: "10px" }}>
                      <InputLabel >
                        Subject
                      </InputLabel>
                      <Select
                        label="Subject"
                        name="subject"
                        onChange={examFormik.handleChange}
                        onBlur={examFormik.handleBlur}
                        value={examFormik.values.subject}
                      >
                        <MenuItem value={""}>Select Sub</MenuItem>
                        {allSubjects &&
                          allSubjects.map((subject, i) => {
                            return (
                              <MenuItem key={i} value={subject._id}>
                                {subject.subject_name}
                              </MenuItem>
                            );
                          })}
                      </Select>
                    </FormControl>
                    {examFormik.touched.subject &&
                      examFormik.errors.subject && (
                        <p
                          style={{ color: "red", textTransform: "capitalize" }}
                        >
                          {examFormik.errors.subject}
                        </p>
                      )}

                    <TextField
                      fullWidth
                      sx={{ marginTop: "10px" }}
                      id="filled-basic"
                      label="Exam Type "
                      variant="outlined"
                      name="exam_type"
                      value={examFormik.values.exam_type}
                      onChange={examFormik.handleChange}
                      onBlur={examFormik.handleBlur}
                      placeholder="(1st Semister, 2nd Semister, Half yearly etc)"
                    />
                    {examFormik.touched.exam_type &&
                      examFormik.errors.exam_type && (
                        <p
                          style={{ color: "red", textTransform: "capitalize" }}
                        >
                          {examFormik.errors.exam_type}
                        </p>
                      )}

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
                        onClick={cancelEditExam}
                      >
                        Cancel
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              )}

              <Paper sx={{ padding: "20px", margin: "10px" }}>
                <Typography
                  sx={{ textAlign: "center" }}
                  className="text-beautify"
                  variant="h5"
                >
                  Examinations
                </Typography>
                <TableContainer component={Paper}>
                  <Table sx={{ minWidth: 250 }} aria-label="simple table">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: "700" }} align="left">
                          Exam Date
                        </TableCell>
                        <TableCell sx={{ fontWeight: "700" }} align="left">
                          Subject
                        </TableCell>
                        <TableCell sx={{ fontWeight: "700" }} align="center">
                          Exam Type
                        </TableCell>
                        <TableCell sx={{ fontWeight: "700" }} align="center">
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {examinations &&
                        examinations.map((examination, i) => {
                          return (
                            <TableRow key={i}>
                              <TableCell component="th" scope="row">
                                {convertDate(examination.examDate)}
                              </TableCell>
                              <TableCell align="left">
                                {examination.subject.subject_name}
                              </TableCell>
                              <TableCell align="center">
                                {examination.examType}
                              </TableCell>
                              <TableCell
                                sx={{ fontWeight: "700" }}
                                align="center"
                              >
                                <Box
                                  component={"div"}
                                  sx={{
                                    bottom: 0,
                                    display: "flex",
                                    justifyContent: "end",
                                  }}
                                >
                                  <Button
                                    variant="contained"
                                    sx={{ background: "red", color: "#fff" }}
                                    onClick={() => {
                                      handleDeleteExam(examination._id);
                                    }}
                                  >
                                    Delete
                                  </Button>
                                  <Button
                                    variant="contained"
                                    sx={{
                                      background: "gold",
                                      color: "#222222",
                                    }}
                                    onClick={() => {
                                      handleEditExam(examination._id);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                </Box>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    marginTop: "10px",
                  }}
                >
                  <Button variant="contained" onClick={handleNewExam}>
                    Add Exam
                  </Button>
                </Box>
              </Paper>
        </>
    )
}