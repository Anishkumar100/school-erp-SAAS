const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
  school: { type: mongoose.Schema.ObjectId, ref: 'School' },
  title: { type: String, required: true },
  message: { type: String, required: true },
  audience: {
    type: [String],           // array of strings
    enum: ["student", "teacher"], // only allow these values
    required: true
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notice", NoticeSchema);
