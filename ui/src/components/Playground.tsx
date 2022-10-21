import { FC, useEffect } from "react";
import { ApplicationContainer } from "./ApplicationContainer";
import { BoardContainer } from "./BoardContainer";
import { WebSocketContext } from "../websocket";
import { useContext } from "react";
import { RootState, useAppDispatch, useAppSelector } from "../store";
import {
    GameInfo, 
    updateGameState,
    updateUserId,
    updateGameId,
} from '../reducers/gameInfoSlice';

export const Playground: FC = () => {
    const { event, sendMessage, finalize } = useContext(WebSocketContext);

    const { isPlayerOne, isBoardLocked, userId, gameId, displayInfo, fields }: GameInfo = useAppSelector((state: RootState) => state.info);
    const dispatch = useAppDispatch();

    useEffect(() => {
        // handle server sent event
        const { type, data } = event;
        if (type === "register") {
            dispatch(updateUserId(data.id));
        } else if (type === "start") {
            const { board, amPlayerOne, gameId, myTurn } = data;
            dispatch(updateGameId(gameId));

            dispatch(updateGameState({
                board: board,
                status: "in_progress", // it's a status set by the ui, not the backend
                amPlayerOne: amPlayerOne,
                isBoardLocked: !myTurn
            }))
        } else if (type === "stop") {
            const { board, status, amPlayerOne } = data;

            dispatch(updateGameState({
                board,
                status,
                amPlayerOne,
                isBoardLocked: true
            }));

            finalize();
        }
    }, [event])

    const handleClick = (index: number) => {
        if (fields[index] === "" && !isBoardLocked) {
            sendMessage({
                type: "update",
                data: {
                    userId: userId,
                    gameId: gameId,
                    pos: index,
                    char: isPlayerOne ? "x" : "o",
                },
            });
        }
    };

    return (
        <ApplicationContainer displayInfo={displayInfo}>
            <BoardContainer
                fields={fields}
                onClickCell={handleClick} />
        </ApplicationContainer>
    );
};
