const express = require('express');
const path = require('path');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');

// Initialize app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Setup Multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/chat', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
});

app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  if (!req.file) {
    return res.json({ success: false, message: 'No file uploaded.' });
  }
  const avatarUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, avatarUrl });
});

// Socket.io Events
io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('chat message', (data) => {
    io.emit('chat message', data);
  });
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
