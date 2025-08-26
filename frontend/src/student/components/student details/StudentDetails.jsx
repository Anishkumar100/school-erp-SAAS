import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableRow, Typography } from "@mui/material";
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust path if needed
import { useEffect, useState } from "react";
import "./StudentDetails.css";

export default function StudentDetails() {
    const [student, setStudent] = useState(null);

    const getStudentDetails = () => {
        // 2. Use apiClient for the authenticated request
        apiClient.get(`/student/fetch-own`)
            .then(resp => {
                setStudent(resp.data.data);
            })
            .catch(e => {
                console.log("Error fetching student details", e);
            });
    };

    useEffect(() => {
        getStudentDetails();
    }, []);

    return(
        <>
                <Typography variant="h3"  sx={{textAlign:'center',marginBottom:"15px" }}>Student Details</Typography>
                {student && <>

                    <Box component={"div"} sx={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",padding:"5px" }}>
                            <img src={`/images/uploaded/student/${student.student_image}`} alt='image' height={'370px'} width={'450px'} style={{borderRadius:"50%"}} />
                        </Box>
                    <TableContainer sx={{margin:"auto", width:"80%",border:'1px solid transparent',  borderRadius:"17px", boxShadow:"0 10px 8px -5px lightgray"
                    }} component={'div'}>
                  <Table sx={{ minWidth: 250 }} aria-label="simple table">
                    <TableBody>
                        <TableRow>
                        <TableCell className="table-cell" align="left">
                          Email
                        </TableCell>
                        <TableCell className="table-cell" align="left" >
                            {student.email}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                          Name
                        </TableCell>
                        <TableCell className="table-cell" align="left" >
                            {student.name}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Class
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                         {student.student_class.class_text}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Age
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                         {student.age}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Gender
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                         {student.gender}
                         </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell className="table-cell" align="left"   >
                        Guardian
                        </TableCell>
                        <TableCell className="table-cell" align="left">
                        {student.guardian}
                         </TableCell>
                      </TableRow>

                    </TableBody>
                  </Table>
                </TableContainer>
                </>}
              
        
        </>
    )
}