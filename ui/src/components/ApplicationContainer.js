import styled from "styled-components";

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

export const ApplicationContainer = ({children, displayInfo}) => {
    return (
        <Application>
            <LeftContainer color={displayInfo.playerOne.color}>
                <h1>{displayInfo.playerOne.title}</h1>
            </LeftContainer>
            <MiddleContainer>
                <Header>
                    <h1>tictactoe</h1>
                </Header>
                {children}
            </MiddleContainer>
            <RightContainer color={displayInfo.playerTwo.color}>
                <h1>{displayInfo.playerTwo.title}</h1>
            </RightContainer>
        </Application>
    )
}