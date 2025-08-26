import {
  Box,
  Button,
  CardMedia,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  styled,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useEffect, useState } from "react";
import { useFormik } from "formik";
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust the path if needed
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";
import { useNavigate } from "react-router-dom";
import Examinations from "./sub components/examinations/Examinations";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: "transparent",
  color: "#fff",
  boxShadow: "none",
  textTransform: "uppercase",
}));

export default function ClassDetails() {
  const [message, setMessage] = useState("");
  const [type, setType] = useState("");
  const resetMessage = () => {
    setMessage("");
  };
  const [allClasses, setAllClasses] = useState([]);
  const [classDetails, setClassDetails] = useState(null);

  const handleMessage = (type, message) => {
    setType(type);
    setMessage(message);
  };

  const handleClassChange = (e) => {
    const value = e.target.value;
    navigate(`/school/class-details?class-id=${value}`);
    setMessage("Class Changed.");
    setType("success");
  };

  const navigate = useNavigate();
  const getClassId = () => {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const paramIdValue = urlParams.get("class-id");
    return paramIdValue;
  };

  // 2. All functions now use apiClient
  const fetchClassWithId = () => {
    const id = getClassId();
    if (id) {
      apiClient
        .get(`/class/fetch-single/${id}`)
        .then((resp) => {
          setClassDetails(resp.data.data);
        })
        .catch((e) => {
          navigate("/school/class");
        });
    } else {
      navigate("/school/class");
    }
  };

  const fetchAllClasses = () => {
    apiClient
      .get(`/class/fetch-all`, { params: {} })
      .then((resp) => {
        setAllClasses(resp.data.data);
      })
      .catch((e) => {
        console.log("Error fetching all Classes");
      });
  };

  const [allSubjects, setAllSubjects] = useState([]);
  const fetchAllSubjects = () => {
    apiClient
      .get(`/subject/fetch-all`, { params: {} })
      .then((resp) => {
        setAllSubjects(resp.data.data);
      })
      .catch((e) => {
        console.log("Error fetching all Subjects");
      });
  };

  const [allTeachers, setAllTeachers] = useState([]);
  const fetchAllTeachers = () => {
    apiClient
      .get(`/teacher/fetch-with-query`, { params: {} })
      .then((resp) => {
        setAllTeachers(resp.data.data);
      })
      .catch((e) => {
        console.log("Error fetching all Teachers");
      });
  };

  const [examinations, setExaminations] = useState([]);
  const fetchExaminations = () => {
    apiClient
      .get(`/examination/fetch-class/${getClassId()}`)
      .then((resp) => {
        setExaminations(resp.data.data);
      })
      .catch((e) => {
        console.log("Error fetching Examinations.");
      });
  };

  const [students, setStudents] = useState([]);
  const fetchStudents = () => {
    apiClient
      .get(`/student/fetch-with-query`, { params: { student_class: getClassId() } })
      .then((resp) => {
        setStudents(resp.data.data);
      })
      .catch((e) => {
        console.log("Error fetching students data", e);
      });
  };

  useEffect(() => {
    fetchAllClasses();
    fetchClassWithId();
    fetchAllSubjects();
    fetchAllTeachers();
    fetchExaminations();
    fetchStudents();
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "black",
        }}
        component={"div"}
      >
        <Typography className="text-beautify hero-text">
          {classDetails && <>{classDetails.class_num}</>}th Class Details
        </Typography>
      </Box>
      <Grid container spacing={0} sx={{ background: "black" }}>
        <Grid item sm={6} md={4} xs={12}>
          <Item>
            <Paper sx={{ margin: "10px", padding: "10px" }}>
              <FormControl sx={{ minWidth: "220px", marginTop: "10px" }}>
                <InputLabel id="demo-simple-select-label">Change Class</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  label="Gender"
                  value={""}
                  onChange={handleClassChange}
                >
                  {allClasses &&
                    allClasses.map((value, i) => (
                      <MenuItem key={i} value={value._id}>
                        {value.class_text}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Paper>

            <Paper sx={{ padding: "20px", margin: "10px" }}>
              <Typography variant="h5" className="text-beautify">
                Students {classDetails && <>{classDetails.class_num}</>}th{" "}
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
                          fontSize: "34px",
                        }}
                        component="th"
                        scope="row"
                      >
                        Total
                      </TableCell>
                      <TableCell align="left" sx={{ fontSize: "34px" }}>
                        {students.length}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Item>
        </Grid>
        <Grid item sm={6} md={8} xs={12}>
          <Item>
            <Examinations allSubjects={allSubjects} handleMessage={handleMessage} examinations={examinations} />
          </Item>
        </Grid>
      </Grid>
    </>
  );
}