const express = require('express');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Save uploaded files to 'uploads' folder
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Save file with unique name based on timestamp
  }
});

// Create multer instance with storage configuration
const upload = multer({ storage });

// Middleware to serve static files (like uploaded images)
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads')); // Serve the uploads folder

// Serve the login page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Serve the chat page
app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'chat.html'));
});

// Handle avatar upload (POST request)
app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: 'No file uploaded.' });
  }

  // Avatar URL can be constructed using the file path
  const avatarUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, avatarUrl });  // Send back the avatar URL
});

// Set up the WebSocket (Socket.io)
io.on('connection', (socket) => {
  console.log('A user connected');
  
  // Listen for chat messages
  socket.on('chat message', (data) => {
    // Broadcast the message to all connected clients
    io.emit('chat message', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});



// Start the server
const PORT = process.env.PORT || 3000;
server.listen(3000,'192.168.0.152', () => {
  console.log('listening on *:3000');
});
