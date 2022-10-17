import { FC, ReactElement } from "react";
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

interface BoardContainerProps {
    fields: string[],
    onClickCell: (index: number) => void
}

export const BoardContainer: FC<BoardContainerProps> = ({ fields, onClickCell }) => {

    const renderFields = (): ReactElement<typeof Board> => {
        const elements: ReactElement[] = []

        for (let i = 0; i < 9; i++) {
            elements.push(
                <TicTacToeButton
                    key={i}
                    playerSymbol={fields[i]}
                    notify={() => onClickCell(i)}
                />
            )
        }

        return <BoardWrapper role="board-wrapper">
            <Board role="board">
                <BoardRow key={1} role="board-row" >{elements.slice(0, 3)}</BoardRow>
                <BoardRow key={2} role="board-row" >{elements.slice(3, 6)}</BoardRow>
                <BoardRow key={3} role="board-row" >{elements.slice(6, 9)}</BoardRow>
            </Board>
        </BoardWrapper>
    }

    return renderFields()
};
