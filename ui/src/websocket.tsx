import { useEffect } from 'react';
import { useState, useRef } from 'react';
import { createContext, ReactNode, FC } from 'react';

interface WSProviderProps {
    children: ReactNode,
}

export interface EventData {
    type: string,
    data: any
}

export type MessagePayload = EventData;

export interface SocketConnection {
    event: EventData,
    sendMessage: (data: MessagePayload) => void,
    finalize: () => void
}

const WebSocketContext = createContext<SocketConnection>({} as SocketConnection);
export { WebSocketContext };

export const WebSocketConnectionProvider: FC<WSProviderProps> = ({ children }) => {
    const wsRef = useRef<WebSocket>()
    const [event, setEvent] = useState<MessageEvent<string>>({} as MessageEvent<string>)

    useEffect(() => {
        if (!wsRef.current) {
            wsRef.current = new WebSocket(`ws://${process.env.REACT_APP_WS_URL}:${process.env.REACT_APP_WS_PORT}`);
            wsRef.current.onmessage = (event: MessageEvent<any>) => {
                if (event && event.data) {
                    setEvent(JSON.parse(event.data));
                }
            }
        }
    }, [])

    const sendMessage = (data: any): void => {
        if (wsRef.current) {
            wsRef.current.send(JSON.stringify(data))
        }
    }

    const finalize = () => {
        if (wsRef.current) {
            wsRef.current.close();
        }
    }

    return <WebSocketContext.Provider value={{
        event,
        sendMessage,
        finalize
    }}>
        {children}
    </WebSocketContext.Provider>
}