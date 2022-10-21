import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface GameInfo {
    isPlayerOne: boolean,
    isBoardLocked: boolean,
    userId: string | null
    gameId: string | null
}

const initialState = (): GameInfo => {
    return {
        isPlayerOne: true,
        isBoardLocked: true,
        userId: null,
        gameId: null
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
        updateBoardLock: (state: GameInfo, action: PayloadAction<boolean>) => {
            state.isBoardLocked = action.payload;
        },
        updateIsPlayerOne: (state: GameInfo, action: PayloadAction<boolean>) => {
            state.isPlayerOne = action.payload;
        },
    }
})

export const {
    updateUserId,
    updateGameId,
    updateBoardLock,
    updateIsPlayerOne 
} = gameInfoSlice.actions;

export default gameInfoSlice.reducer;