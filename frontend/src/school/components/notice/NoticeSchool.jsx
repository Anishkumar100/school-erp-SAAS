import { useEffect, useState } from "react";
import { Box, Button, MenuItem, Paper, Select, TextField, Typography, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import axios from "axios";
import { baseUrl } from "../../../environment";

const NoticeSchool = () => {
  const [formData, setFormData] = useState({ title: "", message: "", audience: "" });
  const [notices, setNotices] = useState([]);
  const [audience, setAudience] = useState("all");
  const [isEditing, setIsEditing] = useState(false); // Track if we are in edit mode
  const [editNoticeId, setEditNoticeId] = useState(null); // Store the ID of the notice being edited

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Fetch Notices based on Audience
  const fetchNotices = async () => {
    try {
      const response = await axios.get(`${baseUrl}/notices/fetch/${audience}`);
      setNotices(response.data);
    } catch (error) {
      console.error("Error fetching notices", error);
    }
  };

  useEffect(() => {
    fetchNotices();
  }, [audience]);

  // Add or Edit Notice
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditing) {
      // Update notice
      try {
        await axios.put(`${baseUrl}/notices/${editNoticeId}`, formData);
        alert("Notice updated successfully!");
        setIsEditing(false); // Reset to add mode
        setEditNoticeId(null); // Clear edit ID
      } catch (error) {
        alert("Failed to update notice.");
      }
    } else {
      // Add new notice
      try {
        await axios.post(`${baseUrl}/notices/add`, formData);
        alert("Notice added successfully!");
      } catch (error) {
        alert("Failed to add notice.");
      }
    }

    setFormData({ title: "", message: "", audience: "" }); // Clear form
    fetchNotices(); // Refresh notices list
  };

  // Set form data for editing
  const handleEdit = (notice) => {
    setFormData({ title: notice.title, message: notice.message, audience: notice.audience });
    setIsEditing(true);
    setEditNoticeId(notice._id);
  };

  // Delete Notice
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete?")) {
      try {
        await axios.delete(`${baseUrl}/notices/${id}`);
        alert("Notice deleted successfully!");
        fetchNotices();
      } catch (error) {
        alert("Failed to delete notice.");
      }
    }

  };

  return (
    <>
      <Box
        sx={{
          maxWidth: { xs: "100%", sm: "900px" }, // full width on small screens
          margin: "0 auto",
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Form Section */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            p: { xs: 2, sm: 3 },
            border: "1px solid #ddd",
            borderRadius: 2,
            boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          <Typography variant="h6" sx={{ textAlign: "center" }}>
            {isEditing ? "Edit Notice" : "Create New Notice"}
          </Typography>

          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
          />

          <TextField
            label="Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            fullWidth
            multiline
            rows={{ xs: 3, sm: 4 }}
            required
          />

          <Select
            name="audience"
            value={formData.audience}
            onChange={handleChange}
            displayEmpty
            fullWidth
            required
          >
            <MenuItem value="" disabled>
              Select Audience
            </MenuItem>
            <MenuItem value="student">Student</MenuItem>
            <MenuItem value="teacher">Teacher</MenuItem>
            <MenuItem value="all">Both</MenuItem>
          </Select>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
              gap: 2,
            }}
          >
            <Button type="submit" variant="contained" color="primary">
              {isEditing ? "Save Changes" : "Add Notice"}
            </Button>

            {isEditing && (
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setFormData({ title: "", message: "", audience: "" });
                  setEditNoticeId(null);
                }}
                color="secondary"
                variant="outlined"
              >
                Cancel
              </Button>
            )}
          </Box>
        </Box>

        {/* Notices Section */}
        <Box
          sx={{
            mt: 4,
            textAlign: "center",
            width: "100%",
          }}
        >
          <Typography variant="h3" sx={{ mb: 2, fontSize: { xs: "1.2rem", sm: "1.8rem" } }}>
            Notice For{" "}
            <span style={{ textTransform: "capitalize", color: "darkgreen" }}>
              {audience}
            </span>
          </Typography>

          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "center",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <Button variant="outlined" onClick={() => setAudience("student")}>
              Student Notices
            </Button>
            <Button variant="outlined" onClick={() => setAudience("teacher")}>
              Teacher Notices
            </Button>
            <Button variant="outlined" onClick={() => setAudience("all")}>
              Both / All Notices
            </Button>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            overflowX: { xs: "scroll", sm: "auto" },
            gap: 2,
            p: 1,
            width: "100%",
            scrollBehavior: "smooth",
            flexWrap: "wrap",
          }}
        >
          {notices.map((notice) => (
            <Paper
              key={notice._id}
              sx={{
                p: 2,
                minWidth: { xs: "100%", sm: "300px" },
                flex: "0 0 auto",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="h5" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
                {notice.title}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: { xs: "0.85rem", sm: "1rem" } }}>
                {notice.message}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 1, display: "block", fontSize: { xs: "0.75rem", sm: "0.9rem" } }}
              >
                Audience: {notice.audience === "all" ? "Student & Teacher" : notice.audience} <br />
                Posted On: {new Date(notice.date).toLocaleDateString()}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, mt: 1 }}>
                <IconButton onClick={() => handleEdit(notice)} color="primary">
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton onClick={() => handleDelete(notice._id)} color="secondary">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

    </>
  );

};

export default NoticeSchool;
