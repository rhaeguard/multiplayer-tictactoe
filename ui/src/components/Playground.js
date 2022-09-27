import styled from "styled-components";
import { useEffect, useState } from "react";
import { TicTacToeButton } from "./TicTacToeButton";
import { ApplicationContainer } from "./ApplicationContainer";

const BoardWrapper = styled.div`
    background-color: #033860;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
`;

const Board = styled.div`
    background-color: #033860;
    display: grid;
    grid-template-rows: 33% 33% 33%;
    width: 420px;
`;

const BoardRow = styled.div`
    padding: 2%;
    display: flex;
    justify-content: center;
`;

const ws = new WebSocket("ws://localhost:8888", "protocolOne");
const winColor = `#8bc34a`;
const lossColor = `#ff5722a6`;
const resetColor = "lightblue";
const drawColor = `#ff5722`;

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

    const [metaInfo, setMetaInfo] = useState({
        playerOne: {
            title: "player 1",
            color: resetColor,
        },
        playerTwo: {
            title: "player 2",
            color: resetColor,
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
            p1Color = drawColor;
            p2Color = drawColor;
            p1Title = `draw`;
            p2Title = `draw`;
        } else if (status === "win") {
            p1Color = amPlayerOne ? winColor : lossColor;
            p2Color = amPlayerOne ? lossColor : winColor;
            p1Title = amPlayerOne ? `you won` : `opponent lost`;
            p2Title = !amPlayerOne ? `you won` : `opponent lost`;
        } else if (status === "loss") {
            p1Color = amPlayerOne ? lossColor : winColor;
            p2Color = amPlayerOne ? winColor : lossColor;
            p1Title = amPlayerOne ? `you lost` : `opponent won`;
            p2Title = !amPlayerOne ? `you lost` : `opponent won`;
        } else {
            p1Color = metaInfo.playerOne.color;
            p2Color = metaInfo.playerTwo.color;
            p1Title = amPlayerOne ? "you" : "opponent";
            p2Title = !amPlayerOne ? "you" : "opponent";
        }
        setMetaInfo({
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

    useEffect(() => {
        ws.onmessage = (event) => {
            const { type, data } = JSON.parse(event.data);
            if (type === "register") {
                localStorage.setItem("id", data.id);
            } else if (type === "start") {
                const { board, amPlayerOne, gameId, myTurn } = data;
                localStorage.setItem("gameId", gameId);

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
        };
    }, []);

    const handleClick = ({ index }) => {
        if (fields[index] === " " && !isBoardLocked) {
            ws.send(
                JSON.stringify({
                    type: "update",
                    data: {
                        userId: localStorage.getItem("id"),
                        gameId: localStorage.getItem("gameId"),
                        pos: index,
                        char: isPlayerOne ? "x" : "o",
                    },
                })
            );
        }
    };

    return (
        <ApplicationContainer metaInfo={metaInfo}>
            <BoardWrapper>
                <Board>
                    <BoardRow>
                        <TicTacToeButton
                            playerSymbol={fields[0]}
                            notify={() => handleClick({ index: 0 })}
                        />
                        <TicTacToeButton
                            playerSymbol={fields[1]}
                            notify={() => handleClick({ index: 1 })}
                        />
                        <TicTacToeButton
                            playerSymbol={fields[2]}
                            notify={() => handleClick({ index: 2 })}
                        />
                    </BoardRow>

                    <BoardRow>
                        <TicTacToeButton
                            playerSymbol={fields[3]}
                            notify={() => handleClick({ index: 3 })}
                        />
                        <TicTacToeButton
                            playerSymbol={fields[4]}
                            notify={() => handleClick({ index: 4 })}
                        />
                        <TicTacToeButton
                            playerSymbol={fields[5]}
                            notify={() => handleClick({ index: 5 })}
                        />
                    </BoardRow>

                    <BoardRow>
                        <TicTacToeButton
                            playerSymbol={fields[6]}
                            notify={() => handleClick({ index: 6 })}
                        />
                        <TicTacToeButton
                            playerSymbol={fields[7]}
                            notify={() => handleClick({ index: 7 })}
                        />
                        <TicTacToeButton
                            playerSymbol={fields[8]}
                            notify={() => handleClick({ index: 8 })}
                        />
                    </BoardRow>
                </Board>
            </BoardWrapper>
        </ApplicationContainer>
    );
};
