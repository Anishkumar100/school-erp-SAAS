import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust path if needed
import NoData from "../../../basic utility components/NoData";

const NoticeTeacher = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        // 2. Use apiClient for the authenticated request
        const response = await apiClient.get(`/notices/fetch/teacher`);
        // The backend now wraps data in a 'data' property
        setNotices(response.data.data || []); 
      } catch (error) {
        console.error("Error fetching notices", error);
      }
    };
    fetchNotices();
  }, []);

  return (
    <>
      <Box>
        <Typography sx={{ textAlign: "center" }} variant="h4">Notice Board</Typography>

        {notices.length < 1 ? <NoData text={'There is no Notice.'} /> :
          <Box sx={{ mt: 2 }}>
            {notices.map((notice) => (
              <Paper key={notice._id} sx={{ p: 2, m: 2, display: "inline-block", background: "lightgreen" }}>
                <Typography variant="h5">{notice.title}</Typography>
                <Typography variant="body1">{notice.message}</Typography>
                <Typography variant="body2" sx={{ mt: 1, display: "block" }}>
                  Posted On: {new Date(notice.createdAt).toLocaleDateString()}
                </Typography>
              </Paper>
            ))}
          </Box>
        }
      </Box>
    </>
  );
};

export default NoticeTeacher;
