import styled from "styled-components";
import { FC, MouseEventHandler, useEffect, useState } from "react";

interface TicTacToeButtonStyleProps {
    colors: {
        bgColor: string,
        textColor: string
    }
}

const TicTacToeButtonStyle = styled.button<TicTacToeButtonStyleProps>`
    width: 100px;
    height: 100px;
    outline: none;
    border: none;
    background-color: ${(props) => props.colors.bgColor};
    color: ${(props) => props.colors.textColor};
    margin: 2%;
    font-size: 2.5em;
    font-family: "Abril Fatface", cursive, "Franklin Gothic Medium",
        "Arial Narrow", Arial, sans-serif;
`;

const BLUE = "#033860";
const WHITE = "white";

interface TicTacToeButtonProps {
    playerSymbol: string,
    notify: MouseEventHandler
}

export const TicTacToeButton: FC<TicTacToeButtonProps> = ({ playerSymbol, notify }) => {
    const [colors, setColor] = useState({
        bgColor: WHITE,
        textColor: BLUE,
    });

    useEffect(() => {
        setColor(
            playerSymbol.trim() === ""
                ? {
                      bgColor: WHITE,
                      textColor: BLUE,
                  }
                : {
                      bgColor: BLUE,
                      textColor: WHITE,
                  }
        );
    }, [playerSymbol]);

    return (
        <TicTacToeButtonStyle colors={colors} onClick={notify} role="board-button">
            {playerSymbol}
        </TicTacToeButtonStyle>
    );
};
