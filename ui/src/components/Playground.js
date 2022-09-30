import { useEffect, useState } from "react";
import { ApplicationContainer } from "./ApplicationContainer";
import { BoardContainer } from "./BoardContainer";

const WIN_COLOR = `#8bc34a`;
const LOSS_COLOR = `#ff5722a6`;
const RESET_COLOR = "lightblue";
const DRAW_COLOR = `#ff5722`;

const ws = new WebSocket(`ws://${process.env.REACT_APP_WS_URL}:${process.env.REACT_APP_WS_PORT}`, "protocolOne");

export const Playground = () => {
    const [isPlayerOne, setIsPlayerOne] = useState(true);
    const [isBoardLocked, setBoardLocked] = useState(true);
    const [fields, setFields] = useState([
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
        " ",
    ]);

    const [displayInfo, setDisplayInfo] = useState({
        playerOne: {
            title: "player 1",
            color: RESET_COLOR,
        },
        playerTwo: {
            title: "player 2",
            color: RESET_COLOR,
        },
    });

    const handleGameUpdate = ({
        board,
        status,
        amPlayerOne,
        isBoardLocked,
    }) => {
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
        setFields(board);
        setIsPlayerOne(amPlayerOne);
        setBoardLocked(isBoardLocked);
    };

    const handleServerSentEvent = (event) => {
        const { type, data } = JSON.parse(event.data);
        if (type === "register") {
            sessionStorage.setItem("id", data.id);
        } else if (type === "start") {
            const { board, amPlayerOne, gameId, myTurn } = data;
            sessionStorage.setItem("gameId", gameId);

            handleGameUpdate({
                board,
                amPlayerOne,
                status: "in_progress", // it's a status set by the ui, not the backend
                isBoardLocked: !myTurn,
            });
        } else if (type === "stop") {
            const { board, status, amPlayerOne } = data;
            handleGameUpdate({
                board,
                amPlayerOne,
                status,
                isBoardLocked: true,
            });
        }
    }

    useEffect(() => {
        ws.onmessage = handleServerSentEvent;
    }, []);

    const handleClick = ({ index }) => {
        if (fields[index] === " " && !isBoardLocked) {
            ws.send(
                JSON.stringify({
                    type: "update",
                    data: {
                        userId: sessionStorage.getItem("id"),
                        gameId: sessionStorage.getItem("gameId"),
                        pos: index,
                        char: isPlayerOne ? "x" : "o",
                    },
                })
            );
        }
    };

    return (
        <ApplicationContainer displayInfo={displayInfo}>
            <BoardContainer 
                fields={fields} 
                onClickCell={handleClick}/>
        </ApplicationContainer>
    );
};
