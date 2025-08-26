import React, { useEffect, useState } from 'react';
import { Container, Typography, Table, TableBody, TableCell, TableHead, TableRow, CircularProgress, Box, Paper } from '@mui/material';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
// 1. Import apiClient instead of axios
import apiClient from '../../../../../apiClient'; // Adjust path if needed
import { useParams } from 'react-router-dom';

const AttendanceDetails = () => {
    Chart.register(ArcElement, Tooltip, Legend);

    const [attendanceData, setAttendanceData] = useState([]);
    const [chartData, setChartData] = useState({ present: 0, absent: 0 });
    const [loading, setLoading] = useState(true);
    const { studentId } = useParams(); // Use useParams hook to get ID from URL

    const dateConvert = (date) => {
        const dateData = new Date(date);
        return dateData.toLocaleDateString(); // Simpler and locale-aware
    };

    // Fetch attendance data for the specific student
    useEffect(() => {
        if (!studentId) {
            setLoading(false);
            return;
        }

        const fetchAttendanceData = async () => {
            try {
                // 2. Use apiClient for the authenticated request
                const response = await apiClient.get(`/attendance/${studentId}`);
                const records = response.data || [];
                setAttendanceData(records);

                // 3. OPTIMIZED: Calculate chart data efficiently with reduce
                const summary = records.reduce((acc, record) => {
                    if (record.status === 'Present') {
                        acc.present += 1;
                    } else if (record.status === 'Absent') {
                        acc.absent += 1;
                    }
                    return acc;
                }, { present: 0, absent: 0 });
                setChartData(summary);

            } catch (error) {
                console.error("Error fetching attendance data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAttendanceData();
    }, [studentId]);

    // Data for the chart
    const pieChartData = {
        labels: ['Present', 'Absent'],
        datasets: [
            {
                data: [chartData.present, chartData.absent],
                backgroundColor: ['rgb(54, 162, 235)', 'rgb(255, 99, 132)'],
                hoverOffset: 4,
            },
        ],
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>Student Attendance</Typography>

      <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={4}>
        {/* Attendance Chart */}
        <Box >
          <Typography variant="h6">Attendance Summary</Typography>
          <Pie style={{padding:"20px"}}  data={data} />
        </Box>

        {/* Attendance List */}
        <Box flex={1}>
          <Typography variant="h6">Attendance Records</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attendanceData.map((record) => (
                <TableRow key={record._id}>
                  <TableCell>{dateConvert(record.date)}</TableCell>
                  <TableCell>{record.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Box>
    </Container>
  );
};

export default AttendanceDetails;
