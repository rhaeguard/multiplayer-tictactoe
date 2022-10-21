import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DisplayInfo } from '../components/ApplicationContainer';

export interface GameInfo {
    isPlayerOne: boolean,
    isBoardLocked: boolean,
    fields: string[],
    userId: string | null,
    gameId: string | null,
    displayInfo: DisplayInfo
}

export interface GameUpdate {
    board: string[];
    status: string;
    amPlayerOne: boolean;
    isBoardLocked: boolean;
}

const EMPTY_BOARD = new Array(9).fill("");
const WIN_COLOR = `#8bc34a`;
const LOSS_COLOR = `#ff5722a6`;
const RESET_COLOR = "lightblue";
const DRAW_COLOR = `#ff5722`;

const initialState = (): GameInfo => {
    return {
        isPlayerOne: true,
        isBoardLocked: true,
        fields: EMPTY_BOARD,
        userId: null,
        gameId: null,
        displayInfo: {
            left: {
                title: "player 1",
                color: RESET_COLOR,
            },
            right: {
                title: "player 2",
                color: RESET_COLOR,
            }
        }
    }
}

const gameInfoSlice = createSlice({
    name: 'gameInfo',
    initialState: initialState(),
    reducers: {
        updateUserId: (state: GameInfo, action: PayloadAction<string>) => {
            state.userId = action.payload;
        },
        updateGameId: (state: GameInfo, action: PayloadAction<string>) => {
            state.gameId = action.payload;
        },
        updateGameState: (state: GameInfo, action: PayloadAction<GameUpdate>) => {
            const { board, isBoardLocked, status, amPlayerOne } = action.payload;

            let p1Color, p2Color;
            let p1Title, p2Title;
            if (status === "draw") {
                p1Color = DRAW_COLOR;
                p2Color = DRAW_COLOR;
                p1Title = "draw";
                p2Title = "draw";
            } else if (status === "win") {
                p1Color = amPlayerOne ? WIN_COLOR : LOSS_COLOR;
                p2Color = amPlayerOne ? LOSS_COLOR : WIN_COLOR;
                p1Title = amPlayerOne ? "you won" : "opponent lost";
                p2Title = !amPlayerOne ? "you won" : "opponent lost";
            } else if (status === "loss") {
                p1Color = amPlayerOne ? LOSS_COLOR : WIN_COLOR;
                p2Color = amPlayerOne ? WIN_COLOR : LOSS_COLOR;
                p1Title = amPlayerOne ? "you lost" : "opponent won";
                p2Title = !amPlayerOne ? "you lost" : "opponent won";
            } else {
                p1Color = state.displayInfo.left.color;
                p2Color = state.displayInfo.right.color;
                p1Title = amPlayerOne ? "you" : "opponent";
                p2Title = !amPlayerOne ? "you" : "opponent";
            }

            state.fields = board;
            state.displayInfo = {
                left: {
                    title: p1Title,
                    color: p1Color,
                },
                right: {
                    title: p2Title,
                    color: p2Color,
                },
            };
            state.isPlayerOne = amPlayerOne;
            state.isBoardLocked = isBoardLocked;
        }
    }
})

export const {
    updateUserId,
    updateGameId,
    updateGameState
} = gameInfoSlice.actions;

export default gameInfoSlice.reducer;