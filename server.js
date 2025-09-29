const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connect (adjust URL if needed)
mongoose.connect('mongodb://127.0.0.1:27017/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB error', err));

const messageSchema = new mongoose.Schema({
  username: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // send previous messages (limit to last 100)
  Message.find().sort({ timestamp: 1 }).limit(100).then(messages => {
    socket.emit('previousMessages', messages);
  }).catch(err => console.error(err));

  socket.on('sendMessage', async (messageData) => {
    try {
      // basic server-side validation
      if (!messageData || !messageData.username || !messageData.content) return;

      const msg = new Message({
        username: messageData.username,
        content: messageData.content,
        timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date()
      });
      await msg.save();

      // broadcast saved message (send the saved doc so _id/timestamp are accurate)
      io.emit('newMessage', { username: msg.username, content: msg.content, timestamp: msg.timestamp });
    } catch (err) {
      console.error('Error saving message', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB connect (adjust URL if needed)
mongoose.connect('mongodb://127.0.0.1:27017/chat', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB error', err));

const messageSchema = new mongoose.Schema({
  username: String,
  content: String,
  timestamp: { type: Date, default: Date.now }
});
const Message = mongoose.model('Message', messageSchema);

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  // send previous messages (limit to last 100)
  Message.find().sort({ timestamp: 1 }).limit(100).then(messages => {
    socket.emit('previousMessages', messages);
  }).catch(err => console.error(err));

  socket.on('sendMessage', async (messageData) => {
    try {
      // basic server-side validation
      if (!messageData || !messageData.username || !messageData.content) return;

      const msg = new Message({
        username: messageData.username,
        content: messageData.content,
        timestamp: messageData.timestamp ? new Date(messageData.timestamp) : new Date()
      });
      await msg.save();

      // broadcast saved message (send the saved doc so _id/timestamp are accurate)
      io.emit('newMessage', { username: msg.username, content: msg.content, timestamp: msg.timestamp });
    } catch (err) {
      console.error('Error saving message', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('socket disconnected', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
