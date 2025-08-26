import { useEffect, useState } from "react";
import { Box, Paper, Typography } from "@mui/material";
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust path if needed
import NoData from "../../../basic utility components/NoData";

const NoticeStudent = () => {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        // 2. Use apiClient for the authenticated request
        const response = await apiClient.get(`/notices/fetch/student`);
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
      <Typography sx={{margin:'auto', textAlign:"center"}} variant="h3">Notice Board</Typography>
    
      <Box sx={{ mt: 2 }}>
        {notices.map((notice) => (
          <Paper key={notice._id} sx={{ p: 2, m: 2, display:'inline-block',  }}>
            <Typography variant="h5">{notice.title}</Typography>
            <Typography variant="p">{notice.message}</Typography>
            <Typography variant="body2" sx={{ mt: 1, display: "block" }}>
              Audiance:  {notice.audience} on {new Date(notice.date).toLocaleDateString()}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
    </>
  );
};

export default NoticeStudent;
