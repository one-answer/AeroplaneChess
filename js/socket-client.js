/**
 * Socket.io client for the multiplayer Aeroplane Chess game
 */
var socket;
var currentRoom = null;
var playerName = "";
var playerColor = "";

// Initialize socket connection
function initializeSocket() {
    socket = io();

    // Socket event listeners
    socket.on('connect', function() {
        console.log('Connected to server');
        refreshRoomList();
    });

    socket.on('error', function(message) {
        alert(message);
    });

    socket.on('roomList', function(rooms) {
        displayRoomList(rooms);
    });

    socket.on('roomCreated', function(roomId) {
        console.log('Room created:', roomId);
        joinRoom(roomId, playerName, playerColor);
    });

    socket.on('roomsUpdated', function() {
        if (!currentRoom) {
            refreshRoomList();
        }
    });

    socket.on('joinedRoom', function(data) {
        console.log('Joined room:', data.roomId);
        currentRoom = data.roomId;
        showWaitingRoom(data.players);
    });

    socket.on('playerJoined', function(data) {
        console.log('Player joined:', data.playerInfo.name);
        updateWaitingRoom(data.players);
    });

    socket.on('playerStatusChanged', function(data) {
        updateWaitingRoom(data.players);
    });

    socket.on('playerLeft', function(data) {
        console.log('Player left');
        updateWaitingRoom(data.players);
    });

    socket.on('gameStarted', function(gameState) {
        console.log('Game started');
        startGame(gameState);
    });

    // Game-specific events
    socket.on('diceResult', function(data) {
        handleDiceResult(data);
    });

    socket.on('planeMove', function(data) {
        handlePlaneMove(data);
    });

    socket.on('turnChanged', function(data) {
        handleTurnChange(data);
    });

    socket.on('turnContinued', function(data) {
        handleTurnContinue(data);
    });
}

// Room management functions
function refreshRoomList() {
    socket.emit('getRooms');
}

function createRoom(roomName) {
    if (!roomName) {
        alert('Please enter a room name');
        return;
    }

    playerName = $j('#playerName').val();
    if (!playerName) {
        alert('Please enter your name');
        return;
    }

    playerColor = getSelectedColor();
    if (!playerColor) {
        alert('Please select a color');
        return;
    }

    socket.emit('createRoom', roomName);
}

function joinRoom(roomId, name, color) {
    if (!name) {
        alert('Please enter your name');
        return;
    }

    if (!color) {
        alert('Please select a color');
        return;
    }

    socket.emit('joinRoom', {
        roomId: roomId,
        playerName: name,
        color: color
    });
}

function leaveRoom() {
    if (currentRoom) {
        socket.emit('leaveRoom', currentRoom);
        currentRoom = null;
        showLobby();
    }
}

function setReady() {
    if (currentRoom) {
        socket.emit('playerReady', currentRoom);
        $j('#readyButton').prop('disabled', true);
    }
}

// Game action functions
function rollDice(diceNum) {
    if (currentRoom) {
        socket.emit('diceRolled', {
            roomId: currentRoom,
            diceNum: diceNum
        });
    }
}

function movePlane(planeId, coordId, step) {
    if (currentRoom) {
        socket.emit('movePlane', {
            roomId: currentRoom,
            planeId: planeId,
            coordId: coordId,
            step: step
        });
    }
}

function nextTurn(nextPlayer) {
    if (currentRoom) {
        socket.emit('nextTurn', {
            roomId: currentRoom,
            nextPlayer: nextPlayer
        });
    }
}

// Signal to server that current player should continue their turn (after rolling a 6)
function continueTurn() {
    if (currentRoom) {
        socket.emit('continueTurn', {
            roomId: currentRoom
        });
    }
}

// Helper functions
function getSelectedColor() {
    if ($j('#redUser li:first-child').hasClass('bth')) return 'red';
    if ($j('#blueUser li:first-child').hasClass('bth')) return 'blue';
    if ($j('#yellowUser li:first-child').hasClass('bth')) return 'yellow';
    if ($j('#greenUser li:first-child').hasClass('bth')) return 'green';
    return '';
}

// UI update functions - these will be implemented in lobby.js
function displayRoomList(rooms) {
    // Implemented in lobby.js
}

function showWaitingRoom(players) {
    // Implemented in lobby.js
}

function updateWaitingRoom(players) {
    // Implemented in lobby.js
}

function showLobby() {
    // Implemented in lobby.js
}

function startGame(gameState) {
    // Implemented in lobby.js
}

