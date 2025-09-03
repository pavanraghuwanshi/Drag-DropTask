const express = require("express");
const Board = require("../model/Board");
const Column = require("../model/Column");
const Task = require("../model/Task");

const router = express.Router();



router.post("/boards", async (req, res) => {
  try {
    const { name, columns } = req.body;

    let columnIds = [];
    if (columns && columns.length) {
      const createdColumns = await Column.insertMany(columns);
      columnIds = createdColumns.map(c => c._id);
    }

    const board = new Board({ name, columns: columnIds });
    await board.save();
    const populatedBoard = await board.populate("columns"); 
    res.status(201).json(populatedBoard);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post("/boardtask", async (req, res) => {
  try {
    const { boardName, task } = req.body;
    console.log("Adding task to board:", boardName, task);

    if (!boardName || !task?.title || !task?.status) {
      return res.status(400).json({ message: "Board name and task details are required" });
    }

    let board = await Board.findOne({ name: boardName }).populate("columns");

    if (!board) {
      return res.status(404).json({ message: "Board not found" });
    }

    const newColumn = new Column({
      title: task.title,
      status: task.status,
    });
    await newColumn.save();

    let columnExists = board.columns.find(
      (col) => col.status === task.status
    );

    if (columnExists) {
      columnExists.items.push(newColumn._id);
    } else {
      board.columns.push(newColumn._id);
    }

    await board.save();

    board = await Board.findOne({ _id: board._id }).populate("columns");
    res.status(200).json({ message: "Task added successfully", board });
  } catch (err) {
    console.error("Add Task to Board Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get all boards with populated columns
router.get("/boards", async (req, res) => {
  try {
    const boards = await Board.find().populate("columns");
    res.json(boards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



router.post("/boards/move", async (req, res) => {
  try {
    const { itemId, to } = req.body;

  
    const task = await Column.findById(itemId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = to;
    await task.save();

    console.log("Task moved successfully:", task._id);
    res.status(200).json({ message: "Task moved successfully", task });
  } catch (err) {
    console.error("Move API error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});


router.post("/boards/:boardName/tasks", async (req, res) => {
  try {
    const { boardName } = req.params;
    const { columns } = req.body;


    if (!columns || !columns.length) {
      return res.status(400).json({ error: "No columns provided" });
    }

    for (let colData of columns) {
      const { title, status } = colData;

      const newColumn = new Column({ title, status });
      const a = await newColumn.save();

      const board = await Board.findOne({ name: boardName });
      if (!board) return res.status(404).json({ error: "Board not found" });

      if (!board.columns.includes(newColumn._id)) {
        board.columns.push(newColumn._id);
        await board.save();
      }
    }

    const updatedBoard = await Board.findOne({ name: boardName }).populate("columns");
    res.status(201).json(updatedBoard);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});








module.exports = router;
