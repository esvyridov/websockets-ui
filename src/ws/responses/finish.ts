import { WebSocket } from 'ws';

export function finishResponse(ws: WebSocket, data: {
    winPlayer: number;
}) {
    ws.send(JSON.stringify({
        type: 'finish',
        data: JSON.stringify(data),
        id: 0,
    }));
}