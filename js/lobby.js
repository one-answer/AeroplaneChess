/**
 * Lobby management for the multiplayer Aeroplane Chess game
 */

// Show the lobby screen
function showLobby() {
    // Hide game elements
    $j('.main').hide();
    $j('.option').hide();

    // Show lobby if it exists, otherwise create it
    if ($j('#lobby').length) {
        $j('#lobby').show();
    } else {
        createLobbyUI();
    }

    // Initialize socket connection if not already done
    if (!socket) {
        initializeSocket();
    } else {
        refreshRoomList();
    }
}

// Create the lobby UI
function createLobbyUI() {
    var lobbyHtml = `
        <div id="lobby">
            <h1>飞行棋 Online</h1>
            <div class="lobby-container">
                <div class="player-info">
                    <h2>Player Information</h2>
                    <div class="form-group">
                        <label for="playerName">Your Name:</label>
                        <input type="text" id="playerName" placeholder="Enter your name">
                    </div>
                    <div class="form-group">
                        <label>Select Color:</label>
                        <div class="color-selection">
                            <div class="color-option red" data-color="red"></div>
                            <div class="color-option blue" data-color="blue"></div>
                            <div class="color-option yellow" data-color="yellow"></div>
                            <div class="color-option green" data-color="green"></div>
                        </div>
                    </div>
                </div>

                <div class="room-list-container">
                    <h2>Game Rooms</h2>
                    <div class="room-controls">
                        <input type="text" id="roomName" placeholder="Room name">
                        <button id="createRoomBtn">Create Room</button>
                        <button id="refreshRoomsBtn">Refresh</button>
                    </div>
                    <div id="roomList" class="room-list">
                        <p>Loading rooms...</p>
                    </div>
                </div>
            </div>
        </div>

        <div id="waitingRoom" style="display:none;">
            <h1>Waiting Room</h1>
            <div class="waiting-container">
                <h2 id="roomNameDisplay"></h2>
                <div id="playersList" class="players-list"></div>
                <div class="waiting-controls">
                    <button id="readyButton">Ready</button>
                    <button id="leaveRoomButton">Leave Room</button>
                </div>
            </div>
        </div>
    `;

    $j('body').append(lobbyHtml);

    // Add event listeners
    $j('#createRoomBtn').click(function() {
        createRoom($j('#roomName').val());
    });

    $j('#refreshRoomsBtn').click(function() {
        refreshRoomList();
    });

    $j('#leaveRoomButton').click(function() {
        leaveRoom();
    });

    $j('#readyButton').click(function() {
        setReady();
    });

    // Color selection
    $j('.color-option').click(function() {
        $j('.color-option').removeClass('selected');
        $j(this).addClass('selected');
        playerColor = $j(this).data('color');
    });

    // Add CSS for the lobby
    var lobbyCss = `
        <style>
            #lobby, #waitingRoom {
                width: 800px;
                margin: 0 auto;
                padding: 20px;
                background-color: #f5f5f5;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
                font-family: Arial, sans-serif;
            }

            h1 {
                text-align: center;
                color: #333;
            }

            .lobby-container, .waiting-container {
                display: flex;
                flex-wrap: wrap;
                justify-content: space-between;
            }

            .player-info, .room-list-container {
                width: 48%;
                background: white;
                padding: 15px;
                border-radius: 8px;
                box-shadow: 0 0 5px rgba(0,0,0,0.05);
            }

            .form-group {
                margin-bottom: 15px;
            }

            label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }

            input[type="text"] {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }

            button {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 4px;
                cursor: pointer;
                margin-right: 5px;
            }

            button:hover {
                background-color: #45a049;
            }

            .color-selection {
                display: flex;
                justify-content: space-between;
            }

            .color-option {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                cursor: pointer;
                border: 2px solid transparent;
            }

            .color-option.selected {
                border-color: #333;
            }

            .color-option.red {
                background-color: red;
            }

            .color-option.blue {
                background-color: blue;
            }

            .color-option.yellow {
                background-color: yellow;
            }

            .color-option.green {
                background-color: green;
            }

            .room-controls {
                display: flex;
                margin-bottom: 15px;
            }

            .room-list {
                max-height: 300px;
                overflow-y: auto;
                border: 1px solid #ddd;
                border-radius: 4px;
                padding: 10px;
            }

            .room-item {
                padding: 10px;
                border-bottom: 1px solid #eee;
                cursor: pointer;
            }

            .room-item:hover {
                background-color: #f9f9f9;
            }

            .players-list {
                margin: 20px 0;
            }

            .player-item {
                padding: 10px;
                margin-bottom: 5px;
                border-radius: 4px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .player-ready {
                color: green;
                font-weight: bold;
            }

            .waiting-controls {
                display: flex;
                justify-content: center;
                margin-top: 20px;
            }
        </style>
    `;

    $j('head').append(lobbyCss);
}

