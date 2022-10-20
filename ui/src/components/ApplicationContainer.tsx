import { useState } from "react";
import { FC, useEffect } from "react";
import styled from "styled-components";

interface ApplicationStyleProps {
    height: number
}

const Application = styled.div<ApplicationStyleProps>`
    // Small devices (landscape phones, 576px and up)
    display: grid;
    grid-template-rows: 5% 5% 90%;
    grid-template-columns: 1fr;
    min-height: ${(props) => `${props.height}px`};

    // Medium devices (tablets, 768px and up)
    @media (min-width: 768px) {
        display: grid;
        grid-template-columns: 20% 60% 20%;
        grid-template-rows: 1fr;
    }
`;

const LeftContainer = styled.div`
    background-color: ${(props) => props.color};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    // Small devices (landscape phones, 576px and up)
    order: 1;

    // Medium devices (tablets, 768px and up)
    @media (min-width: 768px) {
        order: 1;
    }
`;

const RightContainer = styled.div`
    background-color: ${(props) => props.color};
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    // Small devices (landscape phones, 576px and up)
    order: 2;

    // Medium devices (tablets, 768px and up)
    @media (min-width: 768px) {
        order: 3;
    }
`;

const MiddleContainer = styled.div`
    background-color: lightgray;
    display: grid;
    grid-template-rows: 20% 80%;
    // Small devices (landscape phones, 576px and up)
    order: 3;

    // Medium devices (tablets, 768px and up)
    @media (min-width: 768px) {
        order: 2;
    }
`;

const Header = styled.div`
    background-color: #033860;
    text-align: center;
    color: white;
    display: flex;
    font-size: 2em;
    justify-content: center;

    // Medium devices (tablets, 768px and up)
    @media (min-width: 768px) {
        font-size: 2.5em;
    }
`;

export interface DisplayInfo {
    left: {
        color: string,
        title: string
    },
    right: {
        color: string,
        title: string
    }
}

interface ApplicationContainerProps {
    children: any,
    displayInfo: DisplayInfo
}

const useWindowHeight: () => number = () => {
    const [height, setHeight] = useState(() => {
        return window.innerHeight;
    });

    useEffect(() => {
        const setResizedHeight = (e: UIEvent) => setHeight(window.innerHeight)

        window.addEventListener('resize', setResizedHeight)

        return () => {
            window.removeEventListener('resize', setResizedHeight)
        }
    }, [])

    return height;
}

export const ApplicationContainer: FC<ApplicationContainerProps> = ({ children, displayInfo }) => {
    const height = useWindowHeight();

    return (
        <Application height={height}>
            <LeftContainer color={displayInfo.left.color}>
                <h1>{displayInfo.left.title}</h1>
            </LeftContainer>
            <MiddleContainer>
                <Header>
                    <h1>tictactoe</h1>
                </Header>
                {children}
            </MiddleContainer>
            <RightContainer color={displayInfo.right.color}>
                <h1>{displayInfo.right.title}</h1>
            </RightContainer>
        </Application>
    )
}