const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your Vite default
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

const documents = {};

io.on("connection", socket => {
  socket.on("get-document", documentId => {
    if (!documents[documentId]) {
      documents[documentId] = "";
    }

    socket.join(documentId);
    socket.emit("load-document", documents[documentId]);

    socket.on("send-changes", delta => {
      socket.broadcast.to(documentId).emit("receive-changes", delta);
    });

    socket.on("save-document", data => {
      documents[documentId] = data;
    });
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