// Show turn notification to all players
function showTurnNotification(currentPlayer, isContinueTurn) {
    // Create notification if it doesn't exist
    if (!$j('#turnNotification').length) {
        $j('body').append('<div id="turnNotification"></div>');
        $j('#turnNotification').css({
            'position': 'fixed',
            'top': '10px',
            'left': '50%',
            'transform': 'translateX(-50%)',
            'background-color': 'rgba(0,0,0,0.7)',
            'color': 'white',
            'padding': '10px 20px',
            'border-radius': '5px',
            'z-index': '9999',
            'font-weight': 'bold',
            'text-align': 'center'
        });
    }

    // Set the color of the current player
    var colorName = '';
    switch(currentPlayer) {
        case 'red': colorName = '红色'; break;
        case 'blue': colorName = '蓝色'; break;
        case 'yellow': colorName = '黄色'; break;
        case 'green': colorName = '绿色'; break;
    }

    // Show the notification
    if (isContinueTurn) {
        // Special message for continuing turn after rolling a 6
        if (playerColor === currentPlayer) {
            $j('#turnNotification').text('你投出了6点，可以再次投骰！'); // You rolled a 6, roll again!
            $j('#turnNotification').css('background-color', 'rgba(0,150,0,0.8)');
        } else {
            $j('#turnNotification').text(colorName + ' 玩家投出了6点，可以再次投骰'); // Player rolled a 6, can roll again
            $j('#turnNotification').css('background-color', 'rgba(0,0,0,0.7)');
        }
    } else {
        // Normal turn notification
        $j('#turnNotification').text('当前回合: ' + colorName + ' 玩家');
        $j('#turnNotification').css('background-color', 'rgba(0,0,0,0.7)');

        // Highlight if it's the current player's turn
        if (playerColor === currentPlayer) {
            $j('#turnNotification').css('background-color', 'rgba(0,150,0,0.8)');
            $j('#turnNotification').text('你的回合!');
        }
    }

    // Show the notification
    $j('#turnNotification').fadeIn(300).delay(2000).fadeOut(300);
}

// Game event handlers
function handleDiceResult(data) {
    // Update the UI to show dice result for all players
    diceNum = data.diceNum;
    $j("#sdn" + planeOption.currentUser).text(diceNum);

    // Only the current player can move their planes
    if (playerColor === planeOption.currentUser) {
        addPlaneEvent(userState(planeOption.currentUser));
    } else {
        // Disable plane clicks for other players
        $j('.plane').unbind('click').removeClass('pointer');
    }
}

function handlePlaneMove(data) {
    // Find the plane and update its position
    $j('.plane').each(function() {
        if ($j(this).attr('type') === data.playerId && $j(this).attr('num') === data.planeId) {
            $j(this).attr({
                'coordId': data.coordId,
                'step': data.step
            });

            // Update the plane's visual position based on coordId
            var coordValue = selectCoordValue(data.coordId);
            $j(this).animate({
                'top': coordValue.top,
                'left': coordValue.left
            }, 600);
        }
    });
}

function handleTurnChange(data) {
    // Update all UI elements to show the current player's turn
    $j("#sdn" + planeOption.currentUser).text('等待'); // Show "waiting" for previous player
    planeOption.currentUser = data.currentUser;
    $j("#sdn" + planeOption.currentUser).text('请投骰'); // Show "roll dice" for current player

    // If it's this player's turn, enable the dice and highlight their color
    if (playerColor === planeOption.currentUser) {
        isMyTurn = true;
        addDiceEvent();
        // Highlight current player's UI elements
        $j('.player-indicator').removeClass('active');
        $j('.player-indicator.' + playerColor).addClass('active');
    } else {
        isMyTurn = false;
        // Disable dice and plane clicks for other players
        $j("#dice").unbind('click').removeClass('pointer');
        $j('.plane').unbind('click').removeClass('pointer');
    }

    // Show whose turn it is to all players
    showTurnNotification(planeOption.currentUser);
}

// Handle the case where a player continues their turn after rolling a 6
function handleTurnContinue(data) {
    // Make sure the current player is still the same
    planeOption.currentUser = data.currentUser;

    // If it's this player's turn, enable the dice again
    if (playerColor === planeOption.currentUser) {
        isMyTurn = true;
        // Re-enable the dice for the current player
        addDiceEvent();
        // Show a notification that they can roll again
        showTurnNotification(planeOption.currentUser, true);
    } else {
        isMyTurn = false;
        // Make sure other players can't roll
        $j("#dice").unbind('click').removeClass('pointer');
    }
}
