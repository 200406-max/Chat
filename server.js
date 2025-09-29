const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Connect to MongoDB
mongoose.connect('mongodb://localhost/chat', { useNewUrlParser: true, useUnifiedTopology: true });

const messageSchema = new mongoose.Schema({
    username: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Serve static files from the public directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('A user connected');

    // Load previous messages
    Message.find().then(messages => {
        socket.emit('previousMessages', messages);
    });

    // Listen for new messages
    socket.on('sendMessage', (messageData) => {
        const message = new Message(messageData);
        message.save().then(() => {
            io.emit('newMessage', messageData); // Broadcast to all clients
        });
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server
server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
