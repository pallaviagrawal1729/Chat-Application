const users = [];

const addUser = ({ id, username, room }) => {
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room)
        return {
            error: "User and room are required fields!",
        };
    const existingUser = users.find(
        (user) => user.username == username && user.room === room
    );
    if (existingUser)
        return {
            error: "Existing user found! Please provide unique details",
        };
    const user = { id, username, room, color: generateRandomColor() };
    users.push(user);
    return { user: { ...user, username: toTitleCase(user.username) } };
};

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index != -1) {
        const user = users[index];
        users.splice(index, 1);
        return { user: { ...user, username: toTitleCase(user.username) } }
    }
    return { user: null }
}

const getUser = (id) => {
    const index = users.findIndex((user) => user.id === id);
    if (index != -1) return { user: { ...users[index], username: toTitleCase(users[index].username) } };
    return { error: 'No user found' };
}

const getUserByName = (name) => {
    const index = users.findIndex((user) => user.username === name);
    return { ...users[index], username: toTitleCase(users[index].username) };
}

const getUsersListByRoom = (room) => {
    return users
        .filter((user) => user.room == room)
        .map((user) => {return { ...user, username: toTitleCase(user.username)}});
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function (txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
}

function generateRandomColor() {
    // Generate a random number between 0 and 16777215
    const randomColor = Math.floor(Math.random() * 16777215).toString(16);

    // Ensure the color code has 6 digits by padding with zeros if needed
    return '#' + '0'.repeat(6 - randomColor.length) + randomColor;
}

module.exports = { addUser, removeUser, getUser, toTitleCase, getUserByName, getUsersListByRoom };
