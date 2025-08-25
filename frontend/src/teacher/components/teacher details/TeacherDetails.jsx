import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import axios from "axios";
import { useEffect, useState } from "react";
import { baseUrl } from "../../../environment";
// import "./teacherDetails.css"
export default function TeacherDetails(){
    const [teacher, setTeacher] = useState(null)

    const getTeacherDetails = ()=>{
        axios.get(`${baseUrl}/teacher/fetch-own`).then(resp=>{
            setTeacher(resp.data.data)
    console.log("Single Teacher Details from Teacher Details page",  resp)
        }).catch(e=>{
            console.log("Error in teacher", e);
        })
    }

    useEffect(()=>{
        getTeacherDetails()
    },[])
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