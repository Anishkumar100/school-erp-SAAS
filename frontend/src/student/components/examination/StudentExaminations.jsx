import { useEffect, useState } from "react";
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient.js"; // Adjust path if needed
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { convertDate } from "../../../utilityFunctions";

export default function StudentExaminations() {
    const [examinations, setExaminations] = useState([]);
    const [classDetails, setClassDetails] = useState(null);

    const fetchExaminations = (classId) => {
        // 2. Use apiClient for the request
        apiClient
            .get(`/examination/fetch-class/${classId}`) // No baseUrl needed
            .then((resp) => {
                setExaminations(resp.data.data);
            })
            .catch((e) => {
                console.log("Error in fetching Examinations:", e);
            });
    };

    const getStudentDetails = () => {
        // 3. Use apiClient for this request as well
        apiClient
            .get(`/student/fetch-own`) // No baseUrl needed
            .then(resp => {
                if (resp.data.data && resp.data.data.student_class) {
                    fetchExaminations(resp.data.data.student_class._id);
                    setClassDetails({
                        id: resp.data.data.student_class._id,
                        class: resp.data.data.student_class.class_text
                    });
                }
            })
            .catch(e => {
                console.log("Error fetching student details:", e);
            });
    };

    useEffect(() => {
        getStudentDetails();
    }, []);

    return (
        <>
            <Typography
                sx={{ textAlign: "center", my: 3 }}
                variant="h3"
            >
                Your Examinations [ Class: {classDetails ? classDetails.class : '...'} ]
            </Typography>
            <TableContainer component={"div"}>
                <Table sx={{ minWidth: 250 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: "700" }}>Exam Date</TableCell>
                            <TableCell sx={{ fontWeight: "700" }}>Subject</TableCell>
                            <TableCell sx={{ fontWeight: "700" }} align="center">Exam Type</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {examinations && examinations.map((examination, i) => (
                            <TableRow key={i}>
                                <TableCell>{convertDate(examination.examDate)}</TableCell>
                                <TableCell>{examination.subject?.subject_name || 'N/A'}</TableCell>
                                <TableCell align="center">{examination.examType}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </>
    );
}
