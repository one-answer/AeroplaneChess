const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Game rooms storage
const rooms = {};

// Generate a random room ID
function generateRoomId() {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Get available rooms
    socket.on('getRooms', () => {
        const roomList = Object.keys(rooms).map(roomId => {
            return {
                id: roomId,
                name: rooms[roomId].name,
                players: Object.keys(rooms[roomId].players).length,
                maxPlayers: 4
            };
        });
        socket.emit('roomList', roomList);
    });

    // Create a new room
    socket.on('createRoom', (roomName) => {
        const roomId = generateRoomId();
        rooms[roomId] = {
            name: roomName,
            players: {},
            gameState: {
                currentUser: 'red',
                userList: []
            },
            started: false
        };

        socket.emit('roomCreated', roomId);
        io.emit('roomsUpdated');
    });

    // Join a room
    socket.on('joinRoom', (data) => {
        const { roomId, playerName, color } = data;

        if (!rooms[roomId]) {
            socket.emit('error', 'Room does not exist');
            return;
        }

        if (Object.keys(rooms[roomId].players).length >= 4) {
            socket.emit('error', 'Room is full');
            return;
        }

        // Check if color is already taken
        const colorTaken = Object.values(rooms[roomId].players).some(player => player.color === color);
        if (colorTaken) {
            socket.emit('error', 'Color already taken');
            return;
        }

        // Join the room
        socket.join(roomId);
        rooms[roomId].players[socket.id] = {
            name: playerName,
            color: color,
            ready: false
        };

        // Update the room's game state
        updateRoomUserList(roomId);

        // Notify everyone in the room
        socket.emit('joinedRoom', {
            roomId,
            players: rooms[roomId].players,
            gameState: rooms[roomId].gameState
        });

        io.to(roomId).emit('playerJoined', {
            playerId: socket.id,
            playerInfo: rooms[roomId].players[socket.id],
            players: rooms[roomId].players,
            gameState: rooms[roomId].gameState
        });

        io.emit('roomsUpdated');
    });

    // Player ready status
    socket.on('playerReady', (roomId) => {
        if (!rooms[roomId] || !rooms[roomId].players[socket.id]) return;

        rooms[roomId].players[socket.id].ready = true;
        io.to(roomId).emit('playerStatusChanged', {
            playerId: socket.id,
            players: rooms[roomId].players
        });

        // Check if all players are ready to start
        checkGameStart(roomId);
    });

    // Start game
    socket.on('startGame', (roomId) => {
        if (!rooms[roomId]) return;

        rooms[roomId].started = true;
        io.to(roomId).emit('gameStarted', rooms[roomId].gameState);
    });

    // Game actions
    socket.on('diceRolled', (data) => {
        const { roomId, diceNum } = data;
        if (!rooms[roomId]) return;

        // Verify it's the player's turn
        const playerColor = rooms[roomId].players[socket.id]?.color;
        if (playerColor !== rooms[roomId].gameState.currentUser) {
            socket.emit('error', 'Not your turn');
            return;
        }

        // Broadcast dice result to all players in the room
        io.to(roomId).emit('diceResult', {
            playerId: socket.id,
            diceNum: diceNum
        });
    });

    socket.on('movePlane', (data) => {
        const { roomId, planeId, coordId, step } = data;
        if (!rooms[roomId]) return;

        // Verify it's the player's turn
        const playerColor = rooms[roomId].players[socket.id]?.color;
        if (playerColor !== rooms[roomId].gameState.currentUser) {
            socket.emit('error', 'Not your turn');
            return;
        }

        // Broadcast plane movement to all players in the room
        io.to(roomId).emit('planeMove', {
            playerId: socket.id,
            planeId: planeId,
            coordId: coordId,
            step: step
        });
    });

    socket.on('nextTurn', (data) => {
        const { roomId, nextPlayer } = data;
        if (!rooms[roomId]) return;

        // Verify it's the player's turn before allowing turn change
        const playerColor = rooms[roomId].players[socket.id]?.color;
        if (playerColor !== rooms[roomId].gameState.currentUser) {
            socket.emit('error', 'Not your turn');
            return;
        }

        // Verify the next player is valid
        const validNextPlayer = getNextValidPlayer(roomId, playerColor);
        if (nextPlayer !== validNextPlayer) {
            socket.emit('error', 'Invalid next player');
            return;
        }

        // Update game state and broadcast to all players
        rooms[roomId].gameState.currentUser = nextPlayer;
        io.to(roomId).emit('turnChanged', {
            currentUser: nextPlayer
        });
    });

    // Handle player continuing their turn after rolling a 6
    socket.on('continueTurn', (data) => {
        const { roomId } = data;
        if (!rooms[roomId]) return;

        // Verify it's the player's turn
        const playerColor = rooms[roomId].players[socket.id]?.color;
        if (playerColor !== rooms[roomId].gameState.currentUser) {
            socket.emit('error', 'Not your turn');
            return;
        }

        // Send a special turn change event that keeps the same player
        io.to(roomId).emit('turnContinued', {
            currentUser: playerColor
        });
    });

    // Leave room
    socket.on('leaveRoom', (roomId) => {
        leaveRoom(socket, roomId);
    });

    // Disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        // Find and leave all rooms this socket was in
        Object.keys(rooms).forEach(roomId => {
            if (rooms[roomId].players[socket.id]) {
                leaveRoom(socket, roomId);
            }
        });
    });
});

