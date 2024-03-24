import { WebSocket } from 'ws';

export function regResponse(ws: WebSocket, data: {
    name?: string;
    index?: number;
    error: boolean;
    errorText?: string;
}) {
    ws.send(JSON.stringify({
        type: 'reg',
        data: JSON.stringify(data),
        id: 0,
    }));
};
