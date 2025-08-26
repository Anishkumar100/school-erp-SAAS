/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Typography,
  InputLabel,
} from "@mui/material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useEffect, useState } from "react";
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust path if needed
import { convertDate } from "../../../utilityFunctions";
import NoData from "../../../basic utility components/NoData";

export default function TeacherExaminations() {
  const [allClasses, setAllClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [examinations, setExaminations] = useState([]);

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  // 2. All functions now use apiClient
  const fetchExaminations = () => {
    if (!selectedClass) return; // Don't fetch if no class is selected
    apiClient
      .get(`/examination/fetch-class/${selectedClass}`)
      .then((resp) => {
        setExaminations(resp.data.data || []);
      })
      .catch((e) => {
        console.log("Error in fetching Examinations.");
      });
  };

  useEffect(() => {
    fetchExaminations();
  }, [selectedClass]);

  const fetchTeacherClasses = () => {
    apiClient
      .get(`/class/attendee`) // Fetches classes assigned to the logged-in teacher
      .then((resp) => {
        setAllClasses(resp.data);
        if (resp.data.length > 0) {
          setSelectedClass(resp.data[0].classId);
        }
      })
      .catch((e) => {
        console.log("Error in fetching teacher's classes", e);
      });
  };

  useEffect(() => {
    fetchTeacherClasses();
  }, []);

  return (
    <>
      <Box sx={{ maxWidth: "1000px", mx: "auto", p: 2 }}>
        <Typography
          variant="h3"
          sx={{ textAlign: "center", marginBottom: "15px", fontWeight: "600" }}
        >
          Examinations
        </Typography>
  
        <Paper
          sx={{
            margin: "10px",
            padding: "10px",
            borderRadius: "12px",
          }}
        >
          <FormControl sx={{ minWidth: "220px", marginTop: "10px" }}>
            <Typography>Change Class</Typography>
            <Select
              value={selectedClass}
              onChange={handleClassChange}
              onBlur={handleClassChange}
              sx={{ borderRadius: "8px" }}
            >
              {allClasses &&
                allClasses.map((value) => (
                  <MenuItem key={value._id} value={value._id}>
                    {value.class_text}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Paper>
  
        <Paper
  sx={{
    margin: "10px",
    padding: "10px",
    borderRadius: "12px",
    transition: "transform 0.3s ease-in-out",
    "&:hover": {
      transform: "scale(1.02)",
    },
  }}
>

          {examinations.length < 1 ? (
            <NoData text={"There is no Examination."} />
          ) : (
            <>
              <Typography sx={{ textAlign: "center" }} variant="h5">
                Examinations List
              </Typography>
  
              <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
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
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {examinations &&
                      examinations.map((examination, i) => {
                        return (
                          <TableRow
                          key={i}
                          sx={{
                            "&:hover td.subject-cell": {
                              backgroundColor: "#ffffff",
                            },
                          }}
                        >
                        
                            <TableCell component="th" scope="row">
                              {convertDate(examination.examDate)}
                            </TableCell>
                            <TableCell
                              align="left"
                              sx={{
                                transition: "background-color 0.2s ease-in-out",
                                "&:hover": {
                                  backgroundColor: "#ffffff",
                                },
                              }}
                            >
                              {examination.subject.subject_name}
                            </TableCell>

                            <TableCell align="center">
                              {examination.examType}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </Paper>
      </Box>
    </>
  );
  
}
