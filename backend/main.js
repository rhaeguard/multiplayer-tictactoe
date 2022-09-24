const { WebSocketServer } = require('ws');
const { uuid } = require('uuidv4');

const isVictorious = (array) => {
    // 0 1 2
    // 3 4 5
    // 6 7 8

    if (array.filter(x => x === ' ').length === 0) {
        return 'draw'
    }

    const check = (pos) => {
        const x = pos.map(p => array[p]).filter(x => x !== ' ')
        return x.length === 3 && new Set(x).size === 1
    }

    // cols
    const col1 = check([0, 3, 6]);
    const col2 = check([1, 4, 7]);
    const col3 = check([2, 5, 8]);

    if (col1 || col2 || col3) return 'win'

    // rows
    const row1 = check([0, 1, 2]);
    const row2 = check([3, 4, 5]);
    const row3 = check([6, 7, 8]);

    if (row1 || row2 || row3) return 'win'

    // diag
    const diag1 = check([0, 4, 8]);
    const diag2 = check([2, 4, 6]);

    return (diag1 || diag2) ? 'win' : 'in_progress';
}

async function main() {
    const socketsMap = {}
    const lookingForMatchup = {}
    const matchedUp = {};
    const gameStates = {}

    const createNewGame = (p1id, p2id) => {
        return {
            board: new Array(9).fill(' '),
            isPlayerOne: true,
            playerOne: p1id,
            playerTwo: p2id
        }
    }

    const createNewMessage = (type, data) => JSON.stringify({type, data})

    const wss = new WebSocketServer({ host: "127.0.0.1", port: 8888 });

    wss.on('connection', (ws) => {
        const id = uuid()

        ws.send(createNewMessage('register', { id }))

        socketsMap[id] = ws;
        lookingForMatchup[id] = true;
        
        for (let pid in lookingForMatchup) {
            if (pid !== id && lookingForMatchup[pid] === true) {
                matchedUp[pid] = id;
                matchedUp[id] = pid;
                
                const gameId = uuid();
                gameStates[gameId] = createNewGame(pid, id);

                lookingForMatchup[pid] = false;
                lookingForMatchup[id] = false;

                const p1Info = {
                    gameId,
                    amPlayerOne: true,
                    myTurn: true,
                    board: gameStates[gameId].board
                }

                const p2Info = {
                    ...p1Info, amPlayerOne: false, myTurn: false
                }

                socketsMap[pid].send(createNewMessage('start', p1Info));
                socketsMap[id].send(createNewMessage('start', p2Info));

                
                break;
            }
        }

        ws.on('message', (message) => {
            const {type, data} = JSON.parse(message);
            if (type === "update") {
                const { userId, gameId, pos, char } = data;
                gameStates[gameId].board[pos] = char;
                
                const opponentId = matchedUp[userId];
                let opponentData;
                let currentSender;
                
                const state = isVictorious(gameStates[gameId].board);

                if (state === "in_progress") {
                    opponentData = createNewMessage('start', {
                        gameId,
                        amPlayerOne: gameStates[gameId].playerOne === opponentId,
                        myTurn: true,
                        board: gameStates[gameId].board
                    });

                    currentSender = createNewMessage('start', {
                        gameId,
                        amPlayerOne: gameStates[gameId].playerOne === userId,
                        myTurn: false,
                        board: gameStates[gameId].board
                    })
                } else {
                    let opponentStatus, currentSenderStatus;
                    if (state === 'win') {
                        opponentStatus = 'loss';
                        currentSenderStatus = 'win';
                    } else {
                        opponentStatus = 'draw';
                        currentSenderStatus = 'draw';
                    }

                    opponentData = createNewMessage('stop', {
                        board: gameStates[gameId].board,
                        status: opponentStatus,
                        amPlayerOne: gameStates[gameId].playerOne === opponentId,
                    });

                    currentSender = createNewMessage('stop', {
                        board: gameStates[gameId].board,
                        status: currentSenderStatus,
                        amPlayerOne: gameStates[gameId].playerOne === userId,
                    })
                }

                // send to both
                socketsMap[opponentId].send(opponentData);
                socketsMap[userId].send(currentSender);
            }
        })
    });


}

main();