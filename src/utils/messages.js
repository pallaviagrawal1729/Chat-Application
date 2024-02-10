const moment = require('moment');
const {getUserByName} = require('./users');

const sendWelcomeMessage = (socket, user) => {
    const admin =  getUserByName('admin');
    socket.emit('message', admin, 'from', generateMessage('Welcome'));
    socket.broadcast.to(user.room).emit('message', admin, 'from', generateMessage(`${user.username} has joined`));
};

const sendMessage = (socket, user, msgText) => {
    const message = generateMessage(msgText);
    socket.broadcast.to(user.room).emit('message', user, 'from', message);
    socket.emit('message', user, 'to', message);
};

const shareLocation = (socket, coords, user) => {
    socket.broadcast.to(user.room).emit('shareLocationMessage', user, 'from', generateMessage(`https://google.com/maps?q=${coords.lat},${coords.lon}`));
    socket.emit('message', user, 'to', generateMessage(`Location shared successfully`));
};

const generateMessage = (text) => {
    return {
        text,
        url: text,
        createdAt: moment().format('Do MMM YYYY, h:mm a')
    }
}


module.exports = {sendWelcomeMessage,sendMessage, shareLocation, generateMessage }