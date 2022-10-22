import { WebSocket, WebSocketServer } from "ws";
import { v4 as uuid } from "uuid";

require('dotenv').config();

type GameState = "win" | "draw" | "in_progress"

const getCurrentGameState = (array: string[]): GameState => {
    // 0 1 2
    // 3 4 5
    // 6 7 8

    const check = (pos: number[]) => {
        const x = pos.map((p) => array[p]).filter((x) => x !== "");
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

    if (array.filter((x) => x === "").length === 0) {
        return "draw";
    }
    return "in_progress";
};

interface Game {
    board: string[],
    isPlayerOne: boolean,
    playerOne: string,
    playerTwo: string,
    isFinished: boolean
}

const createNewGame = (p1id: string, p2id: string): Game => {
    return {
        board: new Array(9).fill(""),
        isPlayerOne: true,
        playerOne: p1id,
        playerTwo: p2id,
        isFinished: false
    };
};

type WebSocketActionType = "start" | "stop" | "register";

const createNewMessage = (type: WebSocketActionType, data: any) => JSON.stringify({ type, data });

type UserId = string;

class WebSocketHandler {
    allSocketsByUserId: { [key: UserId]: WebSocket };
    currentlyUnmatchedUsers: { [key: UserId]: boolean };
    matchedUp: { [key: UserId]: string }; // TODO: maybe update type, maybe userId should be a type
    gameStates: { [key: string]: Game };

    constructor() {
        this.allSocketsByUserId = {};
        this.currentlyUnmatchedUsers = {};
        this.matchedUp = {};
        this.gameStates = {};
    }

    findOpponentFor(currentUserId: UserId) {
        for (let opponentId in this.currentlyUnmatchedUsers) {
            if (opponentId !== currentUserId) {
                return opponentId;
            }
        }
        return null;
    };

    findGameId(userId: UserId) {
        for (let id in this.gameStates) {
            if (this.gameStates[id].playerOne === userId || this.gameStates[id].playerTwo === userId) {
                return id;
            }
        }
        return null;
    }

    sendToUser(currentUserId: UserId, data: string) {
        try {
            console.log(Object.keys(this.allSocketsByUserId))
            this.allSocketsByUserId[currentUserId].send(data);
        } catch (err) {
            console.log(err)
            console.log(`User[${currentUserId}] does not exist`)
        }
    };

    handleClose(currentUserId: UserId) {
        // the user disconnected which means the opponent has won!
        const gameId = this.findGameId(currentUserId);

        if (gameId && !this.gameStates[gameId].isFinished) {
            const opponentId = [this.gameStates[gameId].playerOne, this.gameStates[gameId].playerTwo].find((x) => x !== currentUserId)

            if (gameId) {
                this.sendToUser(opponentId!, createNewMessage("stop", {
                    board: this.gameStates[gameId].board,
                    status: "win",
                    amPlayerOne: this.gameStates[gameId].playerOne === opponentId,
                }))
            }
        }

        delete this.allSocketsByUserId[currentUserId];
        delete this.currentlyUnmatchedUsers[currentUserId];
        console.log(`User[${currentUserId}] disconnected`)
    }

    handleClientSentEvent(message: string) {
        const { type, data } = JSON.parse(message);
        if (type === "update") {
            const { userId, gameId, pos, char } = data;
            console.log(`User[${userId}] received a message: ${message} : : ${Object.keys(this.allSocketsByUserId)}`)

            this.gameStates[gameId].board[pos] = char;

            const opponentId = this.matchedUp[userId];
            let opponentData;
            let currentSender;

            const state = getCurrentGameState(this.gameStates[gameId].board);

            if (state === "in_progress") {
                opponentData = createNewMessage("start", {
                    gameId,
                    amPlayerOne: this.gameStates[gameId].playerOne === opponentId,
                    myTurn: true,
                    board: this.gameStates[gameId].board,
                });

                currentSender = createNewMessage("start", {
                    gameId,
                    amPlayerOne: this.gameStates[gameId].playerOne === userId,
                    myTurn: false,
                    board: this.gameStates[gameId].board,
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

                // the game has finished
                this.gameStates[gameId].isFinished = true;

                opponentData = createNewMessage("stop", {
                    board: this.gameStates[gameId].board,
                    status: opponentStatus,
                    amPlayerOne: this.gameStates[gameId].playerOne === opponentId,
                });

                currentSender = createNewMessage("stop", {
                    board: this.gameStates[gameId].board,
                    status: currentSenderStatus,
                    amPlayerOne: this.gameStates[gameId].playerOne === userId,
                });
            }

            // send to both
            this.sendToUser(opponentId, opponentData);
            this.sendToUser(userId, currentSender);
        }
    }

    findMatchup(currentUserId: string) {
        const opponentId = this.findOpponentFor(currentUserId);
        if (opponentId) {
            console.log(`User[${currentUserId}] found a matchup in ${opponentId}`)
            // match them up
            this.matchedUp[opponentId] = currentUserId;
            this.matchedUp[currentUserId] = opponentId;
            // and remove them from the queue where others wait for a matchup
            delete this.currentlyUnmatchedUsers[opponentId];
            delete this.currentlyUnmatchedUsers[currentUserId];

            const gameId = uuid();
            this.gameStates[gameId] = createNewGame(opponentId, currentUserId);

            this.sendToUser(
                opponentId,
                createNewMessage("start", {
                    gameId,
                    amPlayerOne: true,
                    myTurn: true,
                    board: this.gameStates[gameId].board,
                })
            );

            this.sendToUser(
                currentUserId,
                createNewMessage("start", {
                    gameId,
                    board: this.gameStates[gameId].board,
                    amPlayerOne: false,
                    myTurn: false,
                })
            );

        }
    }

    handleWs(ws: WebSocket) {
        const currentUserId = uuid();

        ws.send(createNewMessage("register", { id: currentUserId }));

        this.allSocketsByUserId[currentUserId] = ws;
        this.currentlyUnmatchedUsers[currentUserId] = true;

        console.log(`User[${currentUserId}] created: ${Object.keys(this.allSocketsByUserId)}`)

        this.findMatchup(currentUserId);

        ws.on("close", () => this.handleClose(currentUserId));
        ws.on("message", this.handleClientSentEvent);
    }
}

async function main() {
    const wss = new WebSocketServer({ host: process.env.WS_ENDPOINT, port: parseInt(process.env.WS_PORT!) });

    console.log(`Listening on ${process.env.WS_ENDPOINT}:${process.env.WS_PORT}...`)

    const handler = new WebSocketHandler();

    wss.on("connection", (ws) => handler.handleWs(ws));
}

main();
