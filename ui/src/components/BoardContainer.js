import styled from "styled-components";
import { TicTacToeButton } from "./TicTacToeButton";

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

export const BoardContainer = ({ fields, onClickCell }) => {
    return (
        <BoardWrapper>
            <Board>
                <BoardRow>
                    <TicTacToeButton
                        playerSymbol={fields[0]}
                        notify={() => onClickCell({ index: 0 })}
                    />
                    <TicTacToeButton
                        playerSymbol={fields[1]}
                        notify={() => onClickCell({ index: 1 })}
                    />
                    <TicTacToeButton
                        playerSymbol={fields[2]}
                        notify={() => onClickCell({ index: 2 })}
                    />
                </BoardRow>

                <BoardRow>
                    <TicTacToeButton
                        playerSymbol={fields[3]}
                        notify={() => onClickCell({ index: 3 })}
                    />
                    <TicTacToeButton
                        playerSymbol={fields[4]}
                        notify={() => onClickCell({ index: 4 })}
                    />
                    <TicTacToeButton
                        playerSymbol={fields[5]}
                        notify={() => onClickCell({ index: 5 })}
                    />
                </BoardRow>

                <BoardRow>
                    <TicTacToeButton
                        playerSymbol={fields[6]}
                        notify={() => onClickCell({ index: 6 })}
                    />
                    <TicTacToeButton
                        playerSymbol={fields[7]}
                        notify={() => onClickCell({ index: 7 })}
                    />
                    <TicTacToeButton
                        playerSymbol={fields[8]}
                        notify={() => onClickCell({ index: 8 })}
                    />
                </BoardRow>
            </Board>
        </BoardWrapper>
    );
};
