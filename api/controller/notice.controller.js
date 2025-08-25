const Notice = require("../model/notice.model");

module.exports = {
  // CREATE a new notice
  newNotice: async (req, res) => {
    let { title, message, audience } = req.body;
    const schoolId = req.user.schoolId;

    try {
      // If audience is a single string "all", convert it to an array for versatile querying
      if (audience === "all") {
        audience = ["student", "teacher"];
      }

      const newNotice = new Notice({ title, message, audience, school: schoolId });
      await newNotice.save();
      res.status(201).json({ success: true, message: "Notice added successfully!" });
    } catch (error) {
      console.error("Error adding notice:", error);
      res.status(500).json({ success: false, message: "Error adding notice." });
    }
  },

  // GET notices (handles fetching for a specific audience or all audiences)
  getNotices: async (req, res) => {
    const { audience } = req.params; // e.g., 'student', 'teacher', or 'all'
    const schoolId = req.user.schoolId;

    try {
      let query = { school: schoolId };

      // If a specific audience is requested, find notices where that audience is IN the audience array
      if (audience && audience !== "all") {
        // The $in operator correctly finds notices where the audience array contains the requested role.
        // This will find notices for ["student"] as well as ["student", "teacher"].
        query.audience = { $in: [audience] };
      }

      // If audience is 'all' or not provided, the query remains { school: schoolId }, fetching all notices.
      const notices = await Notice.find(query).sort({ createdAt: -1 }); // Sort by newest first
      res.status(200).json({ success: true, data: notices });
    } catch (error) {
      console.error("Error fetching notices:", error);
      res.status(500).json({ success: false, message: "Error fetching notices." });
    }
  },

  // EDIT a notice by ID
  editNotice: async (req, res) => {
    const { id } = req.params;
    const { title, message, audience } = req.body;
    const schoolId = req.user.schoolId;

    try {
      const updatedNotice = await Notice.findOneAndUpdate(
        { _id: id, school: schoolId }, // Enforce school ownership
        { title, message, audience },
        { new: true }
      );

      if (!updatedNotice) {
        return res.status(404).json({ success: false, message: "Notice not found." });
      }
      res.status(200).json({ success: true, message: "Notice updated successfully!", data: updatedNotice });
    } catch (error) {
      console.error("Error updating notice:", error);
      res.status(500).json({ success: false, message: "Error updating notice." });
    }
  },

  // DELETE a notice by ID
  deleteNotice: async (req, res) => {
    const { id } = req.params;
    const schoolId = req.user.schoolId;

    try {
      const deletedNotice = await Notice.findOneAndDelete({ _id: id, school: schoolId });

      if (!deletedNotice) {
        return res.status(404).json({ success: false, message: "Notice not found." });
      }
      res.status(200).json({ success: true, message: "Notice deleted successfully!" });
    } catch (error) {
      console.error("Error deleting notice:", error);
      res.status(500).json({ success: false, message: "Error deleting notice." });
    }
  },
};