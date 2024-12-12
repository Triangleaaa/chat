const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const multer = require('multer');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let messages = []; // Store messages temporarily

// Set up multer for avatar upload
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Handle avatar upload
app.post('/upload-avatar', upload.single('avatar'), (req, res) => {
  const avatarUrl = `/uploads/${req.file.filename}`;
  res.json({ success: true, avatarUrl });
});

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send previous chat messages to the new user
  socket.emit('chat messages', messages);

  // Handle incoming chat messages
  socket.on('chat message', (data) => {
    const newMessage = { ...data, reactions: [] };
    messages.push(newMessage);
    io.emit('chat message', newMessage);  // Broadcast the new message to all clients
  });

  // Handle emoji reactions
  socket.on('add reaction', (messageId, reaction) => {
    // Find the message by ID and add the reaction
    const message = messages.find(msg => msg.timestamp === messageId);
    if (message) {
      message.reactions.push(reaction);  // Add the reaction to the message
      io.emit('message reaction', message.timestamp, message.reactions);  // Broadcast updated reactions to all clients
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(3000,'192.168.0.152', () => {
  console.log('listening on *:3000');
});
