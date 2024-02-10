const http = require('http');
const express = require('express');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUserByName, getUsersListByRoom } = require('./utils/users');
const {sendWelcomeMessage,sendMessage, shareLocation } = require('./utils/messages'); 
const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.port || 3000;

app.use(express.static(path.join(__dirname, '../public')));

io.on('connection', (socket) => {
    console.log("New WebSocket Connection");

    socket.on('join', (options, callback) => {
        const { user, error } = addUser({ id: socket.id, ...options });
        if (error) return callback(error);
        socket.join(user.room);
        sendWelcomeMessage(socket, user);
        io.to(user.room).emit('renderSideBar', getUsersListByRoom(user.room));
        callback();
    });

    socket.on('sendMessage', (msgText, callback) => {
        const { user, error } = getUser(socket.id);

        if (error) return callback(error);

        const filter = new Filter();
        if (filter.isProfane(msgText)) return callback('Message could not be delivered, it\'s profane.');
        sendMessage(socket, user, msgText);
        callback();
    });

    socket.on('share-location', (coords, callback) => {
        const { user, error } = getUser(socket.id);
        if (error) return callback(error);
        shareLocation(socket, coords, user);
        callback();
    });

    socket.on('disconnect', () => {
        const { user } = removeUser(socket.id);
        if (user) {
            io.to(user.room).emit('message', getUserByName('admin'), 'from', generateMessage(`${user.username} has left!`));
            io.to(user.room).emit('renderSideBar', getUsersListByRoom(user.room));
        }
    });
});

server.listen(port, () => {
    console.log("Server is listening on port 3000");
    addUser({id: 0, username: 'Admin', room: "none", color: "#ff00000"});
});
