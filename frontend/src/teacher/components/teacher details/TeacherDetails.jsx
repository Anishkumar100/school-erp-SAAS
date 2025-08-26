import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography, CircularProgress } from "@mui/material";
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust path if needed
import { useEffect, useState } from "react";

export default function TeacherDetails() {
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 2. Use apiClient for the authenticated request
        const getTeacherDetails = () => {
            apiClient.get(`/teacher/fetch-own`)
                .then(resp => {
                    setTeacher(resp.data.data);
                })
                .catch(e => {
                    console.log("Error fetching teacher details", e);
                })
                .finally(() => {
                    setLoading(false);
                });
        };
        getTeacherDetails();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }
    return (
      <>
        <Typography
          variant="h3"
          sx={{
            textAlign: "center",
            marginBottom: "20px",
            fontWeight: "600",
          }}
        >
          Teacher Details
        </Typography>
    
        {teacher && (
          <>
            <Box
              component={"div"}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "20px",
              }}
            >
              <img
                src={`/images/uploaded/teacher/${teacher.teacher_image}`}
                alt="teacher"
                height={"370px"}
                width={"370px"}
                style={{
                  borderRadius: "50%",
                  border: "1px solid lightgreen",
                  padding: "4px",
                  transition: "transform 0.4s ease-in-out",
                }}
                onMouseOver={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseOut={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
    
              <TableContainer
                component={"div"}
                sx={{
                  width: "80%",
                  maxWidth: "900px",
                  borderRadius: "20px",
                  boxShadow: "0 12px 20px rgba(0, 0, 0, 0.2)",
                  transition: "transform 0.3s ease-in-out",
                  ":hover": {
                    transform: "scale(1.015)",
                  },
                  overflow: "hidden",
                }}
              >
                <Table aria-label="teacher-details-table">
                  <TableBody>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>{teacher.name}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>{teacher.email}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Age</TableCell>
                      <TableCell>{teacher.age}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Gender</TableCell>
                      <TableCell>{teacher.gender}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Qualification</TableCell>
                      <TableCell>{teacher.qualification}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </>
        )}
      </>
    );
    
}