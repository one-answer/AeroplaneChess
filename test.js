/**
 * Test script for the multiplayer Aeroplane Chess game
 * 
 * This script tests the basic functionality of the server
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Create a test server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname, '/')));

// Test room creation and joining
io.on('connection', (socket) => {
    console.log('Test client connected:', socket.id);
    
    // Test room creation
    socket.on('createRoom', (roomName) => {
        console.log('Room created:', roomName);
        socket.emit('roomCreated', 'TEST123');
    });
    
    // Test room joining
    socket.on('joinRoom', (data) => {
        console.log('Player joined room:', data);
        socket.emit('joinedRoom', {
            roomId: data.roomId,
            players: {
                [socket.id]: {
                    name: data.playerName,
                    color: data.color,
                    ready: false
                }
            },
            gameState: {
                currentUser: 'red',
                userList: []
            }
        });
    });
    
    // Test player ready status
    socket.on('playerReady', (roomId) => {
        console.log('Player ready in room:', roomId);
        socket.emit('playerStatusChanged', {
            playerId: socket.id,
            players: {
                [socket.id]: {
                    name: 'Test Player',
                    color: 'red',
                    ready: true
                }
            }
        });
    });
    
    // Test game start
    socket.on('startGame', (roomId) => {
        console.log('Game started in room:', roomId);
        socket.emit('gameStarted', {
            currentUser: 'red',
            userList: [
                { color: 'red', state: 'normal' },
                { color: 'blue', state: 'normal' },
                { color: 'yellow', state: 'normal' },
                { color: 'green', state: 'normal' }
            ]
        });
    });
    
    // Test game actions
    socket.on('diceRolled', (data) => {
        console.log('Dice rolled:', data);
        socket.emit('diceResult', {
            playerId: socket.id,
            diceNum: data.diceNum
        });
    });
    
    socket.on('movePlane', (data) => {
        console.log('Plane moved:', data);
        socket.emit('planeMove', {
            playerId: socket.id,
            planeId: data.planeId,
            coordId: data.coordId,
            step: data.step
        });
    });
    
    socket.on('nextTurn', (data) => {
        console.log('Next turn:', data);
        socket.emit('turnChanged', {
            currentUser: data.nextPlayer
        });
    });
    
    // Test disconnection
    socket.on('disconnect', () => {
        console.log('Test client disconnected:', socket.id);
    });
});

// Start the test server
const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
    console.log('Open http://localhost:3001 in your browser to test the game');
});
