import { useEffect, useState } from "react";
import { Box, Button, MenuItem, Paper, Select, TextField, Typography, IconButton } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
// 1. Import apiClient instead of axios
import apiClient from "../../../../apiClient"; // Adjust path if needed
import CustomizedSnackbars from "../../../basic utility components/CustomizedSnackbars";

const NoticeSchool = () => {
  const [formData, setFormData] = useState({ title: "", message: "", audience: "" });
  const [notices, setNotices] = useState([]);
  const [audience, setAudience] = useState("all");
  const [isEditing, setIsEditing] = useState(false);
  const [editNoticeId, setEditNoticeId] = useState(null);

  // State for snackbar messages
  const [message, setMessage] = useState("");
  const [type, setType] = useState("success");
  const resetMessage = () => setMessage("");

  // Fetch Notices based on Audience
  const fetchNotices = async () => {
    try {
      // 2. Use apiClient for all requests
      const response = await apiClient.get(`/notices/fetch/${audience}`);
      setNotices(response.data.data || []); // Ensure notices is always an array
    } catch (error) {
      console.error("Error fetching notices", error);
      setMessage("Failed to fetch notices.");
      setType("error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };


  useEffect(() => {
    fetchNotices();
  }, [audience, message]); // Re-fetch when audience changes or after a CRUD operation

  // Add or Edit Notice
  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiCall = isEditing
      ? apiClient.put(`/notices/${editNoticeId}`, formData)
      : apiClient.post(`/notices/add`, formData);

    try {
      const response = await apiCall;
      setMessage(response.data.message || (isEditing ? "Notice updated successfully!" : "Notice added successfully!"));
      setType("success");

      // Reset form state
      setIsEditing(false);
      setEditNoticeId(null);
      setFormData({ title: "", message: "", audience: "" });
    } catch (error) {
      setMessage(error.response?.data?.message || (isEditing ? "Failed to update notice." : "Failed to add notice."));
      setType("error");
    }
  };

  // Set form data for editing
  const handleEdit = (notice) => {
    setFormData({ title: notice.title, message: notice.message, audience: Array.isArray(notice.audience) ? 'all' : notice.audience });
    setIsEditing(true);
    setEditNoticeId(notice._id);
  };

  // Delete Notice
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notice?")) {
      try {
        const response = await apiClient.delete(`/notices/${id}`);
        setMessage(response.data.message || "Notice deleted successfully!");
        setType("success");
      } catch (error) {
        setMessage(error.response?.data?.message || "Failed to delete notice.");
        setType("error");
      }
    }
  };

  return (
    <>
      <Box
        sx={{
          maxWidth: "900px",
          margin: "0 auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* Title */}
        <Typography variant="h2" sx={{ textAlign: "center", mb: 3 }}>
          Notice
        </Typography>

        {/* Form Section */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            width: "100%",
            p: 3,
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
            rows={4}
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
          </Select>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
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

        {/* Audience Filter Section */}
        <Box sx={{ mt: 4, textAlign: "center", width: "100%" }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Notice For{" "}
            <span style={{ textTransform: "capitalize", color: "darkgreen" }}>
              {audience}
            </span>
          </Typography>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 2 }}>
            <Button variant="outlined" onClick={() => setAudience("student")}>
              Student Notices
            </Button>
            <Button variant="outlined" onClick={() => setAudience("teacher")}>
              Teacher Notices
            </Button>
            <Button variant="outlined" onClick={() => setAudience("all")}>
              All Notices
            </Button>
          </Box>
        </Box>

        {/* Scrollable Notices */}
        <Box
          sx={{
            mt: 2,
            display: "flex",
            overflowX: "auto",
            gap: 2,
            p: 1,
            width: "100%",
            scrollBehavior: "smooth",
          }}
        >
          {notices.map((notice) => (
            <Paper
              key={notice._id}
              sx={{
                p: 2,
                minWidth: "300px",
                flex: "0 0 auto",
                boxShadow: "0px 2px 6px rgba(0,0,0,0.1)",
              }}
            >
              <Typography variant="h5">{notice.title}</Typography>
              <Typography variant="body1">{notice.message}</Typography>
              <Typography variant="body2" sx={{ mt: 1, display: "block" }}>
                Audience: {notice.audience} <br />
                Posted On: {new Date(notice.date).toLocaleDateString()}
              </Typography>

              <Box>
                <IconButton onClick={() => handleEdit(notice)} color="primary">
                  <EditIcon />
                </IconButton>
                <IconButton
                  onClick={() => handleDelete(notice._id)}
                  color="secondary"
                >
                  <DeleteIcon />
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
