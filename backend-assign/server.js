const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const kanbanRoutes = require("./routes/kanban");


const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());


// MongoDB connect
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));


// REST APIs
app.get("/", async (req, res) => {
  res.json("API is running...");
});

app.use("/api", kanbanRoutes);


io.on("connection", (socket) => {
  console.log("User connected");
});

server.listen(3001, () => console.log("Server running on 3001"));
