const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./model/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./model/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Set static folder
app.use(express.static(__dirname + '/Assets'));
app.set('view engine', 'ejs');


app.get(['/', '/home'], (req, res) => {
    res.render('home');
})



// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(user.id, user.username, ` Joind to ${room}`));

        // Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                'alertMessage',
                formatMessage(user.id, user.username, `${user.username} joined room`)
            );

        // Send users and room info
        io.to(user.room).emit('getRoomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatSendMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('messageRecive', formatMessage(user.id, user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            io.to(user.room).emit(
                'alertMessage',
                formatMessage(user.id, `${user.username} left room`)
            );

            // Send users and room info
            io.to(user.room).emit('getRoomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));