const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  columnId: { type: mongoose.Schema.Types.ObjectId, ref: "Column", required: true },
  order: { type: Number, default: 0 }, // for drag/drop ordering
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);
