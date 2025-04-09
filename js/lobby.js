/**
 * Lobby management for the multiplayer Aeroplane Chess game
 */

// Show the lobby screen
function showLobby() {
    // Hide game elements
    $j('.main').hide();
    $j('.option').hide();

    // Initialize i18n if available
    if (window.i18n) {
        window.i18n.initLanguage();
        window.i18n.addLanguageSelector();
    }

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

    // Update all texts with translations
    if (window.i18n) {
        window.i18n.updatePageTexts();
    }
}

// Create the lobby UI
function createLobbyUI() {
    // Get translations function if available
    const t = window.i18n ? window.i18n.t : (key) => key;

    var lobbyHtml = `
        <div id="lobby" class="card">
            <h1 data-i18n="appTitle">${t('appTitle')}</h1>
            <div class="lobby-container">
                <div class="player-info card">
                    <h2 data-i18n="playerInfo">${t('playerInfo')}</h2>
                    <div class="form-group">
                        <label for="playerName" data-i18n="yourName">${t('yourName')}</label>
                        <input type="text" id="playerName" class="form-control" data-i18n-placeholder="yourName" placeholder="${t('yourName')}">
                    </div>
                    <div class="form-group">
                        <label data-i18n="selectColor">${t('selectColor')}</label>
                        <div class="color-selection">
                            <div class="color-option red" data-color="red" title="${t('red')}"></div>
                            <div class="color-option blue" data-color="blue" title="${t('blue')}"></div>
                            <div class="color-option yellow" data-color="yellow" title="${t('yellow')}"></div>
                            <div class="color-option green" data-color="green" title="${t('green')}"></div>
                        </div>
                    </div>
                </div>

                <div class="room-list-container card">
                    <h2 data-i18n="gameRooms">${t('gameRooms')}</h2>
                    <div class="room-controls">
                        <input type="text" id="roomName" class="form-control" data-i18n-placeholder="roomName" placeholder="${t('roomName')}">
                        <button id="createRoomBtn" class="btn btn-primary" data-i18n="createRoom" title="${t('createRoomTip')}">${t('createRoom')}</button>
                        <button id="refreshRoomsBtn" class="btn btn-secondary" data-i18n="refresh" title="${t('refreshTip')}">${t('refresh')}</button>
                    </div>
                    <div id="roomList" class="room-list">
                        <p data-i18n="loading">${t('loading')}</p>
                    </div>
                </div>
            </div>
        </div>

        <div id="waitingRoom" class="card" style="display:none;">
            <h1 data-i18n="waitingRoom">${t('waitingRoom')}</h1>
            <div class="waiting-container">
                <h2 id="roomNameDisplay"></h2>
                <div id="playersList" class="players-list"></div>
                <div class="waiting-controls">
                    <button id="readyButton" class="btn btn-success" data-i18n="ready" title="${t('readyTip')}">${t('ready')}</button>
                    <button id="leaveRoomButton" class="btn btn-secondary" data-i18n="leaveRoom" title="${t('leaveRoomTip')}">${t('leaveRoom')}</button>
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
    // Get translations function if available
    const t = window.i18n ? window.i18n.t : (key) => key;

    var roomListHtml = '';

    if (rooms.length === 0) {
        roomListHtml = `<p data-i18n="noRooms">${t('noRooms')}</p>`;
    } else {
        rooms.forEach(function(room) {
            roomListHtml += `
                <div class="room-item" data-room-id="${room.id}">
                    <div><strong>${room.name}</strong></div>
                    <div data-i18n-players>${t('players')}: ${room.players}/${room.maxPlayers}</div>
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

        // Validate inputs
        if (!name) {
            alert(t('nameRequired'));
            return;
        }

        if (!color) {
            alert(t('colorRequired'));
            return;
        }

        joinRoom(roomId, name, color);
    });
}

// Show the waiting room after joining a room
function showWaitingRoom(players) {
    // Get translations function if available
    const t = window.i18n ? window.i18n.t : (key) => key;

    $j('#lobby').hide();
    $j('#waitingRoom').show();
    $j('#roomNameDisplay').text(`${t('room')}: ${currentRoom}`);

    updateWaitingRoom(players);
}

// Update the waiting room player list
function updateWaitingRoom(players) {
    // Get translations function if available
    const t = window.i18n ? window.i18n.t : (key) => key;

    var playersListHtml = '';

    Object.entries(players).forEach(function([playerId, player]) {
        var colorStyle = `background-color: var(--player-${player.color}, ${player.color}); color: white;`;
        var readyStatus = player.ready ?
            `<span class="player-ready" data-i18n="ready">${t('ready')}</span>` :
            `<span data-i18n="notReady">${t('notReady')}</span>`;

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
    // Get translations function if available
    const t = window.i18n ? window.i18n.t : (key) => key;

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
            // Get color name for title attribute
            const colorName = t(user.color);
            indicatorsHtml += `<div class="player-indicator ${user.color}" style="background-color: var(--player-${user.color}, ${user.color});" title="${colorName}"></div>`;
        });
        indicatorsHtml += '</div>';

        $j('.main').append(indicatorsHtml);
    }

    // Create planes for all players
    createPlane(planeOption.userList);

    // Set initial turn status
    $j(".showdicenum").text(t('waiting')); // All players waiting initially
    $j("#sdn" + planeOption.currentUser).text(t('rollDice')); // Current player's turn

    // If it's this player's turn, enable the dice
    if (playerColor === planeOption.currentUser) {
        isMyTurn = true;
        addDiceEvent();
        // Highlight current player's indicator
        $j('.player-indicator').removeClass('active');
        $j('.player-indicator.' + playerColor).addClass('active');

        // Add tooltip to dice
        $j('#dice').attr('title', t('diceRollTip'));
    } else {
        isMyTurn = false;
        $j("#dice").unbind('click').removeClass('pointer');
    }

    // Show turn notification
    showTurnNotification(planeOption.currentUser);
}
