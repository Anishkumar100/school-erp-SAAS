const Notice = require("../model/notice.model");

// Route to add a new notice
exports.newNotice = async (req, res) => {
  let { title, message, audience } = req.body;
  const schoolId = req.user.schoolId;

  try {
    // If audience is "all", store as an array
    if (audience === "all") audience = ["student", "teacher"];

    const newNotice = new Notice({ title, message, audience, school: schoolId });
    await newNotice.save();
    res.status(201).json({ message: "Notice added successfully!" });
  } catch (error) {
    console.error("Error adding notice:", error);
    res.status(500).json({ message: "Error adding notice." });
  }
};

exports.fetchAudiance = async (req, res) => {
  const { audience } = req.params;
  const schoolId = req.user.schoolId;
  try {
    let query = { school: schoolId };
    if (audience !== "all") query.audience = audience;
    const notices = await Notice.find(query);
    res.json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ message: "Error fetching notices." });
  }
};


exports.fetchAllAudiance = async (req, res) => {
  const schoolId = req.user.schoolId;
    try {
      const notices = await Notice.find({school:schoolId});
      res.json(notices);
    } catch (error) {
      console.error("Error fetching notices:", error);
      res.status(500).json({ message: "Error fetching notices." });
    }
  }


  
// Edit Notice
exports.editNotice = async (req, res) => {
    const { id } = req.params;
    const { title, message, audience } = req.body;
  
    try {
      await Notice.findByIdAndUpdate(id, { title, message, audience });
      res.json({ message: "Notice updated successfully!" });
    } catch (error) {
      console.error("Error updating notice:", error);
      res.status(500).json({ message: "Error updating notice." });
    }
  }
  
  // Delete Notice
  exports.deleteNotice = async (req, res) => {
    const { id } = req.params;
  
    try {
      await Notice.findByIdAndDelete(id);
      res.json({ message: "Notice deleted successfully!" });
    } catch (error) {
      console.error("Error deleting notice:", error);
      res.status(500).json({ message: "Error deleting notice." });
    }
  }
  
