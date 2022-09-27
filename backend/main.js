const { WebSocketServer } = require("ws");
const { uuid } = require("uuidv4");

const isVictorious = (array) => {
    // 0 1 2
    // 3 4 5
    // 6 7 8

    const check = (pos) => {
        const x = pos.map((p) => array[p]).filter((x) => x !== " ");
        return x.length === 3 && new Set(x).size === 1;
    };

    // cols
    const col1 = check([0, 3, 6]);
    const col2 = check([1, 4, 7]);
    const col3 = check([2, 5, 8]);

    if (col1 || col2 || col3) return "win";

    // rows
    const row1 = check([0, 1, 2]);
    const row2 = check([3, 4, 5]);
    const row3 = check([6, 7, 8]);

    if (row1 || row2 || row3) return "win";

    // diag
    const diag1 = check([0, 4, 8]);
    const diag2 = check([2, 4, 6]);

    if (diag1 || diag2) return "win";

    if (array.filter((x) => x === " ").length === 0) {
        return "draw";
    }
    return "in_progress";
};

const createNewGame = (p1id, p2id) => {
    return {
        board: new Array(9).fill(" "),
        isPlayerOne: true,
        playerOne: p1id,
        playerTwo: p2id,
    };
};

const createNewMessage = (type, data) => JSON.stringify({ type, data });

async function main() {
    const allSocketsByUserId = {};
    const currentlyUnmatchedUsers = {};
    const matchedUp = {};
    const gameStates = {};

    const findOpponentFor = (currentUserId) => {
        for (let opponentId in currentlyUnmatchedUsers) {
            if (opponentId !== currentUserId) {
                return opponentId;
            }
        }
        return null;
    };

    const sendToUser = (currentUserId, data) => {
        allSocketsByUserId[currentUserId].send(data);
    };

    const wss = new WebSocketServer({ host: "127.0.0.1", port: 8888 });

    wss.on("connection", (ws) => {
        const currentUserId = uuid();

        ws.send(createNewMessage("register", { id: currentUserId }));

        allSocketsByUserId[currentUserId] = ws;
        currentlyUnmatchedUsers[currentUserId] = true;

        ws.on("close", () => {
            delete allSocketsByUserId[currentUserId];
            delete currentlyUnmatchedUsers[currentUserId];
        });

        const opponentId = findOpponentFor(currentUserId);
        if (opponentId) {
            // match them up
            matchedUp[opponentId] = currentUserId;
            matchedUp[currentUserId] = opponentId;
            // and remove them from the queue where others wait for a matchup
            delete currentlyUnmatchedUsers[opponentId];
            delete currentlyUnmatchedUsers[currentUserId];

            const gameId = uuid();
            gameStates[gameId] = createNewGame(opponentId, currentUserId);

            sendToUser(
                opponentId,
                createNewMessage("start", {
                    gameId,
                    amPlayerOne: true,
                    myTurn: true,
                    board: gameStates[gameId].board,
                })
            );

            sendToUser(
                currentUserId,
                createNewMessage("start", {
                    gameId,
                    board: gameStates[gameId].board,
                    amPlayerOne: false,
                    myTurn: false,
                })
            );
        }

        ws.on("message", (message) => {
            const { type, data } = JSON.parse(message);
            if (type === "update") {
                const { userId, gameId, pos, char } = data;
                gameStates[gameId].board[pos] = char;

                const opponentId = matchedUp[userId];
                let opponentData;
                let currentSender;

                const state = isVictorious(gameStates[gameId].board);

                if (state === "in_progress") {
                    opponentData = createNewMessage("start", {
                        gameId,
                        amPlayerOne:
                            gameStates[gameId].playerOne === opponentId,
                        myTurn: true,
                        board: gameStates[gameId].board,
                    });

                    currentSender = createNewMessage("start", {
                        gameId,
                        amPlayerOne: gameStates[gameId].playerOne === userId,
                        myTurn: false,
                        board: gameStates[gameId].board,
                    });
                } else {
                    let opponentStatus, currentSenderStatus;
                    if (state === "win") {
                        opponentStatus = "loss";
                        currentSenderStatus = "win";
                    } else {
                        opponentStatus = "draw";
                        currentSenderStatus = "draw";
                    }

                    opponentData = createNewMessage("stop", {
                        board: gameStates[gameId].board,
                        status: opponentStatus,
                        amPlayerOne:
                            gameStates[gameId].playerOne === opponentId,
                    });

                    currentSender = createNewMessage("stop", {
                        board: gameStates[gameId].board,
                        status: currentSenderStatus,
                        amPlayerOne: gameStates[gameId].playerOne === userId,
                    });
                }

                // send to both
                sendToUser(opponentId, opponentData);
                sendToUser(userId, currentSender);
            }
        });
    });
}

main();
