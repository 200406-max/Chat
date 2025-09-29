const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

// Optional: replace with MONGO_URI env var for persistence
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost/chat';
mongoose.connect(MONGO_URI).catch(()=>{ console.warn('Mongo not connected'); });

const messageSchema = new mongoose.Schema({
  username: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);

  if (mongoose.connection.readyState === 1) {
    Message.find().sort({ timestamp: 1 }).limit(100).then(msgs => {
      socket.emit('previousMessages', msgs);
    }).catch(()=>socket.emit('previousMessages', []));
  } else {
    socket.emit('previousMessages', []);
  }

  socket.on('sendMessage', async (msg) => {
    const m = { username: msg.username, content: msg.content, timestamp: msg.timestamp || new Date() };
    if (mongoose.connection.readyState === 1) {
      try { await Message.create(m); } catch(e){ console.error(e); }
    }
    io.emit('newMessage', m);
  });

  socket.on('disconnect', () => console.log('Client disconnected', socket.id));
});

const port = process.env.PORT || 3000;
server.listen(port, ()=>console.log('Listening on', port));
