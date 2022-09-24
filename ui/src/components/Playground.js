import { useState } from "react";
import styled from "styled-components";
import { useEffect } from "react";

const Application = styled.div`
    display: grid;
    grid-template-columns: 20% 60% 20%;
    height: 100vh;
`;

const LeftContainer = styled.div`
    background-color: ${(props) => props.color};
    text-align: center;
`;

const RightContainer = styled.div`
    background-color: ${(props) => props.color};
    text-align: center;
`;

const MiddleContainer = styled.div`
    background-color: lightgray;
    display: grid;
    grid-template-rows: 20% 80%;
`;

const Header = styled.div`
    background-color: #033860;
    text-align: center;
    color: white;
    font-size: 2.5em;
    display: flex;
    justify-content: center;
`;

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

const TicTacToeButton = ({ playerSymbol, notify }) => {
    const [colors, setColor] = useState({
        bgColor: "white",
        textColor: "#033860",
    });

    const TicTacToeButtonStyle = styled.button`
        width: 100px;
        height: 100px;
        outline: none;
        border: none;
        background-color: ${colors.bgColor};
        color: ${colors.textColor};
        margin: 2%;
        font-size: 2.5em;
        font-family: "Abril Fatface", cursive, "Franklin Gothic Medium",
            "Arial Narrow", Arial, sans-serif;
    `;

    useEffect(() => {
        setColor(
            playerSymbol === " "
                ? {
                      bgColor: "white",
                      textColor: "#033860",
                  }
                : {
                      textColor: "white",
                      bgColor: "#033860",
                  }
        );
    }, [playerSymbol]);

    return (
        <TicTacToeButtonStyle onClick={notify}>
            {playerSymbol}
        </TicTacToeButtonStyle>
    );
};

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

    const [sideColors, setSideColors] = useState({
        left: resetColor,
        right: resetColor,
    });

    const [playerTitles, setPlayerTitles] = useState({
        playerOne: "player 1",
        playerTwo: "player 2",
    });

    const handleGameStop = ({ board, status, amPlayerOne }) => {
        setFields(board);
        setIsPlayerOne(amPlayerOne);
        setBoardLocked(true);
        let left, right;
        let playerOne, playerTwo;
        if (status === "draw") {
            left = drawColor;
            right = drawColor;
            playerOne = `draw`;
            playerTwo = `draw`;
        } else if (status === "win") {
            left = amPlayerOne ? winColor : lossColor;
            right = amPlayerOne ? lossColor : winColor;
            playerOne = amPlayerOne ? `you won` : `opponent lost`;
            playerTwo = !amPlayerOne ? `you won` : `opponent lost`;
        } else if (status === "loss") {
            left = amPlayerOne ? lossColor : winColor;
            right = amPlayerOne ? winColor : lossColor;
            playerOne = amPlayerOne ? `you lost` : `opponent won`;
            playerTwo = !amPlayerOne ? `you lost` : `opponent won`;
        }
        setSideColors({
            left,
            right,
        });
        setPlayerTitles({
            playerOne,
            playerTwo
        })
    };

    useEffect(() => {
        ws.onmessage = (event) => {
            const { type, data } = JSON.parse(event.data);
            if (type === "register") {
                localStorage.setItem("id", data.id);
            } else if (type === "start") {
                const { board, amPlayerOne, gameId, myTurn } = data;
                setFields(board);
                setIsPlayerOne(amPlayerOne);
                setBoardLocked(!myTurn);
                localStorage.setItem("gameId", gameId);
                setPlayerTitles({
                    playerOne: amPlayerOne ? 'you' : 'opponent',
                    playerTwo: !amPlayerOne ? 'you' : 'opponent'
                })
            } else if (type === "stop") {
                handleGameStop(data);
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
        <Application>
            <LeftContainer color={sideColors.left}>
                <h1>{playerTitles.playerOne}</h1>
            </LeftContainer>
            <MiddleContainer>
                <Header>
                    <h1>tictactoe</h1>
                </Header>
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
            </MiddleContainer>
            <RightContainer color={sideColors.right}>
                <h1>{playerTitles.playerTwo}</h1>
            </RightContainer>
        </Application>
    );
};
