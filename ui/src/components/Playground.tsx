import { FC, useEffect, useState } from "react";
import { ApplicationContainer, DisplayInfo } from "./ApplicationContainer";
import { BoardContainer } from "./BoardContainer";
import { WebSocketContext } from "../websocket";
import { useContext } from "react";

const WIN_COLOR = `#8bc34a`;
const LOSS_COLOR = `#ff5722a6`;
const RESET_COLOR = "lightblue";
const DRAW_COLOR = `#ff5722`;

const EMPTY_BOARD = new Array(9).fill("");

class GameUpdate {
    board: string[];
    status: string;
    amPlayerOne: boolean;
    isBoardLocked: boolean;

    constructor(
        board: string[],
        status: string,
        amPlayerOne: boolean,
        isBoardLocked: boolean
    ) {
        this.board = board;
        this.status = status;
        this.amPlayerOne = amPlayerOne;
        this.isBoardLocked = isBoardLocked;
    }
}

export const Playground: FC = () => {
    const { event, sendMessage, finalize } = useContext(WebSocketContext);

    const [isPlayerOne, setIsPlayerOne] = useState(true);
    const [isBoardLocked, setBoardLocked] = useState(true);
    const [fields, setFields] = useState<string[]>(EMPTY_BOARD);

    const [userId, setUserId] = useState<string | null>(null);
    const [gameId, setGameId] = useState<string | null>(null);

    const [displayInfo, setDisplayInfo] = useState<DisplayInfo>({
        playerOne: {
            title: "player 1",
            color: RESET_COLOR,
        },
        playerTwo: {
            title: "player 2",
            color: RESET_COLOR,
        },
    });

    const handleGameUpdate = (data: GameUpdate) => {
        const { status, amPlayerOne } = data;

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
            p1Color = displayInfo.playerOne.color;
            p2Color = displayInfo.playerTwo.color;
            p1Title = amPlayerOne ? "you" : "opponent";
            p2Title = !amPlayerOne ? "you" : "opponent";
        }
        setDisplayInfo({
            playerOne: {
                title: p1Title,
                color: p1Color,
            },
            playerTwo: {
                title: p2Title,
                color: p2Color,
            },
        });
        setFields(data.board);
        setIsPlayerOne(amPlayerOne);
        setBoardLocked(data.isBoardLocked);
    };

    useEffect(() => {
        // handle server sent event
        const { type, data } = event;
        if (type === "register") {
            setUserId(data.id);
        } else if (type === "start") {
            const { board, amPlayerOne, gameId, myTurn } = data;
            setGameId(gameId);

            handleGameUpdate(new GameUpdate(
                board,
                "in_progress", // it's a status set by the ui, not the backend
                amPlayerOne,
                !myTurn
            ));
        } else if (type === "stop") {
            const { board, status, amPlayerOne } = data;

            handleGameUpdate(new GameUpdate(
                board,
                status,
                amPlayerOne,
                true
            ));

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