// Display the list of available rooms
function displayRoomList(rooms) {
    var roomListHtml = '';

    if (rooms.length === 0) {
        roomListHtml = '<p>No rooms available. Create one!</p>';
    } else {
        rooms.forEach(function(room) {
            roomListHtml += `
                <div class="room-item" data-room-id="${room.id}">
                    <div><strong>${room.name}</strong></div>
                    <div>Players: ${room.players}/${room.maxPlayers}</div>
                </div>
            `;
        });
    }

    $j('#roomList').html(roomListHtml);

    // Add click event to join room
    $j('.room-item').click(function() {
        var roomId = $j(this).data('room-id');
        var name = $j('#playerName').val();
        var color = playerColor;

        joinRoom(roomId, name, color);
    });
}

// Show the waiting room after joining a room
function showWaitingRoom(players) {
    $j('#lobby').hide();
    $j('#waitingRoom').show();
    $j('#roomNameDisplay').text('Room: ' + currentRoom);

    updateWaitingRoom(players);
}

// Update the waiting room player list
function updateWaitingRoom(players) {
    var playersListHtml = '';

    Object.entries(players).forEach(function([playerId, player]) {
        var colorStyle = `background-color: ${player.color}; color: white;`;
        var readyStatus = player.ready ? '<span class="player-ready">Ready</span>' : 'Not Ready';

        playersListHtml += `
            <div class="player-item" style="${colorStyle}">
                <div>${player.name}</div>
                <div>${readyStatus}</div>
            </div>
        `;
    });

    $j('#playersList').html(playersListHtml);
}

// Start the game
function startGame(gameState) {
    $j('#waitingRoom').hide();
    $j('.main').show();

    // Set online mode
    planeOption.setOnlineMode(true);

    // Initialize the game with the received game state
    planeOption.userList = gameState.userList;
    planeOption.currentUser = gameState.currentUser;

    // Add player indicators if they don't exist
    if (!$j('.player-indicators').length) {
        var indicatorsHtml = '<div class="player-indicators">';
        gameState.userList.forEach(function(user) {
            indicatorsHtml += `<div class="player-indicator ${user.color}" style="background-color: ${user.color};"></div>`;
        });
        indicatorsHtml += '</div>';

        $j('.main').append(indicatorsHtml);

        // Style the indicators
        $j('.player-indicators').css({
            'position': 'absolute',
            'top': '10px',
            'right': '10px',
            'display': 'flex',
            'flex-direction': 'column',
            'z-index': '100'
        });

        $j('.player-indicator').css({
            'width': '30px',
            'height': '30px',
            'border-radius': '50%',
            'margin': '5px',
            'border': '2px solid transparent',
            'transition': 'all 0.3s ease'
        });
    }

    // Create planes for all players
    createPlane(planeOption.userList);

    // Set initial turn status
    $j(".showdicenum").text('等待'); // All players waiting initially
    $j("#sdn" + planeOption.currentUser).text('请投骰'); // Current player's turn

    // If it's this player's turn, enable the dice
    if (playerColor === planeOption.currentUser) {
        isMyTurn = true;
        addDiceEvent();
        // Highlight current player's indicator
        $j('.player-indicator').removeClass('active');
        $j('.player-indicator.' + playerColor).addClass('active').css('border-color', 'white');
    } else {
        isMyTurn = false;
        $j("#dice").unbind('click').removeClass('pointer');
    }

    // Show turn notification
    showTurnNotification(planeOption.currentUser);
}
