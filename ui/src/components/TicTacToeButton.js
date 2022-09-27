import styled from "styled-components";
import { useEffect, useState } from "react";

export const TicTacToeButton = ({ playerSymbol, notify }) => {
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