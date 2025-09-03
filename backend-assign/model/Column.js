const mongoose = require("mongoose");

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["To Do", "In Progress", "Done"], required: true },
}, { timestamps: true });

module.exports = mongoose.model("Column", columnSchema);