// Helper function to update the user list in a room
function updateRoomUserList(roomId) {
    if (!rooms[roomId]) return;

    const userList = [];
    Object.entries(rooms[roomId].players).forEach(([playerId, playerInfo]) => {
        userList.push({
            color: playerInfo.color,
            state: 'normal'
        });
    });

    rooms[roomId].gameState.userList = userList;
}

// Helper function to get the next valid player in turn order
function getNextValidPlayer(roomId, currentPlayer) {
    if (!rooms[roomId]) return null;

    // Define the turn order
    const turnOrder = ['red', 'blue', 'yellow', 'green'];

    // Find the current player's index in the turn order
    const currentIndex = turnOrder.indexOf(currentPlayer);
    if (currentIndex === -1) return null;

    // Get all active player colors in the room
    const activeColors = Object.values(rooms[roomId].players).map(player => player.color);

    // Find the next player in the turn order
    for (let i = 1; i <= 4; i++) {
        const nextIndex = (currentIndex + i) % 4;
        const nextColor = turnOrder[nextIndex];

        // Check if this color is active in the room
        if (activeColors.includes(nextColor)) {
            return nextColor;
        }
    }

    // If no valid next player is found, return the current player
    return currentPlayer;
}

// Helper function to check if all players are ready to start
function checkGameStart(roomId) {
    if (!rooms[roomId]) return;

    const allReady = Object.values(rooms[roomId].players).every(player => player.ready);
    const playerCount = Object.keys(rooms[roomId].players).length;

    if (allReady && playerCount >= 2) {
        rooms[roomId].started = true;
        io.to(roomId).emit('gameStarted', rooms[roomId].gameState);
    }
}

// Helper function to handle a player leaving a room
function leaveRoom(socket, roomId) {
    if (!rooms[roomId] || !rooms[roomId].players[socket.id]) return;

    // Remove player from room
    const playerColor = rooms[roomId].players[socket.id].color;
    delete rooms[roomId].players[socket.id];
    socket.leave(roomId);

    // Update the room's game state
    updateRoomUserList(roomId);

    // If room is empty, delete it
    if (Object.keys(rooms[roomId].players).length === 0) {
        delete rooms[roomId];
        io.emit('roomsUpdated');
        return;
    }

    // Notify remaining players
    io.to(roomId).emit('playerLeft', {
        playerId: socket.id,
        players: rooms[roomId].players,
        gameState: rooms[roomId].gameState
    });

    io.emit('roomsUpdated');
}

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
