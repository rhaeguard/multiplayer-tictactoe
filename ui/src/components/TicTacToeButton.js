import styled from "styled-components";
import { useEffect, useState } from "react";

const TicTacToeButtonStyle = styled.button`
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

export const TicTacToeButton = ({ playerSymbol, notify }) => {
    const [colors, setColor] = useState({
        bgColor: WHITE,
        textColor: BLUE,
    });

    useEffect(() => {
        setColor(
            playerSymbol === " "
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
        <TicTacToeButtonStyle colors={colors} onClick={notify}>
            {playerSymbol}
        </TicTacToeButtonStyle>
    );
};
