import { render, RenderOptions, screen, fireEvent } from '@testing-library/react';
import { Playground } from './Playground';
import React, { PropsWithChildren } from 'react';
import { AppStore, RootState, setupStore } from '../store';
import { Provider } from 'react-redux';
import { PreloadedState } from '@reduxjs/toolkit';
import { WebSocketConnectionProvider } from '../websocket';
import WS from "jest-websocket-mock";

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
    preloadedState?: PreloadedState<RootState>,
    store?: AppStore
}

function renderWithReduxProvider(
    ui: React.ReactElement,
    {
        preloadedState = {},
        store = setupStore(preloadedState),
        ...renderOptions
    }: ExtendedRenderOptions = {}
) {
    const Wrapper = ({ children }: PropsWithChildren<{}>) =>
        <Provider store={store}>
            {children}
        </Provider>

    return {
        store,
        ...render(ui, {
            wrapper: Wrapper,
            ...renderOptions
        })
    }
}

describe('Playground', () => {
    let server: WS;
    let previousEnvironmentVariables: NodeJS.ProcessEnv;

    beforeAll(() => {
        previousEnvironmentVariables = process.env;
    })

    afterAll(() => {
        process.env = previousEnvironmentVariables;
    })

    beforeEach(() => {
        const REACT_APP_WS_URL = 'localhost';
        const REACT_APP_WS_PORT = '8889';

        // set the new ones
        process.env = {
            ...previousEnvironmentVariables, ...{
                REACT_APP_WS_URL,
                REACT_APP_WS_PORT,
            }
        };

        server = new WS(`ws://${REACT_APP_WS_URL}:${REACT_APP_WS_PORT}`);
    });

    afterEach(() => {
        server.close();
    })

    it('renders each cell empty initially', () => {
        renderWithReduxProvider(
            <WebSocketConnectionProvider>
                <Playground />
            </WebSocketConnectionProvider>
        )

        // default initial state sets everything to empty
        const buttons = screen.getAllByRole('board-button');
        expect(buttons).toHaveLength(9);

        new Array(9).fill("").forEach((field, index) => {
            expect(buttons[index]).toHaveTextContent(field)
        });
    });

    it('renders a specific state correctly', () => {
        const fields = [
            "x", "o", "o",
            "x", "x", "",
            "", "", ""];

        renderWithReduxProvider(
            <WebSocketConnectionProvider>
                <Playground />
            </WebSocketConnectionProvider>,
            {
                preloadedState: {
                    info: {
                        isPlayerOne: true,
                        isBoardLocked: true,
                        fields: fields,
                        userId: null,
                        gameId: null,
                        displayInfo: {
                            left: {
                                title: "player 1",
                                color: "yellow",
                            },
                            right: {
                                title: "player 2",
                                color: "yellow",
                            }
                        }
                    }
                }
            }
        )

        // default initial state sets everything to empty
        const buttons = screen.getAllByRole('board-button');
        expect(buttons).toHaveLength(9);

        fields.forEach((field, index) => {
            expect(buttons[index]).toHaveTextContent(field)
        });
    });

    it('triggers the correct function when we click on an empty cell', async () => {
        renderWithReduxProvider(
            <WebSocketConnectionProvider>
                <Playground />
            </WebSocketConnectionProvider>,
            {
                preloadedState: {
                    info: {
                        isPlayerOne: true,
                        isBoardLocked: false,
                        fields: new Array(9).fill(""),
                        userId: 'user_id',
                        gameId: 'game_id',
                        displayInfo: {
                            left: {
                                title: "player 1",
                                color: "yellow",
                            },
                            right: {
                                title: "player 2",
                                color: "yellow",
                            }
                        }
                    }
                }
            }
        );

        await server.connected;

        // default initial state sets everything to empty
        const buttons = screen.getAllByRole('board-button');
        expect(buttons).toHaveLength(9);

        fireEvent.click(buttons[0]);

        expect(server).toReceiveMessage(JSON.stringify({
            type: "update",
            data: {
                userId: "user_id",
                gameId: "game_id",
                pos: 0,
                char: "x",
            },
        }))
    });

    it('should not trigger any function when we click on a set cell', async () => {
        const fields = [
            "x", "o", "o",
            "x", "x", "",
            "", "", ""];

        renderWithReduxProvider(
            <WebSocketConnectionProvider>
                <Playground />
            </WebSocketConnectionProvider>,
            {
                preloadedState: {
                    info: {
                        isPlayerOne: true,
                        isBoardLocked: false,
                        fields: fields,
                        userId: 'user_id',
                        gameId: 'game_id',
                        displayInfo: {
                            left: {
                                title: "player 1",
                                color: "yellow",
                            },
                            right: {
                                title: "player 2",
                                color: "yellow",
                            }
                        }
                    }
                }
            }
        );

        await server.connected;

        // default initial state sets everything to empty
        const buttons = screen.getAllByRole('board-button');
        expect(buttons).toHaveLength(9);

        fireEvent.click(buttons[0]);

        expect(server).toHaveReceivedMessages([])
    });

    it('marks o when the current player is player two', async () => {
        renderWithReduxProvider(
            <WebSocketConnectionProvider>
                <Playground />
            </WebSocketConnectionProvider>,
            {
                preloadedState: {
                    info: {
                        isPlayerOne: false,
                        isBoardLocked: false,
                        fields: new Array(9).fill(""),
                        userId: 'user_id',
                        gameId: 'game_id',
                        displayInfo: {
                            left: {
                                title: "player 1",
                                color: "yellow",
                            },
                            right: {
                                title: "player 2",
                                color: "yellow",
                            }
                        }
                    }
                }
            }
        )

        await server.connected;

        // default initial state sets everything to empty
        const buttons = screen.getAllByRole('board-button');
        expect(buttons).toHaveLength(9);

        fireEvent.click(buttons[0]);

        expect(server).toReceiveMessage(JSON.stringify({
            type: "update",
            data: {
                userId: "user_id",
                gameId: "game_id",
                pos: 0,
                char: "o",
            },
        }))
    });

    it('handles server sent events correctly', async () => {
        const { store } = renderWithReduxProvider(
            <WebSocketConnectionProvider>
                <Playground />
            </WebSocketConnectionProvider>
        )

        await server.connected;

        // handle the register event
        server.send(JSON.stringify({
            type: "register",
            data: {
                id: "this-is-a-user-id"
            }
        }));

        // check if the store reflects the necessary changes
        expect(store.getState().info.userId).toEqual("this-is-a-user-id");

        // handle start event
        server.send(JSON.stringify({
            type: "start",
            data: {
                board: new Array(9).fill(""),
                amPlayerOne: true,
                gameId: "this-is-a-game-id",
                myTurn: true,
            }
        }));

        // check if the store reflects the necessary changes
        expect(store.getState().info.userId).toEqual("this-is-a-user-id");
        expect(store.getState().info.gameId).toEqual("this-is-a-game-id");
        expect(store.getState().info.isPlayerOne).toEqual(true);
        expect(store.getState().info.isBoardLocked).toEqual(false);
        expect(store.getState().info.fields).toEqual(new Array(9).fill(""));
        expect(store.getState().info.displayInfo.left.title).toEqual("you");
        expect(store.getState().info.displayInfo.right.title).toEqual("opponent");

        // handle stop event
        server.send(JSON.stringify({
            type: "stop",
            data: {
                board: new Array(9).fill(""),
                amPlayerOne: true,
                status: "win"
            }
        }));

        // check if the store reflects the necessary changes
        expect(store.getState().info.userId).toEqual("this-is-a-user-id");
        expect(store.getState().info.gameId).toEqual("this-is-a-game-id");
        expect(store.getState().info.isPlayerOne).toEqual(true);
        expect(store.getState().info.isBoardLocked).toEqual(true);
        expect(store.getState().info.displayInfo.left.title).toEqual("you won");
        expect(store.getState().info.displayInfo.right.title).toEqual("opponent lost");
        // the client web socket should be closed
        expect((await server.connected).readyState).toEqual(WebSocket.CLOSED);
    })
})